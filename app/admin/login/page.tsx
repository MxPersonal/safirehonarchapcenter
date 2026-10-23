import Link from 'next/link';
import {redirect} from 'next/navigation';
import {LockKeyhole, ShieldCheck} from 'lucide-react';
import {adminConfigured, validAdminSession} from '@/lib/admin/credentials';
import AdminLoginForm from './form';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'ورود اختصاصی مدیریت | چاپ سفیر هنر', robots: {index: false, follow: false}};

export default async function AdminLoginPage() {
  if (await validAdminSession()) redirect('/admin');
  return <section className="admin-secure-login" aria-label="ورود ویژه مدیریت">
    <div className="admin-secure-visual"><span>SAFIRE HONAR / CONTROL DESK</span><div className="admin-secure-seal"><ShieldCheck size={66} strokeWidth={1.4}/></div><h2>مدیریت حرفه‌ای،<br/><em>دسترسی اختصاصی.</em></h2><p>ورود به بخش مدیریت فقط با ایمیل و گذرواژه‌ای که مالک سایت در سرور تعریف کرده است.</p></div>
    <div className="admin-secure-panel"><div className="admin-secure-icon"><LockKeyhole size={26}/></div><span className="tiny-label">AUTHORIZED ACCESS ONLY</span><h1>ورود مدیر سایت</h1><p>ایمیل و رمز اختصاصی مدیریت را وارد کنید. نیازی به ساخت حساب مشتری یا حساب مدیریت در Supabase نیست.</p>
      {adminConfigured() ? <AdminLoginForm/> : <div className="v2-notice" role="status">ورود مدیر هنوز فعال نشده است. فقط ADMIN_EMAIL و ADMIN_PASSWORD را در بخش Environment Variables ورسل تنظیم کنید و دوباره Deploy بگیرید.</div>}
      <Link href="/" className="admin-secure-back">بازگشت به صفحه اصلی</Link>
    </div>
  </section>;
}
