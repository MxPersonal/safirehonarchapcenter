'use client';

import {useEffect} from 'react';

/** Light-touch 3D parallax for product/category links.
 * Event delegation keeps cards server-rendered and preserves navigation.
 * Touch adds a brief lift; mouse/pen calculates a small perspective tilt.
 * Reduced-motion visitors receive the static, accessible design.
 */
const CARD_SELECTOR='.pw-category-item,.shop-tile,.v2-catalog-card,.v3-subcategory-card,.design-card';

export default function GlassInteractions(){
 useEffect(()=>{
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)');
  if(motion.matches)return;

  let animationFrame=0;
  let pending:{card:HTMLElement;x:number;y:number}|null=null;
  const timers=new Map<HTMLElement,number>();

  const findCard=(target:EventTarget|null):HTMLElement|null=>
   target instanceof Element?target.closest<HTMLElement>(CARD_SELECTOR):null;

  function reset(card:HTMLElement){
   card.style.removeProperty('--glass-rx');
   card.style.removeProperty('--glass-ry');
   card.style.removeProperty('--glass-x');
   card.style.removeProperty('--glass-y');
   card.style.removeProperty('will-change');
  }

  function scheduleTilt(event:PointerEvent){
   if(event.pointerType==='touch'||event.buttons>0)return;
   const card=findCard(event.target);
   if(!card)return;
   pending={card,x:event.clientX,y:event.clientY};
   if(animationFrame)return;
   animationFrame=window.requestAnimationFrame(()=>{
    animationFrame=0;
    const next=pending;
    pending=null;
    if(!next||!next.card.isConnected)return;
    const box=next.card.getBoundingClientRect();
    if(!box.width||!box.height)return;
    const px=Math.max(0,Math.min(1,(next.x-box.left)/box.width));
    const py=Math.max(0,Math.min(1,(next.y-box.top)/box.height));
    // Up to +/-3.6 degrees. Gentle enough for quick ecommerce browsing.
    next.card.style.setProperty('--glass-rx',((.5-py)*7.2).toFixed(2)+'deg');
    next.card.style.setProperty('--glass-ry',((px-.5)*7.2).toFixed(2)+'deg');
    next.card.style.setProperty('--glass-x',(px*100).toFixed(1)+'%');
    next.card.style.setProperty('--glass-y',(py*100).toFixed(1)+'%');
    next.card.style.willChange='transform';
   });
  }

  function onPointerOut(event:PointerEvent){
   const card=findCard(event.target);
   if(!card)return;
   if(event.relatedTarget instanceof Node&&card.contains(event.relatedTarget))return;
   reset(card);
  }

  function onPointerDown(event:PointerEvent){
   if(event.pointerType!=='touch')return;
   const card=findCard(event.target);
   if(!card)return;
   const existing=timers.get(card);
   if(existing)window.clearTimeout(existing);
   card.classList.add('glass-touched');
   // A finger tap should never depend on a mouse hover or delay the link.
   const timeout=window.setTimeout(()=>{
    card.classList.remove('glass-touched');
    timers.delete(card);
   },320);
   timers.set(card,timeout);
  }

  document.addEventListener('pointermove',scheduleTilt,{passive:true});
  document.addEventListener('pointerout',onPointerOut,{passive:true});
  document.addEventListener('pointerdown',onPointerDown,{passive:true});
  return ()=>{
   document.removeEventListener('pointermove',scheduleTilt);
   document.removeEventListener('pointerout',onPointerOut);
   document.removeEventListener('pointerdown',onPointerDown);
   if(animationFrame)window.cancelAnimationFrame(animationFrame);
   for(const [card,timer] of timers){
    window.clearTimeout(timer);
    card.classList.remove('glass-touched');
    reset(card);
   }
   timers.clear();
  };
 },[]);
 return null;
}
