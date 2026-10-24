'use client';
import {createContext,useContext} from 'react';
import type {Locale} from '@/lib/i18n';
import {common,localePath} from '@/lib/i18n';
const LocaleContext=createContext<Locale>('fa');
export function LocaleProvider({locale,children}:{locale:Locale;children:React.ReactNode}){return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>}
export const useSiteLocale=()=>useContext(LocaleContext);
export function useI18n(){const locale=useSiteLocale();return {locale,dir:locale==='fa'?'rtl':'ltr',t:common[locale],path:(href:string)=>localePath(href,locale),pick:(fa:string,en:string)=>locale==='en'?en:fa}}
