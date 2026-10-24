import Link from 'next/link';
import {siteText} from '@/lib/i18n-server';
import {localePath} from '@/lib/i18n';
export default async function NotFound(){const {locale,pick}=await siteText();return <div className="container empty-state not-found"><span>404</span><h1>{pick('این صفحه پیدا نشد.','Page not found.')}</h1><p>{pick('برگردیم به جایی که ایده‌ها شروع می‌شوند؟','Head back to where the ideas begin.')}</p><Link className="button button-primary" href={localePath('/',locale)}>{pick('بازگشت به صفحه اصلی','Back to home')}</Link></div>}
