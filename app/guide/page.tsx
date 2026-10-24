import {siteLocale} from '@/lib/i18n-server';
import Link from 'next/link';
import {ArrowUpLeft,FileImage,FileText,Maximize2,Palette,ScanLine} from 'lucide-react';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Print File Preparation Guide':'راهنمای آماده‌سازی فایل'}}
export default async function Guide(){
 const {locale,pick}=await siteText();
 const fa=[
 {icon:Maximize2,title:'ابعاد نهایی',text:'ابعاد چاپ را با واحد سانتی‌متر یا متر مشخص کنید و حاشیه امن متن را با توجه به روش نصب در نظر بگیرید.'},
 {icon:FileImage,title:'کیفیت تصاویر',text:'کیفیت تصویر باید متناسب با اندازه فیزیکی چاپ و فاصله دید باشد. بزرگ‌کردن یک تصویر کم‌کیفیت جزئیات تازه ایجاد نمی‌کند.'},
 {icon:Palette,title:'رنگ و خروجی',text:'پروفایل رنگ و استاندارد خروجی چاپ را قبل از نهایی‌کردن فایل با چاپخانه هماهنگ کنید. نمایشگر و چاپ لزوماً یکسان نیستند.'},
 {icon:FileText,title:'فونت و نوشته',text:'برای جلوگیری از به‌هم‌ریختن حروف، در خروجی نهایی فونت‌ها را Embed یا در صورت توافق با چاپخانه Outline کنید.'},
 {icon:ScanLine,title:'بازبینی نهایی',text:'املای نوشته‌ها، شماره‌ها، لوگوها، ابعاد، جهت طرح و اطلاعات مهم را قبل از تأیید چاپ بررسی کنید.'}
 ];
 const en=[
 {icon:Maximize2,title:'Final dimensions',text:'Specify exact print dimensions in centimeters or meters and allow sufficient safe margins for content and installation.'},
 {icon:FileImage,title:'Image resolution',text:'Image resolution must suit the final print size and viewing distance. Enlarging a low-resolution image cannot recover missing details.'},
 {icon:Palette,title:'Color and export',text:'Confirm color profiles and file export standards with our print team. On-screen colors may differ from printed results.'},
 {icon:FileText,title:'Fonts and lettering',text:'Embed fonts or convert them to outlines in your final artwork when agreed with the print studio.'},
 {icon:ScanLine,title:'Final proof',text:'Review spelling, names, numbers, logos, dimensions, layout direction and important information before approval.'}
 ];
 const tips=locale==='en'?en:fa;
 return <><section className="page-banner"><div className="container"><span className="section-label">PRINT PRODUCTION GUIDE</span>
 <h1>{pick('یک فایل خوب،','A GOOD FILE')} <em>{pick('نیمی از کار','MAKES THE DIFFERENCE')}</em></h1>
 <p>{pick('چند نکته کاربردی برای آنکه نتیجه نهایی به ایده ذهنی شما نزدیک‌تر باشد.','A few essential guidelines for print-ready results.')}</p></div></section>
 <section className="section container guide-section"><div className="guide-grid">{tips.map((tip,i)=><article className="guide-item" key={tip.title}><span className="guide-no">0{i+1}</span><tip.icon size={29} strokeWidth={1.5}/><h2>{tip.title}</h2><p>{tip.text}</p></article>)}</div>
 <div className="guide-cta"><div><h2>{pick('برای نوع فایل مطمئن نیستی؟','Not sure about your file?')}</h2><p>{pick('پیش از چاپ مشخصات را ثبت کن تا متناسب با محصول راهنمایی شوی.','Share your requirements and our team can advise before printing.')}</p></div>
 <Link href={localePath('/order',locale)} className="button button-primary">{pick('ثبت درخواست','Request a quote')} <ArrowUpLeft size={18}/></Link></div></section></>;
}
