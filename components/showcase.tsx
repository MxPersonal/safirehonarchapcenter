import Link from 'next/link';
import {ArrowUpLeft,ArrowLeft,Plus} from 'lucide-react';
import Artwork from '@/components/art';
import {categories as demoCats,designs} from '@/lib/catalog';
import type {StoreCategory,StoreProduct} from '@/lib/store';
import {tomans} from '@/lib/store';
export function CategoryArtwork({slug,name,small=false}:{slug:string;name:string;small?:boolean}){
 const candidate=designs.find(d=>d.category===slug);
 return <div className={`showcase-art showcase-${slug} ${small?'showcase-small':''}`}>
  {candidate?<Artwork design={candidate}/>:<div className="showcase-custom"><span>SAFIRE HONAR / PRINT EDITION</span><b>{name}</b><em>✳</em><small>دسته‌بندی جدید چاپ سفیر هنر</small></div>}
  <div className="showcase-shadow" aria-hidden="true"/>
 </div>
}
export function CategorySpotlight({category,index}:{category:StoreCategory;index:number}){
 return <article className={`spotlight spotlight-${index%3} ${index%2?'spotlight-reverse':''}`}>
  <div className="spotlight-details"><div className="spotlight-top"><span className="spotlight-count">{String(index+1).padStart(2,'0')} / COLLECTION</span><span className="mini-decoration">✳</span></div><div><span className="tiny-label">COLLECTIONS / SAFIRE HONAR</span><h3>{category.name}</h3><p>{category.description}</p></div><Link href={`/catalog/${category.slug}`} className="spotlight-link">مشاهده این دسته‌بندی برای سفارش <ArrowUpLeft size={22}/></Link></div>
  <Link className="spotlight-visual" href={`/catalog/${category.slug}`} aria-label={`مشاهده نمونه‌های ${category.name}`}><CategoryArtwork slug={category.slug} name={category.name}/><span className="visual-index">SH / {String(index+1).padStart(2,'0')}</span></Link>
 </article>
}
export function ProductTile({product}:{product:StoreProduct}){return <Link className="shop-tile" href={`/shop/${product.slug}`}><div className="shop-thumb">{product.image_url?<img src={product.image_url} alt={product.name}/>:<div className="shop-placeholder"><span>SAFIRE HONAR</span><b>{product.name}</b><span>PRINT DESIGN</span></div>}<span className="shop-mode">{product.mode==='fixed'?'قیمت مشخص':'نیازمند استعلام'}</span></div><div className="shop-meta"><div><h3>{product.name}</h3><span>{product.mode==='fixed'&&product.price_toman!==null?tomans(product.price_toman):'برای دریافت قیمت تماس بگیرید'}</span></div><Plus size={21}/></div></Link>}
export function CollectionRail({categories}:{categories:StoreCategory[]}){return <div className="collection-rail">{categories.map((c,i)=><Link key={c.slug} href={`/catalog/${c.slug}`} className="collection-pill"><span>{String(i+1).padStart(2,'0')}</span>{c.name}<ArrowLeft size={15}/></Link>)}</div>}
