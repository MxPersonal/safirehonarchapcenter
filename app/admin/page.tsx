import Link from 'next/link';
import {redirect} from 'next/navigation';
import {currentCustomer} from '@/lib/supabase/server';
import {adminConfigured, adminEmail, validAdminSession} from '@/lib/admin/credentials';
import {signOutAdmin} from './login/actions';
import AdminConsole from '@/components/admin-console';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'پنل مدیریت چاپ سفیر هنر', robots: {index: false, follow: false}};

export default async function Admin() {
  if (!adminConfigured()) return <section className="container v2-empty account-notready"><h1>پنل مدیریت فعال نیست</h1><p>ابتدا فقط دو متغیر ADMIN_EMAIL و ADMIN_PASSWORD را در Vercel تنظیم کنید.</p><Link href="/admin/login">صفحه ورود مدیریت</Link></section>;
  if (!await validAdminSession()) redirect('/admin/login');

  // Login is fully independent of Supabase. Existing CMS writes still use
  // browser-based Supabase RLS; never bypass those permissions from this cookie.
  const {db, user, profile} = await currentCustomer();
  const databaseAccess = Boolean(db && user && profile?.role === 'admin');
  return <section className="container v2-admin">
    <div className="admin-secure-logout"><span>وارد شدید: {adminEmail()}</span><form action={signOutAdmin}><button type="submit" className="v2-outline">خروج از مدیریت</button></form></div>
    {!databaseAccess && <div className="v2-notice" role="status" style={{marginBottom:24}}>
      <strong>ورود مدیریت با موفقیت انجام شد.</strong> کنترل ورود فقط با ایمیل و رمز تنظیم‌شده در Vercel کار می‌کند. ویرایش زنده محصولات، سبدها و سفارش‌ها در پنل قبلی به دیتابیس و مجوزهای Supabase وابسته است و هنوز به این ورود مستقل متصل نشده است؛ تا زمان اتصال امن، این عملیات غیرفعال هستند.
    </div>}
    {databaseAccess ? <AdminConsole/> : <div className="admin-heading"><div><span className="tiny-label">SAFIRE HONAR / ADMIN ACCESS</span><h1>به پنل مدیریت خوش آمدید</h1><p>ورود شما تأیید شده است. مدیریت داده‌های فروشگاهی پس از اتصال امن بخش عملیات فعال می‌شود.</p></div></div>}
  </section>;
}
