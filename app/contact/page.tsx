import {siteLocale} from '@/lib/i18n-server';
import CmsContent from '@/components/cms-content';
export const dynamic='force-dynamic';

export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Contact Us':'تماس با ما'};}
export default function Page(){return <CmsContent slug="contact"/>}
