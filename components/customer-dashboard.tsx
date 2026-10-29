'use client';
import {useState} from 'react';
import {useI18n} from '@/components/locale-provider';
import {orderStatusLabel,quoteStatusLabel} from '@/lib/status-labels';
import {browserDb} from '@/lib/supabase/client';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {ArrowUpLeft,LogOut,ImagePlus,UserRound,Trash2,LayoutDashboard,ShoppingCart,ReceiptText,MessagesSquare,ShieldCheck,MapPin,CheckCircle2} from 'lucide-react';
import CustomerProfileEditor from '@/components/customer-profile-editor';

type Order={id:string;status:string;total_toman:number;created_at:string;customer_note:string};
type Quote={id:string;title:string;details:string;status:string;response:string;created_at:string};
type CartItem={id:string;quantity:number;notes:string;products:{id:string;name:string;price_toman:number;mode:string;name_en?:string|null}|null};
type Props={name:string;email:string;emailVerified:boolean;avatarUrl?:string|null;
 orders:Order[];quotes:Quote[];items:CartItem[];audits:{occurred_at:string;action:string}[]};
type Pane='overview'|'orders'|'quotes'|'cart'|'profile';

export default function CustomerDashboard({name,email,emailVerified,avatarUrl,orders,quotes,items,audits}:Props){
 const {locale,path,pick}=useI18n();
 const [pane,setPane]=useState<Pane>('overview');
 const [busy,setBusy]=useState(false),[message,setMessage]=useState(''),[note,setNote]=useState('');
 const [avatar,setAvatar]=useState<string|null>(avatarUrl||null),[avatarBusy,setAvatarBusy]=useState(false),[avatarMessage,setAvatarMessage]=useState('');
 const router=useRouter();
 const amount=items.reduce((sum,x)=>sum+(x.products?.price_toman||0)*x.quantity,0);
 const fmt=(v:number)=>new Intl.NumberFormat(locale==='fa'?'fa-IR':'en-US').format(v);
 const money=(v:number)=>fmt(v)+(locale==='fa'?' تومان':' Toman');
 const menu=[
  {id:'overview' as Pane,label:pick('داشبورد','Dashboard'),icon:LayoutDashboard},
  {id:'orders' as Pane,label:pick('سفارش‌ها','Orders'),icon:ReceiptText},
  {id:'quotes' as Pane,label:pick('استعلام‌ها','Quotes'),icon:MessagesSquare},
  {id:'cart' as Pane,label:pick('سبد خرید','Cart'),icon:ShoppingCart},
  {id:'profile' as Pane,label:pick('پروفایل و امنیت','Profile & security'),icon:ShieldCheck}
 ];
 async function uploadAvatar(e:React.ChangeEvent<HTMLInputElement>){
  const input=e.currentTarget,file=input.files?.[0];if(!file)return;
  setAvatarMessage('');
  if(file.size>3*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){
   setAvatarMessage(pick('فقط PNG، JPG یا WebP تا سه مگابایت.','Only PNG, JPG or WebP up to 3 MB.'));input.value='';return;
  }
  setAvatarBusy(true);
  try{
   const body=new FormData();body.append('avatar',file);
   const res=await fetch('/api/profile/avatar',{method:'POST',body,credentials:'same-origin'});
   const data=await res.json();
   if(!res.ok)throw Error(data.error||pick('آپلود تصویر ناموفق بود.','Upload failed.'));
   setAvatar(data.url||null);window.dispatchEvent(new Event('safir-profile-changed'));setAvatarMessage(pick('تصویر پروفایل ذخیره شد.','Profile image saved.'));router.refresh();
  }catch(err){setAvatarMessage(err instanceof Error?err.message:pick('خطای بارگذاری تصویر','Upload error'))}
  finally{input.value='';setAvatarBusy(false)}
 }
 async function removeAvatar(){
  setAvatarBusy(true);setAvatarMessage('');
  try{
   const res=await fetch('/api/profile/avatar',{method:'DELETE',credentials:'same-origin'});const data=await res.json();
   if(!res.ok)throw Error(data.error||pick('حذف تصویر ناموفق بود.','Removal failed.'));
   setAvatar(null);window.dispatchEvent(new Event('safir-profile-changed'));setAvatarMessage(pick('عکس حذف شد.','Photo removed.'));router.refresh();
  }catch(err){setAvatarMessage(err instanceof Error?err.message:pick('خطای حذف','Removal error'))}
  finally{setAvatarBusy(false)}
 }
 async function checkout(){
  setBusy(true);setMessage('');
  try{
   const res=await fetch('/api/checkout',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({note})});
   const data=await res.json();
   if(!res.ok)throw Error(data.error||pick('ثبت سفارش ناموفق بود.','Could not submit order.'));
   setMessage(pick('درخواست سفارش ثبت شد؛ پرداختی انجام نشده است.','Order request submitted; no payment was collected.'));router.refresh();
  }catch(e){setMessage(e instanceof Error?e.message:pick('ثبت ناموفق بود.','Submission failed.'))}
  finally{setBusy(false)}
 }
 async function logout(){await browserDb()?.auth.signOut();router.push(path('/login'));router.refresh();}
 const orderList=<section className="sh-customer-card"><h2>{pick('سفارش‌های من','My orders')}</h2>
  {orders.length?orders.map(o=><div className="sh-customer-list-row" key={o.id}>
    <div><strong>{pick('سفارش','Order')} #{o.id.slice(0,8)}</strong>
    <small>{new Date(o.created_at).toLocaleDateString(locale==='fa'?'fa-IR':'en-US')}</small></div>
    <div><span className="sh-customer-pill">{orderStatusLabel(o.status,locale)}</span><strong>{money(o.total_toman)}</strong></div>
  </div>):<p className="sh-customer-empty">{pick('هنوز سفارش ثبت نشده است.','No orders yet.')}</p>}
 </section>;
 const quoteList=<section className="sh-customer-card"><h2>{pick('درخواست‌های استعلام','Quote requests')}</h2>
  {quotes.length?quotes.map(q=><div key={q.id} className="sh-customer-list-row"><div><strong>{q.title}</strong><p>{q.details}</p>{q.response&&<small>{pick('پاسخ مجموعه:','Studio response:')} {q.response}</small>}</div><span className="sh-customer-pill">{quoteStatusLabel(q.status,locale)}</span></div>)
   :<p className="sh-customer-empty">{pick('درخواست استعلامی ندارید.','No quotes yet.')} <Link href={path('/order')}>{pick('ثبت استعلام','Request a quote')}</Link></p>}
 </section>;
 const cart=<section className="sh-customer-card"><h2>{pick('سبد خرید شما','Your cart')}</h2>
  {items.length?items.map(x=><div className="sh-customer-list-row" key={x.id}><strong>{x.products?.name||pick('محصول ناموجود','Unavailable product')} × {fmt(x.quantity)}</strong><span>{x.products?.price_toman?money(x.quantity*x.products.price_toman):pick('نیازمند بررسی','Requires review')}</span></div>):
   <p className="sh-customer-empty">{pick('سبد خالی است.','The cart is empty.')} <Link href={path('/catalog')}>{pick('مشاهده محصولات','Browse products')}</Link></p>}
  {items.length>0&&<div className="sh-customer-checkout"><strong>{pick('جمع','Total')}: {money(amount)}</strong>
   <label>{pick('توضیحات سفارش','Order notes')}<textarea rows={3} maxLength={2000} value={note} onChange={e=>setNote(e.target.value)}/></label>
   <button type="button" disabled={busy} onClick={checkout} className="sh-profile-save">{pick('ثبت درخواست سفارش','Submit order request')} <ArrowUpLeft size={18}/></button>
   <small>{pick('این درخواست پرداخت محسوب نمی‌شود.','Submitting does not collect payment.')}</small>
   {message&&<p role="status">{message}</p>}
  </div>}
 </section>;
 return <div className="sh-customer-workspace">
  <div className="sh-customer-welcome">
   <div><span className="tiny-label">{pick('ناحیه اختصاصی مشتری','CUSTOMER WORKSPACE')}</span>
   <h1>{pick('سلام،','Welcome,')} {name||pick('مشتری عزیز','customer')}</h1>
   <p>{pick('سفارش‌ها، پروفایل و اطلاعات تحویل را در همین حساب مدیریت کن.','Manage orders, your profile and delivery details here.')}</p></div>
   <button type="button" onClick={logout} className="v2-outline"><LogOut size={17}/>{pick('خروج از حساب','Sign out')}</button>
  </div>
  <div className="sh-customer-profile-strip">
   <div className="sh-customer-avatar">{avatar?<img src={avatar} alt={pick('تصویر پروفایل','Profile photo')}/>:<UserRound size={38}/>}</div>
   <div><strong>{name||pick('حساب مشتری','Customer account')}</strong><small dir="ltr">{email}</small>
    <span className="sh-customer-verified"><CheckCircle2 size={15}/>{emailVerified?pick('ایمیل تأییدشده','Email verified'):pick('ایمیل نیازمند تأیید','Email requires confirmation')}</span></div>
   <div className="sh-customer-photo-actions">
    <label><ImagePlus size={16}/>{avatarBusy?pick('در حال ذخیره…','Saving…'):pick('تغییر عکس','Change photo')}
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadAvatar} disabled={avatarBusy}/></label>
    {avatar&&<button type="button" onClick={removeAvatar} disabled={avatarBusy}><Trash2 size={16}/>{pick('حذف عکس','Remove')}</button>}
   </div>
   {avatarMessage&&<p className="sh-photo-message" role="status">{avatarMessage}</p>}
  </div>
  <nav className="sh-customer-tabs" aria-label={pick('بخش‌های حساب مشتری','Customer account sections')}>
   {menu.map(({id,label,icon:Icon})=><button type="button" key={id} aria-current={pane===id?'page':undefined} onClick={()=>setPane(id)}><Icon size={18}/>{label}</button>)}
  </nav>
  {pane==='overview'&&<>
   <div className="sh-customer-stats">
    {[
     {title:pick('سفارش‌ها','Orders'),num:orders.length,go:'orders' as Pane,icon:ReceiptText},
     {title:pick('استعلام‌ها','Quotes'),num:quotes.length,go:'quotes' as Pane,icon:MessagesSquare},
     {title:pick('اقلام سبد','Cart items'),num:items.length,go:'cart' as Pane,icon:ShoppingCart}
    ].map(x=><button key={x.go} type="button" onClick={()=>setPane(x.go)}>
     <span><x.icon size={19}/>{x.title}</span><strong>{fmt(x.num)}</strong><small>{pick('مشاهده جزئیات','View details')} <ArrowUpLeft size={14}/></small>
    </button>)}
   </div>
   <div className="sh-customer-split">{orderList}{cart}</div>
   <div className="sh-customer-split">{quoteList}
    <section className="sh-customer-card"><h2>{pick('فعالیت پشتیبانی','Support activity')}</h2>
     {audits.length?audits.map((a,i)=><div className="sh-customer-list-row" key={i}><span>{a.action}</span><small>{new Date(a.occurred_at).toLocaleString(locale==='fa'?'fa-IR':'en-US')}</small></div>):
      <p className="sh-customer-empty">{pick('هنوز فعالیتی ثبت نشده است.','No support activity yet.')}</p>}
    </section></div>
  </>}
  {pane==='orders'&&orderList}
  {pane==='quotes'&&quoteList}
  {pane==='cart'&&cart}
  {pane==='profile'&&<CustomerProfileEditor email={email} verified={emailVerified}/>}
  <div className="sh-customer-footer"><MapPin size={17}/>{pick('برای دریافت سفارش در آدرس دلخواه، نشانی را در بخش پروفایل تکمیل کن.','Add your delivery address in Profile.')}</div>
 </div>;
}
