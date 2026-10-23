import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowUpLeft,ChevronLeft} from 'lucide-react';
import {storeCategories,storeProducts,exampleDesigns,childCategories} from '@/lib/store';
import {CategoryArtwork,ProductTile} from '@/components/showcase';
import DesignCard from '@/components/design-card';
export const dynamic='force-dynamic';
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const categories=await storeCategories(),cat=categories.find(x=>x.slug===slug);
 if(!cat)notFound();
 const parent=cat.parent_id?categories.find(c=>c.id===cat.parent_id):null;
 const children=childCategories(categories,cat);
 const products=await storeProducts(cat,categories);
 const samples=exampleDesigns(cat.slug);
 return <>
  <section className="v2-inner-head"><div className="container">
   <div className="breadcrumbs"><Link href="/">خانه</Link> / <Link href="/catalog">انواع محصولات چاپی</Link> {parent&&<> / <Link href={`/catalog/${parent.slug}`}>{parent.name}</Link></>} / {cat.name}</div>
   <span className="tiny-label">{parent?'PRINT SUBCATEGORY':'PRINT PRODUCT CATEGORY'}</span>
   <h1>{cat.name}</h1><p>{cat.description}</p>
  </div></section>
  <div className="container category-intro"><CategoryArtwork slug={cat.slug} name={cat.name} imageUrl={cat.image_url}/><div><span className="tiny-label">PRODUCT TYPES / SAFIRE HONAR</span><h2>{children.length?'نوع محصولت رو انتخاب کن.':'نمونه‌ها و محصولات'}</h2><p>{children.length?'در هر زیرمجموعه، طرح‌ها و انواع سفارش را به‌صورت مستقل ببین.':'نوع چاپ را انتخاب کن و اطلاعات لازم برای خرید یا درخواست استعلام را ببین.'}</p><Link href="/order" className="v2-outline">فایل خودم رو دارم <ArrowUpLeft size={18}/></Link></div></div>
  {children.length>0&&<section className="container v3-subcategories"><div className="v3-collection-heading"><div><span className="tiny-label">SUBCATEGORIES</span><h2>زیرمجموعه‌های {cat.name}</h2></div><span>{children.length.toLocaleString('fa-IR')} زیرمجموعه</span></div><div className="v3-subcategory-grid">{children.map(child=><Link className="v3-subcategory-card" href={`/catalog/${child.slug}`} key={child.id}><div className="v3-subcategory-preview"><CategoryArtwork slug={child.slug} name={child.name} imageUrl={child.image_url} small/></div><div><strong>{child.name}</strong><p>{child.description}</p><span>مشاهده نمونه‌ها و سفارش <ChevronLeft size={17}/></span></div></Link>)}</div></section>}
  <section className="container category-products"><h2>{children.length?'محصولات این گروه و زیرمجموعه‌ها':'طرح‌ها و محصولات این مجموعه'}</h2>{products.length>0?<div className="v2-product-grid">{products.map(p=><ProductTile key={p.id} product={p}/>)}</div>:samples.length>0?<><p className="v2-notice">این نمونه‌ها نمایشی هستند؛ قیمت و شرایط چاپ نیازمند تأیید مجموعه است.</p><div className="designs-grid">{samples.map(x=><DesignCard key={x.slug} design={x}/>)}</div></>:<div className="v2-empty">هنوز محصول واقعی در این بخش منتشر نشده است. پس از اتصال پایگاه داده، مدیر می‌تواند نمونه و محصول اضافه کند.</div>}</section>
 </>
}
