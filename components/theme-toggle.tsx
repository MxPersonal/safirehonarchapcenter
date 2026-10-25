'use client';

import {Moon,Sun} from 'lucide-react';
import {useEffect,useState} from 'react';
import {useI18n} from '@/components/locale-provider';

type Theme='light'|'dark';
const storageKey='safir-theme';

export default function ThemeToggle(){
 const [theme,setTheme]=useState<Theme>('light');
 const {pick}=useI18n();
 useEffect(()=>{
  let preference:Theme='light';
  try{
   const saved=window.localStorage.getItem(storageKey);
   if(saved==='dark'||saved==='light')preference=saved;
   else if(window.matchMedia('(prefers-color-scheme: dark)').matches)preference='dark';
  }catch{/* localStorage can be disabled */}
  document.documentElement.dataset.theme=preference;
  setTheme(preference);
 },[]);
 function change(){
  const next:Theme=theme==='dark'?'light':'dark';
  setTheme(next);
  document.documentElement.dataset.theme=next;
  try{window.localStorage.setItem(storageKey,next)}catch{/* storage is optional */}
 }
 return <button type="button" className="site-theme-toggle" onClick={change}
  aria-label={theme==='light'?pick('فعال‌کردن حالت تاریک','Enable dark mode'):pick('فعال‌کردن حالت روشن','Enable light mode')}
  title={theme==='light'?pick('حالت تاریک','Dark mode'):pick('حالت روشن','Light mode')}
  aria-pressed={theme==='dark'}>
  {theme==='dark'?<Sun aria-hidden="true" size={19}/>:<Moon aria-hidden="true" size={19}/>}
 </button>;
}
