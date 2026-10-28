import Link from 'next/link';
import {notFound} from 'next/navigation';
import {ArrowUpLeft,ChevronLeft} from 'lucide-react';
import {storeCategories,storeProducts,exampleDesigns,childCategories} from '@/lib/store';
import {CategoryArtwork,ProductTile} from '@/components/showcase';
import DesignCard from '@/components/design-card';
import {siteText} from '@/lib/i18n-server';
import {localePath,intlNumber} from '@/lib/i18n';
export const dynamic='force-dynamic';
export default async function CategoryPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params,{locale,pick,t}=await siteText();
 const path=(s:string)=>localePath(s,locale);
 const categories=await storeCategories(locale),cat=categories.find(x=>x.slug===slug);
 if(!cat)notFound();
 const parent=cat.parent_id?categories.find(c=>c.id===cat.parent_id):null;
 const children=childCategories(categories,cat);
 const products=await storeProducts(cat,categories,locale);
 const samples=exampleDesigns(cat.slug);
 return <>
 <section className="v2-inner-head sf-catalog-detail-hero"><div className="container">
  <div className="breadcrumbs"><Link href={path('/')}>{t.home}</Link> / <Link href={path('/catalog')}>{t.categories}</Link> {parent&&<> / <Link href={path('/catalog/'+parent.slug)}>{parent.name}</Link></>} / {cat.name}</div>
  <span className="tiny-label">{parent?pick('زیرگروه چاپ','PRINT SUBCATEGORY'):pick('دسته محصولات چاپی','PRINT PRODUCT CATEGORY')}</span>
  <h1>{cat.name}</h1><p>{cat.description}</p>
 </div></section>
 <div className="container category-intro"><CategoryArtwork slug={cat.slug} name={cat.name} imageUrl={cat.image_url} locale={locale}/>
  <div><span className="tiny-label">{pick('انواع محصولات / سفیر هنر','PRODUCT TYPES / SAFIRE HONAR')}</span><h2>{children.length?pick('نوع محصولت رو انتخاب کن.','Choose your print format.'):pick('نمونه‌ها و محصولات','Designs and products')}</h2>
  <p>{children.length?pick('در هر زیرمجموعه، طرح‌ها و انواع سفارش را به‌صورت مستقل ببین.','Explore every format, finish and print type within this collection.'):pick('نوع چاپ را انتخاب کن و اطلاعات لازم برای خرید یا درخواست استعلام را ببین.','Browse available designs and request pricing or place an order.')}</p>
  <Link href={path('/order')} className="v2-outline">{pick('فایل خودم رو دارم','I have my own artwork')} <ArrowUpLeft size={18}/></Link></div>
 </div>
 {children.length>0&&<section className="container v3-subcategories"><div className="v3-collection-heading"><div><span className="tiny-label">{pick('زیرمجموعه‌ها','SUBCATEGORIES')}</span><h2>{pick('زیرمجموعه‌های','Explore')} {cat.name}</h2></div><span>{intlNumber(children.length,locale)} {pick('زیرمجموعه','subcategories')}</span></div>
 <div className="v3-subcategory-grid">{children.map(child=><Link className="v3-subcategory-card" href={path('/catalog/'+child.slug)} key={child.id}>
  <div className="v3-subcategory-preview"><CategoryArtwork slug={child.slug} name={child.name} imageUrl={child.image_url} small locale={locale}/></div>
  <div><strong>{child.name}</strong><p>{child.description}</p><span>{pick('مشاهده نمونه‌ها و سفارش','View designs and order')} <ChevronLeft size={17}/></span></div>
 </Link>)}</div></section>}
 <section className="container category-products"><h2>{children.length?pick('محصولات این گروه و زیرمجموعه‌ها','Products in this collection'):pick('طرح‌ها و محصولات این مجموعه','Designs and products')}</h2>
 {products.length>0?<div className="v2-product-grid">{products.map(p=><ProductTile key={p.id} product={p} locale={locale}/>)}</div>:
 samples.length>0?<><p className="v2-notice">{pick('این نمونه‌ها نمایشی هستند؛ قیمت و شرایط چاپ نیازمند تأیید مجموعه است.','These designs are illustrative examples. Prices and availability require studio confirmation.')}</p><div className="designs-grid">{samples.map(d=><DesignCard key={d.slug} design={d} locale={locale}/>)}</div></>:
 <div className="v2-empty">{pick('هنوز محصول واقعی در این بخش منتشر نشده است.','No published products in this collection yet.')}</div>}
 </section></>;
}
