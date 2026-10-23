import Link from 'next/link';
import {ArrowUpLeft} from 'lucide-react';
import {storeCategories,mainCategories,childCategories} from '@/lib/store';
import {CategoryArtwork} from '@/components/showcase';
export const dynamic='force-dynamic';
export const metadata={title:'انواع محصولات چاپی'};
export default async function Catalog(){const all=await storeCategories(),categories=mainCategories(all);return <>
 <section className="v2-inner-head"><div className="container"><span className="tiny-label">PRINT PRODUCT FAMILIES</span><h1>دنیای محصولات <em>چاپی</em></h1><p>اول نوع محصول را انتخاب کنید؛ سپس زیرمجموعه‌های هر بخش مانند بنر تولد، بروشور سه‌لت یا تابلو حروف برجسته را ببینید.</p></div></section>
 <section className="container v2-catalog-grid">{categories.map((c,i)=><Link href={`/catalog/${c.slug}`} key={c.id} className="v2-catalog-card"><CategoryArtwork slug={c.slug} name={c.name} imageUrl={c.image_url} small/><div><span>{String(i+1).padStart(2,'0')} / PRODUCT FAMILY</span><h2>{c.name}</h2><p>{c.description}</p><small>{childCategories(all,c).map(s=>s.name).slice(0,3).join(' / ')}</small><b>مشاهده این دسته‌بندی برای سفارش <ArrowUpLeft size={18}/></b></div></Link>)}</section>
 </>}
