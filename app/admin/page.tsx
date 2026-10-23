import Link from 'next/link';import {redirect} from 'next/navigation';import {currentCustomer} from '@/lib/supabase/server';import AdminConsole from '@/components/admin-console';
export const dynamic='force-dynamic';export const metadata={title:'پنل مدیریت چاپ سفیر هنر',robots:{index:false,follow:false}};
export default async function Admin(){const {db,user,profile}=await currentCustomer();if(!db)return <section className="container v2-empty account-notready"><h1>پنل مدیریت</h1><p>این بخش فقط پس از اتصال Supabase و تعیین نقش مدیر قابل استفاده است. در حالت نمایشی هیچ رمز عبور پیش‌فرضی وجود ندارد.</p><Link href="/">صفحه اصلی</Link></section>;
 if(!user)redirect('/login?next=/admin');
 if(profile?.role!=='admin')return <section className="container v2-empty account-notready"><h1>دسترسی مدیریت ندارید</h1><p>این بخش ویژه حساب‌های تأییدشده با نقش مدیریت است.</p><Link href="/account">بازگشت به حساب مشتری</Link></section>;
 return <section className="container v2-admin"><AdminConsole/></section>}
