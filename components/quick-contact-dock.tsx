import Link from 'next/link';
import {Phone,Mail,MessageCircle} from 'lucide-react';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
export default async function QuickContactDock(){
 const {locale,pick}=await siteText();
 const phone=process.env.NEXT_PUBLIC_BUSINESS_PHONE;
 const email=process.env.NEXT_PUBLIC_BUSINESS_EMAIL;
 const whatsapp=process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP?.replace(/[^\d]/g,'');
 const href=localePath('/contact',locale);
 return <aside className="wf-contact-dock" aria-label={pick('راه‌های ارتباط سریع','Quick contact options')}>
   {phone&&<a href={'tel:'+phone} aria-label={pick('تماس تلفنی','Call us')} title={pick('تماس تلفنی','Call')}><Phone size={18}/></a>}
   {whatsapp&&<a href={'https://wa.me/'+whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" title="WhatsApp"><MessageCircle size={18}/></a>}
   {email&&<a href={'mailto:'+email} aria-label={pick('ارسال ایمیل','Send an email')} title={pick('ایمیل','Email')}><Mail size={18}/></a>}
   <Link href={href} aria-label={pick('صفحه تماس','Contact page')} title={pick('ارتباط با ما','Contact us')}><MessageCircle size={18}/></Link>
 </aside>;
}
