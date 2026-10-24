'use client';
import Link from 'next/link';
import {usePathname,useSearchParams} from 'next/navigation';
import {Languages} from 'lucide-react';
import {localePath} from '@/lib/i18n';
import {useSiteLocale} from './locale-provider';
export default function LanguageSwitcher({compact=false}:{compact?:boolean}){
 const path=usePathname()||'/';
 const params=useSearchParams();
 const suffix=params.toString()?'?'+params.toString():'';
 const locale=useSiteLocale();
 const href=(lang:'fa'|'en')=>localePath(path,lang)+suffix;
 return <div className={'language-switcher '+(compact?'language-switcher-compact':'')} role="group" aria-label="Website language" dir="ltr">
  <Languages size={16} aria-hidden="true"/>
  <Link href={href('fa')} hrefLang="fa" lang="fa" aria-current={locale==='fa'?'true':undefined} className={locale==='fa'?'selected':''}>FA</Link>
  <span aria-hidden="true">/</span>
  <Link href={href('en')} hrefLang="en" lang="en" aria-current={locale==='en'?'true':undefined} className={locale==='en'?'selected':''}>EN</Link>
 </div>
}
