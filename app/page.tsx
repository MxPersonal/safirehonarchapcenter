import Link from 'next/link';
import {ArrowUpLeft,ArrowLeft,ArrowRight,Check,FileText,Layers3,MoveUpRight,PenTool,Printer,ScanLine,ShieldCheck,Sparkles} from 'lucide-react';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
import {storeCategories,mainCategories,cmsPage,storeGalleryProducts} from '@/lib/store';
import {CategoryArtwork,ProductTile} from '@/components/showcase';

export const dynamic='force-dynamic';

export default async function Home(){
 const {locale,pick}=await siteText();
 const url=(path:string)=>localePath(path,locale);
 const [allCategories,hero,featured]=await Promise.all([storeCategories(locale),cmsPage('home',locale),storeGalleryProducts(locale)]);
 const categories=mainCategories(allCategories);
 const lead=categories[0];
 const showcase=categories.slice(0,8);
 const steps=[
  {number:'01',icon:Layers3,title:pick('محصولت را پیدا کن','Find your format'),desc:pick('از بین دسته‌بندی‌های چاپ، نوع محصول مناسب ایده‌ات را انتخاب کن.','Explore our printing categories and find the format that suits your idea.')},
  {number:'02',icon:PenTool,title:pick('جزئیات را مشخص کن','Make it yours'),desc:pick('ابعاد، جنس، تیراژ و فایل را متناسب با نیازت آماده کن.','Prepare the size, material, quantity and artwork that your project needs.')},
  {number:'03',icon:ShieldCheck,title:pick('با اطمینان ثبت کن','Submit with clarity'),desc:pick('درخواست را ثبت کن تا مشخصات، قیمت و زمان اجرا بررسی شوند.','Submit your request so the studio can review details, price and timing.')}
 ];
 return <div className="studio-home">
  <section className="studio-hero" aria-labelledby="studio-hero-title">
   <div className="container studio-hero-grid">
    <div className="studio-hero-copy">
     <div className="studio-kicker"><span className="studio-kicker-mark"/> {pick('استودیو طراحی و چاپ سفیر هنر','SAFIRE HONAR / PRINT & DESIGN STUDIO')}</div>
     <h1 id="studio-hero-title">{hero?.title||<>{pick('هر ایده‌ای','Ideas worth')}<br/><em>{pick('ارزش دیده‌شدن دارد.','being seen.')}</em></>}</h1>
     <p className="studio-hero-lead">{hero?.body||pick('از کارت ویزیت و بسته‌بندی تا تابلو و چاپ‌های بزرگ. محصولت را پیدا کن، نمونه‌ها را ببین و چاپ بعدی‌ات را دقیق‌تر شروع کن.','From business cards and packaging to signage and large format printing. Explore products, discover design ideas, and start your next project with confidence.')}</p>
     <div className="studio-hero-actions">
      <Link className="studio-btn studio-btn-solid" href={url('/catalog')}>{pick('مشاهده محصولات چاپی','Explore print products')} <ArrowUpLeft size={19}/></Link>
      <Link className="studio-btn studio-btn-quiet" href={url('/order')}>{pick('درخواست اختصاصی','Custom print request')} <ArrowUpLeft size={18}/></Link>
     </div>
     <div className="studio-hero-meta"><span><Check size={15}/>{pick('انتخاب نوع چاپ','Explore formats')}</span><span><Check size={15}/>{pick('بررسی جزئیات سفارش','Review specifications')}</span><span><Check size={15}/>{pick('استعلام شفاف','Clear quote process')}</span></div>
    </div>
    <div className="studio-hero-visual">
      <div className="studio-visual-grid" aria-hidden="true"/>
      <div className="studio-sheet studio-sheet-rear" aria-hidden="true"><div className="studio-sheet-ribbon"/><span>PRINT / FORMAT / 01</span><strong>FORM<br/>MEETS<br/>FUNCTION.</strong><i/></div>
      <div className="studio-sheet studio-sheet-mid" aria-hidden="true"><span>SAFIRE HONAR / STUDIO</span><div className="studio-sheet-circle"/><b>NEW<br/>PERSPECTIVE.</b><span>CREATIVE PRINT OBJECTS</span></div>
      <div className="studio-sheet studio-sheet-front"><span className="studio-sheet-heading">{pick('از یک ایده تا یک اثر چاپی','IDEAS INTO TANGIBLE WORK')}</span>
       {lead?<Link href={url('/catalog/'+lead.slug)} className="studio-hero-feature"><CategoryArtwork slug={lead.slug} name={lead.name} imageUrl={lead.image_url} locale={locale}/><span className="studio-feature-caption">{lead.name}<ArrowUpLeft size={19}/></span></Link>:<div className="studio-fallback-art"><Printer size={62}/></div>}
      </div>
      <div className="studio-hero-stamp" aria-hidden="true">SH<span>®</span><small>PRINT STUDIO</small></div>
    </div>
   </div>
   <div className="container studio-hero-foot"><span>{pick('جایی برای شکل‌گرفتن ایده‌ها','MADE FOR IDEAS THAT MATTER')}</span><span>SAFIRE HONAR / 2026</span></div>
  </section>

  <section className="studio-collections container" id="collections" aria-labelledby="studio-collections-title">
   <div className="studio-section-head"><div><span className="studio-eyebrow"><span>01</span> / {pick('دسته‌بندی‌های چاپ','OUR PRINT COLLECTIONS')}</span><h2 id="studio-collections-title">{pick('برای هر ایده،','The right format')}<br/><em>{pick('یک راه برای چاپ.','for every idea.')}</em></h2></div><div className="studio-head-side"><p>{pick('انواع چاپ، خدمات و زیرمجموعه‌ها را یکجا ببین. هر دسته، مسیر مستقل خودش را برای انتخاب و سفارش دارد.','Discover printing categories and specialized formats. Find the right starting point for your next project.')}</p><Link href={url('/catalog')} className="studio-text-link">{pick('مشاهده همه دسته‌ها','Browse all collections')} <ArrowUpLeft size={18}/></Link></div></div>
   <div className="studio-categories-grid">
    {showcase.map((category,i)=><Link key={category.id} className="studio-category-card" href={url('/catalog/'+category.slug)}>
      <div className="studio-category-image"><CategoryArtwork slug={category.slug} name={category.name} imageUrl={category.image_url} small locale={locale}/><span className="studio-category-number">{String(i+1).padStart(2,'0')}</span></div>
      <div className="studio-category-bottom"><div><h3>{category.name}</h3><p>{category.description}</p></div><span className="studio-category-arrow"><ArrowUpLeft size={21}/></span></div>
    </Link>)}
   </div>
   <div className="studio-collection-bottom"><span>{pick('مجموعه‌هایی برای ایده‌های کوچک و پروژه‌های بزرگ.','Thoughtfully selected formats for projects of every size.')}</span><Link href={url('/catalog')} className="studio-text-link">{pick('تمام دسته‌ها','All collections')} <ArrowUpLeft size={18}/></Link></div>
  </section>

  {featured&&featured.length>0&&<section className="studio-work" aria-labelledby="studio-work-title"><div className="container">
   <div className="studio-section-head"><div><span className="studio-eyebrow"><span>02</span> / {pick('گالری محصولات','PRINT WORK')}</span><h2 id="studio-work-title">{pick('نمونه‌های چاپ،','Real products,')}<br/><em>{pick('با جزئیات بیشتر.','closer details.')}</em></h2></div><div className="studio-head-side"><p>{pick('محصولاتی که از پنل مدیریت منتشر شده‌اند، با همان تصویر و مشخصات اصلی نمایش داده می‌شوند.','Published products appear here with their original images, titles and specifications.')}</p><Link className="studio-text-link" href={url('/designs')}>{pick('ورود به گالری','Explore gallery')} <ArrowUpLeft size={18}/></Link></div></div>
   <div className="studio-featured-grid">{featured.slice(0,4).map(p=><ProductTile key={p.id} product={p} locale={locale}/>)}</div>
  </div></section>}

  <section className="studio-how" aria-labelledby="studio-how-title"><div className="container studio-how-grid">
    <div className="studio-how-heading"><span className="studio-eyebrow"><span>03</span> / {pick('مسیر ساده سفارش','HOW IT WORKS')}</span><h2 id="studio-how-title">{pick('از انتخاب تا چاپ،','A considered process.')}<br/><em>{pick('بدون پیچیدگی.','No guesswork.')}</em></h2><p>{pick('مسیر سفارش شفاف طراحی شده تا هر مرحله، قبل از تأیید نهایی، قابل بررسی باشد.','A clear, simple order journey so every detail can be checked before production.')}</p><Link href={url('/guide')} className="studio-text-link">{pick('راهنمای آماده‌سازی فایل','File preparation guide')} <ArrowUpLeft size={18}/></Link></div>
    <div className="studio-step-list">{steps.map(step=><div key={step.number} className="studio-step"><span className="studio-step-num">{step.number}</span><div className="studio-step-copy"><h3>{step.title}</h3><p>{step.desc}</p></div><step.icon size={27} strokeWidth={1.5}/></div>)}</div>
   </div></section>

  <section className="studio-paths container" aria-labelledby="studio-paths-title"><div className="studio-section-head studio-section-head-compact"><div><span className="studio-eyebrow"><span>04</span> / {pick('روش‌های ثبت سفارش','ORDER OPTIONS')}</span><h2 id="studio-paths-title">{pick('راه مناسب','Choose how')} <em>{pick('سفارشت را انتخاب کن.','to get started.')}</em></h2></div></div>
   <div className="studio-path-grid">
     <article className="studio-path studio-path-direct"><div className="studio-path-top"><span>{pick('محصولات قیمت‌دار','FIXED-PRICE PRODUCTS')}</span><ScanLine size={26}/></div><div><h3>{pick('انتخاب کن.','Choose it.')}<br/>{pick('مستقیم ثبت کن.','Order it.')}</h3><p>{pick('برای محصولاتی که قیمت نهایی و شرایطشان در سایت مشخص است.','For products with published and confirmed pricing.')}</p><Link className="studio-path-link" href={url('/catalog')}>{pick('مشاهده محصولات','Explore products')} <ArrowUpLeft size={21}/></Link></div></article>
     <article className="studio-path studio-path-custom"><div className="studio-path-top"><span>{pick('پروژه‌های اختصاصی','CUSTOM PROJECTS')}</span><FileText size={26}/></div><div><h3>{pick('ایده‌ات را بگو.','Share the idea.')}<br/>{pick('ما بررسی می‌کنیم.','Let’s shape it.')}</h3><p>{pick('برای چاپ‌هایی که قیمت و مشخصاتشان بعد از بررسی دقیق اعلام می‌شود.','For print jobs that need tailored specifications and pricing.')}</p><Link className="studio-path-link" href={url('/order')}>{pick('ثبت درخواست استعلام','Request a quote')} <ArrowUpLeft size={21}/></Link></div></article>
   </div>
  </section>

  <section className="studio-closer"><div className="container studio-closer-grid"><div><span className="studio-eyebrow">{pick('سفیر هنر / استودیو چاپ','SAFIRE HONAR / PRINT STUDIO')}</span><h2>{pick('ایده بعدی تو','What will you')}<br/><em>{pick('چیه؟','create next?')}</em></h2><p>{pick('از یک دسته‌بندی شروع کن، نمونه‌ها را ببین یا ایده اختصاصی‌ات را برای بررسی بفرست.','Explore our collections or bring your own concept for a custom print quote.')}</p></div><div className="studio-closer-action"><Link href={url('/order')} className="studio-btn studio-btn-light">{pick('شروع یک سفارش','Start a project')} <ArrowUpLeft size={22}/></Link><span>{pick('جزئیات خوب، نتیجه خوب.','GOOD DETAILS. GREAT PRINT.')}</span></div></div></section>
 </div>;
}
