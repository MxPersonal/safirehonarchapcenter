import {notFound} from 'next/navigation';
import Link from 'next/link';
import {storeProduct,tomans} from '@/lib/store';
import ProductOrder from '@/components/product-order';
import {currentCustomer} from '@/lib/supabase/server';
import {siteText} from '@/lib/i18n-server';
import {localePath,intlNumber} from '@/lib/i18n';
export const dynamic='force-dynamic';
export default async function ProductPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,{locale,pick}=await siteText();
 const item=await storeProduct(slug,locale);
 if(!item)notFound();
 const {user}=await currentCustomer();
 return <section className="container v2-product-page">
  <div className="product-preview">{item.image_url?<img src={item.image_url} alt={item.name}/>:<div className="product-preview-text"><span>{pick('چاپ سفیر هنر / استودیو چاپ','SAFIRE HONAR / PRINT STUDIO')}</span><strong>{item.name}</strong><span>{pick('ایده شما، چاپ ما','YOUR IDEA, OUR PRINT.')}</span></div>}</div>
  <div className="product-config"><span className="tiny-label">{pick('محصول','PRODUCT')} / {item.mode==='fixed'?pick('قابل سفارش','READY TO ORDER'):pick('نیازمند استعلام','REQUEST A QUOTE')}</span><h1>{item.name}</h1><p>{item.description||pick('جزئیات موردنظر را ثبت کنید.','Please provide your print requirements.')}</p>
  <div className="product-price">{item.mode==='fixed'&&item.price_toman!==null?(locale==='fa'?tomans(item.price_toman):intlNumber(item.price_toman,locale)+' Toman'):pick('قیمت پس از استعلام','Price on request')}</div>
  <ProductOrder product={item} signedIn={!!user}/>
  <p className="v2-fine">{pick('تا قبل از اتصال درگاه پرداخت، سفارش‌های دارای قیمت مشخص در انتظار بررسی ثبت می‌شوند و پرداخت آنلاین انجام نمی‌شود.','Until online payments are enabled, fixed-price orders will be submitted for review without collecting payment.')}</p>
  <Link href={localePath('/catalog',locale)} className="v2-subtle">{pick('بازگشت به دسته‌بندی‌ها','Back to product collections')}</Link>
 </div></section>;
}
