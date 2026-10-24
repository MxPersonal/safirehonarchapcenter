import {siteLocale} from '@/lib/i18n-server';
import {Suspense} from 'react';import AccountLogin from '@/components/account-login';

export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Customer Login':'ورود مشتریان',robots:{index:false,follow:false}};}
export default function Login(){return <Suspense fallback={<div className="v3-auth-loading">در حال بارگذاری صفحه ورود...</div>}><AccountLogin mode="signin"/></Suspense>}
