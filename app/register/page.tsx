import {Suspense} from 'react';import AccountLogin from '@/components/account-login';
export const metadata={title:'ثبت‌نام مشتریان | چاپ سفیر هنر',robots:{index:false,follow:false}};
export default function Register(){return <Suspense fallback={<div className="v3-auth-loading">در حال بارگذاری صفحه ثبت‌نام...</div>}><AccountLogin mode="signup"/></Suspense>}
