'use client';
import {useI18n} from '@/components/locale-provider';

import {useState} from 'react';import {useRouter} from 'next/navigation';import {ArrowUpLeft,CheckCircle2,ShoppingBag} from 'lucide-react';import type {StoreProduct} from '@/lib/store';
export default function ProductOrder({product,signedIn}:{product:StoreProduct;signedIn:boolean}){
 const {path,pick}=useI18n();const router=useRouter();const [quantity,setQuantity]=useState(1),[details,setDetails]=useState(''),[consent,setConsent]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false);
 async function submit(){if(!consent)return;setBusy(true);setError('');try{
  const res=await fetch(product.mode==='fixed'?'/api/cart':'/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(product.mode==='fixed'?{productId:product.id,quantity,notes:details}:{productId:product.id,title:product.name,details})});
  const data=await res.json();if(res.status===401){router.push(path('/login')+'?next='+encodeURIComponent(path('/shop/'+product.slug)));return}if(!res.ok)throw Error(data.error||pick('ثبت درخواست با مشکل مواجه شد.','Could not submit your request.'));
  if(product.mode==='fixed'){router.push(path('/account'));router.refresh()}else{setSuccess(true);router.refresh()}
 }catch(e){setError(e instanceof Error?e.message:pick('خطای نامشخص','Unknown error'))}finally{setBusy(false)}}
 if(!signedIn)return <div className="v3-order-guest"><h2>{pick('برای سفارش، ابتدا وارد حساب شوید','Please sign in to order')}</h2><p>{pick('اگر حساب ندارید، ثبت‌نام کنید و سپس وارد شوید تا سبد و استعلام فقط به حساب شما متصل باشد.','Create an account or sign in to securely manage your cart and quote requests.')}</p><a className="v2-primary" href={path('/login')+'?next='+encodeURIComponent(path('/shop/'+product.slug))}>{pick('ورود به حساب','Log in')} <ArrowUpLeft size={18}/></a><a className="v2-outline" href={path('/register')+'?next='+encodeURIComponent(path('/shop/'+product.slug))}>{pick('ثبت‌نام مشتری جدید','Create an account')}</a></div>;
 if(success)return <div className="v2-success"><CheckCircle2/><strong>{pick('درخواست استعلام ثبت شد','Quote request submitted')}</strong><p>{pick('در ناحیه کاربری می‌توانید وضعیت درخواست را دنبال کنید. ثبت استعلام به معنی رزرو زمان قطعی یا اعلام قیمت نیست.','Track your request in your account. This is not a price confirmation or confirmed booking.')}</p><a href={path("/account")} className="v2-outline">{pick('ناحیه کاربری','My account')} <ArrowUpLeft size={17}/></a></div>;
 return <div className="product-form">
 {product.mode==='fixed'&&<label className="input-label">{pick('تعداد','Quantity')}<input type="number" min={1} max={100} value={quantity} onChange={e=>setQuantity(Math.max(1,Math.min(100,Number(e.target.value)||1)))}/></label>}
 <label className="input-label">{product.mode==='quote'?pick('مشخصات درخواست، ابعاد و تیراژ','Print specifications, dimensions and quantity'):pick('توضیحات سفارشی (اختیاری)','Additional notes (optional)')}<textarea rows={4} value={details} onChange={e=>setDetails(e.target.value)} maxLength={2000} placeholder={pick("ابعاد، جنس، تعداد، توضیحات و زمان موردنظر را وارد کنید...","Dimensions, materials, quantity and other requirements...")}/></label>
 <label className="confirm-check"><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{pick('متن و تعداد را بررسی کرده‌ام و می‌دانم ثبت درخواست به معنی پرداخت یا تأیید زمان چاپ نیست.','I have reviewed my details and understand this request is not a payment or confirmed production date.')}</span></label>
 {error&&<p role="alert" className="form-error">{error}</p>}
 <button disabled={busy||!consent||(product.mode==='quote'&&details.trim().length<5)} className="v2-primary product-action" onClick={submit}>{busy?pick('در حال ثبت...','Submitting...'):product.mode==='fixed'?pick('افزودن به سبد حساب من','Add to my cart'):pick('ثبت درخواست استعلام','Request a quote')}{product.mode==='fixed'?<ShoppingBag size={19}/>:<ArrowUpLeft size={19}/>}</button>
 <span className="v2-fine">{pick('برای ادامه باید وارد حساب کاربری شوید یا ثبت‌نام کنید.','Your order details are saved to your account.')}</span>
 </div>
}
