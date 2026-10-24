import {siteLocale} from '@/lib/i18n-server';
import Link from 'next/link';
import {ArrowUpLeft} from 'lucide-react';
import {storeCategories,mainCategories,childCategories} from '@/lib/store';
import {CategoryArtwork} from '@/components/showcase';
import {siteText} from '@/lib/i18n-server';
import {localePath,intlNumber} from '@/lib/i18n';
export const dynamic='force-dynamic';
export async function generateMetadata(){return {title:(await siteLocale())==='en'?'Print Products':'محصولات چاپی'};}
export default async function Catalog(){
 const {locale,pick}=await siteText();
 const all=await storeCategories(locale),categories=mainCategories(all);
 const path=(href:string)=>localePath(href,locale);
 return <><section className="v2-inner-head"><div className="container"><span className="tiny-label">PRINT PRODUCT FAMILIES</span>
 <h1>{pick('دنیای محصولات','DISCOVER OUR')} <em>{pick('چاپی','PRINT PRODUCTS')}</em></h1>
 <p>{pick('اول نوع محصول را انتخاب کنید؛ سپس زیرمجموعه‌های هر بخش مانند بنر تولد، بروشور سه‌لت یا تابلو حروف برجسته را ببینید.','Choose a product family, then explore formats such as banners, folded brochures, business cards and dimensional signs.')}</p></div></section>
 <section className="container v2-catalog-grid">{categories.map((c,i)=><Link href={path('/catalog/'+c.slug)} key={c.id} className="v2-catalog-card">
 <CategoryArtwork slug={c.slug} name={c.name} imageUrl={c.image_url} small locale={locale}/>
 <div><span>{intlNumber(i+1,locale)} / PRODUCT FAMILY</span><h2>{c.name}</h2><p>{c.description}</p>
 <small>{childCategories(all,c).map(x=>x.name).slice(0,3).join(' / ')}</small>
 <b>{pick('مشاهده این دسته‌بندی برای سفارش','Explore this collection')} <ArrowUpLeft size={18}/></b></div></Link>)}</section></>;
}
