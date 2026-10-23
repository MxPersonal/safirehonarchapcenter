import Link from 'next/link';
import {redirect} from 'next/navigation';
import {currentCustomer} from '@/lib/supabase/server';
import {adminConfigured, validAdminSession} from '@/lib/admin/credentials';
import {signOutAdmin} from './login/actions';
import AdminConsole from '@/components/admin-console';

export const dynamic = 'force-dynamic';
export const metadata = {title: 'پنل مدیریت چاپ سفیر هنر', robots: {index: false, follow: false}};

export default async function Admin() {
  if (!adminConfigured()) return <section className="container v2-empty account-notready"><h1>پنل مدیریت فعال نیست</h1><p>ابتدا تنظیمات احراز هویت مدیر و اتصال Supabase را تکمیل کنید.</p><Link href="/">بازگشت به سایت</Link></section>;
  const {db, user, profile} = await currentCustomer();
  if (!db || !user || profile?.role !== 'admin' || !await validAdminSession(user.id, user.email)) redirect('/admin/login');
  return <section className="container v2-admin">
    <div className="admin-secure-logout"><span>ورود تأییدشده مدیریت</span><form action={signOutAdmin}><button type="submit" className="v2-outline">خروج امن از مدیریت</button></form></div>
    <AdminConsole/>
  </section>;
}
