import {siteLocale} from '@/lib/i18n-server';
import QuoteRequest from '@/components/quote-request';
import {redirect} from 'next/navigation';
import {currentCustomer} from '@/lib/supabase/server';
import {Headset,Printer,CheckCheck} from 'lucide-react';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
export const dynamic='force-dynamic';
export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Custom Print Request':'سفارش چاپ اختصاصی'};}
export default async function Order(){
 const {locale,pick}=await siteText();
 const {db,user}=await currentCustomer();
 if(db&&!user)redirect(localePath('/login?next='+encodeURIComponent(localePath('/order',locale)),locale));
 return <><section className="v2-inner-head"><div className="container"><span className="tiny-label">START A PROJECT</span>
 <h1>{pick('سفارش اختصاصی،','CUSTOM PRINTING,')} <em>{pick('بدون سردرگمی.','MADE SIMPLE.')}</em></h1>
 <p>{pick('قیمت محصولات سفارشی بعد از بررسی واقعی ابعاد، جنس، تیراژ و شرایط چاپ اعلام می‌شود.','Custom printing is priced after we review dimensions, material, quantity and production requirements.')}</p></div></section>
 <div className="container v2-order-layout"><div className="order-info"><h2>{pick('از یک ایده تا یک سفارش دقیق.','From a great idea to the right print.')}</h2>
 <div><Printer/><span>{pick('مشخصات و طرح یا نیازت را توضیح بده.','Tell us about your design and print requirements.')}</span></div>
 <div><Headset/><span>{pick('کارشناس چاپخانه درخواست را بررسی و برای هماهنگی تماس می‌گیرد.','Our print team reviews the details and gets in touch.')}</span></div>
 <div><CheckCheck/><span>{pick('قیمت و شرایط پس از تأیید در حساب مشتری مشخص می‌شود.','Pricing and details are confirmed through your account.')}</span></div>
 <div className="v2-notice">{pick('ثبت درخواست به معنای تأیید ظرفیت، قیمت یا رزرو قطعی تاریخ تحویل نیست.','Submitting a request does not guarantee price, production availability or delivery date.')}</div>
 </div><QuoteRequest/></div></>;
}
