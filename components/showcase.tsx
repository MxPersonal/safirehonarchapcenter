import Link from 'next/link';
import {ArrowUpLeft,ArrowLeft,Plus} from 'lucide-react';
import type {StoreCategory,StoreProduct} from '@/lib/store';
import {tomans} from '@/lib/store';
import PrintMockup from '@/components/print-mockups';
import {Reveal,PosterParallax} from '@/components/scroll-experience';

export function CategoryArtwork({slug,name,imageUrl,small=false}:{slug:string;name:string;imageUrl?:string|null;small?:boolean}){
 return <div className={`showcase-art expressive-art showcase-${slug} ${small?'showcase-small':''}`}>
  {imageUrl?<img className="category-uploaded-image" src={imageUrl} alt={`نمونه ${name}`}/>:<PrintMockup slug={slug} name={name}/>}
 </div>
}
export function CategorySpotlight({category,index}:{category:StoreCategory;index:number}){
 return <Reveal className={`spotlight-reveal spotlight-reveal-${index%4}`} delay={index%2*.065} amount={.12}>
  <article className={`spotlight spotlight-${index%3} ${index%2?'spotlight-reverse':''}`}>
   <div className="spotlight-details"><div className="spotlight-top"><span className="spotlight-count">{String(index+1).padStart(2,'0')} / COLLECTION</span><span className="mini-decoration">✳</span></div><div><span className="tiny-label">PRINT COLLECTION / SAFIRE HONAR</span><h3>{category.name}</h3><p>{category.description}</p></div><Link href={`/catalog/${category.slug}`} className="spotlight-link"><span>مشاهده این دسته‌بندی برای سفارش</span><span className="spotlight-arrow"><ArrowUpLeft size={22}/></span></Link></div>
   <Link className="spotlight-visual" href={`/catalog/${category.slug}`} aria-label={`مشاهده نمونه‌های ${category.name}`}><CategoryArtwork slug={category.slug} name={category.name} imageUrl={category.image_url}/><span className="visual-index">SH / {String(index+1).padStart(2,'0')}</span></Link>
  </article>
 </Reveal>
}
export function ProductTile({product}:{product:StoreProduct}){return <Link className="shop-tile" href={`/shop/${product.slug}`}><div className="shop-thumb">{product.image_url?<img src={product.image_url} alt={product.name}/>:<div className="shop-placeholder"><span>SAFIRE HONAR</span><b>{product.name}</b><span>PRINT DESIGN</span></div>}<span className="shop-mode">{product.mode==='fixed'?'قیمت مشخص':'نیازمند استعلام'}</span></div><div className="shop-meta"><div><h3>{product.name}</h3><span>{product.mode==='fixed'&&product.price_toman!==null?tomans(product.price_toman):'استعلام قیمت'}</span></div><Plus size={21}/></div></Link>}
export function CollectionRail({categories}:{categories:StoreCategory[]}){return <Reveal className="collection-rail"><>{categories.map((c,i)=><Link key={c.slug} href={`/catalog/${c.slug}`} className="collection-pill"><span>{String(i+1).padStart(2,'0')}</span>{c.name}<ArrowLeft size={15}/></Link>)}</></Reveal>}
