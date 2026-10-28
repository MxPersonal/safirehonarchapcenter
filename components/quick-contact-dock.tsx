import Link from 'next/link';
import {Phone, Mail} from 'lucide-react';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';

/** Real contact addresses come only from public project settings.
 * When a channel is unconfigured, its icon opens the contact page instead
 * of inventing an address or sending customers to an invalid URL.
 */
export default async function QuickContactDock(){
 const {locale,pick}=await siteText();
 const phone=process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim()||'';
 const email=process.env.NEXT_PUBLIC_BUSINESS_EMAIL?.trim()||'';
 const whatsappSource=(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP||'').trim();
 const whatsapp=whatsappSource.replace(/[^0-9]/g,'');
 const contactPage=localePath('/contact',locale);
 const callLabel=phone?pick('تماس تلفنی با سفیر هنر','Call Safire Honar'):pick('شماره تماس تنظیم نشده؛ مشاهده صفحه تماس','No phone configured; open contact page');
 const whatsappLabel=whatsapp?pick('گفتگو در واتساپ','Chat on WhatsApp'):pick('واتساپ تنظیم نشده؛ مشاهده صفحه تماس','WhatsApp unavailable; open contact page');
 const emailLabel=email?pick('ارسال ایمیل به سفیر هنر','Email Safire Honar'):pick('ایمیل تنظیم نشده؛ مشاهده صفحه تماس','No email configured; open contact page');
 const phoneButton=<Phone size={22} strokeWidth={2} aria-hidden="true"/>;
 const whatsappButton=<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" role="img" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.476-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.133-.133.297-.347.446-.52.149-.174.198-.298.297-.496.099-.198.05-.372-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.064 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.261.489 1.692.625.711.227 1.358.195 1.869.118.57-.085 1.758-.719 2.005-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.462 7.508h-.004a9.875 9.875 0 0 1-5.032-1.378l-.361-.214-3.742.982.999-3.648-.235-.374a9.866 9.866 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.889-9.884a9.825 9.825 0 0 1 6.995 2.898 9.825 9.825 0 0 1 2.896 6.996c-.002 5.45-4.437 9.884-9.895 9.884zM12.01.13C5.457.13.124 5.463.12 12.017a11.83 11.83 0 0 0 1.587 5.931L.02 24l6.2-1.627a11.894 11.894 0 0 0 5.785 1.474h.005c6.552 0 11.886-5.333 11.89-11.886A11.823 11.823 0 0 0 20.436 3.5 11.822 11.822 0 0 0 12.01.13z"/></svg>;
 const emailButton=<Mail size={22} strokeWidth={2} aria-hidden="true"/>;
 return <aside className="wf-contact-dock wf-contact-dock-wibify" dir="ltr" aria-label={pick('راه‌های ارتباط سریع','Quick contact options')}>
   {phone?<a className="wf-dock-call" href={'tel:'+phone} aria-label={callLabel} title={callLabel}>{phoneButton}</a>
         :<Link className="wf-dock-call" href={contactPage} aria-label={callLabel} title={callLabel}>{phoneButton}</Link>}
   {whatsapp?<a className="wf-dock-whatsapp" href={'https://wa.me/'+whatsapp} target="_blank" rel="noopener noreferrer" aria-label={whatsappLabel} title={whatsappLabel}>{whatsappButton}</a>
            :<Link className="wf-dock-whatsapp" href={contactPage} aria-label={whatsappLabel} title={whatsappLabel}>{whatsappButton}</Link>}
   {email?<a className="wf-dock-mail" href={'mailto:'+email} aria-label={emailLabel} title={emailLabel}>{emailButton}</a>
         :<Link className="wf-dock-mail" href={contactPage} aria-label={emailLabel} title={emailLabel}>{emailButton}</Link>}
 </aside>;
}
