import {serverDb} from '@/lib/supabase/server';
import {categories as samples,designs} from '@/lib/catalog';
export type StoreCategory={id:string;slug:string;name:string;description:string;theme:string;image_url:string|null;isSample?:boolean};
export type StoreProduct={id:string;slug:string;name:string;description:string;category_id:string|null;image_url:string|null;mode:'fixed'|'quote';price_toman:number|null;active:boolean};
export async function storeCategories():Promise<StoreCategory[]>{
 const db=await serverDb();
 if(db){const {data,error}=await db.from('categories').select('id,slug,name,description,theme,image_url').eq('active',true).order('sort_order');
 if(!error&&data&&data.length)return data as StoreCategory[];}
 return samples.map((c,i)=>({id:c.id,slug:c.id,name:c.name,description:c.blurb,theme:['ink','coral','gold','teal','violet','cobalt'][i],image_url:null,isSample:true}));
}
export async function storeProducts(category?:StoreCategory):Promise<StoreProduct[]>{
 if(!category||category.isSample)return [];
 const db=await serverDb();if(!db)return [];
 const {data}=await db.from('products').select('id,slug,name,description,category_id,image_url,mode,price_toman,active').eq('active',true).eq('category_id',category.id).order('created_at',{ascending:false});return data as StoreProduct[]||[];
}
export async function storeProduct(slug:string):Promise<StoreProduct|null>{
 const db=await serverDb();if(!db)return null;
 const {data}=await db.from('products').select('id,slug,name,description,category_id,image_url,mode,price_toman,active').eq('slug',slug).eq('active',true).maybeSingle();
 return data as StoreProduct|null;
}
export async function cmsPage(slug:string){const db=await serverDb();if(!db)return null;const {data}=await db.from('site_pages').select('title,body').eq('slug',slug).maybeSingle();return data as {title:string;body:string}|null;}
export function exampleDesigns(category:string){return designs.filter(d=>d.category===category)}
export function tomans(value:number){return new Intl.NumberFormat('fa-IR').format(value)+' تومان'}
