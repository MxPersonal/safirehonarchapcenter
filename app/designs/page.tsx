import {storeGalleryProducts} from '@/lib/store';
import {ProductTile} from '@/components/showcase';
import DesignCatalog from '@/components/design-catalog';
import {siteText} from '@/lib/i18n-server';
export const dynamic='force-dynamic';
export default async function Designs(){
 const {locale,pick}=await siteText();
 const products=await storeGalleryProducts(locale);
 return <><section className="page-banner"><div className="container">
 <span className="section-label">DISCOVER / PRINT CONCEPTS</span>
 <h1>{pick('گالری','DESIGN')} <em>{pick('طرح‌ها','GALLERY')}</em></h1>
 <p>{pick('نمونه‌ها و طرح‌های چاپی؛ محصولات منتشرشده را مدیر سایت از پنل مدیریت کنترل می‌کند.','Explore print concepts and approved products managed by the studio.')}</p>
 </div></section><div className="container page-content">
 {products===null?<DesignCatalog/>:products.length>0?<><div className="v2-product-grid">{products.map(p=><ProductTile key={p.id} product={p} locale={locale}/>)}</div>
 <p className="catalog-note">{pick('فقط محصولات دارای قیمت تأییدشده، با قیمت نمایش داده می‌شوند. سایر موارد استعلامی هستند.','Prices are shown only for approved fixed-price products. All other items require a quote.')}</p></>:
 <div className="v2-empty">{pick('هنوز نمونه‌طرح منتشرشده‌ای وجود ندارد.','No designs have been published yet.')}</div>}
 </div></>;
}
