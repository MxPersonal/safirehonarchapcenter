'use client';

import {usePathname} from 'next/navigation';
import type {MouseEvent} from 'react';
import {localePath} from '@/lib/i18n';
import {useSiteLocale} from '@/components/locale-provider';

/**
 * A single native language-switch link, matching the one-button theme toggle.
 * Real document navigation is essential: Next.js layout reuse after middleware
 * rewrites would otherwise leave the previous html lang/dir and locale context.
 */
export default function LanguageSwitcher({compact=false}:{compact?:boolean}){
 const pathname=usePathname()||'/';
 const locale=useSiteLocale();
 const target=locale==='fa'?'en':'fa';
 const label=target==='fa'?'FA':'EN';
 const description=locale==='fa'?'تغییر زبان سایت به انگلیسی':'Switch the website language to Persian';

 function navigate(event:MouseEvent<HTMLAnchorElement>){
  // Modified and middle clicks retain normal browser navigation behavior.
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  // Preserve the actual visible URL, query string and fragment after middleware rewrites.
  const current=new URL(window.location.href);
  const destination=localePath(current.pathname,target)+current.search+current.hash;
  const intended=event.currentTarget.getAttribute('href');
  if(intended!==destination){
   event.preventDefault();
   window.location.assign(destination);
  }
 }
 return <a
  href={localePath(pathname,target)}
  hrefLang={target}
  lang="en"
  dir="ltr"
  className={'language-switcher language-toggle-single'+(compact?' language-switcher-compact':'')}
  title={description}
  aria-label={description}
  onClick={navigate}
 ><span aria-hidden="true">{label}</span></a>;
}
