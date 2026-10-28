import Link from 'next/link';
import { ArrowUpLeft, ArrowDownLeft, ArrowLeft, ArrowRight, ArrowUpRight, Check, Layers3, ScanLine, FileCheck2, ArrowUp, Sparkles, Plus, Printer, PackageCheck, MessageCircle, PenLine, MousePointer2 } from 'lucide-react';
import { siteText } from '@/lib/i18n-server';
import { localePath } from '@/lib/i18n';
import { storeCategories, mainCategories, cmsPage, storeGalleryProducts } from '@/lib/store';
import { ProductTile } from '@/components/showcase';
import PrintCollectionExplorer from '@/components/print-collection-explorer';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { locale, pick } = await siteText();
  const path = (url: string) => localePath(url, locale);
  const [all, hero, products] = await Promise.all([
    storeCategories(locale),
    cmsPage('home', locale),
    storeGalleryProducts(locale)
  ]);
  const categories = mainCategories(all).slice(0, 8);
  const featuredProducts = (products ?? []).slice(0, 4);
  const steps = [
    { no: '01', Icon: Layers3, title: pick('محصولت رو پیدا کن', 'Explore the collection'), text: pick('از دسته‌بندی‌های اصلی، چاپ مورد نظرت را انتخاب کن.', 'Find the right printing format in our product collections.') },
    { no: '02', Icon: ScanLine, title: pick('جزئیات رو مشخص کن', 'Share the details'), text: pick('ابعاد، تعداد، جنس و فایل یا توضیحات طرح را ثبت کن.', 'Describe the size, quantity, material and artwork requirements.') },
    { no: '03', Icon: FileCheck2, title: pick('بررسی و هماهنگی', 'Review and confirmation'), text: pick('درخواست برای بررسی شرایط و هماهنگی سفارش ارسال می‌شود.', 'Your request is reviewed before pricing and production are confirmed.') }
  ];
  const faqs = [
    { q: pick('آیا همه محصولات قیمت مشخص دارند؟', 'Does every product have a fixed price?'), a: pick('نه. محصولات دارای قیمت مشخص را می‌توان از فروشگاه انتخاب کرد؛ برای خدمات سفارشی، قیمت پس از بررسی مشخصات اعلام می‌شود.', 'No. Some products have published prices; custom printing is quoted after reviewing the specifications.') },
    { q: pick('برای سفارش اختصاصی چه اطلاعاتی لازم است؟', 'What details do I need for a custom order?'), a: pick('ابعاد، جنس، تعداد، فایل طرح یا شرح نیازت را در فرم سفارش وارد کن تا امکان بررسی فراهم شود.', 'Tell us the dimensions, material, quantity and your design or project requirements in the request form.') },
    { q: pick('اگر هنوز فایل آماده چاپ ندارم چه کار کنم؟', 'What if my print-ready file is not ready?'), a: pick('می‌توانی ابتدا نیازت را توضیح بدهی و برای بررسی از بخش سفارش اختصاصی اقدام کنی. شرایط نهایی پس از هماهنگی مشخص می‌شود.', 'You can explain what you need through the custom order form. The team will review the request before confirming the next steps.') },
    { q: pick('از کجا وضعیت سفارش را پیگیری کنم؟', 'Where can I follow up on my order?'), a: pick('از بخش حساب کاربری وارد شو و اطلاعات مربوط به درخواست‌ها و سفارش‌های خودت را بررسی کن.', 'Sign in to your customer account to review your requests and order information.') }
  ];
  return <div className="sx-home">
    <section className="sx-hero" aria-labelledby="sx-hero-title">
      <div className="sx-hero-noise" aria-hidden="true" />
      <div className="container sx-hero-grid">
        <div className="sx-hero-copy">
          <div className="sx-eyebrow sx-eyebrow-light"><span className="sx-live-dot" /> {pick('استودیو تخصصی چاپ و طراحی', 'CREATIVE PRINT & DESIGN STUDIO')} <span className="sx-eyebrow-index">01 / STUDIO</span></div>
          <h1 id="sx-hero-title">{hero?.title || <>{pick('هر ایده،', 'IDEAS MADE')}<br/><span>{pick('یک اثر ماندگار.', 'TO BE SEEN.')}</span></>}</h1>
          <p>{hero?.body || pick('از ظرافت کارت ویزیت تا جسارت یک بنر بزرگ. محصول مناسب ایده‌ات را پیدا کن، جزئیات را ببین و سفارش چاپ را با اطمینان بیشتری شروع کن.', 'From fine-detail business cards to large-format banners. Explore print collections, discover the right format and start your next order with clarity.')}</p>
          <div className="sx-hero-actions">
            <Link className="sx-btn sx-btn-lime" href={path('/catalog')}>{pick('کشف محصولات چاپی', 'Explore print products')} <ArrowUpLeft size={19}/></Link>
            <Link className="sx-btn sx-btn-outline-dark" href={path('/order')}>{pick('ثبت سفارش اختصاصی', 'Custom print request')} <ArrowUpLeft size={19}/></Link>
          </div>
          <div className="sx-hero-note"><span className="sx-note-asterisk">✳</span><span>{pick('از انتخاب محصول تا هماهنگی چاپ، قدم‌به‌قدم همراه ایده‌ات.', 'A clear journey from finding a format to reviewing your print request.')}</span></div>
        </div>
        <div className="sx-hero-visual" role="img" aria-label={pick('چیدمان نمایشی پوستر، کارت ویزیت و نمونه چاپ سفیر هنر','Illustrative composition of print studio stationery, poster and business cards')}>
          <div className="sx-visual-orbit sx-visual-orbit-one" aria-hidden="true"/>
          <div className="sx-visual-orbit sx-visual-orbit-two" aria-hidden="true"/>
          <div className="sx-print-shadow" aria-hidden="true"/>
          <div className="sx-print-poster">
            <span className="sx-poster-top">{pick('چاپ سفیر هنر', 'SAFIRE HONAR')} <span>001 / PRINT</span></span>
            <div className="sx-poster-graphic"><span className="sx-poster-ball" /><span className="sx-poster-petal sx-petal-1"/><span className="sx-poster-petal sx-petal-2"/><span className="sx-poster-petal sx-petal-3"/><span className="sx-poster-petal sx-petal-4"/></div>
            <strong>{pick('رنگی از', 'PRINT WITH')}<br/><em>{pick('جنس ایده', 'CHARACTER')}</em></strong>
            <span className="sx-poster-bottom">CMYK / PRINT STUDIO <span>1405 / 2026</span></span>
          </div>
          <div className="sx-print-ticket"><span>SH / 002</span><strong>{pick('یک قاب،', 'MAKE IT')}<br/>{pick('هزار نگاه', 'MEMORABLE')}</strong><span className="sx-ticket-mark">↗</span></div>
          <div className="sx-print-card"><span>SAFIRE HONAR ®</span><div className="sx-card-mark">S<span>H</span></div><small>CREATIVE PRINT STUDIO</small></div>
          <div className="sx-cmyk-mark" aria-hidden="true"><i/><i/><i/><i/></div>
          <div className="sx-visual-caption"><span className="sx-caption-dot"/>{pick('ترکیب گرافیکی نمایشی', 'ILLUSTRATIVE PRINT COMPOSITION')}</div>
        </div>
      </div>
      <div className="container sx-hero-bottom"><span>{pick('چاپ سفیر هنر / فرم، رنگ، ایده', 'SAFIRE HONAR / FORM, COLOUR, IDEAS')}</span><a href="#collections">{pick('دنیای چاپ رو کشف کن', 'Discover our collections')} <ArrowDownLeft size={16}/></a></div>
    </section>

    <section className="sx-intro-strip" aria-label={pick('مسیرهای اصلی سایت','Quick navigation')}>
      <div className="container sx-intro-grid">
        <Link href={path('/catalog')}><span className="sx-intro-icon"><Layers3 size={23}/></span><span><strong>{pick('محصولات چاپی','Print collections')}</strong><small>{pick('دسته‌بندی و انتخاب', 'Browse categories')}</small></span><ArrowUpLeft size={20}/></Link>
        <Link href={path('/designs')}><span className="sx-intro-icon"><Sparkles size={23}/></span><span><strong>{pick('گالری طرح‌ها','Design gallery')}</strong><small>{pick('نمونه‌ها و طرح‌ها', 'Explore the gallery')}</small></span><ArrowUpLeft size={20}/></Link>
        <Link href={path('/order')}><span className="sx-intro-icon"><PenLine size={23}/></span><span><strong>{pick('سفارش اختصاصی','Custom orders')}</strong><small>{pick('درخواست و استعلام', 'Get a custom quote')}</small></span><ArrowUpLeft size={20}/></Link>
      </div>
    </section>

    <section className="sx-collections sx-section" id="collections" aria-labelledby="sx-collections-title">
      <div className="container">
        <div className="sx-section-head">
          <div><span className="sx-section-kicker"><span>01</span> / {pick('دنیای محصولات','COLLECTIONS')}</span><h2 id="sx-collections-title">{pick('برای هر ایده،','A print for')} <em>{pick('یک شکل تازه.', 'every idea.')}</em></h2><p>{pick('از بین دسته‌بندی‌های چاپی، مناسب‌ترین مسیر را برای پروژه‌ات انتخاب کن.', 'Find the right print category for your next project.')}</p></div>
          <Link className="sx-text-link" href={path('/catalog')}>{pick('تمام دسته‌بندی‌ها','All collections')} <ArrowUpLeft size={18}/></Link>
        </div>
        <PrintCollectionExplorer categories={categories} locale={locale} />
      </div>
    </section>

    {featuredProducts.length > 0 && <section className="sx-featured sx-section" aria-labelledby="sx-products-title">
      <div className="container">
        <div className="sx-section-head"><div><span className="sx-section-kicker"><span>02</span> / {pick('محصولات منتشرشده','PUBLISHED PRODUCTS')}</span><h2 id="sx-products-title">{pick('جزئیات،', 'The details')} <em>{pick('تفاوت می‌سازند.', 'make the difference.')}</em></h2><p>{pick('محصولات و تصاویر واقعی منتشرشده در فروشگاه، با قیمت یا شرایط استعلام همان محصول.', 'Published products from our actual store, with their current pricing or quote options.')}</p></div><Link className="sx-text-link" href={path('/catalog')}>{pick('رفتن به فروشگاه', 'Browse the shop')} <ArrowUpLeft size={18}/></Link></div>
        <div className="sx-product-grid">{featuredProducts.map(product => <ProductTile key={product.id} product={product} locale={locale}/>)}</div>
      </div>
    </section>}

    <section className="sx-manifesto" aria-label={pick('نگاه ما به چاپ','Our approach to printing')}>
      <div className="container sx-manifesto-grid">
        <div className="sx-manifesto-meta"><span className="sx-star">✳</span><span>THE ART OF PRINT<br/>SAFIRE HONAR / 2026</span></div>
        <div className="sx-manifesto-copy"><span className="sx-section-kicker">{pick('چرا سفیر هنر؟','OUR APPROACH')}</span><h2>{pick('چاپ، فقط خروجی نیست.', 'Print is more than output.')}<br/><em>{pick('شکل دیده‌شدن یک ایده‌ست.', 'It gives an idea its shape.')}</em></h2><p>{pick('یک انتخاب درست در جنس، اندازه و نوع چاپ می‌تواند نتیجه را متفاوت کند. دسته‌بندی‌ها را بشناس و قبل از سفارش، جزئیات را بررسی کن.', 'The right format, finish and size matter. Explore your options and review the details before placing a request.')}</p><Link href={path('/services')} className="sx-btn sx-btn-cream">{pick('آشنایی با خدمات چاپ', 'Explore our services')} <ArrowUpLeft size={19}/></Link></div>
        <div className="sx-manifesto-symbol" aria-hidden="true"><span>SH</span><span>✳</span></div>
      </div>
    </section>

    <section className="sx-steps sx-section" aria-labelledby="sx-steps-title">
      <div className="container"><div className="sx-section-head"><div><span className="sx-section-kicker"><span>03</span> / {pick('مراحل سفارش','HOW IT WORKS')}</span><h2 id="sx-steps-title">{pick('از ایده تا چاپ،', 'From idea')} <em>{pick('مسیر روشنه.', 'to the final print.')}</em></h2><p>{pick('شروع سفارش از یک انتخاب ساده آغاز می‌شود.', 'A straightforward way to get your project started.')}</p></div><Link className="sx-text-link" href={path('/guide')}>{pick('راهنمای آماده‌سازی فایل', 'Artwork preparation guide')} <ArrowUpLeft size={18}/></Link></div>
        <div className="sx-steps-grid">{steps.map(step => <article className="sx-step" key={step.no}><div className="sx-step-top"><span>{step.no} / 03</span><step.Icon size={27} strokeWidth={1.5}/></div><div><h3>{step.title}</h3><p>{step.text}</p></div></article>)}</div>
      </div>
    </section>

    <section className="sx-paths sx-section" aria-labelledby="sx-paths-title">
      <div className="container"><div className="sx-section-head"><div><span className="sx-section-kicker"><span>04</span> / {pick('دو مسیر سفارش','TWO WAYS TO BEGIN')}</span><h2 id="sx-paths-title">{pick('هر سفارش،', 'Your project,')} <em>{pick('مسیر خودش رو داره.', 'your way.')}</em></h2></div></div>
        <div className="sx-paths-grid">
          <Link href={path('/catalog')} className="sx-path-card sx-path-ready"><div className="sx-path-top"><span>01 / {pick('خرید از فروشگاه', 'SHOP PRODUCTS')}</span><PackageCheck size={27}/></div><div className="sx-path-art" aria-hidden="true"><span className="sx-path-sheet"><i/><i/><i/></span><span className="sx-path-disc"/></div><div className="sx-path-bottom"><div><h3>{pick('محصول آماده انتخاب کن.', 'Find your print product.')}</h3><p>{pick('محصولات منتشرشده را ببین و اگر قیمت مشخص دارند، سفارش را از همان مسیر شروع کن.', 'Browse published products and choose a fixed-price option where available.')}</p></div><span className="sx-path-arrow"><ArrowUpLeft size={24}/></span></div></Link>
          <Link href={path('/order')} className="sx-path-card sx-path-custom"><div className="sx-path-top"><span>02 / {pick('چاپ اختصاصی', 'CUSTOM PRINTING')}</span><PenLine size={27}/></div><div className="sx-path-art" aria-hidden="true"><span className="sx-path-ribbon">S</span><span className="sx-path-custom-stamp">H<br/>✳</span></div><div className="sx-path-bottom"><div><h3>{pick('چیز متفاوتی تو ذهنته؟', 'Have something in mind?')}</h3><p>{pick('مشخصات پروژه‌ات را بفرست تا شرایط اجرا و قیمت پس از بررسی اعلام شود.', 'Share your requirements for review before the production details and pricing are confirmed.')}</p></div><span className="sx-path-arrow"><ArrowUpLeft size={24}/></span></div></Link>
        </div>
      </div>
    </section>

    <section className="sx-faq sx-section" aria-labelledby="sx-faq-title">
      <div className="container sx-faq-grid"><div className="sx-faq-aside"><span className="sx-section-kicker"><span>05</span> / {pick('پرسش‌های متداول','GOOD TO KNOW')}</span><h2 id="sx-faq-title">{pick('سؤالی', 'Questions?')}<br/><em>{pick('باقی مونده؟', 'We can help.')}</em></h2><p>{pick('پیش از انتخاب محصول یا ثبت درخواست، جواب چند پرسش پرتکرار را ببین.', 'A few useful answers before you choose a product or make a request.')}</p><Link className="sx-text-link" href={path('/contact')}>{pick('تماس با ما','Contact the studio')} <ArrowUpLeft size={18}/></Link></div><div className="sx-faq-list">{faqs.map((faq,i) => <details key={faq.q} className="sx-faq-item"><summary><span className="sx-faq-number">0{i+1}</span><strong>{faq.q}</strong><Plus size={21}/></summary><p>{faq.a}</p></details>)}</div></div>
    </section>

    <section className="sx-final-cta" aria-labelledby="sx-final-title"><div className="container sx-final-inner"><span className="sx-final-corner">SAFIRE HONAR / START HERE</span><div><span className="sx-section-kicker">{pick('وقتش رسیده ایده‌ات دیده بشه','MAKE YOUR NEXT PROJECT VISIBLE')}</span><h2 id="sx-final-title">{pick('ایده‌ات رو', 'Let’s make')}<br/><em>{pick('به چاپ برسون.', 'it tangible.')}</em></h2></div><div className="sx-final-actions"><p>{pick('از یک محصول ساده تا یک درخواست اختصاصی، نقطه شروع همین‌جاست.', 'Whether it is a simple print or a custom request, start right here.')}</p><Link href={path('/order')} className="sx-btn sx-btn-dark">{pick('شروع سفارش', 'Start your project')} <ArrowUpLeft size={20}/></Link></div><span className="sx-final-decoration" aria-hidden="true">✳</span></div></section>
  </div>;
}
