import {siteLocale} from '@/lib/i18n-server';
import {LocaleProvider} from '@/components/locale-provider';
import type {Metadata} from 'next';import localFont from 'next/font/local';import '@fontsource-variable/vazirmatn/wght.css';import '@fontsource-variable/cairo/wght.css';import './globals.css';import './upgrade.css';import './typography.css';import './taxonomy-auth.css';import './experience.css';import './expressive.css';import './admin/login/admin-login.css';import './admin-preview.css';import './admin-visual-pickers.css';import './accounting.css';import './i18n.css';import './bidi-fix.css';import './printworks.css';import './theme-logos.css';import './glass-aurora.css';import './glass-refinements.css';import './font-refresh.css';import './persian-calligraphy.css';import './editorial-studio.css';import './wibify-theme.css';import './video-reference.css';import './brand-fidelity.css';import './wibify-fixed-controls.css';import {ScrollProgress} from '@/components/scroll-experience';import GlassInteractions from '@/components/glass-interactions';import Header from '@/components/header';import Footer from '@/components/footer';import QuickContactDock from '@/components/quick-contact-dock';
const safirNastaliq=localFont({src:'../public/fonts/iran-nastaliq.woff2',weight:'400',style:'normal',display:'swap',variable:'--safir-nastaliq'});
const safirYekan=localFont({src:'../public/fonts/yekan.woff2',weight:'400',style:'normal',display:'swap',variable:'--safir-yekan'});
const url=process.env.NEXT_PUBLIC_SITE_URL;
export async function generateMetadata():Promise<Metadata>{
 const locale=await siteLocale();
 const english=locale==='en';
 const title=english?'Safire Honar | Creative Print Studio':'چاپ سفیر هنر | هنر در ابعاد تازه';
 const description=english?
 'Explore creative printing, customized banners, cards, signs, brochures and quote requests at Safire Honar.':
 'گالری طرح‌های چاپ، ثبت سفارش محصولات با قیمت مشخص و درخواست استعلام خدمات سفارشی در چاپ سفیر هنر.';
 const base=process.env.NEXT_PUBLIC_SITE_URL;
 return {
  title:{default:title,template:english?'%s | Safire Honar':'%s | چاپ سفیر هنر'},
  description,
  metadataBase:base?new URL(base):undefined,
  openGraph:{title,description,locale:english?'en_US':'fa_IR',type:'website'},
  alternates:{languages:{fa:'/fa',en:'/en','x-default':'/fa'}},
 };
}
export default async function RootLayout({children}:{children:React.ReactNode}){const locale=await siteLocale();return <html lang={locale} dir={locale==='fa'?'rtl':'ltr'} className={safirNastaliq.variable+' '+safirYekan.variable}><body><LocaleProvider locale={locale}><GlassInteractions/><ScrollProgress/><Header/><main id="main">{children}</main><QuickContactDock/><Footer/></LocaleProvider></body></html>}
