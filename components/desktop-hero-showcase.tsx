'use client';

import {useEffect,useRef,useState,type ReactNode} from 'react';
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

type Props={
  slides:HeroShowcaseSlide[];
  locale:Locale;
  baseTitle:string;
  badge:ReactNode;
  children:ReactNode;
};

const SLIDE_INTERVAL_MS=4400;

export default function DesktopHeroShowcase({slides,locale,baseTitle,badge,children}:Props){
  const [active,setActive]=useState(0);
  const [focused,setFocused]=useState(false);
  const [mobile,setMobile]=useState(false);
  const touchX=useRef<number|null>(null);
  const fa=locale==='fa';
  const count=slides.length;

  useEffect(()=>{
    const query=window.matchMedia('(max-width: 900px)');
    const update=()=>setMobile(query.matches);
    update();
    query.addEventListener('change',update);
    return()=>query.removeEventListener('change',update);
  },[]);

  useEffect(()=>{
    if(count<2||focused||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const id=window.setInterval(()=>{
      if(!document.hidden)setActive(value=>(value+1)%count);
    },SLIDE_INTERVAL_MS);
    return()=>window.clearInterval(id);
  },[count,focused]);

  if(!count)return null;
  const current=active%count;
  const selected=slides[current];
  const selectRelative=(amount:number)=>setActive(value=>(value+amount+count)%count);
  const position=(index:number)=>{
    if(index===current)return 'is-center';
    if(count>1&&index===(current+1)%count)return 'is-right';
    if(count>2&&index===(current-1+count)%count)return 'is-left';
    return 'is-hidden';
  };
  const onTouchStart=(event:React.TouchEvent<HTMLElement>)=>{
    touchX.current=event.touches[0]?.clientX??null;
  };
  const onTouchEnd=(event:React.TouchEvent<HTMLElement>)=>{
    const start=touchX.current;
    touchX.current=null;
    const finish=event.changedTouches[0]?.clientX;
    if(start===null||finish===undefined||Math.abs(finish-start)<48||count<2)return;
    selectRelative(finish<start?1:-1);
  };

  return (
    <div className="wf-desktop-showcase" dir={fa?'rtl':'ltr'}
      onFocusCapture={()=>setFocused(true)}
      onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node|null))setFocused(false);}}>
      <div className="wf-showcase-layout">
        <div className="wf-showcase-copy">
          {badge}
          <h1 id="wf-hero-heading" className="wf-showcase-title">
            <span className="wf-showcase-title-base">{baseTitle}</span>
            <span key={selected.id} className="wf-showcase-title-blue" dir={fa?'rtl':'ltr'}>
              {selected.categoryName}
            </span>
          </h1>
          {children}
        </div>
        <div className="wf-showcase-visual">
          <div className="wf-showcase-stage" role="region" aria-roledescription="carousel"
            aria-label={fa?'اسلایدر نمونه محصولات چاپ':'Print product showcase'}
            onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
            {slides.map((slide,index)=>{
              const place=position(index);
              const available=place==='is-center'||(!mobile&&(place==='is-left'||place==='is-right'));
              return <Link key={slide.id} href={slide.href}
                className={'wf-showcase-card '+place}
                aria-hidden={!available} tabIndex={available?0:-1}
                aria-label={place==='is-center'
                  ?(fa?'مشاهده '+(slide.isProduct?'محصول ':'دسته‌بندی ')+slide.photoName:'Open '+slide.photoName)
                  :(fa?'نمایش '+slide.categoryName:'Show '+slide.categoryName)}
                onClick={event=>{if(place!=='is-center'){event.preventDefault();setActive(index);}}}>
                {slide.imageUrl
                  ?<img src={slide.imageUrl} alt={slide.photoName} loading={place==='is-center'?'eager':'lazy'} decoding="async"/>
                  :<div className="wf-showcase-empty">
                    <img src="/safir-logo-light.png" alt="" loading="lazy"/>
                    <small>{fa?'هنوز تصویری برای این دسته‌بندی ثبت نشده':'No category photo uploaded'}</small>
                   </div>}
                <div className="wf-showcase-card-caption">
                  <span>{fa?'چاپ سفیر هنر':'SAFIRE HONAR PRINT'}</span>
                  <strong>{slide.photoName}</strong>
                </div>
              </Link>;
            })}
            {count>1&&<>
              <button type="button" className="wf-showcase-nav wf-showcase-nav-left"
                onClick={()=>selectRelative(-1)} aria-label={fa?'نمایش مورد قبلی':'Previous slide'}>
                <ChevronLeft size={20} aria-hidden="true"/>
              </button>
              <button type="button" className="wf-showcase-nav wf-showcase-nav-right"
                onClick={()=>selectRelative(1)} aria-label={fa?'نمایش مورد بعدی':'Next slide'}>
                <ChevronRight size={20} aria-hidden="true"/>
              </button>
            </>}
          </div>
          <div className="wf-showcase-bottom">
            <span className="wf-showcase-indicator" aria-hidden="true">
              {String(current+1).padStart(2,'0')} / {String(count).padStart(2,'0')}
            </span>
            <Link className="wf-button wf-button-primary wf-showcase-dynamic-cta" href={selected.href}>
              {fa?(selected.isProduct?'مشاهده محصول ':'مشاهده دسته‌بندی ')+selected.categoryName
                :(selected.isProduct?'View product: ':'Explore collection: ')+selected.categoryName}
              <ArrowUpLeft size={19} aria-hidden="true"/>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
