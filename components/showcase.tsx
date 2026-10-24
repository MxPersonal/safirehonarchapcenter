import {localePath,intlNumber} from '@/lib/i18n';
import type {Locale} from '@/lib/i18n';
import Link from 'next/link';
import {ArrowUpLeft,ArrowLeft,Plus} from 'lucide-react';
import type {StoreCategory,StoreProduct} from '@/lib/store';
import {tomans} from '@/lib/store';
import PrintMockup from '@/components/print-mockups';
import Artwork from '@/components/art';
import {getDesign} from '@/lib/catalog';
import {Reveal,PosterParallax} from '@/components/scroll-experience';

export function CategoryArtwork({slug,name,imageUrl,small=false,locale='fa'}:{slug:string;name:string;imageUrl?:string|null;small?:boolean;locale?:Locale}){
 return <div className={`showcase-art expressive-art showcase-${slug} ${small?'showcase-small':''}`}>
  {imageUrl?<img className="category-uploaded-image" src={imageUrl} alt={locale==='en'?'Sample: '+name:`نمونه ${name}`}/>:<PrintMockup slug={slug} name={name} locale={locale}/>}
 </div>
}
export function CategorySpotlight({category,index,locale='fa'}:{category:StoreCategory;index:number;locale?:Locale}){
 return <Reveal className={`spotlight-reveal spotlight-reveal-${index%4}`} delay={index%2*.065} amount={.12}>
  <article className={`spotlight spotlight-${index%3} ${index%2?'spotlight-reverse':''}`}>
   <div className="spotlight-details"><div className="spotlight-top"><span className="spotlight-count">{String(index+1).padStart(2,'0')} / {locale==='fa'?'مجموعه':'COLLECTION'}</span><span className="mini-decoration">✳</span></div><div><span className="tiny-label">{locale==='fa'?'مجموعه چاپ / سفیر هنر':'PRINT COLLECTION / SAFIRE HONAR'}</span><h3>{category.name}</h3><p>{category.description}</p></div><Link href={localePath('/catalog/'+category.slug,locale)} className="spotlight-link"><span>{locale==='fa'?'مشاهده این دسته‌بندی برای سفارش':'Explore collection and order'}</span><span className="spotlight-arrow"><ArrowUpLeft size={22}/></span></Link></div>
   <Link className="spotlight-visual" href={localePath('/catalog/'+category.slug,locale)} aria-label={locale==='fa'? `مشاهده نمونه‌های ${category.name}`:'View '+category.name+' samples'}><CategoryArtwork slug={category.slug} name={category.name} imageUrl={category.image_url} locale={locale}/><span className="visual-index">{locale==='fa'?'سفیر هنر':'SH'} / {String(index+1).padStart(2,'0')}</span></Link>
  </article>
 </Reveal>
}
export function ProductTile({product,locale='fa'}:{product:StoreProduct;locale?:Locale}){const originalDesign=getDesign(product.slug);return <Link className="shop-tile" href={localePath('/shop/'+product.slug,locale)}><div className="shop-thumb">{product.image_url?<img src={product.image_url} alt={product.name}/>:originalDesign?<Artwork design={{...originalDesign,name:product.name}} locale={locale}/>:<div className="shop-placeholder"><span>{locale==='fa'?'چاپ سفیر هنر':'SAFIRE HONAR'}</span><b>{product.name}</b><span>{locale==='fa'?'طراحی چاپ':'PRINT DESIGN'}</span></div>}<span className="shop-mode">{product.mode==='fixed'?(locale==='fa'?'قیمت مشخص':'Fixed price'):(locale==='fa'?'نیازمند استعلام':'Request a quote')}</span></div><div className="shop-meta"><div><h3>{product.name}</h3><span>{product.mode==='fixed'&&product.price_toman!==null?(locale==='fa'?tomans(product.price_toman):intlNumber(product.price_toman,locale)+' Toman'):(locale==='fa'?'استعلام قیمت':'Request a quote')}</span></div><Plus size={21}/></div></Link>}
export function CollectionRail({categories,locale='fa'}:{categories:StoreCategory[];locale?:Locale}){return <Reveal className="collection-rail"><>{categories.map((c,i)=><Link key={c.slug} href={localePath('/catalog/'+c.slug,locale)} className="collection-pill"><span>{String(i+1).padStart(2,'0')}</span>{c.name}<ArrowLeft size={15}/></Link>)}</></Reveal>}
