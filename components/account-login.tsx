'use client';
import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter,useSearchParams} from 'next/navigation';
import {useI18n} from '@/components/locale-provider';
import {browserDb} from '@/lib/supabase/client';
import {ArrowLeft,ArrowRight,AtSign,Check,CheckCircle2,Eye,EyeOff,LockKeyhole,Mail,RefreshCw,ShieldCheck,UserRound} from 'lucide-react';

type CheckData={digits:string;token:string};
export default function AccountLogin({mode}:{mode:'signin'|'signup'}){
 const {pick,path,t,locale}=useI18n();
 const router=useRouter(),params=useSearchParams(),db=browserDb();
 const requested=params.get('next')||'/account';
 const next=requested.startsWith('/')&&!requested.startsWith('//')&&!requested.includes('\\')?requested:'/account';
 const nextUrl=path(next),nextQuery=next==='/account'?'':'?next='+encodeURIComponent(nextUrl);
 const signup=mode==='signup';
 const [stage,setStage]=useState<'identifier'|'form'|'verify'|'complete'>(signup?'form':'identifier');
 const [identifier,setIdentifier]=useState(''),[name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [visible,setVisible]=useState(false),[terms,setTerms]=useState(false),[loading,setLoading]=useState(false);
 const [error,setError]=useState(''),[notice,setNotice]=useState(''),[code,setCode]=useState('');
 const [verificationEmail,setVerificationEmail]=useState(''),[check,setCheck]=useState<CheckData|null>(null),[answer,setAnswer]=useState('');
 const inFlight=useRef(false);
 const backIcon=locale==='fa'?<ArrowLeft size={18}/>:<ArrowRight size={18}/>;
 async function refreshCheck(){
  setCheck(null);setAnswer('');
  try{
   const res=await fetch('/api/customer-auth/challenge',{cache:'no-store'});
   if(!res.ok)throw new Error('CHECK_UNAVAILABLE');
   const data=await res.json() as CheckData;
   if(!/^\d{6}$/.test(data.digits)||!data.token)throw Error('CHECK_UNAVAILABLE');
   setCheck(data);
  }catch{setError(pick('بارگذاری کد تصویری ممکن نشد؛ دوباره تلاش کن.','Could not load verification digits. Please retry.'))}
 }
 useEffect(()=>{void refreshCheck()},[]);
 function continueIdentifier(event:React.FormEvent){
  event.preventDefault();setError('');
  const value=identifier.trim();
  if(!/^\S+@\S+\.\S+$/.test(value)&&!(/^(?:\+98|0098|98|0)?9\d{9}$/.test(value.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[\s()-]/g,'')))){
   setError(pick('ایمیل یا شماره موبایل ایرانی معتبر وارد کن.','Enter a valid email or Iranian mobile number.'));return;
  }
  // Deliberately do not reveal whether an account exists before verifying password.
  setStage('form');
 }
 async function submit(event:React.FormEvent){
  event.preventDefault();if(inFlight.current)return;
  setError('');setNotice('');
  if(!check||answer.length!==6){setError(pick('عدد شش‌رقمی نمایش‌داده‌شده را وارد کن.','Enter the displayed six-digit number.'));return}
  if(signup&&(!terms||name.trim().length<2||password!==confirm)){
   setError(pick('نام، تکرار رمز و پذیرش قوانین را بررسی کن.','Check name, password confirmation and terms.'));return;
  }
  inFlight.current=true;setLoading(true);
  try{
   const response=await fetch('/api/customer-auth/'+(signup?'register':'login'),{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({...(signup?{name:name.trim(),email:email.trim().toLowerCase(),password}:{identifier:identifier.trim(),password}),checkToken:check.token,checkAnswer:answer})
   });
   const data=await response.json();
   if(!response.ok){
    const messages:Record<string,string>={
     CHECK_FAILED:pick('کد عددی نادرست یا منقضی شده است.','Number expired or does not match.'),
     RATE_LIMITED:pick('تلاش‌های زیادی انجام شده؛ بعداً دوباره امتحان کن.','Too many attempts. Try again later.'),
     INVALID_CREDENTIALS:pick('اطلاعات ورود صحیح نیست یا حساب هنوز تأیید نشده است. اگر حساب نداری ثبت‌نام کن.','Incorrect credentials or account not confirmed. Sign up if you are new.'),
     AUTH_NOT_CONFIGURED:pick('سیستم احراز هویت پیکربندی نشده است.','Authentication is not configured.'),
     SIGNUP_FAILED:pick('ایجاد حساب ممکن نشد. شاید این ایمیل قبلاً ثبت شده باشد.','Could not create an account. The email might already be registered.'),
    };
    throw Error(messages[data.error]||pick('عملیات انجام نشد؛ دوباره تلاش کن.','Something went wrong. Please retry.'));
   }
   if(!signup||data.mode==='signed_in'){
    setPassword('');setConfirm('');
    router.replace(nextUrl);router.refresh();return;
   }
   setVerificationEmail(email.trim().toLowerCase());
   setPassword('');setConfirm('');setStage('verify');
   setNotice(pick('برای ورود، کد تأیید واقعی ارسال‌شده به ایمیلت را وارد کن. اگر ایمیلی دریافت نکردی، تنظیمات ارسال ایمیل Supabase باید بررسی شود.','Enter the real email code to activate your account. If no email arrives, Supabase email delivery needs configuration.'));
  }catch(e){setError(e instanceof Error?e.message:pick('خطا در ورود یا ثبت‌نام','Sign-in or sign-up failed'));void refreshCheck()}
  finally{inFlight.current=false;setLoading(false)}
 }
 async function verify(event:React.FormEvent){
  event.preventDefault();if(!db)return;
  setError('');setNotice('');
  const token=code.replace(/\s/g,'');
  if(!/^\d{6}$/.test(token)){setError(pick('کد شش‌رقمی ایمیل را وارد کن.','Enter the six-digit email code.'));return}
  setLoading(true);
  try{
   const {error:e}=await db.auth.verifyOtp({email:verificationEmail,token,type:'email'});
   if(e)throw e;
   await db.auth.signOut({scope:'local'});
   setStage('complete');
  }catch(e){setError(e instanceof Error?e.message:pick('کد تأیید ایمیل معتبر نیست.','Invalid email verification code.'))}
  finally{setLoading(false)}
 }
 async function resend(){
  if(!db||!verificationEmail||loading)return;
  setLoading(true);setError('');setNotice('');
  try{
   const {error:e}=await db.auth.resend({type:'signup',email:verificationEmail});
   if(e)throw e;
   setNotice(pick('درخواست ارسال مجدد ایمیل ثبت شد.','Verification email requested again.'));
  }catch(e){setError(e instanceof Error?e.message:pick('ارسال مجدد ممکن نشد.','Could not resend code.'))}
  finally{setLoading(false)}
 }
 return <div className="sh-auth-page" dir={locale==='fa'?'rtl':'ltr'}>
  <div className="sh-auth-layout">
   <div className="sh-auth-form-panel">
    <div className="sh-auth-upper"><span className="sh-auth-number">{signup?'01 / 02':stage==='identifier'?'01 / 02':'02 / 02'}</span><span className="sh-auth-lock"><LockKeyhole size={18}/></span></div>
    <div className="sh-auth-flow" aria-label={pick('مراحل ورود','Sign-in progress')}>
     {(signup?[pick('ساخت حساب','Create account'),pick('تأیید ایمیل در صورت نیاز','Email verification if required')]:[pick('ایمیل یا موبایل','Email or mobile'),pick('رمز و ورود','Password and sign-in')]).map((item,i)=>
      <span key={item} className={'sh-auth-flow-step'+((signup?i===0:stage==='identifier'?i===0:true)?' is-done':'')}><b>{i+1}</b><small>{item}</small></span>)}
    </div>
    {stage==='complete'?<div className="sh-auth-done"><CheckCircle2 size={43}/>
      <h1>{pick('ایمیل تأیید شد','Email verified')}</h1>
      <p>{pick('حالا با ایمیل و رمز عبور وارد حسابت شو.','Sign in with your email and password to continue.')}</p>
      <Link href={path('/login')+nextQuery} className="sh-auth-submit">{pick('ورود به حساب','Sign in')}{backIcon}</Link>
    </div>:stage==='verify'?<div className="sh-auth-verify">
      <div className="sh-auth-heading"><span className="sh-auth-label">{pick('تأیید واقعی ایمیل','EMAIL VERIFICATION')}</span>
       <h1>{pick('کد تأیید ایمیل','Email verification code')}</h1>
       <p>{pick('کد شش‌رقمی ارسال‌شده به ایمیلت را وارد کن:','Enter the six-digit code sent to:')} <strong dir="ltr">{verificationEmail}</strong></p></div>
      <form onSubmit={verify} className="sh-auth-fields">
       <label>{pick('کد تأیید ایمیل','Email code')}<input dir="ltr" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000"/></label>
       {error&&<p className="sh-auth-error" role="alert">{error}</p>}
       {notice&&<p className="sh-auth-notice" role="status">{notice}</p>}
       <button type="submit" disabled={loading||code.length!==6} className="sh-auth-submit">{loading?pick('در حال بررسی…','Verifying…'):pick('تأیید ایمیل','Verify email')}{backIcon}</button>
       <button type="button" className="sh-auth-text-action" onClick={resend} disabled={loading}>{pick('ارسال مجدد کد','Resend email code')}</button>
      </form>
    </div>:stage==='identifier'?<div>
      <div className="sh-auth-heading"><span className="sh-auth-label">{pick('حساب مشتری / ورود امن','CUSTOMER / SIGN IN')}</span>
       <h1>{pick('ورود به ناحیه کاربری','Welcome back')}</h1>
       <p>{pick('ایمیل یا شماره همراهی را که در اطلاعات حساب ثبت کرده‌ای وارد کن.','Enter your account email or the mobile number saved in your profile.')}</p></div>
      <form onSubmit={continueIdentifier} className="sh-auth-fields">
       <label>{pick('ایمیل یا شماره موبایل','Email or mobile number')}
        <div className="sh-auth-input"><AtSign size={20}/><input required autoComplete="username" dir="ltr" value={identifier} onChange={e=>setIdentifier(e.target.value)} placeholder="name@example.com / 09123456789"/></div>
       </label>
       {error&&<p className="sh-auth-error" role="alert">{error}</p>}
       <button className="sh-auth-submit" type="submit">{pick('ادامه و وارد کردن رمز','Continue to password')}{backIcon}</button>
      </form>
      <div className="sh-auth-switch">{pick('هنوز حساب نداری؟','New here?')} <Link href={path('/register')+nextQuery}>{t.register}</Link></div>
    </div>:<>
      <div className="sh-auth-heading"><span className="sh-auth-label">{signup?pick('حساب مشتری / ثبت‌نام','CUSTOMER / SIGN UP'):pick('حساب مشتری / ورود امن','CUSTOMER / SIGN IN')}</span>
       <h1>{signup?pick('ساخت حساب مشتری','Create your account'):pick('رمز عبور حساب','Your account password')}</h1>
       <p>{signup?pick('فقط ایمیل و رمز عبور لازم است. شماره همراه را بعداً در اطلاعات پروفایل ثبت کن.','Only email and password are needed. Add your mobile number later in your profile.'):pick('رمز عبور را وارد کن و عدد نمایش‌داده‌شده را تکرار کن.','Enter your password and repeat the number shown below.')}</p></div>
      <form onSubmit={submit} className="sh-auth-fields">
       {signup&&<label>{pick('نام و نام خانوادگی','Full name')}<div className="sh-auth-input"><UserRound size={20}/><input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={e=>setName(e.target.value)} placeholder={pick('نام کامل','Your full name')}/></div></label>}
       {signup?<label>{pick('آدرس ایمیل','Email address')}<div className="sh-auth-input"><Mail size={20}/><input type="email" dir="ltr" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></div></label>:
        <button type="button" className="sh-auth-text-action" onClick={()=>{setStage('identifier');setPassword('');setError('')}}>{pick('ویرایش شناسه:','Change identifier:')} <b dir="ltr">{identifier}</b></button>}
       <label>{pick('گذرواژه','Password')}<div className="sh-auth-input"><LockKeyhole size={20}/><input type={visible?'text':'password'} required autoComplete={signup?'new-password':'current-password'} minLength={signup?8:1} value={password} onChange={e=>setPassword(e.target.value)} placeholder={pick('گذرواژه امن','Secure password')}/><button type="button" onClick={()=>setVisible(v=>!v)} aria-label={visible?pick('پنهان کردن رمز','Hide password'):pick('نمایش رمز','Show password')}>{visible?<EyeOff size={19}/>:<Eye size={19}/>}</button></div></label>
       {signup&&<><label>{pick('تکرار گذرواژه','Confirm password')}<div className="sh-auth-input"><ShieldCheck size={20}/><input type={visible?'text':'password'} autoComplete="new-password" required minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={pick('تکرار رمز','Repeat password')}/></div></label>
        <label className="sh-auth-consent"><input required checked={terms} onChange={e=>setTerms(e.target.checked)} type="checkbox"/><span>{pick('شرایط استفاده','I agree to the')} <Link href={path('/terms')} target="_blank">{t.terms}</Link> {pick('و','and')} <Link href={path('/privacy')} target="_blank">{t.privacy}</Link> {pick('را مطالعه کرده و می‌پذیرم.','policies.')}</span></label></>}
       <div className="sh-auth-number-check">
        <div className="sh-auth-number-head"><span>{pick('عدد نمایشی را وارد کن','Repeat the displayed number')}</span>
         <button type="button" className="sh-auth-text-action" onClick={()=>void refreshCheck()} aria-label={pick('تولید عدد جدید','Get a new number')}><RefreshCw size={17}/></button></div>
        <div className="sh-auth-number-row"><strong dir="ltr" aria-label={pick('عدد تأیید','Verification number')}>{check?.digits||'••••••'}</strong>
         <input dir="ltr" inputMode="numeric" maxLength={6} pattern="[0-9]{6}" required value={answer} onChange={e=>setAnswer(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" aria-label={pick('تکرار عدد','Repeat number')}/></div>
        <small>{pick('این بررسی ساده جای تأیید مالکیت ایمیل یا CAPTCHA حرفه‌ای نیست.','This simple number check does not verify email ownership or replace a professional CAPTCHA.')}</small>
       </div>
       {error&&<p className="sh-auth-error" role="alert">{error}</p>}
       {notice&&<p className="sh-auth-notice" role="status">{notice}</p>}
       <button className="sh-auth-submit" disabled={loading||!check||answer.length!==6}>{loading?pick('در حال پردازش…','Processing…'):signup?pick('ساخت حساب','Create account'):pick('ورود به حساب','Sign in')}{backIcon}</button>
      </form>
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
