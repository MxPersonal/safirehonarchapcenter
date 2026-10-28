'use client';
import {useEffect,useState} from 'react';
import type {Locale} from '@/lib/i18n';
export default function RotatingPrintTitle({phrases,locale}:{phrases:string[];locale:Locale}){
 const [index,setIndex]=useState(0);
 useEffect(()=>{
  if(phrases.length<2||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const handle=window.setInterval(()=>setIndex(value=>(value+1)%phrases.length),2700);
  return()=>window.clearInterval(handle);
 },[phrases.length]);
 return <span className="wf-rotating-title" dir={locale==='fa'?'rtl':'ltr'} aria-label={phrases[0]}><span key={index} aria-hidden="true">{phrases[index]||phrases[0]}</span></span>;
}
