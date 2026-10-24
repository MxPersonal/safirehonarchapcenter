import 'server-only';
import {headers} from 'next/headers';
import type {Locale} from './i18n';
import {common} from './i18n';
export async function siteLocale():Promise<Locale>{
 const h=await headers();
 return h.get('x-safir-locale')==='en'?'en':'fa';
}
export async function siteText(){const locale=await siteLocale();return {locale,t:common[locale],pick:(fa:string,en:string)=>locale==='en'?en:fa}}
