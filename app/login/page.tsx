import {Suspense} from 'react';import AccountLogin from '@/components/account-login';
export const metadata={title:'ورود مشتریان | چاپ سفیر هنر',robots:{index:false,follow:false}};
export default function Login(){return <Suspense fallback={<div className="v3-auth-loading">در حال بارگذاری صفحه ورود...</div>}><AccountLogin mode="signin"/></Suspense>}
