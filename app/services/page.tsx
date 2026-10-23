import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowUpLeft,ScanLine} from 'lucide-react';
import {printServices} from '@/lib/catalog';
import {storeCategories,mainCategories} from '@/lib/store';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'خدمات چاپ'};
export default async function Services(){
 const all=await storeCategories();
 const categories=mainCategories(all);
 // After linking the catalog, the print services page uses the very same
 // editable product families as the home and catalog pages.
 const items=categories.length?categories.map((c,i)=>({key:c.slug,title:c.name,subtitle:c.description,number:String(i+1).padStart(2,'0'),url:'/catalog/'+c.slug}))
   :printServices.map(s=>({key:s.kind,title:s.title,subtitle:s.subtitle,number:s.number,url:'/order?service='+encodeURIComponent(s.title)}));
 return <><section className="page-banner dark-banner"><div className="container"><span className="section-label">OUR PRINTING SERVICES</span><h1>همه‌چیز برای <em>چاپ</em></h1><p>انواع خدمات و محصولات چاپی. دسته‌ها و توضیحات از پنل مدیریت به‌روز می‌شوند.</p></div></section><section className="section container"><div className="services-cards">{items.map((s,i)=><article className={`service-block service-block-${i%3}`} key={s.key}><span className="service-block-no">{s.number} / PRINT SERVICE</span><div className="service-block-shape"><ScanLine size={52} strokeWidth={1.2}/></div><h2>{s.title}</h2><p>{s.subtitle}</p><Link href={s.url} className="text-link">مشاهده دسته و درخواست بررسی <ArrowUpLeft size={18}/></Link></article>)}</div></section></>
}
