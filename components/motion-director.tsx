'use client';
import {useEffect} from 'react';
/** Intentional, progressive enhancements: content remains visible if JS fails. */
export default function MotionDirector(){
 useEffect(()=>{
  let cancelled=false; let dispose:()=>void=()=>{};
  const run=async()=>{
   const [{gsap},{ScrollTrigger}]=await Promise.all([import('gsap'),import('gsap/ScrollTrigger')]);
   if(cancelled)return;
   gsap.registerPlugin(ScrollTrigger);
   const root=document.querySelector<HTMLElement>('.experience-root');
   if(!root)return;
   const mm=gsap.matchMedia();
   mm.add('(prefers-reduced-motion: no-preference)',()=>{
    const ctx=gsap.context(()=>{
     gsap.fromTo('[data-hero-enter]',{autoAlpha:0,y:65,rotateX:9},{autoAlpha:1,y:0,rotateX:0,duration:1.12,ease:'power3.out',stagger:.12,delay:.12,clearProps:'transform,opacity,visibility'});
     gsap.fromTo('.v3-print-sheet',{autoAlpha:0,y:105,rotate:-12,scale:.88},{autoAlpha:1,y:0,rotate:0,scale:1,duration:1.3,ease:'back.out(1.2)',stagger:.12,delay:.25,clearProps:'opacity,visibility'});
     gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el)=>{
      gsap.fromTo(el,{autoAlpha:0,y:54},{autoAlpha:1,y:0,duration:.83,ease:'power3.out',clearProps:'all',scrollTrigger:{trigger:el,start:'top 91%',toggleActions:'play none none none',once:true}});
     });
     gsap.utils.toArray<HTMLElement>('[data-group]').forEach((group)=>{
      const children=group.querySelectorAll('[data-item]');
      if(!children.length)return;
      gsap.fromTo(children,{autoAlpha:0,y:70,rotate:1.5},{autoAlpha:1,y:0,rotate:0,stagger:.095,duration:.8,ease:'power3.out',clearProps:'all',scrollTrigger:{trigger:group,start:'top 86%',once:true}});
     });
     gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((element)=>{
      const amount=Number(element.dataset.parallax||35);
      gsap.fromTo(element,{y:-amount},{y:amount,ease:'none',scrollTrigger:{trigger:element.parentElement||element,start:'top bottom',end:'bottom top',scrub:1.15}});
     });
     gsap.to('.v3-hero-ring',{rotate:25,ease:'none',scrollTrigger:{trigger:'.v3-hero',start:'top top',end:'bottom top',scrub:1.5}});
     gsap.fromTo('.v3-showcase-title',{backgroundSize:'0% 100%'},{backgroundSize:'100% 100%',ease:'none',scrollTrigger:{trigger:'.v3-manifesto',start:'top 75%',end:'bottom 50%',scrub:1}});
     gsap.to('.v3-progress-line',{scaleX:1,ease:'none',transformOrigin:'right center',scrollTrigger:{trigger:root,start:'top top',end:'bottom bottom',scrub:.2}});
    },root);
    return()=>ctx.revert();
   });
   dispose=()=>mm.revert();
  };
  void run().catch(()=>{ /* reduced or offline browsing still has fully visible content */ });
  return()=>{cancelled=true;dispose()};
 },[]);
 return null;
}
