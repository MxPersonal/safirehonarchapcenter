import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{
 const base=(process.env.NEXT_PUBLIC_SITE_URL||'https://safirehonarchapcenter.vercel.app').replace(/\/$/,'');
 return ['/','/catalog','/designs','/services','/order','/about','/contact','/guide','/terms','/privacy'].map(x=>({url:base+x,changeFrequency:'weekly' as const,priority:x==='/'?1:.7}));
}
