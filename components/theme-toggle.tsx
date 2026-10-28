'use client';

import {MoonStar,Sun} from 'lucide-react';
import {useEffect,useState} from 'react';
import {useI18n} from '@/components/locale-provider';

type Theme='light'|'dark';
const storageKey='safir-theme-video-reference-v1';

export default function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>('light');
 const {pick}=useI18n();
 useEffect(()=>{
  let preference:Theme='light';
  try{
   const saved=window.localStorage.getItem(storageKey);
   if(saved==='dark'||saved==='light')preference=saved;
  }catch{/* storage optional */}
  document.documentElement.dataset.theme=preference;
  setTheme(preference);
 },[]);
 function change(){
  const next:Theme=theme==='dark'?'light':'dark';
  setTheme(next);
  document.documentElement.dataset.theme=next;
  try{window.localStorage.setItem(storageKey,next)}catch{/* storage optional */}
 }
 return <button type="button" className="site-theme-toggle wf-theme-toggle wf-header-mode-control" data-current-theme={theme} onClick={change}
 aria-label={theme==='light'?pick('تغییر به حالت تاریک','Switch to dark mode'):pick('تغییر به حالت روشن','Switch to light mode')}
 title={theme==='light'?pick('حالت تاریک','Dark mode'):pick('حالت روشن','Light mode')}
 aria-pressed={theme==='dark'}>
 {theme==='dark'?<Sun aria-hidden="true" size={18} strokeWidth={2}/>:<MoonStar aria-hidden="true" size={18} strokeWidth={2}/>}
 </button>;
}
