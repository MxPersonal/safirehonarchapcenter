'use client';

import {usePathname} from 'next/navigation';
import type {MouseEvent} from 'react';
import {Languages} from 'lucide-react';
import {localePath} from '@/lib/i18n';
import {useSiteLocale} from '@/components/locale-provider';

/**
 * Locale switching must be a real document navigation.
 * A client-side Next Link reuses the root layout for /fa and /en even when
 * middleware rewrites them to the same route: html[lang], html[dir] and the
 * root locale context can stay stale. Native anchors always reload them.
 *
 * No useSearchParams: this control renders immediately during SSR and is
 * usable before JavaScript hydration, including on the homepage and admin.
 */
export default function LanguageSwitcher({compact=false}:{compact?:boolean}){
 const pathname=usePathname()||'/';
 const locale=useSiteLocale();

 function navigate(event:MouseEvent<HTMLAnchorElement>,target:'fa'|'en'){
  // Modified / middle clicks retain standard browser behavior.
  if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  // Use the actual browser URL rather than the internal middleware rewrite.
  const current=new URL(window.location.href);
  const destination=localePath(current.pathname,target)+current.search+current.hash;
  const intended=event.currentTarget.getAttribute('href');
  if(intended!==destination){
   event.preventDefault();
   window.location.assign(destination);
  }
 }
 return <nav className={'language-switcher '+(compact?'language-switcher-compact':'')} role="group" aria-label={locale==='fa'?'انتخاب زبان سایت':'Select website language'} dir="ltr">
  <Languages size={17} aria-hidden="true" className="language-switcher-icon"/>
  <a href={localePath(pathname,'fa')} hrefLang="fa" lang="fa" title="نمایش سایت به فارسی" aria-label="نمایش کامل سایت به زبان فارسی" aria-current={locale==='fa'?'page':undefined} onClick={e=>navigate(e,'fa')} className={'language-switcher-option '+(locale==='fa'?'selected':'')}>FA</a>
  <a href={localePath(pathname,'en')} hrefLang="en" lang="en" title="View site in English" aria-label="Switch the entire website to English" aria-current={locale==='en'?'page':undefined} onClick={e=>navigate(e,'en')} className={'language-switcher-option '+(locale==='en'?'selected':'')}>EN</a>
 </nav>;
}
