import {serverDb} from '@/lib/supabase/server';
import {designs} from '@/lib/catalog';

export type StoreCategory={id:string;slug:string;name:string;description:string;theme:string;image_url:string|null;parent_id:string|null;sort_order?:number;isSample?:boolean};
export type StoreProduct={id:string;slug:string;name:string;description:string;category_id:string|null;image_url:string|null;mode:'fixed'|'quote';price_toman:number|null;active:boolean};

// Product types are primary categories. Occasions, dimensions and finishes are subcategories.
// These are clearly marked DEMO categories until a Supabase catalog is configured.
const baseCategories:Omit<StoreCategory,'id'>[]=[
 {slug:'banner',name:'بنر',description:'چاپ بنر برای مناسبت‌ها، مراسم، افتتاحیه و تبلیغات در اندازه‌های مختلف.',theme:'coral',parent_id:null,image_url:null},
 {slug:'brochure',name:'بروشور',description:'بروشورهای تبلیغاتی، معرفی خدمات و محصولات با انواع تا و جنس کاغذ.',theme:'gold',parent_id:null,image_url:null},
 {slug:'business-card',name:'کارت ویزیت',description:'کارت ویزیت رسمی و خلاقانه با جنس و پرداخت‌های متنوع.',theme:'ink',parent_id:null,image_url:null},
 {slug:'signboard',name:'تابلو و حروف برجسته',description:'تابلو فروشگاهی، حروف برجسته، لایت‌باکس و انواع تابلو تبلیغاتی.',theme:'cobalt',parent_id:null,image_url:null},
 {slug:'sticker',name:'استیکر و لیبل',description:'برچسب اختصاصی، لیبل محصول و استیکر ویترین و بسته‌بندی.',theme:'teal',parent_id:null,image_url:null},
 {slug:'flyer',name:'تراکت و پوستر',description:'تراکت، پوستر تبلیغاتی و چاپ اقلام اطلاع‌رسانی.',theme:'violet',parent_id:null,image_url:null},
 {slug:'packaging',name:'بسته‌بندی چاپی',description:'پاکت، جعبه و ملزومات بسته‌بندی برندها.',theme:'gold',parent_id:null,image_url:null},
 {slug:'exhibition',name:'سازه و چاپ نمایشگاهی',description:'رول‌آپ، استند، پاپ‌آپ و محصولات چاپی غرفه.',theme:'coral',parent_id:null,image_url:null},
];
const subCategories:{parent:string;slug:string;name:string;description:string;theme:string}[]=[
 {parent:'banner',slug:'condolence',name:'بنر تسلیت',description:'نمونه‌طرح‌های محترمانه برای مراسم یادبود و تسلیت.',theme:'ink'},
 {parent:'banner',slug:'birthday',name:'بنر تولد',description:'بنر جشن تولد کودک و بزرگسال.',theme:'coral'},
 {parent:'banner',slug:'pilgrimage',name:'بنر زیارتی',description:'طرح‌های حج، کربلا و بازگشت از زیارت.',theme:'teal'},
 {parent:'banner',slug:'events',name:'بنر مناسبتی',description:'بنر تبریک، قدردانی و رویدادهای مختلف.',theme:'violet'},
 {parent:'banner',slug:'business',name:'بنر تبلیغاتی',description:'بنر افتتاحیه، فروش ویژه و معرفی کسب‌وکار.',theme:'cobalt'},
 {parent:'brochure',slug:'brochure-bifold',name:'بروشور دو لت',description:'بروشور با یک خط تا برای معرفی کسب‌وکار.',theme:'gold'},
 {parent:'brochure',slug:'brochure-trifold',name:'بروشور سه لت',description:'بروشور سه‌قسمتی برای محتوای متنوع.',theme:'gold'},
 {parent:'business-card',slug:'card-matte',name:'کارت ویزیت مات',description:'نمونه کارت‌های رسمی با روکش مات.',theme:'ink'},
 {parent:'business-card',slug:'card-special',name:'کارت ویزیت خاص',description:'کارت با برش و پرداخت سفارشی.',theme:'cobalt'},
 {parent:'signboard',slug:'raised-letters',name:'حروف برجسته',description:'ساخت و سفارش تابلوهای حروف برجسته.',theme:'cobalt'},
 {parent:'signboard',slug:'lightbox',name:'لایت‌باکس',description:'تابلو و قاب نورپردازی‌شده.',theme:'teal'},
 {parent:'signboard',slug:'shop-signs',name:'تابلو فروشگاهی',description:'تابلو سردر، پلکسی و محصولات مشابه.',theme:'ink'},
 {parent:'sticker',slug:'product-label',name:'لیبل محصولات',description:'لیبل بسته‌بندی و اطلاعات محصول.',theme:'teal'},
 {parent:'sticker',slug:'window-sticker',name:'استیکر ویترین',description:'برچسب و طرح شیشه فروشگاه.',theme:'gold'},
];
export const demoCategories:StoreCategory[]=[...baseCategories.map((c,i)=>({...c,id:`demo-main-${i}`,sort_order:i,isSample:true})),...subCategories.map((c,i)=>({id:`demo-child-${i}`,slug:c.slug,name:c.name,description:c.description,theme:c.theme,image_url:null,parent_id:`demo-main-${baseCategories.findIndex(p=>p.slug===c.parent)}`,sort_order:i,isSample:true}))];

export async function storeCategories():Promise<StoreCategory[]>{
 const db=await serverDb();
 if(db){const {data,error}=await db.from('categories').select('id,slug,name,description,theme,image_url,parent_id,sort_order').eq('active',true).order('sort_order');
  if(!error&&data&&data.length)return data as StoreCategory[];
  // Do not resurrect hidden/disabled demo categories after the first database import.
  if(!error&&!data?.length){
    const {count}=await db.from('categories').select('id',{count:'exact',head:true});
    if(count && count>0)return [];
  }
 }
 return demoCategories;
}
export function mainCategories(categories:StoreCategory[]){return categories.filter(c=>!c.parent_id)}
export function childCategories(categories:StoreCategory[],parent:StoreCategory){return categories.filter(c=>c.parent_id===parent.id)}
export function categoryDescendants(categories:StoreCategory[],parent:StoreCategory):StoreCategory[]{
 const visited=new Set([parent.id]),queue=[parent],found:StoreCategory[]=[];
 while(queue.length){const p=queue.shift()!;for(const c of childCategories(categories,p)){if(!visited.has(c.id)){visited.add(c.id);found.push(c);queue.push(c)}}}return found;
}
export async function storeProducts(category?:StoreCategory,all?:StoreCategory[]):Promise<StoreProduct[]>{
 if(!category||category.isSample)return [];
 const db=await serverDb();if(!db)return [];
 const ids=[category.id,...(all?categoryDescendants(all,category).map(c=>c.id):[])];
 const {data}=await db.from('products').select('id,slug,name,description,category_id,image_url,mode,price_toman,active').eq('active',true).in('category_id',ids).order('created_at',{ascending:false});return data as StoreProduct[]||[];
}
export async function storeProduct(slug:string):Promise<StoreProduct|null>{
 const db=await serverDb();if(!db)return null;
 const {data}=await db.from('products').select('id,slug,name,description,category_id,image_url,mode,price_toman,active').eq('slug',slug).eq('active',true).maybeSingle();return data as StoreProduct|null;
}
export async function cmsPage(slug:string){const db=await serverDb();if(!db)return null;const {data}=await db.from('site_pages').select('title,body').eq('slug',slug).maybeSingle();return data as {title:string;body:string}|null;}
export function exampleDesigns(category:string){return designs.filter(d=>d.category===category)}
export function tomans(value:number){return new Intl.NumberFormat('fa-IR').format(value)+' تومان'}

/** Returns null only when Supabase is unconfigured or the products table is unavailable.
 * An empty array means the database exists, but no active product is published. */
export async function storeGalleryProducts():Promise<StoreProduct[]|null>{
 const db=await serverDb();if(!db)return null;
 const {data,error}=await db.from('products').select('id,slug,name,description,category_id,image_url,mode,price_toman,active').eq('active',true).order('created_at',{ascending:false}).limit(200);
 if(error)return null;
 if(data?.length===0){const {count}=await db.from('products').select('id',{count:'exact',head:true});if(count===0)return null;}
 return data as StoreProduct[];
}
