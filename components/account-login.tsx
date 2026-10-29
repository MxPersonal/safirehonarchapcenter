'use client';
import {useRef,useState} from 'react';
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
 const [stage,setStage]=useState<'sms'|'form'|'verify'|'complete'>(mode==='signup'?'sms':'form');
 const [code,setCode]=useState(''),[loading,setLoading]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [verificationEmail,setVerificationEmail]=useState('');
 const [autoConfirmedDuringSignup,setAutoConfirmedDuringSignup]=useState(false);

 const [phone,setPhone]=useState(''),[smsCode,setSmsCode]=useState(''),[smsSent,setSmsSent]=useState(false);
 const requestInFlight=useRef(false);
 async function phoneAction(action:'send'|'verify'){
  if(requestInFlight.current)return;
  requestInFlight.current=true;setLoading(true);setError('');setNotice('');
  try{
   const response=await fetch('/api/customer-otp/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,...(action==='verify'?{code:smsCode}:{})})});
   const data=await response.json();
   if(!response.ok||action==='verify'&&data.verified!==true){
    throw Error(data.error==='RATE_LIMITED'?pick('برای ارسال دوباره کمی صبر کن.','Wait before requesting a new code.'):data.error==='OTPY_NOT_CONFIGURED'?pick('سرویس پیامکی هنوز تنظیم نشده است.','SMS service is not configured.'):data.error==='INVALID_PHONE'?pick('شماره همراه ایران معتبر نیست.','Invalid Iranian mobile number.'):pick('ارسال یا تأیید پیامک ناموفق بود.','SMS request or verification failed.'));
   }
   if(action==='send'){setSmsSent(true);setNotice(pick('کد پیامکی درخواست شد.','SMS code requested.'))}
   else{setStage('form');setNotice(pick('موبایل تأیید شد؛ ثبت‌نام را کامل کن.','Phone verified. Complete registration.'))}
  }catch(e){setError(e instanceof Error?e.message:pick('خطا در اتصال پیامکی','SMS error'))}
  finally{requestInFlight.current=false;setLoading(false)}
 }

 async function submit(event:React.FormEvent){
  event.preventDefault();if(requestInFlight.current)return;
  setError('');setNotice('');
  if(!db){setError(pick('سرویس کاربران هنوز وصل نشده است.','Account service is unavailable.'));return}
  if(signup&&(!terms||name.trim().length<2||password!==confirm)){
   setError(pick('نام، تکرار رمز و پذیرش قوانین را بررسی کن.','Check name, password confirmation and terms.'));return;
  }
  requestInFlight.current=true;setLoading(true);
  try{
   if(signup){
    const address=email.trim().toLowerCase();
    const response=await fetch('/api/customer-otp/register',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({phone,name:name.trim(),email:address,password})});
    const result=await response.json();
    if(!response.ok){
     if(result.error==='ACCOUNT_CREATED_WITHOUT_EMAIL_CHALLENGE'){
      setAutoConfirmedDuringSignup(true);
      setStage('complete');
      setPassword('');setConfirm('');
      return;
     }
     const messages:Record<string,string>={
      PHONE_VERIFICATION_REQUIRED:pick('تأیید موبایل منقضی شد؛ ثبت‌نام را دوباره از مرحله پیامک آغاز کن.','Phone verification expired. Restart signup with SMS.'),
      EMAIL_CONFIRMATION_DISABLED:pick('تأیید ایمیل در Supabase خاموش است. مدیر سایت باید از Authentication → Sign In / Providers → Email گزینه Confirm email را روشن کند.','Email verification is disabled in Supabase. The site administrator must enable Confirm email in Authentication → Sign In / Providers → Email.'),
      AUTH_CONFIG_UNAVAILABLE:pick('بررسی تنظیمات تأیید ایمیل در Supabase ممکن نشد. دوباره تلاش کن.','Unable to check Supabase email verification settings. Try again.'),
      AUTH_NOT_CONFIGURED:pick('اتصال Supabase در سرور تنظیم نشده است.','Supabase is not configured on the server.'),
      EMAIL_SIGNUP_DISABLED:pick('ثبت‌نام ایمیلی در Supabase غیرفعال است.','Email signup is disabled in Supabase.'),
     };
     throw Error(messages[result.error]||pick('ثبت‌نام ممکن نشد؛ اطلاعات را بررسی کن.','Could not register. Check your information.'));
    }
    setVerificationEmail(address);setStage('verify');setPassword('');setConfirm('');
    setNotice(pick('کد تأیید ایمیل درخواست شد. پوشه هرزنامه را هم بررسی کن.','Email confirmation requested. Check your inbox and spam.'));
   }else{
    const {error:e}=await db.auth.signInWithPassword({email:email.trim(),password});
    if(e)throw e;
    router.replace(nextUrl);router.refresh();
   }
  }catch(e){setError(e instanceof Error?e.message:pick('عملیات ناموفق بود.','Request failed.'))}
  finally{requestInFlight.current=false;setLoading(false)}
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
  if(!db||!verificationEmail||loading)return;
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
    <div className="sh-auth-upper"><span className="sh-auth-number">01 / {signup?'04':'02'}</span><span className="sh-auth-lock"><LockKeyhole size={18}/></span></div>
    <div className="sh-auth-flow" aria-label={pick('مراحل ساخت حساب','Account steps')}>
     {(signup?[
      pick('تأیید موبایل','Verify phone'),pick('حساب کاربری','Account'),pick('تأیید ایمیل','Verify email'),pick('پروفایل','Profile')
     ]:[pick('ورود','Sign in'),pick('داشبورد','Dashboard')]).map((item,i)=>
      <span key={item} className={'sh-auth-flow-step'+((stage==='sms'?i===0:stage==='form'?i<=(signup?1:0):stage==='verify'?i<=2:true)?' is-done':'')}>
       <b>{i+1}</b><small>{item}</small>
      </span>
     )}
    </div>
    {stage==='sms'?<div className="sh-auth-verify">
      <div className="sh-auth-heading"><span className="sh-auth-label">{pick('مرحله ۱ / کد پیامکی','STEP 1 / SMS CODE')}</span>
       <h1>{pick('تأیید شماره همراه','Verify mobile number')}</h1>
       <p>{pick('برای ساخت حساب، شماره موبایل خود را با پیامک تأیید کن.','Verify your Iranian mobile number before registration.')}</p></div>
      <div className="sh-auth-fields">
       <label>{pick('شماره موبایل','Mobile number')}<input type="tel" dir="ltr" inputMode="tel" autoComplete="tel" maxLength={11} required disabled={smsSent} value={phone} onChange={e=>setPhone(e.target.value)} placeholder="09123456789"/></label>
       {smsSent&&<label>{pick('کد پیامکی','SMS code')}<input dir="ltr" inputMode="numeric" autoComplete="one-time-code" maxLength={8} required value={smsCode} onChange={e=>setSmsCode(e.target.value.replace(/\D/g,'').slice(0,8))} placeholder="000000"/></label>}
       {error&&<p className="sh-auth-error" role="alert">{error}</p>}
       {notice&&<p className="sh-auth-notice" role="status">{notice}</p>}
       {!smsSent?<button type="button" disabled={loading||phone.length!==11} className="sh-auth-submit" onClick={()=>phoneAction('send')}>{loading?pick('در حال ارسال…','Sending…'):pick('دریافت کد پیامکی','Send SMS code')}{backIcon}</button>:
       <><button type="button" disabled={loading||smsCode.length<4} className="sh-auth-submit" onClick={()=>phoneAction('verify')}>{loading?pick('در حال بررسی…','Verifying…'):pick('تأیید کد و ادامه','Verify and continue')}{backIcon}</button>
        <button type="button" className="sh-auth-text-action" disabled={loading} onClick={()=>{setSmsSent(false);setSmsCode('');setError('');setNotice('')}}>{pick('تغییر شماره / ارسال دوباره','Change phone / resend')}</button></>}
      </div>
     </div>:stage==='complete'?<div className="sh-auth-done"><CheckCircle2 size={43}/>
      <h1>{autoConfirmedDuringSignup?pick('حساب ساخته شد، اما بدون تأیید دستی ایمیل','Account created without manual email confirmation'):pick('ایمیل تأیید شد','Email verified')}</h1>
      <p>{autoConfirmedDuringSignup?
       pick('Supabase ایمیل را به‌صورت خودکار تأیید کرده است. برای ثبت‌نام‌های بعدی، مدیر باید Confirm email را روشن کند. این حساب را دوباره ثبت‌نام نکن؛ می‌توانی با اطلاعات همین حساب وارد شوی.','Supabase auto-confirmed the email. The administrator must enable Confirm email for future registrations. Do not sign up again; use this account to sign in.'):
       pick('حساب شما فعال شد. حالا می‌توانی وارد شوی و اطلاعات پروفایل را تکمیل کنی.','Your account is confirmed. Sign in to complete your profile.')}</p>
      <Link href={path('/login')+nextQuery} className="sh-auth-submit">{pick('ورود به حساب','Sign in')}{backIcon}</Link>
     </div>:stage==='verify'?<div className="sh-auth-verify">
      <div className="sh-auth-heading"><span className="sh-auth-label">{pick('مرحله ۳ / تأیید نشانی ایمیل','STEP 3 / EMAIL VERIFICATION')}</span>
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
       <p>{signup?pick('شماره همراه تأیید شد؛ اطلاعات را وارد کن و ایمیلت را هم تأیید کن.','Create an account, then verify your email with a code.'):pick('سفارش‌ها، پروفایل و درخواست‌هایت در یک فضای اختصاصی.','Your orders, profile and requests in one workspace.')}</p></div>
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
