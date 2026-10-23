import type {MetadataRoute} from 'next';
export default function robots():MetadataRoute.Robots{
 const origin=process.env.NEXT_PUBLIC_SITE_URL||'https://safirehonarchapcenter.vercel.app';
 return {rules:[{userAgent:'*',allow:'/',disallow:['/admin','/account','/api','/cart','/track']}],sitemap:`${origin.replace(/\/$/,'')}/sitemap.xml`};
}
