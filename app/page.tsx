import Link from 'next/link';
import {ArrowUpLeft,ArrowLeft,ArrowRight,ArrowDownLeft,ArrowUpRight, BadgeCheck, Layers3, FileCheck2, ScanLine, ChevronLeft, ChevronRight, Search, Phone, Mail, Printer, Sparkles, PackageCheck, MousePointerClick} from 'lucide-react';
import {siteText} from '@/lib/i18n-server';
import {localePath,intlNumber} from '@/lib/i18n';
import {storeCategories,mainCategories,cmsPage,storeGalleryProducts} from '@/lib/store';
import {CategoryArtwork,ProductTile} from '@/components/showcase';
import PrintCollectionExplorer from '@/components/print-collection-explorer';
import RotatingPrintTitle from '@/components/rotating-print-title';

export const dynamic='force-dynamic';

export default async function Home(){
 const {locale,pick}=await siteText();
 const path=(s:string)=>localePath(s,locale);
 const [all,hero,products]=await Promise.all([storeCategories(locale),cmsPage('home',locale),storeGalleryProducts(locale)]);
 const categories=mainCategories(all);
 const highlighted=(products??[]).slice(0,6);
 const featured=categories.slice(0,8);
 const services=categories.slice(0,9);
 const groups=[services.slice(0,3),services.slice(3,6),services.slice(6,9)];
 const faqs=[
  {q:pick('آیا قیمت همه محصولات مشخص است؟','Does every product have a fixed price?'),a:pick('خیر. قیمت محصولات آماده در صفحه محصول مشخص می‌شود. برای سفارش‌های اختصاصی، قیمت پس از بررسی ابعاد، جنس و تیراژ اعلام می‌شود.','No. Fixed-price products are listed individually. Custom jobs require a quote after reviewing specifications.')},
  {q:pick('برای ثبت سفارش اختصاصی از کجا شروع کنم؟','How do I start a custom print order?'),a:pick('از بخش «سفارش اختصاصی» مشخصات محصول، تعداد و توضیحات چاپ را ارسال کن تا کارشناسان مجموعه بررسی کنند.','Use the custom order page to submit dimensions, quantity, and project details for review.')},
  {q:pick('اگر فایل آماده چاپ نداشته باشم چه؟','What if I do not have print-ready artwork?'),a:pick('می‌توانی نیاز خودت را توضیح بدهی. امکان انجام سفارش و خدمات موردنیاز پس از بررسی توسط مجموعه مشخص خواهد شد.','Describe what you need. The team will clarify the possible production and design options after reviewing your request.')},
  {q:pick('چطور محصول دلخواهم را پیدا کنم؟','How can I find the right print product?'),a:pick('از دسته‌بندی‌های اصلی، نوع محصول را انتخاب کن و سپس زیرمجموعه‌ها و محصولات مربوط به آن را ببین.','Browse a main product category, then explore its subcategories and published products.')},
  {q:pick('چطور سفارش یا درخواست خود را پیگیری کنم؟','How do I follow up on my request?'),a:pick('با ورود به حساب کاربری، اطلاعات درخواست‌ها و سفارش‌هایی که برای حسابت ثبت شده‌اند را بررسی کن.','Sign in to your account to review your requests and any order details available there.')},
 ];
 return <div className="wf-site wf-home">
  <section className="wf-hero" aria-labelledby="wf-hero-heading">
    <div className="wf-container wf-hero-inner">
      <div className="wf-hero-badge"><i className="wf-signal" aria-hidden="true"/>{pick('مرکز تخصصی چاپ و طراحی سفیر هنر','SAFIRE HONAR / PRINT & DESIGN STUDIO')}<ArrowUpLeft size={13}/></div>
      <h1 id="wf-hero-heading">{hero?.title || <>{pick('به ایده‌هایت','Give your ideas')} <br className="wf-hero-break"/><span className="wf-hero-blue"><RotatingPrintTitle phrases={categories.length?categories.slice(0,5).map(c=>c.name):[pick('رنگ و شکل بده','a new shape')]} locale={locale}/></span></>}</h1>
      <p className="wf-hero-description">{hero?.body||pick('از انتخاب محصول تا ثبت سفارش چاپ، همه‌چیز در یک‌جا. بنر، کارت ویزیت، بروشور، تابلو و دیگر محصولات چاپی را بررسی کن و مناسب‌ترین گزینه را برای کسب‌وکارت پیدا کن.','Explore printed products, compare formats and start your next order, all in one place. From business cards and banners to brochures and signage.')}</p>
      <div className="wf-hero-actions">
        <Link href={path('/order')} className="wf-button wf-button-primary">{pick('شروع سفارش چاپ','Start your print request')}<ArrowUpLeft size={18}/></Link>
        <Link href="#references" className="wf-button wf-button-secondary">{pick('مشاهده محصولات','Explore products')}<ArrowDownLeft size={18}/></Link>
      </div>
      <div className="wf-hero-features" aria-label={pick('مسیرهای خدماتی سفیر هنر','Safire Honar service highlights')}>
        <div><span className="wf-feature-icon"><Layers3 size={19}/></span><strong>{pick('دسته‌بندی‌های متنوع','Product collections')}</strong><small>{pick('انتخاب نوع چاپ','Explore print types')}</small></div>
        <div><span className="wf-feature-icon"><Printer size={19}/></span><strong>{pick('سفارش اختصاصی','Custom printing')}</strong><small>{pick('بررسی مشخصات چاپ','Project review')}</small></div>
        <div><span className="wf-feature-icon"><FileCheck2 size={19}/></span><strong>{pick('استعلام قیمت','Quote requests')}</strong><small>{pick('پس از بررسی پروژه','After reviewing details')}</small></div>
      </div>
    </div>
    <div className="wf-hero-bottom-glow" aria-hidden="true"/>
  </section>

  <section className="wf-section wf-references" id="references" aria-labelledby="wf-references-title">
    <div className="wf-container">
      <div className="wf-section-intro"><span className="wf-tag"><span className="wf-tag-dot"/> {pick('محصولات چاپی','PRINT COLLECTIONS')}</span><h2 id="wf-references-title">{pick('ایده‌های واقعی.','Real ideas.')} <span>{pick('چاپ‌های متفاوت.','Thoughtful printing.')}</span></h2>
       <p>{pick('از کارت ویزیت تا تابلو، هر خانواده از محصولات را بشناس و برای ثبت سفارش وارد دسته‌بندی مربوط شو.','From business cards to signage, explore the print families available in our catalogue.')}</p>
       <Link href={path('/catalog')} className="wf-button wf-button-secondary">{pick('مشاهده همه دسته‌بندی‌ها','View all collections')} <ArrowUpLeft size={16}/></Link>
      </div>
      <div className="wf-gallery-grid">
       {featured.map((category,index)=><Link className="wf-gallery-card" href={path('/catalog/'+category.slug)} key={category.id}>
         <div className="wf-gallery-visual"><CategoryArtwork slug={category.slug} name={category.name} imageUrl={category.image_url} small locale={locale}/><span className="wf-gallery-badge">{String(index+1).padStart(2,'0')}</span></div>
         <div className="wf-gallery-text"><span>{pick('خانواده محصولات چاپی','PRINT CATEGORY')}</span><h3>{category.name}</h3><p>{category.description}</p><span className="wf-gallery-meta">{pick('مشاهده دسته‌بندی','Explore collection')}<ArrowUpLeft size={14}/></span></div>
       </Link>)}
      </div>
      {categories.length===0&&<p className="wf-empty">{pick('هنوز دسته‌بندی منتشرشده‌ای وجود ندارد.','No published collections yet.')}</p>}
      {categories.length>8&&<div className="wf-centered-action"><Link href={path('/catalog')} className="wf-button wf-button-secondary">{pick('مشاهده دسته‌بندی‌های بیشتر','See more collections')} <ArrowUpLeft size={17}/></Link></div>}
    </div>
  </section>

  {highlighted.length>0&&<section className="wf-section wf-products" aria-labelledby="wf-products-title"><div className="wf-container">
    <div className="wf-section-intro"><span className="wf-tag"><span className="wf-tag-dot"/>{pick('محصولات فروشگاه','OUR PRODUCTS')}</span><h2 id="wf-products-title">{pick('جزئیات مهم‌اند.','Details matter.')} <span>{pick('چاپ باید درست باشد.','Find the right product.')}</span></h2><p>{pick('محصولات منتشرشده در فروشگاه با تصاویر و شرایط واقعی ثبت‌شده.','Browse currently published products and their actual pricing or quote requirements.')}</p></div>
    <div className="wf-product-grid">{highlighted.map(product=><ProductTile product={product} key={product.id} locale={locale}/>)}</div>
    <div className="wf-centered-action"><Link className="wf-button wf-button-secondary" href={path('/catalog')}>{pick('ورود به فروشگاه','Explore the shop')} <ArrowUpLeft size={17}/></Link></div>
  </div></section>}

  <section className="wf-section wf-services" id="services" aria-labelledby="wf-services-title"><div className="wf-container">
    <div className="wf-section-intro"><span className="wf-tag"><span className="wf-tag-dot"/>{pick('خدمات چاپ سفیر هنر','OUR SERVICES')}</span><h2 id="wf-services-title">{pick('چه چیزی می‌توانیم','What can we')} <span>{pick('برای تو چاپ کنیم؟','print for you?')}</span></h2>
      <p>{pick('خدمت مورد نظرت را پیدا کن و جزئیات آن را در دسته‌بندی مربوط ببین.','Choose a printing category and explore available formats and order options.')}</p>
      <Link href={path('/services')} className="wf-button wf-button-primary">{pick('همه خدمات چاپ','All printing services')} <ArrowUpLeft size={17}/></Link>
    </div>
    <div className="wf-services-grid">{groups.map((list,i)=><div className="wf-service-group" key={i}><div className="wf-service-group-heading"><span>{String(i+1).padStart(2,'0')}</span><h3>{[pick('چاپ و تبلیغات','Print & advertising'),pick('هویت و بسته‌بندی','Brand & packaging'),pick('سایر محصولات','More print solutions')][i]}</h3></div>
      {list.map(c=><Link className="wf-service-row" key={c.id} href={path('/catalog/'+c.slug)}><span><strong>{c.name}</strong><small>{c.description}</small></span><ArrowUpLeft size={18}/></Link>)}
    </div>)}</div>
  </div></section>

  <section className="wf-section wf-how" aria-labelledby="wf-how-title"><div className="wf-container">
   <div className="wf-section-intro"><span className="wf-tag"><span className="wf-tag-dot"/>{pick('از انتخاب تا سفارش','HOW IT WORKS')}</span><h2 id="wf-how-title">{pick('سه قدم ساده.','Three clear steps.')} <span>{pick('تا شروع چاپ.','One print request.')}</span></h2></div>
   <div className="wf-step-grid">
     {[{icon:Layers3,t:pick('محصول را انتخاب کن','Choose a print format'),d:pick('در دسته‌بندی‌ها محصول مناسب را پیدا کن.','Find the product or format that suits your project.')},{icon:ScanLine,t:pick('جزئیات را ارسال کن','Describe your project'),d:pick('اندازه، جنس، تعداد و فایل یا توضیحات خود را ثبت کن.','Send the dimensions, quantity, artwork and other requirements.')},{icon:FileCheck2,t:pick('منتظر بررسی باش','Review and confirmation'),d:pick('کارشناسان مشخصات و امکان اجرا را بررسی می‌کنند.','The studio reviews your request before confirming production.') }].map((s,i)=><article className="wf-step-card" key={i}><div className="wf-step-top"><span>{String(i+1).padStart(2,'0')}</span><s.icon size={23}/></div><h3>{s.t}</h3><p>{s.d}</p></article>)}
   </div>
  </div></section>

  <section className="wf-section wf-faq" id="faq" aria-labelledby="wf-faq-heading"><div className="wf-container wf-faq-grid">
    <div className="wf-faq-intro"><span className="wf-tag"><span className="wf-tag-dot"/>{pick('پرسش و پاسخ','FAQ')}</span><h2 id="wf-faq-heading">{pick('سؤال‌های رایج.','Frequently asked')} <span>{pick('پاسخ‌های روشن.','Clear answers.')}</span></h2><p>{pick('درباره انتخاب محصول، هزینه و ثبت سفارش بیشتر بدان.','Useful answers about print products, ordering and quotes.')}</p>
    <div className="wf-faq-contact"><strong>{pick('جوابت را پیدا نکردی؟','Need more information?')}</strong><p>{pick('از طریق صفحه تماس، با مجموعه ارتباط بگیر.','Reach the studio through the contact page.')}</p><Link className="wf-button wf-button-primary" href={path('/contact')}>{pick('ارتباط با ما','Contact the studio')}<ArrowUpLeft size={16}/></Link></div>
    </div>
    <div className="wf-faq-items">{faqs.map((item,i)=><details className="wf-faq-item" key={i} open={i===0}><summary><span className="wf-faq-number">{String(i+1).padStart(2,'0')}</span><strong>{item.q}</strong><span className="wf-faq-toggle" aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div>
  </div></section>

  <section className="wf-contact-section" id="start" aria-labelledby="wf-contact-heading"><div className="wf-container">
   <div className="wf-contact-panel">
    <div className="wf-contact-aura" aria-hidden="true"/>
    <div className="wf-contact-pills"><span><BadgeCheck size={15}/>{pick('درخواست قابل بررسی','Project review')}</span><span><BadgeCheck size={15}/>{pick('انتخاب دسته‌بندی','Product options')}</span></div>
    <h2 id="wf-contact-heading">{pick('بیایید چیزی','Let’s create')}<br/><span>{pick('ماندگار چاپ کنیم.','something memorable.')}</span></h2>
    <p>{pick('فایل یا جزئیات پروژه‌ات را بفرست تا درباره شرایط چاپ و قیمت هماهنگ کنیم.','Tell us about your print project and we’ll review the next steps and pricing.')}</p>
    <div className="wf-contact-cta"><Link className="wf-button wf-button-primary" href={path('/order')}>{pick('شروع سفارش اختصاصی','Start a custom request')} <ArrowUpLeft size={18}/></Link><Link className="wf-button wf-button-secondary" href={path('/contact')}>{pick('راه‌های ارتباطی','Contact options')} <ArrowUpLeft size={18}/></Link></div>
   </div>
  </div></section>
 </div>;
}
