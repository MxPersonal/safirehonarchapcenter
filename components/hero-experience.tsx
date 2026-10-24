'use client';

import Link from 'next/link';
import {useI18n} from '@/components/locale-provider';
import {useRef} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'motion/react';
import {ArrowDownLeft,ArrowUpLeft,MoveUpLeft,Sparkles,Layers3} from 'lucide-react';

export default function HeroExperience({headline,description}:{headline?:string;description?:string}){
 const {locale,path,pick}=useI18n();
 const stage=useRef<HTMLElement>(null);
 const reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:stage,offset:['start start','end start']});
 const leftY=useTransform(scrollYProgress,[0,1],[0,-104]);
 const centerY=useTransform(scrollYProgress,[0,1],[0,72]);
 const rightY=useTransform(scrollYProgress,[0,1],[0,-38]);
 const spin=useTransform(scrollYProgress,[0,1],[-12,18]);
 const fade=useTransform(scrollYProgress,[0,0.95],[1,0.45]);
 return <section className="atelier-hero" ref={stage} aria-label={pick("معرفی استودیوی چاپ سفیر هنر","Safire Honar creative print studio")}>
  <div className="atelier-hero-halftone" aria-hidden="true"/>
  <div className="atelier-hero-sundial" aria-hidden="true"/>
  <div className="container atelier-hero-shell">
   <motion.div className="atelier-hero-copy" style={{opacity:reduced?1:fade}}>
    <div className="atelier-sup"><span className="atelier-sup-dot"/> {pick('استودیوی خلاق چاپ','CREATIVE PRINTING STUDIO')} <span> / {pick("۱۴۰۵","2026")}</span></div>
    <div className="atelier-hero-headline">
      {headline?<motion.span initial={reduced?false:{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.74}} className="atelier-headline-first">{headline}</motion.span>:<>
      <motion.span initial={reduced?false:{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.74}} className="atelier-headline-first">{pick("چاپ، فقط","PRINT IS")}</motion.span>
      <motion.span initial={reduced?false:{y:45,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.78,delay:.14}} className="atelier-headline-second">{pick("چاپ نیست","MORE THAN INK")}<span className="atelier-headline-asterisk">✳</span></motion.span>
      <motion.span initial={reduced?false:{y:38,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.78,delay:.27}} className="atelier-headline-third">{pick("یک ","IT’S ")}<i>{pick("هنره!","AN ART.")}</i></motion.span></>}
    </div>
    <motion.p initial={reduced?false:{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.72,delay:.48}}>{description||pick('از بنرهای چندمتری تا ظرافت یک کارت ویزیت. هر سفارشی می‌تونه یک اثر متفاوت باشه. دسته‌بندی‌ات رو انتخاب کن، نمونه‌ها رو ببین و سفارش مخصوص خودت رو بساز.','From large-format banners to carefully finished business cards. Explore our print collections, find inspiration and create something entirely your own.')}</motion.p>
    <motion.div className="atelier-hero-buttons" initial={reduced?false:{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.55}}>
      <Link href="#collections" className="atelier-action atelier-action-dark">{pick("کشف دنیای چاپ","Explore our work")} <ArrowUpLeft size={20}/></Link>
      <Link href={path("/order")} className="atelier-action atelier-action-outline">{pick("سفارش اختصاصی","Custom order")} <MoveUpLeft size={18}/></Link>
    </motion.div>
    <div className="atelier-hero-signature"><div className="atelier-signature-icon"><Sparkles size={20}/></div><span>{pick("یک ایده. هزار امکان.","One idea. Endless possibilities.")}<br/><b>{pick("سفیر هنر، جایی برای دیده‌شدن.","Make your ideas visible.")}</b></span></div>
   </motion.div>
   <div className="atelier-gallery" aria-label={pick("موکاپ گرافیکی محصولات چاپی","Graphic mockups of printed products")}>
      <div className="atelier-orbit-ring" aria-hidden="true"/>
      <motion.div className="atelier-print-sheet atelier-print-sheet-1" style={{y:reduced?0:leftY,rotate:reduced?-13:spin}}>
        <span className="atelier-sheet-top">{pick('سفیر هنر / ۰۰۱ | آزمایش چاپ','SH. / 001 | PRINT EXPERIMENT')}</span><strong className="atelier-sheet-a">{pick('هنر را','MAKE')}<br/><b>{pick('نمایان','ART')}</b><i>{pick('کن.','VISIBLE.')}</i></strong><span className="atelier-sheet-stroke"/><span className="atelier-sheet-foot">{pick('جوهر روی کاغذ؛ ایده در حرکت','INK ON PAPER. IDEAS IN MOTION.')}</span>
      </motion.div>
      <motion.div className="atelier-print-sheet atelier-print-sheet-2" style={{y:reduced?0:centerY}}>
        <span className="atelier-sheet-top">{pick("چاپ سفیر هنر / ۰۰۲","SAFIRE HONAR / 002")}</span><span className="atelier-sheet-center">{pick("یک ","A ")}<i>{pick("اثر","BOLD")}</i><br/>{pick("متفاوت.","IMPRESSION.")}</span><span className="atelier-wave"/><span className="atelier-sheet-foot">{pick('هنر چاپ / زاده ایده‌ها','THE ART OF PRINT / EST. IN IDEAS')}</span>
      </motion.div>
      <motion.div className="atelier-print-sheet atelier-print-sheet-3" style={{y:reduced?0:rightY}}>
        <span>{pick('مطالعه رنگ / ۰۰۳','COLOR STUDY 003')}</span><div className="atelier-grid-flower" aria-hidden="true"><i/><i/><i/><i/></div><b>{pick('رنگ‌های','CMYK')}<br/>{pick('چاپ','STUDIO')}</b><span>{pick('امکان‌های بی‌پایان','UNLIMITED POSSIBILITIES')} ↗</span>
      </motion.div>
      <div className="atelier-color-bar" aria-hidden="true"><span/><span/><span/><span/></div>
      <div className="atelier-sticker" aria-hidden="true"><span>{pick("۱۰۰٪","100%")}</span><b>{pick("خلاقیت","CREATIVE")}</b><Layers3 size={24}/></div>
      <div className="atelier-chapter-mark">{pick('شماره ۰۱ / چهره خلاق چاپ','NO. 01 / THE CREATIVE SIDE OF PRINT')}</div>
   </div>
  </div>
  <div className="atelier-hero-bottom"><a href="#collections">{pick("اسکرول کن، الهام بگیر","Scroll to get inspired")} <ArrowDownLeft size={19}/></a><div className="atelier-bottom-line"/><span>{pick('چاپ سفیر هنر','SAFIRE HONAR')} <b>®</b> {pick('آزمایشگاه تصویر','VISUAL LAB')}</span></div>
 </section>
}
