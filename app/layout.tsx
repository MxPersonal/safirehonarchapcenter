import type {Metadata} from 'next';import './globals.css';import Header from '@/components/header';import Footer from '@/components/footer';
const siteUrl=process.env.NEXT_PUBLIC_SITE_URL;
export const metadata:Metadata={title:{default:'چاپ سفیر هنر | چاپ با سلیقه شما',template:'%s | چاپ سفیر هنر'},description:'انتخاب طرح، شخصی‌سازی و درخواست خدمات چاپ بنر، فلکس، استیکر و سازه‌های نمایشگاهی در چاپ سفیر هنر.',metadataBase:siteUrl?new URL(siteUrl):undefined,openGraph:{title:'چاپ سفیر هنر',description:'دنیای چاپ با نگاه تازه',type:'website',locale:'fa_IR'}};
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="fa" dir="rtl"><body><Header/><main id="main">{children}</main><Footer/></body></html>}
