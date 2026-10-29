'use client';
import {useState} from 'react';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {useI18n} from '@/components/locale-provider';
import {browserDb} from '@/lib/supabase/client';
import {ArrowLeft,ArrowRight,AtSign,Check,CheckCircle2,Eye,EyeOff,LockKeyhole,Mail,ShieldCheck,UserRound} from 'lucide-react';

export default function AccountLogin({mode}:{mode:'signin'|'signup'}){
 const {pick,path,t,locale}=useI18n();
 const router=useRouter(),params=useSearchParams(),db=browserDb();
 const requested=params.get('next')||'/account';
 const next=requested.startsWith('/')&&!requested.startsWith('//')&&!requested.includes('\\')?requested:'/account';
 const nextUrl=path(next);
 const nextQuery=next==='/account'?'':'?next='+encodeURIComponent(nextUrl);
 const signup=mode==='signup';
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState('');
 const [confirm,setConfirm]=useState(''),[visible,setVisible]=useState(false),[terms,setTerms]=useState(false);
 const [stage,setStage]=useState<'form'|'verify'|'complete'>('form');
 const [code,setCode]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [verificationEmail,setVerificationEmail]=useState('');
 async function submit(event:React.FormEvent){
  event.preventDefault();setError('');setNotice('');
  if(!db){setError(pick('سرویس کاربران هنوز وصل نشده است.','Account service is unavailable.'));return}
  if(signup&&(!terms||name.trim().length<2||password!==confirm)){
   setError(pick('نام، تکرار رمز و پذیرش قوانین را بررسی کن.','Check name, password confirmation and terms.'));return;
  }
  setLoading(true);
  try{
   if(signup){
    const address=email.trim().toLowerCase();
    const {data,error:e}=await db.auth.signUp({email:address,password,options:{data:{display_name:name.trim()}}});
    if(e)throw e;
    if(data.session){
     await db.auth.signOut({scope:'local'});
     throw Error(pick('تأیید ایمیل در تنظیمات Supabase فعال نیست. مدیر باید Confirm email را فعال کند تا کد ارسال شود.','Email confirmation is disabled in Supabase. Enable Confirm email before using code verification.'));
    }
    setVerificationEmail(address);setStage('verify');setPassword('');setConfirm('');
    setNotice(pick('اگر سرویس ایمیل تنظیم شده باشد، کد تأیید برایت ارسال شده است.','A verification code has been requested. Delivery requires SMTP and the OTP email template.'));
   }else{
    const {error:e}=await db.auth.signInWithPassword({email:email.trim(),password});
    if(e)throw e;
    router.replace(nextUrl);router.refresh();
   }
  }catch(e){setError(e instanceof Error?e.message:pick('عملیات ناموفق بود.','Request failed.'))}
  finally{setLoading(false)}
 }
 async function verify(event:React.FormEvent){
  event.preventDefault();if(!db)return;
  setError('');setNotice('');
  const token=code.replace(/\s/g,'');
  if(!/^[0-9]{6}$/.test(token)){setError(pick('کد شش‌رقمی را وارد کن.','Enter the six-digit code.'));return}
  setLoading(true);
  try{
   const {error:e}=await db.auth.verifyOtp({email:verificationEmail,token,type:'email'});
   if(e)throw e;
   // Keep the established registration-then-login policy.
   await db.auth.signOut({scope:'local'});
   setStage('complete');
  }catch(e){setError(e instanceof Error?e.message:pick('کد تأیید معتبر نیست.','Invalid verification code.'))}
  finally{setLoading(false)}
 }
 async function resend(){
  if(!db||!verificationEmail)return;
  setLoading(true);setError('');setNotice('');
  try{
   const {error:e}=await db.auth.resend({type:'signup',email:verificationEmail});
   if(e)throw e;
   setNotice(pick('درخواست ارسال مجدد ثبت شد. پوشه هرزنامه را هم بررسی کن.','Resend requested. Check your spam folder as well.'));
  }catch(e){setError(e instanceof Error?e.message:pick('ارسال مجدد ممکن نشد.','Could not resend.'))}
  finally{setLoading(false)}
 }
 const backIcon=locale==='fa'?<ArrowLeft size={18}/>:<ArrowRight size={18}/>;
 return <div className="sh-auth-page" dir={locale==='fa'?'rtl':'ltr'}>
  <div className="sh-auth-layout">
   <div className="sh-auth-form-panel">
    <div className="sh-auth-upper"><span className="sh-auth-number">01 / {signup?'03':'02'}</span><span className="sh-auth-lock"><LockKeyhole size={18}/></span></div>
    <div className="sh-auth-flow" aria-label={pick('مراحل ساخت حساب','Account steps')}>
     {(signup?[
      pick('حساب کاربری','Account'),pick('تأیید ایمیل','Verify email'),pick('پروفایل','Profile')
     ]:[pick('ورود','Sign in'),pick('داشبورد','Dashboard')]).map((item,i)=>
      <span key={item} className={'sh-auth-flow-step'+((stage==='form'?i===0:stage==='verify'?i<=1:true)?' is-done':'')}>
       <b>{i+1}</b><small>{item}</small>
      </span>
     )}
    </div>
    {stage==='complete'?<div className="sh-auth-done"><CheckCircle2 size={43}/>
      <h1>{pick('ایمیل تأیید شد','Email verified')}</h1>
      <p>{pick('حساب شما فعال شد. حالا می‌توانی وارد شوی و اطلاعات پروفایل را تکمیل کنی.','Your account is confirmed. Sign in to complete your profile.')}</p>
      <Link href={path('/login')+nextQuery} className="sh-auth-submit">{pick('ورود به حساب','Sign in')}{backIcon}</Link>
     </div>:stage==='verify'?<div className="sh-auth-verify">
      <div className="sh-auth-heading"><span className="sh-auth-label">{pick('مرحله ۲ / تأیید نشانی ایمیل','STEP 2 / EMAIL VERIFICATION')}</span>
       <h1>{pick('کد تأیید ایمیل','Email verification code')}</h1>
       <p>{pick('کد شش‌رقمی ارسال‌شده به ایمیل را وارد کن.','Enter the six-digit code sent to your inbox.')} <strong dir="ltr">{verificationEmail}</strong></p></div>
      <form onSubmit={verify} className="sh-auth-fields">
       <label>{pick('کد شش‌رقمی','Six-digit code')}<input dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000"/></label>
       {error&&<p className="sh-auth-error" role="alert">{error}</p>}
       {notice&&<p className="sh-auth-notice" role="status">{notice}</p>}
       <button type="submit" disabled={loading||code.length!==6} className="sh-auth-submit">{loading?pick('در حال بررسی…','Verifying…'):pick('تأیید کد','Verify code')}{backIcon}</button>
       <button type="button" onClick={resend} disabled={loading} className="sh-auth-text-action">{pick('ارسال مجدد کد','Resend code')}</button>
       <button type="button" className="sh-auth-text-action" onClick={()=>{setStage('form');setError('');setCode('')}}>{pick('ویرایش ایمیل','Change email')}</button>
      </form>
     </div>:<>
      <div className="sh-auth-heading"><span className="sh-auth-label">{signup?pick('حساب مشتری / ثبت‌نام','CUSTOMER / SIGN UP'):pick('حساب مشتری / ورود امن','CUSTOMER / SIGN IN')}</span>
       <h1>{signup?pick('ساخت حساب مشتری','Create your account'):pick('ورود به ناحیه کاربری','Welcome back')}</h1>
       <p>{signup?pick('اطلاعات اولیه را وارد کن؛ سپس ایمیل را با کد تأیید کن.','Create an account, then verify your email with a code.'):pick('سفارش‌ها، پروفایل و درخواست‌هایت در یک فضای اختصاصی.','Your orders, profile and requests in one workspace.')}</p></div>
      <form onSubmit={submit} className="sh-auth-fields">
       {signup&&<label>{pick('نام و نام خانوادگی','Full name')}<div className="sh-auth-input"><UserRound size={20}/><input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder={pick('نام کامل','Your full name')}/></div></label>}
       <label>{pick('آدرس ایمیل','Email address')}<div className="sh-auth-input"><Mail size={20}/><input type="email" dir="ltr" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></div></label>
       <label>{pick('گذرواژه','Password')}<div className="sh-auth-input"><LockKeyhole size={20}/><input type={visible?'text':'password'} required autoComplete={signup?'new-password':'current-password'} minLength={signup?8:1} value={password} onChange={e=>setPassword(e.target.value)} placeholder={pick('گذرواژه امن','Secure password')}/><button type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?pick('پنهان کردن رمز','Hide password'):pick('نمایش رمز','Show password')}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
       {signup&&<><label>{pick('تکرار گذرواژه','Confirm password')}<div className="sh-auth-input"><ShieldCheck size={20}/><input type={visible?'text':'password'} autoComplete="new-password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={pick('تکرار رمز','Repeat password')}/></div></label>
        <label className="sh-auth-consent"><input required checked={terms} onChange={e=>setTerms(e.target.checked)} type="checkbox"/><span>{pick('شرایط استفاده','I agree to the')} <Link href={path('/terms')} target="_blank">{t.terms}</Link> {pick('و','and')} <Link href={path('/privacy')} target="_blank">{t.privacy}</Link> {pick('را مطالعه کرده و می‌پذیرم.','policies.')}</span></label></>}
       {error&&<p className="sh-auth-error" role="alert">{error}</p>}
       <button className="sh-auth-submit" disabled={loading||!db}>{loading?pick('در حال پردازش…','Processing…'):signup?pick('ساخت حساب و دریافت کد','Create account & get code'):pick('ورود به حساب','Sign in')}{backIcon}</button>
      </form>
      {!db&&<p className="sh-auth-notice">{pick('اتصال کاربران هنوز در سایت فعال نشده است.','Customer auth connection is unavailable.')}</p>}
      <div className="sh-auth-switch">{signup?pick('قبلاً حساب ساخته‌ای؟','Already registered?'):pick('هنوز حساب نداری؟','New here?')} <Link href={path(signup?'/login':'/register')+nextQuery}>{signup?t.login:t.register}</Link></div>
     </>}
    <Link href={path('/')} className="sh-auth-back">{pick('بازگشت به سایت سفیر هنر','Back to Safire Honar')}</Link>
   </div>
   <aside className="sh-auth-story-panel" aria-label={pick('معرفی خدمات چاپ سفیر هنر','Safire Honar introduction')}>
    <span className="sh-auth-story-kicker">{pick('سفیر هنر / فضای اختصاصی شما','SAFIRE HONAR / CREATIVE PRINT STUDIO')}</span>
    <div className="sh-auth-poster"><span>{pick('سفیر هنر / چاپ','SAFIRE HONAR / PRINT')}</span><strong>{pick('از ایده','FROM IDEA')}<small>✳</small>{pick('تا اثر.','TO PRINT.')}</strong></div>
    <h2>{pick('حساب خودت، مسیر چاپ خودت.','Your ideas. Your print journey.')}</h2>
    <p>{pick('اطلاعات مشتری، درخواست‌های قیمت، سفارش‌ها و سوابق را یک‌جا و امن مدیریت کن.','Manage account information, quotes, orders and history in one secure place.')}</p>
    <div className="sh-auth-story-pills"><span><Check size={15}/>{pick('مدیریت سفارش‌ها','Order management')}</span><span><Check size={15}/>{pick('اطلاعات پروفایل','Account details')}</span></div>
   </aside>
  </div>
 </div>;
}
