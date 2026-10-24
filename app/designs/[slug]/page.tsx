import {notFound,redirect} from 'next/navigation';
import Link from 'next/link';
import {ArrowLeft,ChevronLeft} from 'lucide-react';
import {categoryName,designs,getDesign} from '@/lib/catalog';
import Artwork from '@/components/art';
import Configurator from '@/components/configurator';
import type {Metadata} from 'next';
import {storeProduct} from '@/lib/store';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
import {designEnglish,categoryEnglish} from '@/lib/translated-content';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {slug}=await params,{locale}=await siteText(),d=getDesign(slug);
 return {title:d?(locale==='en'?designEnglish[slug]?.[0]||slug:d.name):locale==='en'?'Design not found':'طرح پیدا نشد'};
}
export function generateStaticParams(){return designs.map(d=>({slug:d.slug}));}
export default async function DesignDetails({params}:Props){
 const {slug}=await params,{locale,pick,t}=await siteText();
 const path=(s:string)=>localePath(s,locale);
 const product=await storeProduct(slug,locale);
 if(product)redirect(path('/shop/'+product.slug));
 const d=getDesign(slug);if(!d)notFound();
 const title=locale==='en'?(designEnglish[d.slug]?.[0]||d.slug):d.name;
 const sub=locale==='en'?(designEnglish[d.slug]?.[1]||'Creative print concept'):d.subtitle;
 return <div className="container detail-page">
  <div className="breadcrumbs"><Link href={path('/')}>{t.home}</Link><ChevronLeft size={14}/><Link href={path('/designs')}>{t.designs}</Link><ChevronLeft size={14}/><span>{title}</span></div>
  <div className="detail-grid"><div className="detail-visual"><Artwork design={d} locale={locale} hero/><div className="detail-visual-note"><span>PREVIEW / CONCEPT DESIGN</span><span>{d.code}</span></div><div className="detail-disclaimer">{pick('این تصویر یک نمونه‌طرح مفهومی است. فایل نهایی چاپ پس از بررسی و تأیید آماده می‌شود.','This artwork is an illustrative concept. Final print-ready artwork requires review and approval.')}</div></div>
  <div className="detail-main"><div className="detail-head"><span className="card-eyebrow">{locale==='en'?(categoryEnglish[d.category]?.[0]||d.category):categoryName(d.category)} / {d.code}</span><h1>{title}</h1><p>{sub}. {pick('این طرح برای نمونه‌سازی مسیر سفارش ایجاد شده است.','This concept demonstrates our custom print request process.')}</p></div><Configurator design={d}/></div></div>
  <div className="bottom-help"><div><h2>{pick('سفارش متفاوتی در ذهن داری؟','Have another idea in mind?')}</h2><p>{pick('برای طرح اختصاصی می‌توانی مشخصات فایل یا ایده‌ات را آماده کنی.','Share your own file or concept for a custom project.')}</p></div><Link href={path('/order')} className="text-link">{pick('درخواست اختصاصی','Custom order')} <ArrowLeft size={19}/></Link></div>
 </div>;
}
