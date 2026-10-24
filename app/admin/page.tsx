import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
import Link from 'next/link';
import {redirect} from 'next/navigation';
import {adminConfigured,adminEmail,validAdminSession} from '@/lib/admin/credentials';
import {adminDatabase} from '@/lib/admin/server-db';
import {signOutAdmin} from './login/actions';
import AdminConsole from '@/components/admin-console';

export const dynamic='force-dynamic';
export const metadata={robots:{index:false,follow:false}};
export default async function Admin(){
 const {locale,pick}=await siteText();
 if(!adminConfigured())return <section className="container v2-empty account-notready"><h1>{pick('پنل مدیریت فعال نیست','Admin dashboard is not configured')}</h1><p>{pick('فقط ADMIN_EMAIL و ADMIN_PASSWORD را در Vercel تنظیم کنید.','Set ADMIN_EMAIL and ADMIN_PASSWORD in Vercel.')}</p><Link href={localePath("/admin/login",locale)}>{pick("صفحه ورود مدیر","Administrator login")}</Link></section>;
 if(!await validAdminSession())redirect(localePath('/admin/login',locale));
 const hasDb=Boolean(adminDatabase());
 return <section className="container v2-admin">
   <div className="admin-secure-logout"><span>{pick('ورود تأییدشده:','Signed in as:')} {adminEmail()}</span><form action={signOutAdmin}><button type="submit" className="v2-outline">{pick('خروج امن','Sign out')}</button></form></div>
   {!hasDb?<div className="v2-notice" role="alert"><strong>{pick('اتصال خصوصی دیتابیس کامل نشده است.','The private database connection is incomplete.')}</strong><p>{pick('اتصال عمومی Supabase به‌تنهایی برای مدیریت کافی نیست. در Vercel مقدار SUPABASE_URL و SUPABASE_SECRET_KEY (یا کلید قدیمی SUPABASE_SERVICE_ROLE_KEY) را فقط برای سرور تنظیم کنید.','Public Supabase connection details cannot authorize administration. Configure the private SUPABASE_URL and SUPABASE_SECRET_KEY (or legacy SUPABASE_SERVICE_ROLE_KEY) in Vercel server environment variables.')}</p></div>:<AdminConsole/>}
 </section>;
}
