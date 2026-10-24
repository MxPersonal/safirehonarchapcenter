import Link from 'next/link';
import {ArrowLeft,ArrowUpLeft,Check,ChevronLeft,FileCheck2,Layers3,MoveUpLeft,PackageCheck,Printer,ScanLine,Send,Shapes} from 'lucide-react';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
import {storeCategories,mainCategories,cmsPage,storeGalleryProducts} from '@/lib/store';
import {ProductTile} from '@/components/showcase';

export const dynamic='force-dynamic';

export default async function Home(){
 const {locale,pick}=await siteText();
 const path=(s:string)=>localePath(s,locale);
 const [all,hero,products]=await Promise.all([storeCategories(locale),cmsPage('home',locale),storeGalleryProducts(locale)]);
 const categories=mainCategories(all);
 const productList=products??[];
 const cover=productList.find(product=>product.image_url);
 const categoriesToShow=categories.slice(0,8);
 const highlights=[
  {n:'01',title:pick('انتخاب محصول','Choose a format'),body:pick('محصول و دسته‌بندی مناسب را پیدا کن.','Browse the right print category and product.'),icon:Layers3},
  {n:'02',title:pick('ثبت جزئیات','Specify the details'),body:pick('ابعاد، جنس و تعداد را مشخص کن.','Share size, material, quantity and artwork.'),icon:ScanLine},
  {n:'03',title:pick('بررسی و تأیید','Review and confirm'),body:pick('درخواستت بررسی و شرایط چاپ اعلام می‌شود.','The studio reviews your request before printing.'),icon:FileCheck2}
 ];
 return <div className="pw-home">
  <section className="pw-hero" aria-labelledby="pw-hero-title"><div className="container pw-hero-grid">
   <div className="pw-hero-copy">
    <div className="pw-hero-overline"><span className="pw-live-dot"/>{pick('سفیر هنر / مرکز تخصصی چاپ و طراحی','SAFIRE HONAR / PRINT & DESIGN STUDIO')}</div>
    <h1 id="pw-hero-title">{hero?.title||<>{pick('چاپی که','PRINT THAT')}<br/><em>{pick('دیده می‌شود.','GETS NOTICED.')}</em></>}</h1>
    <p>{hero?.body||pick('از یک کارت ویزیت دقیق تا چاپ عریض و سازه‌های تبلیغاتی. هر محصول را بشناس، نمونه‌ها را ببین و سفارش بعدی‌ات را مطمئن‌تر آغاز کن.','From fine-detail business cards to large-format printing and signage. Explore formats and start your next project with clarity.')}</p>
    <div className="pw-hero-buttons"><Link className="pw-button pw-button-light" href={path('/catalog')}>{pick('مشاهده محصولات','Explore print products')} <ArrowUpLeft size={20}/></Link><Link href={path('/order')} className="pw-button pw-button-outline">{pick('درخواست چاپ اختصاصی','Request custom printing')} <ArrowUpLeft size={18}/></Link></div>
    <div className="pw-hero-baseline"><span>{pick('محصولات چاپی','Print products')}</span><i/><span>{pick('طراحی و سفارش','Design and orders')}</span><i/><span>{pick('استعلام قیمت','Custom quotes')}</span></div>
   </div>
   <div className="pw-hero-media" aria-label={pick('نمایش تصویری دنیای چاپ','A visual study in print')}>
    {cover?<><img src={cover.image_url!} alt={cover.name} className="pw-hero-photo"/><div className="pw-hero-image-caption"><span>{pick('از گالری محصولات','FROM THE PRODUCT GALLERY')}</span><strong>{cover.name}</strong></div></>:<div className="pw-hero-art" aria-hidden="true"><div className="pw-art-paper"><span>SAFIRE HONAR / 2026</span><strong>MADE<br/>TO<br/><i>PRINT.</i></strong><small>FORM. COLOUR. DETAIL.</small></div><div className="pw-art-disc"/><span className="pw-art-serial">01 / 08</span></div>}
    <div className="pw-hero-corner" aria-hidden="true"><span>SH.</span><span>01</span></div>
   </div>
  </div><div className="container pw-hero-bottom"><span>{pick('ایده‌ای برای چاپ داری؟ از اینجا شروع کن.','GREAT IDEAS DESERVE GREAT PRINT.')}</span><a href="#categories">{pick('کشف دسته‌بندی‌ها','EXPLORE CATEGORIES')} ↓</a></div></section>

  <section className="container pw-section pw-categories" id="categories" aria-labelledby="pw-categories-title">
   <div className="pw-section-heading"><div><span className="pw-eyebrow">01 / {pick('چه چیزی چاپ می‌کنیم؟','WHAT WE PRINT')}</span><h2 id="pw-categories-title">{pick('برای هر ایده','A format for')} <em>{pick('یک راه وجود دارد.','every idea.')}</em></h2></div><Link className="pw-underlined-link" href={path('/catalog')}>{pick('همه دسته‌بندی‌ها','All categories')} <ArrowUpLeft size={19}/></Link></div>
   <div className="pw-category-grid">{categoriesToShow.map((c,i)=><Link key={c.id} className="pw-category-item" href={path('/catalog/'+c.slug)}>
    <div className="pw-category-cover">{c.image_url?<img src={c.image_url} alt={c.name}/>:<div className={`pw-category-pattern pw-pattern-${i%4}`} aria-hidden="true"><div className="pw-category-glyph">{String(i+1).padStart(2,'0')}</div><span>{pick('چاپ سفیر هنر','SAFIRE HONAR')}</span></div>}<span className="pw-category-arrow"><ArrowUpLeft size={20}/></span></div>
    <div className="pw-category-details"><span>{String(i+1).padStart(2,'0')} / {pick('دسته چاپ','PRINT CATEGORY')}</span><h3>{c.name}</h3><p>{c.description}</p></div>
   </Link>)}</div>
   <div className="pw-categories-footer"><span>{pick('تنوع چاپ برای هر اندازه و هر نوع پروژه','Print options for projects of every size.')}</span><Link href={path('/catalog')} className="pw-underlined-link">{pick('مشاهده تمام محصولات','Browse every format')} <ArrowUpLeft size={18}/></Link></div>
  </section>

  {productList.length>0&&<section className="pw-featured"><div className="container pw-section"><div className="pw-section-heading"><div><span className="pw-eyebrow">02 / {pick('محصولات و نمونه‌کارها','PRODUCT SHOWCASE')}</span><h2>{pick('نگاهی نزدیک‌تر','Details make')} <em>{pick('به جزئیات.','the difference.')}</em></h2><p>{pick('همان محصولات و تصاویر منتشرشده در فروشگاه، بدون تغییر با جابه‌جایی زبان.','Real published products and their original artwork, unchanged by language selection.')}</p></div><Link href={path('/designs')} className="pw-underlined-link">{pick('مشاهده گالری','View the gallery')} <ArrowUpLeft size={19}/></Link></div><div className="pw-featured-grid">{productList.slice(0,4).map(p=><ProductTile product={p} locale={locale} key={p.id}/>)}</div></div></section>}

  <section className="pw-process"><div className="container pw-process-grid"><div className="pw-process-intro"><span className="pw-eyebrow">03 / {pick('ثبت سفارش بدون پیچیدگی','A SIMPLE PROCESS')}</span><h2>{pick('از ایده تا چاپ،','From idea')} <em>{pick('شفاف و دقیق.','to the final print.')}</em></h2><p>{pick('انتخاب و ثبت سفارش قرار نیست دشوار باشد. جزئیات را قدم‌به‌قدم مشخص کن و برای بررسی بفرست.','A clear order journey, from selecting your format to reviewing the details before production.')}</p><Link className="pw-button pw-button-dark" href={path('/guide')}>{pick('راهنمای فایل چاپ','Print file guide')} <ArrowUpLeft size={18}/></Link></div><div className="pw-process-steps">{highlights.map(x=><article key={x.n} className="pw-process-step"><span>{x.n}</span><div><h3>{x.title}</h3><p>{x.body}</p></div><x.icon size={27} strokeWidth={1.55}/></article>)}</div></div></section>

  <section className="container pw-section pw-order-options"><div className="pw-section-heading"><div><span className="pw-eyebrow">04 / {pick('دو روش برای شروع','TWO WAYS TO ORDER')}</span><h2>{pick('سفارش خودت را','Make it')} <em>{pick('به روش خودت ثبت کن.','your own.')}</em></h2></div></div><div className="pw-order-grid">
   <article className="pw-order-card pw-order-card-ready"><div className="pw-order-top"><span>01 / {pick('خرید محصولات قیمت‌دار','READY-TO-ORDER')}</span><PackageCheck size={28}/></div><div><h3>{pick('محصول را انتخاب کن.','Choose.')}<br/>{pick('سفارش را ثبت کن.','Place the order.')}</h3><p>{pick('برای محصولاتی که قیمت نهایی آنها در فروشگاه تعیین شده است.','For products with confirmed prices published in the catalogue.')}</p><Link href={path('/catalog')}>{pick('مشاهده محصولات','Explore products')} <ArrowUpLeft size={20}/></Link></div></article>
   <article className="pw-order-card pw-order-card-quote"><div className="pw-order-top"><span>02 / {pick('پروژه‌های اختصاصی','BESPOKE PRINT')}</span><Shapes size={28}/></div><div><h3>{pick('طرح خاص داری؟','A custom idea?')}<br/>{pick('ما بررسی می‌کنیم.','Let’s discuss it.')}</h3><p>{pick('ابعاد، فایل و نیازت را بفرست تا شرایط اجرا و قیمت بررسی شود.','Send your specifications so the studio can review the details and quote.')}</p><Link href={path('/order')}>{pick('درخواست استعلام قیمت','Request a quote')} <ArrowUpLeft size={20}/></Link></div></article>
  </div></section>

  <section className="pw-endcap"><div className="container pw-endcap-inner"><div><span>{pick('سفیر هنر / استودیو چاپ','SAFIRE HONAR / PRINT STUDIO')}</span><h2>{pick('وقتِ ساختن','LET’S MAKE')}<br/><em>{pick('چیزهای ماندگار است.','SOMETHING LAST.')}</em></h2></div><div><p>{pick('از دسته‌بندی‌ها شروع کن یا پروژه اختصاصی‌ات را برای کارشناسان چاپ ارسال کن.','Explore our print collections or share your bespoke project with the studio.')}</p><Link className="pw-button pw-button-light" href={path('/order')}>{pick('شروع درخواست چاپ','Start a project')} <ArrowUpLeft size={20}/></Link></div></div></section>
 </div>;
}
