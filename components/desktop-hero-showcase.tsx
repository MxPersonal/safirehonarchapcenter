'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpLeft,ChevronLeft,ChevronRight} from 'lucide-react';
import type {Locale} from '@/lib/i18n';

export type HeroShowcaseSlide={
  id:string;
  categoryName:string;
  photoName:string;
  imageUrl:string|null;
  href:string;
  isProduct:boolean;
};

export default function DesktopHeroShowcase({slides,locale}:{slides:HeroShowcaseSlide[];locale:Locale}){
  const [active,setActive]=useState(0);
  const [paused,setPaused]=useState(false);
  const fa=locale==='fa';
  useEffect(()=>{
    if(slides.length<2||paused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const interval=window.setInterval(()=>{
      if(!document.hidden)setActive(value=>(value+slides.length-1)%slides.length);
    },4400);
    return()=>window.clearInterval(interval);
  },[paused,slides.length]);
  if(!slides.length)return null;
  const current=active%slides.length;
  const selected=slides[current];
  const position=(index:number)=>{
    if(index===current)return 'is-center';
    const diff=(index-current+slides.length)%slides.length;
    if(diff===slides.length-1)return 'is-left';
    if(diff===1)return 'is-right';
    return 'is-hidden';
  };
  const step=(direction:number)=>setActive(value=>(value+direction+slides.length)%slides.length);
  return (
    <div className="wf-desktop-showcase" onMouseEnter={()=>setPaused(true)}
      onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)}
      onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setPaused(false);}}>
      <h1 id="wf-hero-heading-desktop" className="wf-showcase-title">
        <span className="wf-showcase-title-base">{fa?'از ایده تا چاپ،':'From idea to print,'}</span>
        <span key={selected.id} className="wf-showcase-title-blue" dir={fa?'rtl':'ltr'}>{selected.categoryName}</span>
      </h1>
      <div className="wf-showcase-stage" role="region" aria-roledescription="carousel"
        aria-label={fa?'نمونه محصولات دسته‌بندی‌های چاپ':'Printing collections showcase'}>
        {slides.map((slide,index)=>{
          const place=position(index);
          const hidden=place==='is-hidden';
          return (
            <Link key={slide.id} href={slide.href}
              className={'wf-showcase-card '+place}
              aria-hidden={hidden} tabIndex={hidden?-1:0}
              aria-label={place==='is-center'
                ?(fa?'مشاهده '+(slide.isProduct?'محصول ':'دسته‌بندی ')+slide.photoName:'Explore '+slide.photoName)
                :(fa?'نمایش نمونه '+slide.categoryName:'Show '+slide.categoryName)}
              onClick={event=>{if(place!=='is-center'){event.preventDefault();setActive(index);}}}>
              {slide.imageUrl
                ?<img src={slide.imageUrl} alt={slide.photoName} loading={hidden?'lazy':'eager'} decoding="async"/>
                :<div className="wf-showcase-empty"><img src="/safir-logo-light.png" alt="" loading="lazy"/><small>{fa?'تصویر این دسته‌بندی ثبت نشده':'No sample image uploaded'}</small></div>}
              <div className="wf-showcase-card-caption">
                <span>{fa?'نمونه چاپ سفیر هنر':'SAFIRE HONAR PRINT'}</span>
                <strong>{slide.photoName}</strong>
              </div>
            </Link>
          );
        })}
        {slides.length>1&&<>
          <button type="button" className="wf-showcase-nav wf-showcase-nav-left"
            onClick={()=>step(-1)} aria-label={fa?'نمونه قبلی':'Previous sample'}><ChevronLeft size={20}/></button>
          <button type="button" className="wf-showcase-nav wf-showcase-nav-right"
            onClick={()=>step(1)} aria-label={fa?'نمونه بعدی':'Next sample'}><ChevronRight size={20}/></button>
        </>}
      </div>
      <div className="wf-showcase-bottom">
        <span className="wf-showcase-indicator" aria-hidden="true">{String(current+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span>
        <Link className="wf-button wf-button-primary wf-showcase-dynamic-cta" href={selected.href}>
          {fa?(selected.isProduct?'مشاهده محصول ':'مشاهده دسته‌بندی ')+selected.categoryName
            :(selected.isProduct?'View product: ':'Explore collection: ')+selected.categoryName}
          <ArrowUpLeft size={19} aria-hidden="true"/>
        </Link>
      </div>
    </div>
  );
}
