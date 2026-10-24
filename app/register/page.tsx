import {siteLocale} from '@/lib/i18n-server';
import {Suspense} from 'react';import AccountLogin from '@/components/account-login';

export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Create an Account':'ثبت‌نام مشتری',robots:{index:false,follow:false}};}
export default function Register(){return <Suspense fallback={<div className="v3-auth-loading">در حال بارگذاری صفحه ثبت‌نام...</div>}><AccountLogin mode="signup"/></Suspense>}
