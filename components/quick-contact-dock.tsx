import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
import AdaptiveContactDock from '@/components/adaptive-contact-dock';

/** Only configured public contact details become direct links.
 * Missing contact details fall back to the actual contact page.
 */
export default async function QuickContactDock(){
  const {locale}=await siteText();
  const phone=process.env.NEXT_PUBLIC_BUSINESS_PHONE?.trim()||'';
  const email=process.env.NEXT_PUBLIC_BUSINESS_EMAIL?.trim()||'';
  const whatsapp=(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER||
    process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP||'').replace(/[^0-9]/g,'');
  return <AdaptiveContactDock
    locale={locale}
    contactPage={localePath('/contact',locale)}
    phone={phone}
    email={email}
    whatsapp={whatsapp}
  />;
}
