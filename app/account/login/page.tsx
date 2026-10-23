import {Suspense} from 'react';import AccountLogin from '@/components/account-login';
export const metadata={title:'ورود و ثبت‌نام'};
export default function Login(){return <section className="v2-login"><Suspense fallback={<p>در حال بارگذاری…</p>}><AccountLogin/></Suspense></section>}
