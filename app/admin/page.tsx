import Link from 'next/link';
import {redirect} from 'next/navigation';
import {adminConfigured,adminEmail,validAdminSession} from '@/lib/admin/credentials';
import {adminDatabase} from '@/lib/admin/server-db';
import {signOutAdmin} from './login/actions';
import AdminConsole from '@/components/admin-console';

export const dynamic='force-dynamic';
export const metadata={title:'پنل مدیریت چاپ سفیر هنر',robots:{index:false,follow:false}};
export default async function Admin(){
 if(!adminConfigured())return <section className="container v2-empty account-notready"><h1>پنل مدیریت فعال نیست</h1><p>فقط ADMIN_EMAIL و ADMIN_PASSWORD را در Vercel تنظیم کنید.</p><Link href="/admin/login">صفحه ورود مدیر</Link></section>;
 if(!await validAdminSession())redirect('/admin/login');
 const hasDb=Boolean(adminDatabase());
 return <section className="container v2-admin">
   <div className="admin-secure-logout"><span>ورود تأییدشده: {adminEmail()}</span><form action={signOutAdmin}><button type="submit" className="v2-outline">خروج امن</button></form></div>
   {!hasDb?<div className="v2-notice" role="alert"><strong>اتصال خصوصی دیتابیس کامل نشده است.</strong><p>اتصال عمومی Supabase به‌تنهایی برای مدیریت کافی نیست. در Vercel مقدار SUPABASE_URL و SUPABASE_SECRET_KEY (یا کلید قدیمی SUPABASE_SERVICE_ROLE_KEY) را فقط برای سرور تنظیم کنید.</p></div>:<AdminConsole/>}
 </section>;
}
