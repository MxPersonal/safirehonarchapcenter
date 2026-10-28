import Link from 'next/link';
import { Mail, Phone, ArrowUpLeft, Sparkles } from 'lucide-react';
import Brand from '@/components/brand';
import { siteText } from '@/lib/i18n-server';
import { localePath } from '@/lib/i18n';

export default async function Footer() {
 const { locale, t, pick } = await siteText();
 const path = (href: string) => localePath(href, locale);
 const phone = process.env.NEXT_PUBLIC_BUSINESS_PHONE;
 const email = process.env.NEXT_PUBLIC_BUSINESS_EMAIL;
 return <footer className="footer sx-footer"><div className="container">
  <div className="sx-footer-head"><span className="sx-footer-pretitle"><Sparkles size={17}/> SAFIRE HONAR / PRINT & DESIGN</span><strong>{pick('هنر، وقتی', 'Ideas deserve')}<br/><em>{pick('به چاپ می‌رسد.', 'a place in print.')}</em></strong><Link href={path('/order')} className="sx-footer-start">{pick('سفارش اختصاصی', 'Start a print request')} <ArrowUpLeft size={19}/></Link></div>
  <div className="footer-top">
   <div className="footer-about"><Link href={path('/')} className="footer-brand"><Brand/></Link><p>{pick('جایی که فکر و چاپ به هم می‌رسند. از انتخاب محصول تا ثبت سفارش سفارشی، جزئیات مهم‌اند.', 'A creative print studio for ambitious ideas, thoughtful details and custom projects.')}</p><div className="social-row">{phone && <a href={'tel:' + phone} aria-label={t.contact}><Phone size={18}/></a>}{email && <a href={'mailto:' + email} aria-label="Email"><Mail size={18}/></a>}</div></div>
   <div className="footer-column"><h3>{pick('دنیای چاپ', 'Print studio')}</h3><Link href={path('/catalog')}>{t.categories}</Link><Link href={path('/designs')}>{t.designs}</Link><Link href={path('/services')}>{t.services}</Link><Link href={path('/order')}>{t.quote}</Link></div>
   <div className="footer-column"><h3>{pick('حساب و سفارش', 'Account and orders')}</h3><Link href={path('/register')}>{t.register}</Link><Link href={path('/login')}>{t.login}</Link><Link href={path('/account')}>{t.myAccount}</Link><Link href={path('/guide')}>{t.guide}</Link><Link href={path('/contact')}>{t.contact}</Link></div>
   <div className="footer-column"><h3>{pick('اطلاعات کسب‌وکار', 'Information')}</h3><Link href={path('/about')}>{t.about}</Link><Link href={path('/terms')}>{t.terms}</Link><Link href={path('/privacy')}>{t.privacy}</Link>{phone && <a href={'tel:' + phone}>{phone}</a>}{!phone && <span>{pick('اطلاعات تماس از تنظیمات سایت تکمیل می‌شود.', 'Contact details will be available soon.')}</span>}</div>
  </div>
  <div className="footer-bottom"><span>© {new Date().getFullYear()} {pick('چاپ سفیر هنر. همه حقوق محفوظ است.', 'Safire Honar. All rights reserved.')}</span><span dir="ltr">MADE FOR IDEAS / SAFIRE HONAR ®</span></div>
 </div></footer>;
}
