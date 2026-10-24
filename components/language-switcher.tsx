'use client';

import {usePathname,useSearchParams} from 'next/navigation';
import {Languages} from 'lucide-react';
import {localePath} from '@/lib/i18n';
import {useSiteLocale} from '@/components/locale-provider';

/**
 * Next's root layout is cached during client-side App Router navigation.
 * For two URLs that middleware rewrites into one route tree, a <Link> navigation
 * does NOT reliably rerender <html lang dir> or its context provider.
 *
 * Real document links force the server to render a fresh root layout.
 * This is deliberate: no router.push(), router.replace() or preventDefault().
 */
export default function LanguageSwitcher({compact=false}:{compact?:boolean}){
 const pathname=usePathname()||'/';
 const params=useSearchParams();
 const locale=useSiteLocale();
 const query=params.toString();
 const suffix=query?'?'+query:'';
 const url=(lang:'fa'|'en')=>localePath(pathname,lang)+suffix;
 return <nav className={'language-switcher '+(compact?'language-switcher-compact':'')} role="group" aria-label={locale==='fa'?'انتخاب زبان سایت':'Select website language'} dir="ltr">
   <Languages size={17} aria-hidden="true" className="language-switcher-icon"/>
   <a href={url('fa')} hrefLang="fa" lang="fa" title="نمایش کامل سایت به فارسی" aria-label="نمایش سایت به زبان فارسی" aria-current={locale==='fa'?'page':undefined} className={'language-switcher-option '+(locale==='fa'?'selected':'')}>FA</a>
   <a href={url('en')} hrefLang="en" lang="en" title="View the entire website in English" aria-label="Switch website to English" aria-current={locale==='en'?'page':undefined} className={'language-switcher-option '+(locale==='en'?'selected':'')}>EN</a>
 </nav>;
}
