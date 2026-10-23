'use client';
import {useState} from 'react';import {useRouter} from 'next/navigation';import {ArrowUpLeft,CheckCircle2,ShoppingBag} from 'lucide-react';import type {StoreProduct} from '@/lib/store';
export default function ProductOrder({product,signedIn}:{product:StoreProduct;signedIn:boolean}){
 const router=useRouter();const [quantity,setQuantity]=useState(1),[details,setDetails]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false);
 async function submit(){if(!consent)return;setBusy(true);setError('');try{
  const res=await fetch(product.mode==='fixed'?'/api/cart':'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(product.mode==='fixed'?{productId:product.id,quantity,notes:details}:{productId:product.id,title:product.name,details})});
  const data=await res.json();if(res.status===401){router.push('/login?next='+encodeURIComponent('/shop/'+product.slug));return}if(!res.ok)throw Error(data.error||'ثبت درخواست با مشکل مواجه شد.');
  if(product.mode==='fixed'){router.push('/account');router.refresh()}else{setSuccess(true);router.refresh()}
 }catch(e){setError(e instanceof Error?e.message:'خطای نامشخص')}finally{setBusy(false)}}
 if(!signedIn)return <div className="v3-order-guest"><h2>برای سفارش، ابتدا وارد حساب شوید</h2><p>اگر حساب ندارید، ثبت‌نام کنید و سپس وارد شوید تا سبد و استعلام فقط به حساب شما متصل باشد.</p><a className="v2-primary" href={'/login?next='+encodeURIComponent('/shop/'+product.slug)}>ورود به حساب <ArrowUpLeft size={18}/></a><a className="v2-outline" href={'/register?next='+encodeURIComponent('/shop/'+product.slug)}>ثبت‌نام مشتری جدید</a></div>;
 if(success)return <div className="v2-success"><CheckCircle2/><strong>درخواست استعلام ثبت شد</strong><p>در ناحیه کاربری می‌توانید وضعیت درخواست را دنبال کنید. ثبت استعلام به معنی رزرو زمان قطعی یا اعلام قیمت نیست.</p><a href="/account" className="v2-outline">ناحیه کاربری <ArrowUpLeft size={17}/></a></div>;
 return <div className="product-form">
 {product.mode==='fixed'&&<label className="input-label">تعداد<input type="number" min={1} max={100} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(100,Number(e.target.value)||1)))}/></label>}
 <label className="input-label">{product.mode==='quote'?'مشخصات درخواست، ابعاد و تیراژ':'توضیحات سفارشی (اختیاری)'}<textarea rows={4} value={details} onChange={e=>setDetails(e.target.value)} maxLength={2000} placeholder="ابعاد، جنس، تعداد، توضیحات و زمان موردنظر را وارد کنید..."/></label>
 <label className="confirm-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>متن و تعداد را بررسی کرده‌ام و می‌دانم ثبت درخواست به معنی پرداخت یا تأیید زمان چاپ نیست.</span></label>
 {error&&<p role="alert" className="form-error">{error}</p>}
 <button disabled={busy||!consent||(product.mode==='quote'&&details.trim().length<5)} className="v2-primary product-action" onClick={submit}>{busy?'در حال ثبت...':product.mode==='fixed'?'افزودن به سبد حساب من':'ثبت درخواست استعلام'}{product.mode==='fixed'?<ShoppingBag size={19}/>:<ArrowUpLeft size={19}/>}</button>
 <span className="v2-fine">برای ادامه باید وارد حساب کاربری شوید یا ثبت‌نام کنید.</span>
 </div>
}
