import type {Metadata} from 'next';
import {storeGalleryProducts} from '@/lib/store';
import {ProductTile} from '@/components/showcase';
import DesignCatalog from '@/components/design-catalog';

export const dynamic='force-dynamic';
export const metadata:Metadata={title:'گالری طرح‌ها',description:'نمونه‌طرح‌ها و محصولات چاپ سفیر هنر؛ اطلاعات قابل تغییر از پنل مدیریت.'};
export default async function Designs(){
 const products=await storeGalleryProducts();
 return <><section className="page-banner"><div className="container"><span className="section-label">DISCOVER / PRINT CONCEPTS</span><h1>گالری <em>طرح‌ها</em></h1><p>نمونه‌ها و طرح‌های چاپی؛ محصولات منتشرشده را مدیر سایت از پنل مدیریت کنترل می‌کند.</p></div></section><div className="container page-content">
 {products===null?<DesignCatalog/>:products.length>0?<><div className="v2-product-grid">{products.map(p=><ProductTile key={p.id} product={p}/>)}</div><p className="catalog-note">قیمت‌ها فقط برای محصولات قیمت‌دار تأییدشده نمایش داده می‌شوند؛ نمونه‌های واردشده از نسخه اولیه، استعلامی هستند.</p></>:<div className="v2-empty">هنوز نمونه‌طرح منتشرشده‌ای وجود ندارد؛ مدیر می‌تواند از پنل مدیریت نمونه‌ها را اضافه یا فعال کند.</div>}
 </div></>
}
