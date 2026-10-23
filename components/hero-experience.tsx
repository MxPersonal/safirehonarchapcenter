'use client';

import Link from 'next/link';
import {useRef} from 'react';
import {motion,useScroll,useTransform,useReducedMotion} from 'motion/react';
import {ArrowDownLeft,ArrowUpLeft,MoveUpLeft,Sparkles,Layers3} from 'lucide-react';

export default function HeroExperience({headline,description}:{headline?:string;description?:string}){
 const stage=useRef<HTMLElement>(null);
 const reduced=useReducedMotion();
 const {scrollYProgress}=useScroll({target:stage,offset:['start start','end start']});
 const leftY=useTransform(scrollYProgress,[0,1],[0,-104]);
 const centerY=useTransform(scrollYProgress,[0,1],[0,72]);
 const rightY=useTransform(scrollYProgress,[0,1],[0,-38]);
 const spin=useTransform(scrollYProgress,[0,1],[-12,18]);
 const fade=useTransform(scrollYProgress,[0,0.95],[1,0.45]);
 return <section className="atelier-hero" ref={stage} aria-label="معرفی استودیوی چاپ سفیر هنر">
  <div className="atelier-hero-halftone" aria-hidden="true"/>
  <div className="atelier-hero-sundial" aria-hidden="true"/>
  <div className="container atelier-hero-shell">
   <motion.div className="atelier-hero-copy" style={{opacity:reduced?1:fade}}>
    <div className="atelier-sup"><span className="atelier-sup-dot"/> CREATIVE PRINTING STUDIO <span> / ۱۴۰۵</span></div>
    <div className="atelier-hero-headline">
      {headline?<motion.span initial={reduced?false:{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.74}} className="atelier-headline-first">{headline}</motion.span>:<>
      <motion.span initial={reduced?false:{y:40,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.74}} className="atelier-headline-first">چاپ، فقط</motion.span>
      <motion.span initial={reduced?false:{y:45,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.78,delay:.14}} className="atelier-headline-second">چاپ نیست<span className="atelier-headline-asterisk">✳</span></motion.span>
      <motion.span initial={reduced?false:{y:38,opacity:0}} animate={{y:0,opacity:1}} transition={{duration:.78,delay:.27}} className="atelier-headline-third">یک <i>هنره!</i></motion.span></>}
    </div>
    <motion.p initial={reduced?false:{opacity:0,y:24}} animate={{opacity:1,y:0}} transition={{duration:.72,delay:.48}}>{description||'از بنرهای چندمتری تا ظرافت یک کارت ویزیت. هر سفارشی می‌تونه یک اثر متفاوت باشه. دسته‌بندی‌ات رو انتخاب کن، نمونه‌ها رو ببین و سفارش مخصوص خودت رو بساز.'}</motion.p>
    <motion.div className="atelier-hero-buttons" initial={reduced?false:{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{duration:.7,delay:.55}}>
      <Link href="#collections" className="atelier-action atelier-action-dark">کشف دنیای چاپ <ArrowUpLeft size={20}/></Link>
      <Link href="/order" className="atelier-action atelier-action-outline">سفارش اختصاصی <MoveUpLeft size={18}/></Link>
    </motion.div>
    <div className="atelier-hero-signature"><div className="atelier-signature-icon"><Sparkles size={20}/></div><span>یک ایده. هزار امکان.<br/><b>سفیر هنر، جایی برای دیده‌شدن.</b></span></div>
   </motion.div>
   <div className="atelier-gallery" aria-label="موکاپ گرافیکی محصولات چاپی">
      <div className="atelier-orbit-ring" aria-hidden="true"/>
      <motion.div className="atelier-print-sheet atelier-print-sheet-1" style={{y:reduced?0:leftY,rotate:reduced?-13:spin}}>
        <span className="atelier-sheet-top">SH. / 001 &nbsp; | &nbsp; PRINT EXPERIMENT</span><strong className="atelier-sheet-a">MAKE<br/><b>ART</b><i>VISIBLE.</i></strong><span className="atelier-sheet-stroke"/><span className="atelier-sheet-foot">INK ON PAPER. IDEAS IN MOTION.</span>
      </motion.div>
      <motion.div className="atelier-print-sheet atelier-print-sheet-2" style={{y:reduced?0:centerY}}>
        <span className="atelier-sheet-top">چاپ سفیر هنر / ۰۰۲</span><span className="atelier-sheet-center">یک <i>اثر</i><br/>متفاوت.</span><span className="atelier-wave"/><span className="atelier-sheet-foot">THE ART OF PRINT / EST. IN IDEAS</span>
      </motion.div>
      <motion.div className="atelier-print-sheet atelier-print-sheet-3" style={{y:reduced?0:rightY}}>
        <span>COLOR STUDY 003</span><div className="atelier-grid-flower" aria-hidden="true"><i/><i/><i/><i/></div><b>CMYK<br/>STUDIO</b><span>UNLIMITED POSSIBILITIES ↗</span>
      </motion.div>
      <div className="atelier-color-bar" aria-hidden="true"><span/><span/><span/><span/></div>
      <div className="atelier-sticker" aria-hidden="true"><span>۱۰۰٪</span><b>خلاقیت</b><Layers3 size={24}/></div>
      <div className="atelier-chapter-mark">NO. 01 / THE CREATIVE SIDE OF PRINT</div>
   </div>
  </div>
  <div className="atelier-hero-bottom"><a href="#collections">اسکرول کن، الهام بگیر <ArrowDownLeft size={19}/></a><div className="atelier-bottom-line"/><span>SAFIRE HONAR <b>®</b> VISUAL LAB</span></div>
 </section>
}
