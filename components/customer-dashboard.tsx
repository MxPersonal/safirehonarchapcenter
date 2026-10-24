'use client';import {useState} from 'react';import {browserDb} from '@/lib/supabase/client';import {useRouter} from 'next/navigation';const tomans=(v:number)=>new Intl.NumberFormat('fa-IR').format(v)+' تومان';import Link from 'next/link';import {ArrowUpLeft,LogOut,ImagePlus,UserRound,Trash2} from 'lucide-react';
type Order={id:string;status:string;total_toman:number;created_at:string;customer_note:string};type Quote={id:string;title:string;details:string;status:string;response:string;created_at:string};type CartItem={id:string;quantity:number;notes:string;products:{id:string;name:string;price_toman:number;mode:string}|null};
export default function CustomerDashboard({name,avatarUrl,orders,quotes,items,audits}:{name:string;avatarUrl?:string|null;orders:Order[];quotes:Quote[];items:CartItem[];audits:{occurred_at:string;action:string}[]}){const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[note,setNote]=useState('');const [avatar,setAvatar]=useState<string|null>(avatarUrl||null),[avatarBusy,setAvatarBusy]=useState(false),[avatarMessage,setAvatarMessage]=useState('');const router=useRouter();const amount=items.reduce((sum,x)=>sum+(x.products?.price_toman||0)*x.quantity,0);

 async function uploadAvatar(e:React.ChangeEvent<HTMLInputElement>){
  const input=e.currentTarget,file=input.files?.[0];if(!file)return;
  setAvatarMessage('');
  if(file.size>3*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){
   setAvatarMessage('فقط تصویر PNG، JPEG یا WebP تا ۳ مگابایت مجاز است.');input.value='';return;
  }
  setAvatarBusy(true);
  try{
   const body=new FormData();body.append('avatar',file);
   const res=await fetch('/api/profile/avatar',{method:'POST',body,credentials:'same-origin'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||'بارگذاری عکس انجام نشد.');
   setAvatar(data.url||null);setAvatarMessage('عکس پروفایل ذخیره شد.');router.refresh();
  }catch(err){setAvatarMessage(err instanceof Error?err.message:'خطای بارگذاری عکس.');}
  finally{input.value='';setAvatarBusy(false);}
 }
 async function removeAvatar(){
  setAvatarBusy(true);setAvatarMessage('');
  try{const res=await fetch('/api/profile/avatar',{method:'DELETE',credentials:'same-origin'});const data=await res.json();
   if(!res.ok)throw new Error(data.error||'حذف عکس انجام نشد.');
   setAvatar(null);setAvatarMessage('عکس پروفایل حذف شد.');router.refresh();
  }catch(err){setAvatarMessage(err instanceof Error?err.message:'خطای حذف عکس.');}
  finally{setAvatarBusy(false);}
 }
 async function checkout(){setBusy(true);setMessage('');const result=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({note})});const data=await result.json();if(result.ok){setMessage('درخواست سفارش ثبت شد. پرداخت آنلاین انجام نشده است.');router.refresh()}else setMessage(data.error||'ثبت سفارش موفق نبود');setBusy(false)}
 async function exit(){await browserDb()?.auth.signOut();router.push('/login');router.refresh()}
 return <div className="dashboard">
 <section className="dashboard-profile-bar" aria-label="عکس پروفایل مشتری">
  <div className="dashboard-avatar">{avatar?<img src={avatar} alt={'عکس پروفایل '+name} referrerPolicy="no-referrer"/>:<UserRound size={44}/>}</div>
  <div className="profile-controls">
   <div><strong>عکس پروفایل من</strong><p>این تصویر در حساب شما و برای تشخیص صحیح مشتری در پنل مدیریت دیده می‌شود.</p></div>
   <label><ImagePlus size={17}/> {avatarBusy?'در حال ذخیره…':'انتخاب یا تغییر عکس'}
    <input type="file" accept="image/jpeg,image/png,image/webp" aria-label="بارگذاری عکس پروفایل" disabled={avatarBusy} onChange={uploadAvatar}/>
   </label>
   {avatar&&<button type="button" className="v2-outline" disabled={avatarBusy} onClick={removeAvatar}><Trash2 size={17}/> حذف عکس</button>}
   {avatarMessage&&<p role="status" className="v2-notice">{avatarMessage}</p>}
  </div>
 </section>
 <div className="dashboard-head"><div><span className="tiny-label">YOUR PERSONAL WORKSPACE</span><h1>سلام، {name||'همراه عزیز'}!</h1><p>سفارش‌ها، درخواست‌های قیمت و سبد خرید شما یک‌جا قابل مشاهده هستند.</p></div><button className="v2-outline" onClick={exit}>خروج از حساب <LogOut size={18}/></button></div><div className="dashboard-stats"><div><span>درخواست‌های سفارش</span><strong>{orders.length.toLocaleString('fa-IR')}</strong></div><div><span>استعلام‌های ثبت‌شده</span><strong>{quotes.length.toLocaleString('fa-IR')}</strong></div><div><span>اقلام سبد حساب</span><strong>{items.length.toLocaleString('fa-IR')}</strong></div></div>
 <div className="dashboard-columns"><section className="dashboard-box"><h2>سبد خرید متصل به حساب</h2>{items.length?items.map(x=><div className="dashboard-line" key={x.id}><span>{x.products?.name||'محصول حذف‌شده'} × {x.quantity.toLocaleString('fa-IR')}</span><b>{x.products?.price_toman?tomans(x.quantity*x.products.price_toman):'نیازمند بررسی'}</b></div>):<div className="v2-empty">سبد حساب خالی است. <Link href="/catalog">مشاهده محصولات</Link></div>}{items.length>0&&<><div className="dashboard-total">جمع طبق قیمت ثبت‌شده <strong>{tomans(amount)}</strong></div><label className="input-label">توضیح تکمیلی سفارش<textarea rows={2} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label><button disabled={busy} onClick={checkout} className="v2-primary">ثبت درخواست سفارش بدون پرداخت <ArrowUpLeft size={18}/></button><p className="v2-fine">ثبت این درخواست جایگزین پرداخت نیست. پس از بررسی، شرایط پرداخت توسط مجموعه اعلام می‌شود.</p></>}{message&&<p role="status" className="v2-notice">{message}</p>}</section>
 <section className="dashboard-box"><h2>سفارش‌های من</h2>{orders.length?orders.map(x=><div className="dashboard-line" key={x.id}><div><span>سفارش {x.id.slice(0,8)}</span><small>{new Date(x.created_at).toLocaleDateString('fa-IR')} • {x.status}</small></div><b>{tomans(x.total_toman)}</b></div>):<p>هنوز سفارشی ثبت نشده است.</p>}</section></div>
 <div className="dashboard-columns"><section className="dashboard-box"><h2>درخواست‌های استعلام</h2>{quotes.length?quotes.map(x=><div className="quote-line" key={x.id}><strong>{x.title}</strong><p>{x.details}</p><span>وضعیت: {x.status}</span>{x.response&&<blockquote>پاسخ چاپخانه: {x.response}</blockquote>}</div>):<p>درخواست استعلامی وجود ندارد. <Link href="/order">ثبت استعلام جدید</Link></p>}</section><section className="dashboard-box"><h2>تغییرات ثبت‌شده توسط پشتیبانی</h2>{audits.length?audits.map((a,i)=><div className="dashboard-line" key={i}><span>تغییر در سبد توسط مدیریت: {a.action}</span><small>{new Date(a.occurred_at).toLocaleString('fa-IR')}</small></div>):<p>تغییری در سبد شما توسط پشتیبانی ثبت نشده است.</p>}</section></div></div>}
