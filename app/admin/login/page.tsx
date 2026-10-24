import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {LockKeyhole, ShieldCheck} from 'lucide-react';
import {adminConfigured, validAdminSession} from '@/lib/admin/credentials';
import AdminLoginForm from './form';

export const dynamic = 'force-dynamic';
export const metadata={robots:{index:false,follow:false}};

export default async function AdminLoginPage() {
  const {locale,pick}=await siteText();
  if (await validAdminSession()) redirect(localePath('/admin',locale));
  return <section className="admin-secure-login" aria-label={pick("ورود ویژه مدیریت","Administrator sign in")}>
    <div className="admin-secure-visual"><span>{pick('سفیر هنر / مرکز مدیریت','SAFIRE HONAR / CONTROL DESK')}</span><div className="admin-secure-seal"><ShieldCheck size={66} strokeWidth={1.4}/></div><h2>{pick('مدیریت حرفه‌ای،','MANAGE WITH CONFIDENCE.')}<br/><em>{pick('دسترسی اختصاصی.','EXCLUSIVE ACCESS.')}</em></h2><p>{pick('ورود به بخش مدیریت فقط با ایمیل و گذرواژه‌ای که مالک سایت در سرور تعریف کرده است.','The admin dashboard is protected by credentials configured by the site owner.')}</p></div>
    <div className="admin-secure-panel"><div className="admin-secure-icon"><LockKeyhole size={26}/></div><span className="tiny-label">{pick('فقط ورود مدیر مجاز است','AUTHORIZED ACCESS ONLY')}</span><h1>{pick('ورود مدیر سایت','Administrator login')}</h1><p>{pick('ایمیل و رمز اختصاصی مدیریت را وارد کنید. نیازی به ساخت حساب مشتری یا حساب مدیریت در Supabase نیست.','Enter your administrator email and password. No customer account is required.')}</p>
      {adminConfigured() ? <AdminLoginForm/> : <div className="v2-notice" role="status">{pick('ورود مدیر هنوز فعال نشده است. فقط ADMIN_EMAIL و ADMIN_PASSWORD را در بخش Environment Variables ورسل تنظیم کنید و دوباره Deploy بگیرید.','Admin access is not configured yet. Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel environment variables and redeploy.')}</div>}
      <Link href={localePath("/",locale)} className="admin-secure-back">{pick("بازگشت به صفحه اصلی","Back to homepage")}</Link>
    </div>
  </section>;
}
