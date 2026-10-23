import Link from 'next/link';
import {ArrowUpLeft,CheckCircle2,ChevronLeft,ClipboardCheck,Headset,Layers3,Paintbrush2,ScanLine,ShoppingBag,Stars,UploadCloud} from 'lucide-react';
import {storeCategories,mainCategories,cmsPage} from '@/lib/store';
import {CategorySpotlight,CollectionRail} from '@/components/showcase';
import HeroExperience from '@/components/hero-experience';
import {Reveal,WordReveal,PosterParallax} from '@/components/scroll-experience';

export const dynamic='force-dynamic';
const journey=[
 {step:'۰۱',title:'انتخاب کن',sub:'یک دسته یا نمونه‌طرح انتخاب کن، یا با فایل خودت شروع کن.',icon:ScanLine},
 {step:'۰۲',title:'سفارشی کن',sub:'ابعاد، جنس، متن و جزئیات چاپ رو به سلیقه خودت مشخص کن.',icon:Paintbrush2},
 {step:'۰۳',title:'تأیید کن',sub:'مشخصات رو بازبینی کن و سفارش یا درخواست استعلام رو ثبت کن.',icon:ClipboardCheck}
];
export default async function Home(){const [allCategories,hero]=await Promise.all([storeCategories(),cmsPage('home')]);const categories=mainCategories(allCategories);return <div className="expressive-home">
 <HeroExperience headline={hero?.title} description={hero?.body}/>
 <div className="expressive-ribbon" aria-label="گروه محصولات چاپی"><div className="expressive-ribbon-track" aria-hidden="true">CREATIVE PRINT ✳ LARGE FORMAT ✳ BRAND MATERIALS ✳ SIGNAGE ✳ BESPOKE PRINT ✳ چاپ با شخصیت ✳ CREATIVE PRINT ✳ LARGE FORMAT ✳ BRAND MATERIALS ✳ SIGNAGE ✳ BESPOKE PRINT ✳ چاپ با شخصیت ✳</div></div>
 <section className="expressive-intro" aria-labelledby="expressive-intro-title"><div className="container expressive-intro-inner">
   <Reveal className="expressive-intro-header"><span className="atelier-label">01 / WHAT WE PRINT</span><h2 id="expressive-intro-title">ما فقط محصول چاپ نمی‌کنیم.<br/><em>ما به ایده‌ها شکل می‌دیم.</em></h2></Reveal>
   <Reveal className="expressive-intro-side" delay={.1}><span className="intro-flower" aria-hidden="true">✳</span><p>از بنر و تابلو تا کارت ویزیت و بسته‌بندی. اینجا هر دسته یک جهان گرافیکی جداگانه دارد. اول نوع چاپ را انتخاب کن و بعد سراغ زیرمجموعه‌ها برو.</p><a href="#collections">دسته‌بندی‌ها رو کشف کن <ArrowUpLeft size={19}/></a></Reveal>
 </div></section>
 <section className="expressive-collections" id="collections" aria-labelledby="collections-heading"><div className="container">
    <Reveal className="expressive-heading"><div><span className="atelier-label">02 / THE PRINT UNIVERSE</span><h2 id="collections-heading"><WordReveal>انتخابت چیه؟</WordReveal><br/><em><WordReveal>بزن بریم توش!</WordReveal></em></h2></div><div className="expressive-heading-end"><span className="expressive-heading-asterisk">✳</span><p>از هر دسته یک نمونه می‌بینی. برای مشاهده تمام زیرمجموعه‌ها و نمونه‌طرح‌های قابل سفارش وارد همان دسته شو.</p></div></Reveal>
    <CollectionRail categories={categories}/>
    <div className="spotlight-stack">{categories.map((category,index)=><CategorySpotlight key={category.id} category={category} index={index}/>)}</div>
    <Reveal className="expressive-collection-footer"><span>{String(categories.length).padStart(2,'0')} / PRINT FAMILIES</span><Link href="/catalog" className="atelier-action atelier-action-dark">تمام دسته‌های چاپ <ArrowUpLeft size={19}/></Link></Reveal>
 </div></section>
 <section className="expressive-marquee-block" aria-label="طرح‌های چاپی"><div><span>PRINT</span> YOUR <i>STORY.</i> <strong>✳</strong> MAKE IT <em>LOUD.</em></div></section>
 <section className="expressive-order" aria-labelledby="order-way-heading"><div className="container">
   <Reveal className="expressive-heading"><div><span className="atelier-label">03 / YOUR ORDER, YOUR WAY</span><h2 id="order-way-heading">دو مسیر،<br/><em>یک نتیجه عالی.</em></h2></div><p>همه سفارش‌ها یک شکل نیستند. هر محصول، مسیر خرید مناسب خودش را دارد.</p></Reveal>
   <div className="expressive-order-grid"><Reveal className="expressive-order-card order-fixed"><div className="order-card-top"><span>01 / DIRECT ORDER</span><ShoppingBag size={30}/></div><div className="order-card-icon" aria-hidden="true">✦</div><div className="order-card-copy"><span className="order-mode-pill"><CheckCircle2 size={14}/> قیمت مشخص</span><h3>قیمت داره؟<br/>مستقیم سفارش بده.</h3><p>برای محصولاتی که قیمت نهایی‌شان توسط مجموعه تعیین شده است، بدون تماس وارد فرایند سفارش شو.</p><Link href="/catalog">مشاهده محصولات <ArrowUpLeft size={20}/></Link></div></Reveal>
   <Reveal className="expressive-order-card order-quote" delay={.12}><div className="order-card-top"><span>02 / CUSTOM REQUEST</span><Headset size={30}/></div><div className="order-card-orb" aria-hidden="true"><span>؟</span></div><div className="order-card-copy"><span className="order-mode-pill">سفارشی و استعلامی</span><h3>کار خاص داری؟<br/>بذار بررسی کنیم.</h3><p>جزئیات و ابعاد را ارسال کن، درخواست در حساب کاربری‌ات ثبت می‌شود و قیمت پس از بررسی اعلام می‌شود.</p><Link href="/order">ثبت درخواست استعلام <ArrowUpLeft size={20}/></Link></div></Reveal></div>
   <p className="expressive-trust-note"><CheckCircle2 size={17}/> هیچ قیمت، زمان تحویل یا تخفیفی بدون تأیید مجموعه اعلام نمی‌شود.</p>
 </div></section>
 <section className="expressive-process" aria-labelledby="process-heading"><div className="container expressive-process-grid"><div className="expressive-process-copy"><Reveal><span className="atelier-label">04 / FROM FILE TO FINAL</span><h2 id="process-heading">از ایده تا<br/><em>اثر نهایی.</em></h2><p>ثبت سفارش چاپ نباید پیچیده باشد. مسیر را قدم‌به‌قدم جلو می‌بریم تا قبل از چاپ، همه چیز واضح باشد.</p></Reveal><div className="expressive-journey">{journey.map((item,i)=><Reveal key={item.step} delay={i*.09} className="expressive-journey-item"><span className="journey-number">{item.step}</span><div><h3>{item.title}</h3><p>{item.sub}</p></div><item.icon size={23}/></Reveal>)}</div><Link href="/guide" className="atelier-action atelier-action-dark">راهنمای چاپ و فایل <ArrowUpLeft size={20}/></Link></div>
    <PosterParallax className="expressive-process-art" strength={62}><div className="process-stage"><span className="process-stage-grid"/><div className="process-paper process-paper-back"><span>SH / EXPLORING COLORS</span><strong>CM<br/>YK.</strong><b>PRINT EXPERIMENT / 02</b></div><div className="process-paper process-paper-front"><span>SAFIRE HONAR · EDITION 01</span><strong>جزئیات<br/><i>مهم‌اند.</i></strong><div className="process-paper-shape"/><span>DESIGNED TO LEAVE A MARK ↗</span></div><span className="process-stage-stamp">✳</span></div></PosterParallax>
 </div></section>
 <section className="expressive-outro" aria-labelledby="outro-heading"><div className="container expressive-outro-inner"><Reveal><span className="atelier-label">05 / LET'S MAKE SOMETHING GOOD</span><h2 id="outro-heading">حالا نوبت<br/><em>ایده توئه!</em></h2><p>از دسته‌بندی شروع کن یا طرح خودت رو برای بررسی بفرست.</p><div className="outro-ctas"><Link href="/catalog" className="atelier-action atelier-action-light">دیدن دسته‌ها <ArrowUpLeft size={20}/></Link><Link href="/order" className="atelier-outro-plain">ثبت درخواست اختصاصی <ChevronLeft size={20}/></Link></div></Reveal><div className="outro-glyph" aria-hidden="true">✳</div></div></section>
 </div>}
