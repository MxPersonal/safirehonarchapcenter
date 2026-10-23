import {cmsPage} from '@/lib/store';
import {starterPages} from '@/lib/starter-content';
const fallbacks=Object.fromEntries(starterPages.map(p=>[p.slug,p]));
export default async function CmsContent({slug}:{slug:string}){const data=(await cmsPage(slug))||fallbacks[slug];return <><section className="v2-inner-head"><div className="container"><span className="tiny-label">SAFIRE HONAR / INFORMATION</span><h1>{data.title}</h1><p>اطلاعات این صفحه از طریق پنل مدیریت قابل ویرایش است.</p></div></section><div className="container v2-cms-paper"><div className="v2-cms-body">{data.body}</div></div></>}
