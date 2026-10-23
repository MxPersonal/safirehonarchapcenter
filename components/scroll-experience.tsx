'use client';

import {useRef, type ReactNode} from 'react';
import {motion, useScroll, useSpring, useTransform, useReducedMotion} from 'motion/react';

/**
 * Lightweight, transform-only animation primitives. Motion's IntersectionObserver
 * activates sections without scroll-event polling. The reading progress is
 * scroll-linked and respects reduced motion settings.
 */
export function ScrollProgress(){
  const {scrollYProgress}=useScroll();
  const scaleX=useSpring(scrollYProgress,{stiffness:130,damping:27,mass:0.23});
  const reduced=useReducedMotion();
  return <motion.div className="print-scroll-progress" aria-hidden="true" style={{scaleX:reduced?scrollYProgress:scaleX,transformOrigin:'right'}}/>;
}

export function Reveal({children,className='',delay=0,amount=0.14}:{children:ReactNode;className?:string;delay?:number;amount?:number}){
  const reduced=useReducedMotion();
  return <motion.div className={className} initial={reduced?false:{opacity:0,y:52,filter:'blur(7px)'}} whileInView={reduced?undefined:{opacity:1,y:0,filter:'blur(0px)'}} viewport={{once:true,amount}} transition={{duration:0.82,delay,ease:[0.19,1,0.22,1]}}>{children}</motion.div>;
}

export function PosterParallax({children,className='',strength=55}:{children:ReactNode;className?:string;strength?:number}){
  const target=useRef<HTMLDivElement>(null);
  const reduced=useReducedMotion();
  const {scrollYProgress}=useScroll({target,offset:['start end','end start']});
  const y=useTransform(scrollYProgress,[0,1],[strength,-strength]);
  return <div className={className} ref={target}><motion.div className="parallax-inner" style={{y:reduced?0:y}}>{children}</motion.div></div>;
}

export function WordReveal({children,className=''}:{children:ReactNode;className?:string}){
  const reduced=useReducedMotion();
  return <motion.span className={className} style={{display:'inline-block'}} initial={reduced?false:{opacity:0,y:48,rotate:2}} whileInView={reduced?undefined:{opacity:1,y:0,rotate:0}} viewport={{once:true,amount:0.45}} transition={{duration:0.84,ease:[0.17,0.9,0.25,1]}}>{children}</motion.span>;
}
