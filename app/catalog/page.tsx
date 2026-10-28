import {siteLocale,siteText} from '@/lib/i18n-server';
import Link from 'next/link';
import {ArrowUpLeft,ArrowDownLeft,Layers3} from 'lucide-react';
import {storeCategories,mainCategories,childCategories} from '@/lib/store';
import {localePath,intlNumber} from '@/lib/i18n';

export const dynamic='force-dynamic';
export async function generateMetadata(){
 return {title:(await siteLocale())==='en'?'Print Products':'محصولات چاپی'};
}

export default async function Catalog(){
 const {locale,pick}=await siteText();
 const all=await storeCategories(locale);
 const categories=mainCategories(all);
 const path=(href:string)=>localePath(href,locale);
 return <div className="sf-catalog-page">
  <section className="sf-catalog-hero" aria-labelledby="sf-catalog-title">
   <div className="sf-catalog-hero-inner">
    <div className="sf-catalog-eyebrow"><span className="sf-catalog-eyebrow-dot" aria-hidden="true"/>{pick('چاپ سفیر هنر / دسته‌بندی محصولات','SAFIRE HONAR / PRINT COLLECTIONS')}</div>
    <h1 id="sf-catalog-title">{pick('دنیای محصولات','Discover our')} <span>{pick('چاپی','print collections')}</span></h1>
    <p>{pick('اول نوع محصول را انتخاب کنید؛ سپس زیرمجموعه‌های هر بخش مانند بنر تولد، بروشور سه‌لت یا تابلو حروف برجسته را ببینید.','Choose a product family, then explore formats such as banners, folded brochures, business cards and dimensional signs.')}</p>
    <div className="sf-catalog-hero-foot">
      <a className="sf-catalog-hero-action" href="#sf-catalog-list">{pick('مشاهده دسته‌بندی‌ها','Explore categories')} <ArrowDownLeft size={18} aria-hidden="true"/></a>
      <span className="sf-catalog-hero-count"><Layers3 size={17} aria-hidden="true"/><strong>{intlNumber(categories.length,locale)}</strong> {pick('دسته‌بندی اصلی','main categories')}</span>
    </div>
   </div>
   <div className="sf-catalog-hero-dots" aria-hidden="true"/>
  </section>

  <section id="sf-catalog-list" className="sf-catalog-list" aria-labelledby="sf-catalog-list-title">
   <div className="sf-catalog-list-inner">
    <div className="sf-catalog-list-head">
     <div><span className="sf-catalog-list-kicker">{pick('مجموعه‌های چاپی','OUR COLLECTIONS')}</span>
      <h2 id="sf-catalog-list-title">{locale==='fa'?<><span className="sf-catalog-title-line">دسته‌بندی چاپ را</span><span className="sf-catalog-title-line">انتخاب کن</span></>:'Choose a print category'}</h2>
     </div>
     <span className="sf-catalog-list-meta">{intlNumber(categories.length,locale)} {pick('گروه محصول','product families')}</span>
    </div>
    {categories.length>0?<div className="sf-catalog-card-grid">
      {categories.map((c,i)=>{
       const children=childCategories(all,c);
       return <Link href={path('/catalog/'+c.slug)} key={c.id} className="sf-catalog-card">
        <div className={'sf-catalog-card-media'+(c.image_url?' is-image':' is-no-image')}>
         {c.image_url?<img src={c.image_url} alt={c.name} loading="lazy" decoding="async"/>:
          <div className="sf-catalog-image-pending">
           <img src="/safir-logo-light.png" alt="" loading="lazy" decoding="async"/>
           <span>{pick('تصویر دسته‌بندی ثبت نشده','Category photo not uploaded')}</span>
          </div>}
         <span className="sf-catalog-card-number">{String(i+1).padStart(2,'0')}</span>
        </div>
        <div className="sf-catalog-card-content">
         <div className="sf-catalog-card-title-group">
          <span className="sf-catalog-card-eyebrow">{pick('خانواده محصولات چاپی','PRINT CATEGORY')}</span>
          <div className="sf-catalog-card-title-shell"><h3>{c.name}</h3></div>
         </div>
         {c.description&&<p>{c.description}</p>}
         {children.length>0&&<div className="sf-catalog-children" aria-label={pick('زیرمجموعه‌های این دسته','Subcategories')}>
          {children.slice(0,3).map(child=><span key={child.id}>{child.name}</span>)}
         </div>}
         <div className="sf-catalog-card-bottom">
          <span>{pick('مشاهده دسته‌بندی','View collection')}</span>
          <span className="sf-catalog-card-arrow"><ArrowUpLeft size={20} aria-hidden="true"/></span>
         </div>
        </div>
       </Link>;
      })}
     </div>:<div className="sf-catalog-empty">{pick('هنوز دسته‌بندی منتشرشده‌ای برای نمایش وجود ندارد.','There are no published collections to display yet.')}</div>}
   </div>
  </section>
 </div>;
}
