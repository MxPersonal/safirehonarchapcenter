import {siteLocale} from '@/lib/i18n-server';
import Link from 'next/link';
import {ArrowUpLeft,ScanLine} from 'lucide-react';
import {storeCategories,mainCategories} from '@/lib/store';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
export const dynamic='force-dynamic';
export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Print Services':'خدمات چاپ'};}
export default async function Services(){
 const {locale,pick}=await siteText();
 const categories=mainCategories(await storeCategories(locale));
 const path=(s:string)=>localePath(s,locale);
 const items=categories.map((c,i)=>({key:c.slug,title:c.name,subtitle:c.description,number:String(i+1).padStart(2,'0'),url:path('/catalog/'+c.slug)}));
 return <><section className="page-banner dark-banner"><div className="container"><span className="section-label">OUR PRINTING SERVICES</span>
 <h1>{pick('همه‌چیز برای','EVERYTHING FOR')} <em>{pick('چاپ','PRINT')}</em></h1>
 <p>{pick('خدمات و محصولات چاپی قابل سفارش، با دسته‌بندی و توضیحات قابل مدیریت.','Explore our print services and collections. Product details are maintained by the studio.')}</p></div></section>
 <section className="section container"><div className="services-cards">{items.map((s,i)=><article className={`service-block service-block-${i%3}`} key={s.key}>
 <span className="service-block-no">{s.number} / PRINT SERVICE</span><div className="service-block-shape"><ScanLine size={52} strokeWidth={1.2}/></div>
 <h2>{s.title}</h2><p>{s.subtitle}</p><Link href={s.url} className="text-link">{pick('مشاهده دسته و درخواست بررسی','Explore collection and request a quote')} <ArrowUpLeft size={18}/></Link>
 </article>)}</div></section></>;
}
