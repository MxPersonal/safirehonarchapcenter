import Link from 'next/link';
import {redirect} from 'next/navigation';
import {LockKeyhole, ShieldCheck} from 'lucide-react';
import {adminConfigured, validAdminSession} from '@/lib/admin/credentials';
import {currentCustomer} from '@/lib/supabase/server';
import AdminLoginForm from './form';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'ورود اختصاصی مدیریت | چاپ سفیر هنر', robots: {index: false, follow: false}};

export default async function AdminLoginPage() {
  if (adminConfigured()) {
    const {user, profile} = await currentCustomer();
    if (user && profile?.role === 'admin' && await validAdminSession(user.id, user.email)) redirect('/admin');
  }
  return <section className="admin-secure-login" aria-label="ورود ویژه مدیریت">
    <div className="admin-secure-visual"><span>SAFIRE HONAR / CONTROL DESK</span><div className="admin-secure-seal"><ShieldCheck size={66} strokeWidth={1.4}/></div><h2>مدیریت حرفه‌ای،<br/><em>دسترسی اختصاصی.</em></h2><p>محتوا، محصولات و سفارش‌ها فقط در اختیار حساب مدیریت تأییدشده قرار می‌گیرد.</p></div>
    <div className="admin-secure-panel"><div className="admin-secure-icon"><LockKeyhole size={26}/></div><span className="tiny-label">AUTHORIZED ACCESS ONLY</span><h1>ورود مدیر سایت</h1><p>با ایمیل و گذرواژه مدیریت وارد شوید. حساب مشتری به این بخش دسترسی ندارد.</p>
      {adminConfigured() ? <AdminLoginForm/> : <div className="v2-notice" role="status">ورود مدیر هنوز فعال نشده است. ابتدا ADMIN_EMAIL، ADMIN_PASSWORD_HASH و ADMIN_SESSION_SECRET و اتصال Supabase را در تنظیمات سرور وارد کنید.</div>}
      <Link href="/" className="admin-secure-back">بازگشت به صفحه اصلی</Link>
    </div>
  </section>;
}
