'use client';
import {useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {browserDb} from '@/lib/supabase/client';
import Link from 'next/link';
import {ArrowUpLeft,CheckCircle2,Eye,EyeOff,LockKeyhole,ShieldCheck,UserRound} from 'lucide-react';

export default function AccountLogin({mode}:{mode:'signin'|'signup'}){
 const router=useRouter(),search=useSearchParams(),db=browserDb();
 const next=search.get('next')||'/account';
 const safeNext=next.startsWith('/')&&!next.startsWith('//')&&!next.includes('\\')?next:'/account';
 const nextParam=safeNext==='/account'?'':'?next='+encodeURIComponent(safeNext);
 const [name,setName]=useState(''),[email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState('');
 const [visible,setVisible]=useState(false),[approved,setApproved]=useState(false),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 async function submit(e:React.FormEvent){
  e.preventDefault();setMessage('');
  if(!db){setMessage('اتصال امن به سامانه کاربران هنوز فعال نشده است.');return}
  if(mode==='signup'&&(!approved||password!==confirm||name.trim().length<2)){setMessage('نام، تکرار گذرواژه و پذیرش قوانین را بررسی کنید.');return}
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
    router.replace(safeNext);router.refresh();
   }
  }catch(e){const code=(e as {code?:string})?.code;setMessage(code==='invalid_credentials'?'ایمیل یا گذرواژه صحیح نیست.':code==='email_not_confirmed'?'ابتدا ایمیل ثبت‌نام خود را تأیید کنید.':e instanceof Error?e.message:'عملیات انجام نشد.')}finally{setBusy(false)}
 }
 return <div className="v3-auth-shell"><div className="v3-auth-story"><span className="tiny-label">SAFIRE HONAR / YOUR CREATIVE SPACE</span><div className="v3-auth-illustration"><span>SH / PRINT</span><strong>از ایده<br/>تا <em>اثر.</em></strong><div className="v3-auth-stamp">✳</div></div><h2>حساب خودت، مسیر چاپ خودت.</h2><p>نمونه‌ها را ببین، سفارش‌ها را ثبت کن و روند بررسی و پیگیری را در یک جا داشته باش.</p><div className="v3-auth-features"><span><ShieldCheck size={18}/> اطلاعات سفارش اختصاصی شما</span><span><CheckCircle2 size={18}/> پیگیری درخواست‌ها در حساب مشتری</span></div></div>
 <div className="v3-auth-form-wrap"><div className="v3-auth-form"><span className="v3-auth-badge">{mode==='signup'?<UserRound size={24}/>:<LockKeyhole size={24}/>}</span>
  {done?<><h1>درخواست ثبت‌نام دریافت شد</h1><p>اگر تأیید ایمیل در سامانه فعال باشد، ابتدا پیوند تأیید ارسال‌شده به ایمیل را باز کنید. سپس با ایمیل و گذرواژه خود وارد شوید.</p><Link className="v3-auth-submit" href={'/login'+nextParam}>رفتن به صفحه ورود <ArrowUpLeft size={19}/></Link></>:<>
   <span className="tiny-label">{mode==='signup'?'STEP 01 / CREATE ACCOUNT':'STEP 02 / SIGN IN'}</span>
   <h1>{mode==='signup'?'ساخت حساب مشتری':'ورود به ناحیه کاربری'}</h1>
   <p>{mode==='signup'?'اول ثبت‌نام کنید؛ سپس وارد شوید و سفارش خود را ثبت کنید.':'با حساب ثبت‌شده خود وارد شوید تا سفارش‌ها، سبد و استعلام‌ها در دسترس باشند.'}</p>
   {search.get('registered')==='1'&&mode==='signin'&&<div className="v3-auth-success" role="status">ثبت‌نام انجام شد. در صورت نیاز ایمیل خود را تأیید کنید، سپس وارد شوید.</div>}
   {search.get('verified')==='1'&&mode==='signin'&&<div className="v3-auth-success" role="status">ایمیل شما تأیید شد. اکنون می‌توانید وارد شوید.</div>}
   <form onSubmit={submit} className="v3-auth-fields">{mode==='signup'&&<label>نام و نام خانوادگی<input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} autoComplete="name" placeholder="نام شما"/></label>}
    <label>آدرس ایمیل<input required type="email" autoComplete="email" dir="ltr" value={email} onChange={e=>setEmail(e.target.value)} placeholder="name@example.com"/></label>
    <label>گذرواژه <span>{mode==='signup'?'حداقل ۸ نویسه':''}</span><div className="v3-password-control"><input required type={visible?'text':'password'} autoComplete={mode==='signup'?'new-password':'current-password'} minLength={mode==='signup'?8:1} value={password} onChange={e=>setPassword(e.target.value)} placeholder="گذرواژه امن"/><button type="button" onClick={()=>setVisible(!visible)} aria-label={visible?'مخفی‌کردن گذرواژه':'نمایش گذرواژه'}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
    {mode==='signup'&&<><label>تکرار گذرواژه<input required type={visible?'text':'password'} autoComplete="new-password" minLength={8} value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="تکرار گذرواژه"/></label><label className="v3-auth-terms"><input type="checkbox" required checked={approved} onChange={e=>setApproved(e.target.checked)}/><span><Link href="/terms" target="_blank">قوانین و شرایط</Link> و <Link href="/privacy" target="_blank">حریم خصوصی</Link> را مطالعه و قبول کرده‌ام.</span></label></>}
    {message&&<p role="alert" className="form-error">{message}</p>}
    <button className="v3-auth-submit" type="submit" disabled={busy||!db}>{busy?'در حال پردازش...':mode==='signup'?'ثبت‌نام و ساخت حساب':'ورود و ادامه سفارش'} <ArrowUpLeft size={19}/></button>
   </form>
   {!db&&<p className="v2-notice" role="status">ثبت‌نام و ورود واقعی تا زمان اتصال Supabase در Vercel غیرفعال است. هیچ حساب پیش‌فرضی وجود ندارد.</p>}
   <div className="v3-auth-switch">{mode==='signup'?<>از قبل حساب داری؟ <Link href={'/login'+nextParam}>ورود به حساب</Link></>:<>هنوز حساب نداری؟ <Link href={'/register'+nextParam}>اول ثبت‌نام کن</Link></>}</div>
  </>}
  <Link href="/" className="v2-subtle">بازگشت به وب‌سایت</Link>
 </div></div></div>
}
