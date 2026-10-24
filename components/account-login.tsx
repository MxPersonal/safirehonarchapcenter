'use client';
import {useState} from 'react';
import {useI18n} from '@/components/locale-provider';
import {useRouter,useSearchParams} from 'next/navigation';
import {browserDb} from '@/lib/supabase/client';
import Link from 'next/link';
import {ArrowUpLeft,CheckCircle2,Eye,EyeOff,LockKeyhole,ShieldCheck,UserRound} from 'lucide-react';

export default function AccountLogin({mode}:{mode:'signin'|'signup'}){
 const {locale,pick,path,t}=useI18n();const router=useRouter(),search=useSearchParams(),db=browserDb();
 const next=search.get('next')||'/account';
 const safeNext=next.startsWith('/')&&!next.startsWith('//')&&!next.includes('\\')?next:'/account';
 const nextParam=safeNext==='/account'?'':'?next='+encodeURIComponent(path(safeNext));
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [visible,setVisible]=useState(false),[approved,setApproved]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();setMessage('');
  if(!db){setMessage(pick('اتصال امن به سامانه کاربران هنوز فعال نشده است.','Secure account login is not available yet.'));return}
  if(mode==='signup'&&(!approved||password!==confirm||name.trim().length<2)){setMessage(pick('نام، تکرار گذرواژه و پذیرش قوانین را بررسی کنید.','Check your name, password confirmation and agreement to the terms.'));return}
  setBusy(true);
  try{
   if(mode==='signup'){
    const {data,error}=await db.auth.signUp({email:email.trim(),password,options:{data:{display_name:name.trim()},emailRedirectTo:window.location.origin+'/auth/confirm'}});
    if(error)throw error;
    // Signup does not immediately grant access to the ordering interface.
    if(data.session)await db.auth.signOut({scope:'local'});
    setDone(true);setPassword('');setConfirm('');
   }else{
    const {error}=await db.auth.signInWithPassword({email:email.trim(),password});if(error)throw error;
    router.replace(path(safeNext));router.refresh();
   }
  }catch(e){const code=(e as {code?:string})?.code;setMessage(code==='invalid_credentials'?pick('ایمیل یا گذرواژه صحیح نیست.','Incorrect email or password.'):code==='email_not_confirmed'?pick('ابتدا ایمیل ثبت‌نام خود را تأیید کنید.','Please confirm your email address first.'):e instanceof Error?e.message:pick('عملیات انجام نشد.','The action could not be completed.'))}finally{setBusy(false)}
 }
 return <div className="v3-auth-shell"><div className="v3-auth-story"><span className="tiny-label">SAFIRE HONAR / YOUR CREATIVE SPACE</span><div className="v3-auth-illustration"><span>SH / PRINT</span><strong>{pick('از ایده','FROM IDEA')}<br/>{pick('تا ','TO ')}<em>{pick('اثر.','PRINT.')}</em></strong><div className="v3-auth-stamp">✳</div></div><h2>{pick('حساب خودت، مسیر چاپ خودت.','Your account. Your print journey.')}</h2><p>{pick('نمونه‌ها را ببین، سفارش‌ها را ثبت کن و روند بررسی و پیگیری را در یک جا داشته باش.','Explore print designs, request quotes and track your orders in one place.')}</p><div className="v3-auth-features"><span><ShieldCheck size={18}/> {pick('اطلاعات سفارش اختصاصی شما','Your orders stay in your account')}</span><span><CheckCircle2 size={18}/> {pick('پیگیری درخواست‌ها در حساب مشتری','Track your print requests')}</span></div></div>
 <div className="v3-auth-form-wrap"><div className="v3-auth-form"><span className="v3-auth-badge">{mode==='signup'?<UserRound size={24}/>:<LockKeyhole size={24}/>}</span>
  {done?<><h1>{pick('درخواست ثبت‌نام دریافت شد','Registration submitted')}</h1><p>{pick('اگر تأیید ایمیل در سامانه فعال باشد، ابتدا پیوند تأیید ارسال‌شده به ایمیل را باز کنید. سپس با ایمیل و گذرواژه خود وارد شوید.','Check your inbox for a confirmation link if email verification is enabled. Then sign in using your email and password.')}</p><Link className="v3-auth-submit" href={path('/login')+nextParam}>{pick('رفتن به صفحه ورود','Go to login')} <ArrowUpLeft size={19}/></Link></>:<>
   <span className="tiny-label">{mode==='signup'?'STEP 01 / CREATE ACCOUNT':'STEP 02 / SIGN IN'}</span>
   <h1>{mode==='signup'?pick('ساخت حساب مشتری','Create an account'):pick('ورود به ناحیه کاربری','Sign in to your account')}</h1>
   <p>{mode==='signup'?pick('اول ثبت‌نام کنید؛ سپس وارد شوید و سفارش خود را ثبت کنید.','Create an account first, then sign in to place orders.'):pick('با حساب ثبت‌شده خود وارد شوید تا سفارش‌ها، سبد و استعلام‌ها در دسترس باشند.','Sign in to manage your orders, cart and quote requests.')}</p>
   {search.get('registered')==='1'&&mode==='signin'&&<div className="v3-auth-success" role="status">{pick('ثبت‌نام انجام شد. در صورت نیاز ایمیل خود را تأیید کنید، سپس وارد شوید.','Registration complete. Confirm your email if required, then sign in.')}</div>}
   {search.get('verified')==='1'&&mode==='signin'&&<div className="v3-auth-success" role="status">{pick('ایمیل شما تأیید شد. اکنون می‌توانید وارد شوید.','Email confirmed. You can now sign in.')}</div>}
   <form onSubmit={submit} className="v3-auth-fields">{mode==='signup'&&<label>{pick('نام و نام خانوادگی','Full name')}<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder={pick("نام شما","Your full name")}/></label>}
    <label>{pick('آدرس ایمیل','Email address')}<input required type="email" autoComplete="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label>
    <label>{pick('گذرواژه','Password')} <span>{mode==='signup'?pick('حداقل ۸ نویسه','At least 8 characters'):''}</span><div className="v3-password-control"><input required type={visible?'text':'password'} autoComplete={mode==='signup'?'new-password':'current-password'} minLength={mode==='signup'?8:1} value={password} onChange={e=>setPassword(e.target.value)} placeholder={pick("گذرواژه امن","Secure password")}/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?pick('مخفی‌کردن گذرواژه','Hide password'):pick('نمایش گذرواژه','Show password')}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    {mode==='signup'&&<><label>{pick('تکرار گذرواژه','Confirm password')}<input required type={visible?'text':'password'} autoComplete="new-password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder={pick("تکرار گذرواژه","Repeat password")}/></label><label className="v3-auth-terms"><input type="checkbox" required checked={approved} onChange={e=>setApproved(e.target.checked)}/><span><Link href={path("/terms")} target="_blank">{t.terms}</Link> {pick('و','and')} <Link href={path("/privacy")} target="_blank">{t.privacy}</Link> {pick('را مطالعه و قبول کرده‌ام.','have been read and accepted.')}</span></label></>}
    {message&&<p role="alert" className="form-error">{message}</p>}
    <button className="v3-auth-submit" type="submit" disabled={busy||!db}>{busy?pick('در حال پردازش...','Processing...'):mode==='signup'?pick('ثبت‌نام و ساخت حساب','Create my account'):pick('ورود و ادامه سفارش','Sign in and continue')} <ArrowUpLeft size={19}/></button>
   </form>
   {!db&&<p className="v2-notice" role="status">{pick('ثبت‌نام و ورود واقعی تا زمان اتصال Supabase در Vercel غیرفعال است. هیچ حساب پیش‌فرضی وجود ندارد.','Accounts are unavailable until Supabase is connected. No default account exists.')}</p>}
   <div className="v3-auth-switch">{mode==='signup'?<>{pick('از قبل حساب داری؟','Already have an account?')} <Link href={path('/login')+nextParam}>{t.login}</Link></>:<>{pick('هنوز حساب نداری؟','New here?')} <Link href={path('/register')+nextParam}>{t.register}</Link></>}</div>
  </>}
  <Link href={path("/")} className="v2-subtle">{pick("بازگشت به وب‌سایت","Back to the website")}</Link>
 </div></div></div>
}
