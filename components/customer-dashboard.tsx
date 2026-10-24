'use client';
import {useI18n} from '@/components/locale-provider';
import {orderStatusLabel,quoteStatusLabel} from '@/lib/status-labels';import {useState} from 'react';import {browserDb} from '@/lib/supabase/client';import {useRouter} from 'next/navigation';const money=(v:number,lang:'fa'|'en')=>new Intl.NumberFormat(lang==='fa'?'fa-IR':'en-US').format(v)+(lang==='fa'?' تومان':' Toman');import Link from 'next/link';import {ArrowUpLeft,LogOut,ImagePlus,UserRound,Trash2} from 'lucide-react';
type Order={id:string;status:string;total_toman:number;created_at:string;customer_note:string};type Quote={id:string;title:string;details:string;status:string;response:string;created_at:string};type CartItem={id:string;quantity:number;notes:string;products:{id:string;name:string;price_toman:number;mode:string;name_en?:string|null}|null};
export default function CustomerDashboard({name,avatarUrl,orders,quotes,items,audits}:{name:string;avatarUrl?:string|null;orders:Order[];quotes:Quote[];items:CartItem[];audits:{occurred_at:string;action:string}[]}){const {locale,path,pick}=useI18n();const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[note,setNote]=useState('');const [avatar,setAvatar]=useState<string|null>(avatarUrl||null),[avatarBusy,setAvatarBusy]=useState(false),[avatarMessage,setAvatarMessage]=useState('');const router=useRouter();const amount=items.reduce((sum,x)=>sum+(x.products?.price_toman||0)*x.quantity,0);

 async function uploadAvatar(e:React.ChangeEvent<HTMLInputElement>){
  const input=e.currentTarget,file=input.files?.[0];if(!file)return;
  setAvatarMessage('');
  if(file.size>3*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){
   setAvatarMessage(pick('فقط تصویر PNG، JPEG یا WebP تا ۳ مگابایت مجاز است.','Only PNG, JPEG or WebP images under 3 MB are allowed.'));input.value='';return;
  }
  setAvatarBusy(true);
  try{
   const body=new FormData();body.append('avatar',file);
   const res=await fetch('/api/profile/avatar',{method:'POST',body,credentials:'same-origin'});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||pick('بارگذاری عکس انجام نشد.','Photo upload failed.'));
   setAvatar(data.url||null);setAvatarMessage(pick('عکس پروفایل ذخیره شد.','Profile photo saved.'));router.refresh();
  }catch(err){setAvatarMessage(err instanceof Error?err.message:pick('خطای بارگذاری عکس.','Photo upload error.'));}
  finally{input.value='';setAvatarBusy(false);}
 }
 async function removeAvatar(){
  setAvatarBusy(true);setAvatarMessage('');
  try{const res=await fetch('/api/profile/avatar',{method:'DELETE',credentials:'same-origin'});const data=await res.json();
   if(!res.ok)throw new Error(data.error||pick('حذف عکس انجام نشد.','Could not remove the photo.'));
   setAvatar(null);setAvatarMessage(pick('عکس پروفایل حذف شد.','Profile photo removed.'));router.refresh();
  }catch(err){setAvatarMessage(err instanceof Error?err.message:pick('خطای حذف عکس.','Error removing photo.'));}
  finally{setAvatarBusy(false);}
 }
 async function checkout(){setBusy(true);setMessage('');const result=await fetch('/api/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({note})});const data=await result.json();if(result.ok){setMessage(pick('درخواست سفارش ثبت شد. پرداخت آنلاین انجام نشده است.','Order request submitted. No online payment was collected.'));router.refresh()}else setMessage(data.error||pick('ثبت سفارش موفق نبود','Order submission failed'));setBusy(false)}
 async function exit(){await browserDb()?.auth.signOut();router.push(path('/login'));router.refresh()}
 return <div className="dashboard">
 <section className="dashboard-profile-bar" aria-label={pick("عکس پروفایل مشتری","Customer profile photo")}>
  <div className="dashboard-avatar">{avatar?<img src={avatar} alt={pick('عکس پروفایل ','Profile photo of ')+name} referrerPolicy="no-referrer"/>:<UserRound size={44}/>}</div>
  <div className="profile-controls">
   <div><strong>{pick('عکس پروفایل من','My profile photo')}</strong><p>{pick('این تصویر در حساب شما و برای تشخیص صحیح مشتری در پنل مدیریت دیده می‌شود.','This photo helps you and our staff identify your account.')}</p></div>
   <label><ImagePlus size={17}/> {avatarBusy?pick('در حال ذخیره…','Saving...'):pick('انتخاب یا تغییر عکس','Upload or change photo')}
    <input type="file" accept="image/jpeg,image/png,image/webp" aria-label={pick("بارگذاری عکس پروفایل","Upload profile photo")} disabled={avatarBusy} onChange={uploadAvatar}/>
   </label>
   {avatar&&<button type="button" className="v2-outline" disabled={avatarBusy} onClick={removeAvatar}><Trash2 size={17}/> {pick('حذف عکس','Remove photo')}</button>}
   {avatarMessage&&<p role="status" className="v2-notice">{avatarMessage}</p>}
  </div>
 </section>
 <div className="dashboard-head"><div><span className="tiny-label">{pick('ناحیه اختصاصی مشتری','YOUR PERSONAL WORKSPACE')}</span><h1>{pick('سلام،','Hello,')} {name||pick('همراه عزیز','customer')}!</h1><p>{pick('سفارش‌ها، درخواست‌های قیمت و سبد خرید شما یک‌جا قابل مشاهده هستند.','View your orders, quote requests and cart in one place.')}</p></div><button className="v2-outline" onClick={exit}>{pick('خروج از حساب','Log out')} <LogOut size={18}/></button></div><div className="dashboard-stats"><div><span>{pick('درخواست‌های سفارش','Orders')}</span><strong>{orders.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')}</strong></div><div><span>{pick('استعلام‌های ثبت‌شده','Quote requests')}</span><strong>{quotes.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')}</strong></div><div><span>{pick('اقلام سبد حساب','Cart items')}</span><strong>{items.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')}</strong></div></div>
 <div className="dashboard-columns"><section className="dashboard-box"><h2>{pick('سبد خرید متصل به حساب','My shopping cart')}</h2>{items.length?items.map(x=><div className="dashboard-line" key={x.id}><span>{x.products?.name||pick('محصول حذف‌شده','Unavailable product')} × {x.quantity.toLocaleString(locale==='fa'?'fa-IR':'en-US')}</span><b>{x.products?.price_toman?money(x.quantity*x.products.price_toman,locale):pick('نیازمند بررسی','Pending review')}</b></div>):<div className="v2-empty">{pick('سبد حساب خالی است.','Your cart is empty.')} <Link href={path('/catalog')}>{pick('مشاهده محصولات','Browse products')}</Link></div>}{items.length>0&&<><div className="dashboard-total">{pick('جمع طبق قیمت ثبت‌شده','Cart total')} <strong>{money(amount,locale)}</strong></div><label className="input-label">{pick('توضیح تکمیلی سفارش','Order notes')}<textarea rows={2} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label><button disabled={busy} onClick={checkout} className="v2-primary">{pick('ثبت درخواست سفارش بدون پرداخت','Submit order for review')} <ArrowUpLeft size={18}/></button><p className="v2-fine">{pick('ثبت این درخواست جایگزین پرداخت نیست. پس از بررسی، شرایط پرداخت توسط مجموعه اعلام می‌شود.','Submitting this request is not a payment. We will confirm payment arrangements after review.')}</p></>}{message&&<p role="status" className="v2-notice">{message}</p>}</section>
 <section className="dashboard-box"><h2>{pick('سفارش‌های من','My orders')}</h2>{orders.length?orders.map(x=><div className="dashboard-line" key={x.id}><div><span>{pick('سفارش','Order')} {x.id.slice(0,8)}</span><small>{new Date(x.created_at).toLocaleDateString(locale==='fa'?'fa-IR':'en-US')} • {orderStatusLabel(x.status,locale)}</small></div><b>{money(x.total_toman,locale)}</b></div>):<p>{pick('هنوز سفارشی ثبت نشده است.','No orders yet.')}</p>}</section></div>
 <div className="dashboard-columns"><section className="dashboard-box"><h2>{pick('درخواست‌های استعلام','Quote requests')}</h2>{quotes.length?quotes.map(x=><div className="quote-line" key={x.id}><strong>{x.title}</strong><p>{x.details}</p><span>{pick('وضعیت:','Status:')} {quoteStatusLabel(x.status,locale)}</span>{x.response&&<blockquote>{pick('پاسخ چاپخانه:','Studio response:')} {x.response}</blockquote>}</div>):<p>{pick('درخواست استعلامی وجود ندارد.','No quote requests yet.')} <Link href={path('/order')}>{pick('ثبت استعلام جدید','Request a quote')}</Link></p>}</section><section className="dashboard-box"><h2>{pick('تغییرات ثبت‌شده توسط پشتیبانی','Support activity')}</h2>{audits.length?audits.map((a,i)=><div className="dashboard-line" key={i}><span>{pick('تغییر در سبد توسط مدیریت:','Cart updated by support:')} {a.action}</span><small>{new Date(a.occurred_at).toLocaleString(locale==='fa'?'fa-IR':'en-US')}</small></div>):<p>{pick('تغییری در سبد شما توسط پشتیبانی ثبت نشده است.','No support changes recorded.')}</p>}</section></div></div>}
