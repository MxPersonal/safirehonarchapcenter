import {NextRequest,NextResponse} from 'next/server';
import {storeCategories} from '@/lib/store';
import {serverDb} from '@/lib/supabase/server';
import {localePath,type Locale} from '@/lib/i18n';
import {translatedFields} from '@/lib/translated-content';

export const dynamic='force-dynamic';
export const runtime='nodejs';

type Kind='product'|'category'|'page';
type Item={id:string;kind:Kind;title:string;description:string;href:string;imageUrl:string|null;
 price:number|null;mode:'fixed'|'quote'|null;categoryId:string|null;slug:string;sample:boolean};
const max=42;
const clean=(v:string)=>v.toLocaleLowerCase().replace(/[يى]/g,'ی').replace(/ك/g,'ک')
 .replace(/[\u064b-\u065f\u0670]/g,'').replace(/\u200c/g,' ').replace(/\s+/g,' ').trim();
const value=(v:unknown)=>typeof v==='string'?v:'';
const fixedPages=[
 {slug:'about',fa:'درباره ما',en:'About us',detailFa:'معرفی چاپ سفیر هنر',detailEn:'About Safire Honar Print Studio'},
 {slug:'contact',fa:'تماس با ما',en:'Contact us',detailFa:'اطلاعات تماس و ارتباط با چاپخانه',detailEn:'Contact the print studio'},
 {slug:'services',fa:'خدمات چاپ',en:'Print services',detailFa:'خدمات و دسته‌بندی چاپ',detailEn:'Print services and categories'},
 {slug:'guide',fa:'راهنمای چاپ',en:'Print guide',detailFa:'راهنمای ثبت و آماده‌سازی سفارش چاپ',detailEn:'Information about print requests'},
 {slug:'order',fa:'سفارش اختصاصی',en:'Custom print request',detailFa:'ثبت درخواست چاپ در سه مرحله',detailEn:'Submit a custom printing inquiry'},
 {slug:'terms',fa:'قوانین و شرایط',en:'Terms and conditions',detailFa:'قوانین و شرایط سایت',detailEn:'Website terms'},
 {slug:'privacy',fa:'حریم خصوصی',en:'Privacy policy',detailFa:'سیاست حریم خصوصی',detailEn:'Privacy policy'},
 {slug:'pricing',fa:'قیمت و استعلام',en:'Pricing and quotes',detailFa:'قیمت محصولات چاپی و درخواست استعلام',detailEn:'Print product pricing and quote requests'},
 {slug:'track',fa:'پیگیری سفارش',en:'Track an order',detailFa:'مشاهده وضعیت سفارش',detailEn:'Check order progress'}
] as const;

export async function GET(req:NextRequest){
 const params=req.nextUrl.searchParams;
 const locale:Locale=params.get('locale')==='en'?'en':'fa';
 const q=value(params.get('q')).trim().slice(0,90);
 const needle=clean(q);
 const kind=params.get('kind');
 const chosenKind:Kind|'all'=kind==='product'||kind==='category'||kind==='page'?kind:'all';
 const priceFilter=params.get('pricing');
 const pricing=priceFilter==='fixed'||priceFilter==='quote'?priceFilter:'all';
 const sort=params.get('sort')==='title'?'title':params.get('sort')==='price'?'price':'relevance';
 const categoryParam=value(params.get('category')).slice(0,90);
 const all=await storeCategories(locale);
 const active=all.filter(c=>!c.isSample||c.isSample);
 const idToCat=new Map(active.map(c=>[c.id,c]));
 const chosen=active.find(c=>c.slug===categoryParam);
 const allowedIds=new Set<string>();
 if(chosen){
  const queue=[chosen.id];
  for(let i=0;i<queue.length&&i<500;i++){
   const current=queue[i];if(allowedIds.has(current))continue;
   allowedIds.add(current);
   for(const cat of active)if(cat.parent_id===current)queue.push(cat.id);
  }
 }
 const options=active.map(c=>({slug:c.slug,name:c.name,level:c.parent_id?1:0,parentId:c.parent_id||null}))
  .sort((a,b)=>a.level-b.level||a.name.localeCompare(b.name));
 const categoryItems:Item[]=active.map(c=>({
  id:c.id,kind:'category',title:c.name,description:c.description||'',
  href:localePath('/catalog/'+encodeURIComponent(c.slug),locale),
  imageUrl:c.image_url||null,price:null,mode:null,categoryId:c.id,slug:c.slug,sample:!!c.isSample
 }));
 const db=await serverDb();
 let productItems:Item[]=[];
 let pageRecords:Array<{slug:string;title:string;body:string;title_en?:string|null;body_en?:string|null}>=[];
 let catalogLimited=false;
 if(db){
  const [prod,pages]=await Promise.all([
   db.from('products').select('id,slug,name,description,image_url,category_id,mode,price_toman,active')
    .eq('active',true).order('created_at',{ascending:false}).limit(1000),
   db.from('site_pages').select('slug,title,body,title_en,body_en')
    .in('slug',['about','contact','terms','privacy','home']).limit(8)
  ]);
  if(!prod.error&&prod.data){
   catalogLimited=prod.data.length>=1000;
   productItems=prod.data.map(p=>({
    id:p.id,kind:'product' as const,title:value(p.name),description:value(p.description),
    href:localePath('/shop/'+encodeURIComponent(p.slug),locale),
    imageUrl:p.image_url||null,price:p.price_toman===null?null:Number(p.price_toman),
    mode:p.mode==='fixed'?'fixed' as const:'quote' as const,
    categoryId:p.category_id||null,slug:p.slug,sample:false
   }));
  }
  if(!pages.error&&pages.data)pageRecords=pages.data;
 }
 const pageItems:Item[]=fixedPages.map(p=>{
  const dbPage=pageRecords.find(row=>row.slug===p.slug);
  const title=locale==='en'?(dbPage?.title_en||p.en):(dbPage?.title||p.fa);
  const desc=locale==='en'?(dbPage?.body_en||p.detailEn):(dbPage?.body||p.detailFa);
  return {id:p.slug,kind:'page',title,description:desc.slice(0,240),
   href:localePath('/'+p.slug,locale),imageUrl:null,price:null,mode:null,
   categoryId:null,slug:p.slug,sample:false};
 });
 const items=[...productItems,...categoryItems,...pageItems].filter(item=>{
  if(chosenKind!=='all'&&item.kind!==chosenKind)return false;
  if(pricing!=='all'&&(item.kind!=='product'||item.mode!==pricing))return false;
  if(chosen&&(item.kind==='page'||!item.categoryId||!allowedIds.has(item.categoryId)))return false;
  if(!needle)return true;
  const categoryName=item.categoryId?idToCat.get(item.categoryId)?.name||'':'';
  const haystack=clean([item.title,item.description,item.slug,categoryName].join(' '));
  return needle.split(' ').filter(Boolean).every(token=>haystack.includes(token));
 });
 function score(item:Item){
  if(!needle)return item.kind==='category'?0:item.kind==='product'?1:2;
  const t=clean(item.title),s=clean(item.slug),tokens=needle.split(' ').filter(Boolean);
  if(t===needle)return 0;
  if(t.startsWith(needle))return 1;
  if(t.includes(needle))return 2;
  if(s.includes(needle))return 3;
  if(tokens.every(token=>t.includes(token)))return 4;
  return 5;
 }
 items.sort((a,b)=>{
  if(sort==='price'){
   if(a.price!==null&&b.price!==null)return a.price-b.price;
   if(a.price!==null)return -1;
   if(b.price!==null)return 1;
  }
  if(sort==='title')return a.title.localeCompare(b.title,locale==='fa'?'fa':'en');
  return score(a)-score(b)||a.title.localeCompare(b.title,locale==='fa'?'fa':'en');
 });
 const counts={all:items.length,product:items.filter(i=>i.kind==='product').length,
  category:items.filter(i=>i.kind==='category').length,page:items.filter(i=>i.kind==='page').length};
 return NextResponse.json({items:items.slice(0,max),total:items.length,counts,
  categories:options,limited:catalogLimited}, {headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
