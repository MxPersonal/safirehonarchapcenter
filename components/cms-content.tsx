import {cmsPage} from '@/lib/store';
import {starterPages} from '@/lib/starter-content';
import {translatedPage} from '@/lib/translated-content';
import {siteText} from '@/lib/i18n-server';
const fallbacks=Object.fromEntries(starterPages.map(p=>[p.slug,p]));
export default async function CmsContent({slug}:{slug:string}){
 const {locale,pick}=await siteText();
 const data=(await cmsPage(slug,locale))||translatedPage(fallbacks[slug],locale);
 return <><section className="v2-inner-head"><div className="container">
  <span className="tiny-label">SAFIRE HONAR / INFORMATION</span>
  <h1>{data.title}</h1>
  <p>{pick('اطلاعات این صفحه از طریق پنل مدیریت قابل ویرایش است.','The content of this page is managed by Safire Honar.')}</p>
 </div></section><div className="container v2-cms-paper"><div className="v2-cms-body">{data.body}</div></div></>;
}
