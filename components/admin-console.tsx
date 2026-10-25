'use client';
import {useI18n} from '@/components/locale-provider';
import {orderStatusLabel,quoteStatusLabel} from '@/lib/status-labels';
import {categoryEnglish,designEnglish,pageEnglish} from '@/lib/translated-content';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowUpLeft,Plus,RefreshCw,Save,Settings2,ShoppingBag,UserRound,Layers,FilePen,MessagesSquare,Landmark,PanelsTopLeft,Store} from 'lucide-react';
import AccountingConsole from '@/components/accounting-console';
import AdminArtworkPreview from '@/components/admin-artwork-preview';
import {CustomerVisualPicker,ProductVisualPicker,CustomerAvatar} from '@/components/admin-visual-picker';
type C={id:string;slug:string;name:string;name_en?:string|null;description_en?:string|null;description:string;theme:string;image_url:string|null;parent_id:string|null;sort_order:number;active:boolean};
type P={id:string;slug:string;name:string;name_en?:string|null;description_en?:string|null;description:string;category_id:string|null;mode:'fixed'|'quote';price_toman:number|null;image_url:string|null;active:boolean};
type ManualProduct={id:string;slug:string;name:string;mode:'fixed'|'quote';price_toman:number|null;image_url:string|null;active:boolean;source:'database'|'starter'};
type Page={slug:string;title:string;body:string;title_en?:string|null;body_en?:string|null};type User={id:string;display_name:string;email:string;role:string;avatar_url?:string|null};
type Cart={id:string;user_id:string;cart_items:{id:string;product_id:string;quantity:number;notes:string}[]};
type Order={id:string;user_id:string;status:string;total_toman:number;created_at:string;admin_note?:string;order_items?:Array<{id:string;title:string;quantity:number;unit_price_toman:number;notes:string}>};type Quote={id:string;user_id:string;title:string;details:string;status:string;response:string};
const siteTabs=[['categories','دسته‌بندی‌ها',Layers],['products','محصولات و نمونه‌کارها',ShoppingBag],['pages','مدیریت صفحات سایت',FilePen]] as const;
const commerceTabs=[['accounting','حسابداری',Landmark],['orders','سفارش‌ها',Settings2],['quotes','استعلام‌ها',MessagesSquare],['carts','سبد خرید مشتریان',ShoppingBag],['customers','مشتریان',UserRound]] as const;
const styles=['coral','ink','gold','teal','violet','cobalt'];
const pageDefaults:Page[]=[{slug:'home',title:'تیتر اصلی صفحه نخست',body:''},{slug:'about',title:'درباره ما',body:''},{slug:'contact',title:'تماس با ما',body:''},{slug:'terms',title:'قوانین و شرایط',body:''},{slug:'privacy',title:'حریم خصوصی',body:''}];
type Starter={categories:Array<{slug:string;name:string;description:string;parent_slug:string|null}>;products:Array<{slug:string;name:string;description:string;category_slug:string}>;pages:Page[]};
type ImportProgress={categories:{added:number;existing:number;failed:number};products:{added:number;existing:number;failed:number};pages:{added:number;existing:number;failed:number}};
type Result={error?:string;warnings?:string[];ok?:boolean;partial?:boolean;url?:string;summary?:string;progress?:ImportProgress;failed?:Array<{kind:string;slug:string;reason:string}>;starter?:Starter;categories?:C[];products?:P[];manualProducts?:ManualProduct[];pages?:Page[];customers?:User[];carts?:Cart[];orders?:Order[];quotes?:Quote[]};
async function send(action:string,value:Record<string,unknown>,id=''):Promise<Result>{
 const res=await fetch('/admin/api',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',cache:'no-store',body:JSON.stringify({action,value,id})});
 const data=await res.json().catch(()=>({error:'پاسخ سرور قابل خواندن نیست.'}));
 if(!res.ok)throw new Error(data.error||`خطای سرور ${res.status}`);
 return data;
}
export default function AdminConsole(){
 const {locale,pick}=useI18n();
 const [starter,setStarter]=useState<Starter|null>(null),[importing,setImporting]=useState(false),[hasLoaded,setHasLoaded]=useState(false);
 const [importReport,setImportReport]=useState<Result|null>(null);
 const [area,setArea]=useState<'site'|'commerce'>('site');
 const [tab,setTab]=useState<string>('categories'),[msg,setMsg]=useState(''),[warning,setWarning]=useState(''),[busy,setBusy]=useState(false),[cats,setCats]=useState<C[]>([]),[products,setProducts]=useState<P[]>([]),[manualProducts,setManualProducts]=useState<ManualProduct[]>([]),[pages,setPages]=useState<Page[]>(pageDefaults),[customers,setCustomers]=useState<User[]>([]),[carts,setCarts]=useState<Cart[]>([]),[orders,setOrders]=useState<Order[]>([]),[quotes,setQuotes]=useState<Quote[]>([]);
 const [catForm,setCatForm]=useState({id:'',name:'',name_en:'',slug:'',description:'',description_en:'',theme:'coral',image_url:'',parent_id:'',sort_order:'0',active:true});
 const [pForm,setPForm]=useState({id:'',name:'',name_en:'',slug:'',description:'',description_en:'',category_id:'',mode:'quote',price_toman:'',image_url:'',active:true});
 const [productCategoryFilter,setProductCategoryFilter]=useState('all');
 const [productSearch,setProductSearch]=useState('');

 const [pageForm,setPageForm]=useState<Page>({slug:'about',title:'درباره ما',body:'',title_en:'',body_en:''});
 const [manual,setManual]=useState({user_id:'',product_id:'',quantity:'1',note:'',action:'cart'});
 async function load(){setBusy(true);try {
  const response=await fetch('/admin/api',{credentials:'same-origin',cache:'no-store'});
  const data:Result=await response.json();if(!response.ok)throw new Error(data.error||'اتصال به سرور برقرار نشد.');
  setCats(data.categories||[]);setProducts(data.products||[]);setManualProducts(data.manualProducts||[]);setStarter(data.starter||null);
  const combined=pageDefaults.map(defaultPage=>data.pages?.find(p=>p.slug===defaultPage.slug)||data.starter?.pages.find(p=>p.slug===defaultPage.slug)||defaultPage);
  setPages(combined);setPageForm(current=>combined.find(p=>p.slug===current.slug)||combined[0]);
  setCustomers(data.customers||[]);setCarts(data.carts||[]);setOrders(data.orders||[]);setQuotes(data.quotes||[]);
  setWarning((data.warnings||[]).join(' | '));setHasLoaded(true);
 } catch(e){setWarning(e instanceof Error?e.message:'خطای غیرمنتظره اتصال Supabase.')}finally{setBusy(false)}}
 useEffect(()=>{void load()},[]);
 async function run(action:string,value:Record<string,unknown>,id=''){setBusy(true);setMsg('');try{await send(action,value,id);setMsg('تغییرات با موفقیت در پایگاه داده ذخیره شد.');await load();return true;}catch(e){setMsg(e instanceof Error?e.message:'ذخیره انجام نشد.');return false;}finally{setBusy(false)}}
 async function importExisting(){
  if(!window.confirm('دسته‌ها، نمونه‌طرح‌ها و صفحات فعلی را بدون تغییر دادن داده‌های ثبت‌شده قبلی به Supabase اضافه کنیم؟'))return;
  setImporting(true);setMsg('');setImportReport(null);try{
   const result=await send('importCurrentSite',{});
   let linkReport='';
   try{const repair=await send('repairStarterCategoryLinks',{});linkReport=String(repair.summary||'');}catch{linkReport=pick('ارتباط محصولات با دسته‌ها را بررسی کنید.','Check product-category links.');}
   await load();setImportReport(result);setMsg([result.summary||pick('محتوای نمونه ثبت شد.','Starter content imported.'),linkReport].filter(Boolean).join(' | '));
  }catch(e){setMsg(e instanceof Error?e.message:'همگام‌سازی ممکن نشد.')}finally{setImporting(false)}
 }
 const missingCategories=starter?.categories.filter(s=>!cats.some(c=>c.slug===s.slug))||[];
 const missingProducts=starter?.products.filter(s=>!products.some(p=>p.slug===s.slug))||[];
 const starterCategoryId=(slug:string)=>cats.find(c=>c.slug===slug)?.id||'starter:'+slug;
 const siteCats:C[]=[...cats,...missingCategories.map((c,index)=>({
  id:'starter:'+c.slug,slug:c.slug,name:c.name,description:c.description,theme:'coral',
  image_url:null,parent_id:c.parent_slug?starterCategoryId(c.parent_slug):null,sort_order:index,active:true,
  name_en:categoryEnglish[c.slug]?.[0]||null,description_en:categoryEnglish[c.slug]?.[1]||null
 }))];
 const siteProducts:P[]=[...products,...missingProducts.map(p=>({
  id:'starter:'+p.slug,slug:p.slug,name:p.name,description:p.description,
  name_en:designEnglish[p.slug]?.[0]||null,description_en:designEnglish[p.slug]?.[1]||null,
  category_id:starterCategoryId(p.category_slug),mode:'quote' as const,
  price_toman:null,image_url:null,active:true
 }))];
 const mainCategoryRows=siteCats.filter(c=>!c.parent_id||!siteCats.some(p=>p.id===c.parent_id));
 const childrenFor=(id:string)=>siteCats.filter(c=>c.parent_id===id);
 const categoryPath=(id:string|null)=>{
  const category=siteCats.find(c=>c.id===id);
  if(!category)return pick('بدون دسته معتبر','Unassigned / missing category');
  const parent=siteCats.find(c=>c.id===category.parent_id);
  return parent?parent.name+' ← '+category.name:category.name;
 };
 const categoryIdCache=new Map<string,Set<string>>();
 const categoryIdsFor=(id:string)=>{
  const cached=categoryIdCache.get(id);if(cached)return cached;
  const ids=new Set([id]);
  for(let i=0;i<siteCats.length;i++){
   let changed=false;
   for(const category of siteCats)if(category.parent_id&&ids.has(category.parent_id)&&!ids.has(category.id)){
    ids.add(category.id);changed=true;
   }
   if(!changed)break;
  }
  categoryIdCache.set(id,ids);
  return ids;
 };
 const invalidProducts=products.filter(p=>!p.category_id||!cats.some(c=>c.id===p.category_id));
 const visibleCategoryIds=productCategoryFilter==='all'||productCategoryFilter==='unassigned'?null:categoryIdsFor(productCategoryFilter);
 const filteredProducts=siteProducts.filter(p=>{
  const query=productSearch.trim().toLocaleLowerCase();
  const searchable=!query||[p.name,p.slug,p.description,categoryPath(p.category_id)].some(x=>x.toLocaleLowerCase().includes(query));
  if(!searchable)return false;
  if(productCategoryFilter==='all')return true;
  if(productCategoryFilter==='unassigned')return !p.category_id||!cats.some(c=>c.id===p.category_id);
  return visibleCategoryIds?.has(p.category_id||'')||false;
 });
 function editCategoryById(id:string){
  if(id.startsWith('starter:')){const preview=starter?.categories.find(c=>c.slug===id.slice(8));if(preview)editStarterCategory(preview);return;}
  const c=cats.find(c=>c.id===id);if(!c)return;
  setArea('site');setTab('categories');setMsg('');
  setCatForm({...c,name_en:c.name_en||'',description_en:c.description_en||'',image_url:c.image_url||'',parent_id:c.parent_id||'',sort_order:String(c.sort_order)});
 }
 function browseCategoryProducts(id:string){setProductCategoryFilter(id);setArea('site');setTab('products');setProductSearch('');setMsg('');}
 async function repairMissingProductCategories(){
  if(!window.confirm(pick('فقط دسته محصولات نمونه‌ای را که بدون دسته معتبر مانده‌اند به دسته اصلی‌شان متصل کنیم؟ قیمت، عکس و محصولات سفارشی تغییر نمی‌کنند.','Repair only starter products with missing category links? Prices, photos, and custom products will not change.')))return;
  setBusy(true);setMsg('');
  try{
   const result=await send('repairStarterCategoryLinks',{});
   setMsg(pick('ترمیم انجام شد: ','Repair completed: ')+String(result.summary||''));
   await load();
  }catch(e){setMsg(e instanceof Error?e.message:pick('ترمیم دسته‌ها ناموفق بود.','Could not repair category links.'))}
  finally{setBusy(false)}
 }

 function editStarterCategory(c:Starter['categories'][number]){setArea('site');setTab('categories');setCatForm({id:'',name:c.name,name_en:categoryEnglish[c.slug]?.[0]||'',slug:c.slug,description:c.description,description_en:categoryEnglish[c.slug]?.[1]||'',theme:'coral',image_url:'',parent_id:c.parent_slug?starterCategoryId(c.parent_slug):'',sort_order:'0',active:true});setMsg(pick('این دسته نمونهٔ سایت است. با ذخیره، دسته و والد ثبت‌نشدهٔ آن نیز در دیتابیس ایجاد می‌شوند.','This is a site-preview category; saving also registers a missing parent.'));}
 function editStarterProduct(prod:Starter['products'][number]){setArea('site');setTab('products');setPForm({id:'',name:prod.name,name_en:designEnglish[prod.slug]?.[0]||'',slug:prod.slug,description:prod.description,description_en:designEnglish[prod.slug]?.[1]||'',category_id:starterCategoryId(prod.category_slug),mode:'quote',price_toman:'',image_url:'',active:true});setMsg(pick('این نمونه آمادهٔ ویرایش است؛ هنگام ذخیره، دستهٔ آن در صورت نیاز در دیتابیس ثبت می‌شود.','This sample can be edited; saving also registers its category if missing.'));}
 async function upsertCategory(e:React.FormEvent){e.preventDefault();const ok=await run('saveCategory',{...catForm,sort_order:Number(catForm.sort_order),parent_id:catForm.parent_id||null},catForm.id);if(ok)setCatForm({id:'',name:'',name_en:'',slug:'',description:'',description_en:'',theme:'coral',image_url:'',parent_id:'',sort_order:'0',active:true})}
 async function upsertProduct(e:React.FormEvent){e.preventDefault();const ok=await run('saveProduct',{...pForm,price_toman:pForm.mode==='fixed'?Number(pForm.price_toman):null},pForm.id);if(ok)setPForm({id:'',name:'',name_en:'',slug:'',description:'',description_en:'',category_id:'',mode:'quote',price_toman:'',image_url:'',active:true})}
 async function savePage(e:React.FormEvent){e.preventDefault();await run('savePage',pageForm)}
 async function uploadImage(e:React.ChangeEvent<HTMLInputElement>,target:'cat'|'prod'){
  const file=e.target.files?.[0];if(!file)return;
  if(file.size>5*1024*1024||!['image/png','image/jpeg','image/webp'].includes(file.type)){setMsg('فقط تصویر PNG، JPG یا WebP تا ۵ مگابایت مجاز است.');return}
  setBusy(true);setMsg('');try{const data=new FormData();data.append('file',file);const response=await fetch('/admin/api',{method:'POST',body:data,credentials:'same-origin'});const result:Result=await response.json();if(!response.ok||!result.url)throw new Error(result.error||'آپلود انجام نشد');
  if(target==='cat')setCatForm(s=>({...s,image_url:result.url!}));else setPForm(s=>({...s,image_url:result.url!}));
  setMsg('تصویر آپلود شد؛ برای انتشار دکمه ذخیره را بزنید.');
  }catch(e){setMsg(e instanceof Error?e.message:'خطای آپلود')}finally{setBusy(false)}}
 async function manualAction(e:React.FormEvent){e.preventDefault();await run('manual',{...manual,mode:manual.action,quantity:Number(manual.quantity)})}
 async function changeCartItem(id:string,quantity:number){await run('cartItem',{quantity,reason:'اصلاح سبد توسط مدیر'},id)}
 async function changeOrderStatus(id:string,status:string){await run('orderStatus',{status},id)}
 async function changeOrderNote(id:string,note:string){await run('orderNote',{note},id)}
 async function changeQuote(q:Quote,field:'status'|'response',value:string){await run('quote',{field,text:value},q.id)}
 const pickedProduct=manualProducts.find(p=>p.id===manual.product_id);
 const hasFixedProducts=manualProducts.some(p=>p.mode==='fixed'&&p.source==='database');
 const customerName=(id:string)=>{const u=customers.find(x=>x.id===id);return u?`${u.display_name||pick('مشتری','Customer')} (${u.email})`:id.slice(0,8)};
 return <div className="pw-admin-workspace">
 <aside className="pw-admin-sidebar" aria-label={pick('ناوبری مدیریت','Administration navigation')}>
  <div className="pw-admin-brand"><span>{pick('سفیر هنر / مدیریت','SH / CONTROL')}</span><strong>{pick('مرکز مدیریت','Management hub')}</strong><small>{pick('چاپ سفیر هنر','Safire Honar Print Studio')}</small></div>
  <nav className="pw-admin-navigation" aria-label={pick('بخش‌های پنل مدیریت','Administration sections')}>
   <span className="pw-admin-nav-title">{pick('مدیریت سایت','SITE MANAGEMENT')}</span>
   {siteTabs.map(([key,name,Icon])=><button type="button" key={key} className="pw-admin-nav-item" aria-current={tab===key?'page':undefined} onClick={()=>{setArea('site');setTab(key);setMsg('')}}><Icon size={18}/>{locale==='en'?({categories:'Categories',products:'Products & portfolio',pages:'Site pages'} as Record<string,string>)[key]:name}</button>)}
   <span className="pw-admin-nav-title">{pick('مدیریت فروشگاه','STORE OPERATIONS')}</span>
   {commerceTabs.map(([key,name,Icon])=><button type="button" key={key} className="pw-admin-nav-item" aria-current={tab===key?'page':undefined} onClick={()=>{setArea('commerce');setTab(key);setMsg('')}}><Icon size={18}/>{locale==='en'?({accounting:'Accounting',orders:'Orders',quotes:'Quotes',carts:'Customer carts',customers:'Customers'} as Record<string,string>)[key]:name}</button>)}
  </nav>
  <div className="pw-admin-sidebar-foot">{pick('محتوای سایت و عملیات فروشگاه از یک فضای امن مدیریت می‌شوند.','Website content and store operations are managed in one secure workspace.')}</div>
 </aside>
 <div className="pw-admin-content">
 <div className="admin-heading"><div><span className="tiny-label">{pick('سفیر هنر / مدیریت سایت و فروشگاه','SAFIRE HONAR / CONTENT & COMMERCE')}</span><h1>{pick('پنل مدیریت چاپ سفیر هنر','Safire Honar Administration')}</h1><p>{pick('مدیریت سایت و فروشگاه از دو فضای مستقل با کنترل کامل محتوا و گزارش‌های مالی انجام می‌شود.','Manage website content, store operations and financial reports from one dashboard.')}</p></div><button disabled={busy} className="v2-outline" onClick={load}>{pick('بازخوانی داده‌ها','Refresh data')} <RefreshCw size={17}/></button></div>
 <div className="pw-admin-overview" aria-label={pick('نمای کلی داده‌های ثبت‌شده','Recorded data overview')} aria-busy={!hasLoaded}>
  {([
   {id:'categories',area:'site' as const,label:pick('دسته‌های سایت','Site categories'),count:siteCats.length,icon:Layers},
   {id:'products',area:'site' as const,label:pick('محصولات و نمونه‌ها','Products and samples'),count:siteProducts.filter(p=>p.active).length,icon:ShoppingBag},
   {id:'customers',area:'commerce' as const,label:pick('حساب‌های مشتری','Customer accounts'),count:customers.length,icon:UserRound},
   {id:'orders',area:'commerce' as const,label:pick('سفارش‌های ثبت‌شده','Recorded orders'),count:orders.length,icon:Settings2}
  ]).map(item=><button type="button" key={item.id} className="pw-admin-kpi" onClick={()=>{setArea(item.area);setTab(item.id);setMsg('')}}>
   <span className="pw-admin-kpi-label">{item.label}<item.icon size={18}/></span>
   <strong>{hasLoaded?item.count.toLocaleString(locale==='fa'?'fa-IR':'en-US'):'…'}</strong>
   <small>{pick('مشاهده و مدیریت','Open and manage')} <ArrowUpLeft size={13}/></small>
  </button>)}
 </div>
 {(missingCategories.length>0||missingProducts.length>0)&&<div className="v2-notice" style={{marginBottom:22,borderColor:'#b67b49',padding:22}}>
 <strong>{pick('محتوای فعلی سایت در کد وجود دارد، اما هنوز همه آن به Supabase منتقل نشده است.','Some starter content has not yet been imported into Supabase.')}</strong>
 <p>{pick('دسته‌های آماده:','Starter categories:')} {starter?.categories.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')} | {pick('دسته‌های منتقل‌نشده:','Missing categories:')} {missingCategories.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')} | {pick('نمونه‌های منتقل‌نشده:','Missing samples:')} {missingProducts.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')}</p>
 <p>{pick('تا قبل از انتقال، این موارد پایین فهرست‌ها با برچسب «نمونه سایت» نمایش داده می‌شوند. برای ویرایش، یک‌بار آن‌ها را وارد دیتابیس کن. اطلاعات موجود، قیمت‌ها و ویرایش‌های قبلی دست‌نخورده می‌مانند.','Starter examples appear below the database items. Import them before editing; existing prices, images and records will not be overwritten.')}</p>
 <button type="button" className="v2-primary" onClick={importExisting} disabled={busy||importing}>{importing?pick('در حال همگام‌سازی...','Syncing...'):pick('همگام‌سازی محتوای فعلی سایت با دیتابیس','Import current site content')} <RefreshCw size={17}/></button>
 </div>}
 {importReport&&<div className="v2-notice" role="status" style={{marginBottom:18}}><strong>{pick('گزارش مرحله‌ای همگام‌سازی','Step-by-step import report')}</strong><div className="admin-import-report">{(['categories','products','pages'] as const).map(key=><span key={key}>{key==='categories'?pick('دسته‌ها','Categories'):key==='products'?pick('محصولات','Products'):pick('صفحات','Pages')}: {pick('افزوده','Added')} {importReport.progress?.[key].added??0} | {pick('قبلاً موجود','Existing')} {importReport.progress?.[key].existing??0} | {pick('خطا','Failed')} {importReport.progress?.[key].failed??0}</span>)}</div>{(importReport.failed||[]).length>0&&<details open><summary>{pick('مشاهده علت خطای هر مورد','View reasons for failed items')} ({importReport.failed!.length})</summary><ul>{importReport.failed!.map((f,i)=><li key={i}><strong>{f.kind} {f.slug}:</strong> {f.reason}</li>)}</ul></details>}</div>}
 {warning&&<div role="alert" className="v2-notice" style={{borderColor:'#d25b42',marginBottom:16}}><strong>{pick('نیازمند بررسی دیتابیس:','Database check required:')}</strong> {warning}</div>}{msg&&<div role="status" className="v2-notice">{msg}</div>}
 {tab==='categories'&&<div className="admin-columns"><form className="admin-editor" onSubmit={upsertCategory}><h2>{catForm.id?pick('ویرایش دسته‌بندی','Edit category'):pick('دسته‌بندی تازه','New category')}</h2><label>{pick('عنوان فارسی','Persian name')}<input required value={catForm.name} onChange={e=>setCatForm(s=>({...s,name:e.target.value}))}/></label><label>{pick('نام انگلیسی','English name')}<input lang="en" dir="ltr" value={catForm.name_en} placeholder="e.g. Business Cards" onChange={e=>setCatForm(s=>({...s,name_en:e.target.value}))}/></label><label>{pick('شناسه انگلیسی برای آدرس','URL slug (English)')}<input required dir="ltr" value={catForm.slug} onChange={e=>setCatForm(s=>({...s,slug:e.target.value}))}/></label><label>{pick('توضیح فارسی','Persian description')}<textarea value={catForm.description} onChange={e=>setCatForm(s=>({...s,description:e.target.value}))}/></label><label>{pick('توضیح انگلیسی','English description')}<textarea lang="en" dir="ltr" value={catForm.description_en} onChange={e=>setCatForm(s=>({...s,description_en:e.target.value}))}/></label><label>{pick('جایگاه دسته‌بندی','Category hierarchy')}<select value={catForm.parent_id} onChange={e=>setCatForm(s=>({...s,parent_id:e.target.value}))}><option value="">{pick('دسته اصلی (مثل بنر، بروشور یا تابلو)','Main category (e.g. banners, brochures, signage)')}</option>{mainCategoryRows.filter(c=>c.id!==catForm.id).map(c=><option key={c.id} value={c.id}>{pick('زیرمجموعه','Child of')} {c.name}</option>)}</select></label><p className="v2-fine">{pick('دسته‌های اصلی در صفحه خانه دیده می‌شوند. زیرمجموعه‌ها داخل صفحه دسته والد نمایش داده می‌شوند.','Main categories appear on the homepage; subcategories appear within their parent collection.')}</p><label>{pick('پالت رنگ','Color palette')}<select value={catForm.theme} onChange={e=>setCatForm(s=>({...s,theme:e.target.value}))}>{styles.map(x=><option key={x} value={x}>{x}</option>)}</select></label><div className="admin-editor-preview"><strong>{pick('پیش‌نمایش این دسته','Category preview')}</strong><AdminArtworkPreview key={catForm.slug+catForm.image_url} kind="category" slug={catForm.slug||"banner"} name={catForm.name||"دسته جدید"} url={catForm.image_url} large/><small>{pick('پس از آپلود یا تغییر آدرس عکس، پیش‌نمایش به‌روز می‌شود.','Preview updates after upload or URL changes.')}</small></div><label>{pick('آدرس تصویر نمونه','Image URL')}<input dir="ltr" value={catForm.image_url} onChange={e=>setCatForm(s=>({...s,image_url:e.target.value}))}/></label><label>{pick('یا آپلود تصویر','Or upload an image')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadImage(e,'cat')}/></label><label>{pick('ترتیب نمایش','Display order')}<input type="number" value={catForm.sort_order} onChange={e=>setCatForm(s=>({...s,sort_order:e.target.value}))}/></label><label className="admin-check"><input type="checkbox" checked={catForm.active} onChange={e=>setCatForm(s=>({...s,active:e.target.checked}))}/> {pick('فعال و قابل نمایش','Active and visible')}</label><button className="v2-primary" disabled={busy}><Save size={18}/> {pick('ذخیره دسته‌بندی','Save category')}</button>{catForm.id&&<button type="button" className="v2-outline" onClick={()=>setCatForm({id:'',name:'',name_en:'',slug:'',description:'',description_en:'',theme:'coral',image_url:'',parent_id:'',sort_order:'0',active:true})}>{pick('فرم جدید','New form')}</button>}</form><div className="admin-list"><h2>{pick('دسته‌های سایت و دیتابیس','Site and database categories')} ({siteCats.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')})</h2><p className="admin-catalog-meta">{pick('دیتابیس','Database')}: {cats.length} | {pick('نمونه سایت','Site previews')}: {missingCategories.length}</p>{siteCats.map(c=><div className="admin-linked-row" key={c.id}><button type="button" className="admin-entry admin-entry-media" onClick={()=>editCategoryById(c.id)}><AdminArtworkPreview kind="category" slug={c.slug} name={c.name} url={c.image_url}/><div><strong>{c.parent_id?'↳ ':'★ '}{c.name} {c.id.startsWith('starter:')&&<small className="admin-source-tag">{pick('نمونه سایت','Site preview')}</small>}</strong><span>{c.parent_id?`زیرمجموعه ${cats.find(p=>p.id===c.parent_id)?.name||pick('نامشخص','Unknown')} | `:pick('دسته اصلی | ','Main category | ')}{c.slug} | {c.active?pick('فعال','Active'):pick('غیرفعال','Inactive')}</span><span>{pick('انتخاب برای ویرایش تصویر و اطلاعات','Select to edit information and image')}</span></div></button><button type="button" className="v2-outline admin-linked-row-action" onClick={()=>browseCategoryProducts(c.id)}>{pick('مشاهده محصولات این دسته','Browse category products')} ({siteProducts.filter(p=>categoryIdsFor(c.id).has(p.category_id||'')).length.toLocaleString(locale==='fa'?'fa-IR':'en-US')}) <ArrowUpLeft size={15}/></button></div>)}<div className="admin-category-summary"><strong>{pick('نمایش محصولات هر دسته','Browse products in a category')}</strong><div className="admin-category-quicklinks">{mainCategoryRows.map(c=><button type="button" key={c.id} className="v2-outline" onClick={()=>browseCategoryProducts(c.id)}>{c.name} · {siteProducts.filter(p=>categoryIdsFor(c.id).has(p.category_id||'')).length.toLocaleString(locale==='fa'?'fa-IR':'en-US')} <ArrowUpLeft size={14}/></button>)}</div></div></div></div>}
 {tab==='products'&&<div className="admin-columns"><form id="admin-product-editor" className="admin-editor" onSubmit={upsertProduct}><h2>{pForm.id?pick('ویرایش محصول','Edit product'):pick('افزودن نمونه جدید','Add new product')}</h2><label>{pick('نام محصول به فارسی','Persian product name')}<input required value={pForm.name} onChange={e=>setPForm(s=>({...s,name:e.target.value}))}/></label><label>{pick('نام انگلیسی محصول','Product name (English)')}<input lang="en" dir="ltr" value={pForm.name_en} onChange={e=>setPForm(s=>({...s,name_en:e.target.value}))}/></label><label>{pick('شناسه آدرس انگلیسی','English URL slug')}<input required dir="ltr" value={pForm.slug} onChange={e=>setPForm(s=>({...s,slug:e.target.value}))}/></label><label>{pick('توضیحات فارسی','Persian details')}<textarea value={pForm.description} onChange={e=>setPForm(s=>({...s,description:e.target.value}))}/></label><label>{pick('توضیحات انگلیسی محصول','Product description (English)')}<textarea lang="en" dir="ltr" value={pForm.description_en} onChange={e=>setPForm(s=>({...s,description_en:e.target.value}))}/></label><div className="admin-category-picker">
 <label>{pick('دسته‌بندی محصول','Product category')}
  <select required value={pForm.category_id} onChange={e=>setPForm(prev=>({...prev,category_id:e.target.value}))}>
   <option value="">{pick('ابتدا یک دسته انتخاب کنید','Select a category first')}</option>
   {pForm.category_id&&!siteCats.some(c=>c.id===pForm.category_id)&&<option value={pForm.category_id} disabled>{pick('دسته قبلی حذف شده یا موجود نیست','Previously assigned category is missing')}</option>}
   {mainCategoryRows.map(parent=><optgroup key={parent.id} label={parent.name}>
    <option value={parent.id}>{parent.name} · {pick('دسته اصلی','Main category')}</option>
    {childrenFor(parent.id).map(child=><option value={child.id} key={child.id}>{parent.name} ← {child.name}</option>)}
   </optgroup>)}
  </select>
 </label>
 <div className="admin-category-picker-meta">
  <span>{pForm.category_id&&siteCats.some(c=>c.id===pForm.category_id)?categoryPath(pForm.category_id):pick('محصول هنوز به دسته معتبر وصل نشده است.','This product is not linked to a valid category.')}</span>
  {pForm.category_id&&siteCats.some(c=>c.id===pForm.category_id)&&<button type="button" className="v2-outline" onClick={()=>editCategoryById(pForm.category_id)}>{pick('ویرایش این دسته','Edit category')} <ArrowUpLeft size={15}/></button>}
 </div>
 {!siteCats.length&&<p className="v2-notice">{pick('هیچ دسته‌ای از دیتابیس بارگذاری نشده؛ ابتدا در قسمت دسته‌بندی‌ها، دسته‌ها را ثبت یا همگام‌سازی کنید.','No database categories loaded. Create or import categories before saving the product.')}</p>}
 </div><label>{pick('نوع سفارش','Order method')}<select value={pForm.mode} onChange={e=>setPForm(s=>({...s,mode:e.target.value}))}><option value="quote">{pick('استعلام قیمت و تماس','Quote and contact')}</option><option value="fixed">{pick('قیمت مشخص و ثبت مستقیم','Fixed price / direct ordering')}</option></select></label>{pForm.mode==='fixed'&&<label>{pick('قیمت قطعی (تومان)','Fixed price (Toman)')}<input type="number" required min={0} value={pForm.price_toman} onChange={e=>setPForm(s=>({...s,price_toman:e.target.value}))}/></label>}<div className="admin-editor-preview"><strong>{pick('پیش‌نمایش محصول در سایت','Product preview on the website')}</strong><AdminArtworkPreview key={pForm.slug+pForm.image_url} kind="product" slug={pForm.slug} name={pForm.name||"محصول جدید"} url={pForm.image_url} large/><small>{pick('اگر هنوز عکس ندارد، طرح گرافیکی اولیه محصول نمایش داده می‌شود.','Products without photos show their illustrative graphics.')}</small></div><label>{pick('آدرس تصویر','Image URL')}<input dir="ltr" value={pForm.image_url} onChange={e=>setPForm(s=>({...s,image_url:e.target.value}))}/></label><label>{pick('یا آپلود تصویر','Or upload an image')}<input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>uploadImage(e,'prod')}/></label><label className="admin-check"><input type="checkbox" checked={pForm.active} onChange={e=>setPForm(s=>({...s,active:e.target.checked}))}/> {pick('منتشر شود','Publish')}</label><button className="v2-primary" disabled={busy}><Save size={18}/> {pick('ذخیره محصول','Save product')}</button>{pForm.id&&<button type="button" className="v2-outline" onClick={()=>setPForm({id:'',name:'',name_en:'',slug:'',description:'',description_en:'',category_id:'',mode:'quote',price_toman:'',image_url:'',active:true})}>{pick('محصول جدید','New product')}</button>}</form><div className="admin-list"><h2>{pick('محصولات و نمونه‌های سایت','Site products and samples')} ({siteProducts.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')})</h2><p className="admin-catalog-meta">{pick('ثبت‌شده','Saved')}: {products.length} | {pick('نمونهٔ سایت','Site previews')}: {missingProducts.length}</p>
 <div className="admin-site-category-browser"><strong>{pick('دسته‌های موجود در سایت','Categories available on the site')}</strong><p>{pick('دستهٔ موردنظر را انتخاب کن؛ نمونه‌های ثبت‌نشده با برچسب مشخص‌اند.','Select a category. Unsaved site previews have a visible label.')}</p><div className="admin-site-category-buttons"><button type="button" className="v2-outline" aria-pressed={productCategoryFilter==='all'} onClick={()=>setProductCategoryFilter('all')}>{pick('همه','All')} ({siteProducts.length})</button>{mainCategoryRows.map(c=><button type="button" key={c.id} className="v2-outline" aria-pressed={productCategoryFilter===c.id} onClick={()=>setProductCategoryFilter(c.id)}>{c.name} ({siteProducts.filter(p=>categoryIdsFor(c.id).has(p.category_id||'')).length}) {c.id.startsWith('starter:')&&<small>{pick('نمونه','Preview')}</small>}</button>)}</div></div>
 <div className="admin-product-category-tools">
  <label>{pick('فیلتر براساس دسته و زیرمجموعه','Filter by category and subcategory')}
   <select value={productCategoryFilter} onChange={e=>setProductCategoryFilter(e.target.value)}>
    <option value="all">{pick('همه محصولات و نمونه‌ها','All products and samples')} ({siteProducts.length})</option>
    <option value="unassigned">{pick('بدون دسته معتبر','Missing category')} ({invalidProducts.length})</option>
    {mainCategoryRows.map(parent=><optgroup key={parent.id} label={parent.name}>
     <option value={parent.id}>{parent.name} ({siteProducts.filter(p=>categoryIdsFor(parent.id).has(p.category_id||'')).length})</option>
     {childrenFor(parent.id).map(child=><option key={child.id} value={child.id}>{parent.name} ← {child.name}</option>)}
    </optgroup>)}
   </select>
  </label>
  <label>{pick('جست‌وجوی محصولات','Search products')}
   <input type="search" value={productSearch} onChange={e=>setProductSearch(e.target.value)} placeholder={pick('نام، توضیح یا شناسه محصول…','Name, description or slug…')}/>
  </label>
  <p>{pick('محصولات نمایش‌داده‌شده','Matching products')}: {filteredProducts.length.toLocaleString(locale==='fa'?'fa-IR':'en-US')}</p>
 </div>
 {invalidProducts.length>0&&<div className="v2-notice admin-category-warning"><strong>{pick('محصولات بدون دسته معتبر: ','Products without a valid category: ')}{invalidProducts.length}</strong><p>{pick('برای محصولات دلخواه دسته را از فرم انتخاب کنید. ترمیم خودکار فقط برای نمونه‌محصولات شناخته‌شده انجام می‌شود.','Assign custom products manually. Auto-repair only handles known starter products.')}</p><button type="button" className="v2-outline" disabled={busy} onClick={repairMissingProductCategories}>{pick('ترمیم ارتباط نمونه‌محصولات','Repair starter category links')}</button></div>}
 {filteredProducts.map(p=><div className="admin-linked-row" key={p.id}><button type="button" className="admin-entry admin-entry-media" onClick={()=>{if(p.id.startsWith('starter:')){const preview=starter?.products.find(x=>x.slug===p.slug);if(preview)editStarterProduct(preview);}else setPForm({...p,name_en:p.name_en||'',description_en:p.description_en||'',category_id:p.category_id||'',image_url:p.image_url||'',price_toman:String(p.price_toman??'')});document.getElementById('admin-product-editor')?.scrollIntoView({behavior:'smooth',block:'start'});}}><AdminArtworkPreview kind="product" slug={p.slug} name={p.name} url={p.image_url}/><div><strong>{p.name} {p.id.startsWith('starter:')&&<small className="admin-source-tag">{pick('نمونه سایت','Site preview')}</small>}</strong><span className="admin-product-category-path">{categoryPath(p.category_id)}</span><span>{p.mode==='fixed'?`${pick("قیمت ثابت","Fixed price")}: ${p.price_toman} ${pick("تومان","Toman")}`:pick('استعلام','Quote')} | {p.active?pick('منتشر','Published'):pick('غیرفعال','Inactive')}</span><span>{pick('ویرایش تصویر، جزئیات و قیمت','Edit image, details and pricing')}</span></div></button><button type="button" className="v2-outline admin-linked-row-action" disabled={!p.category_id||!siteCats.some(c=>c.id===p.category_id)} onClick={()=>{if(p.category_id)editCategoryById(p.category_id)}}>{pick('ورود به دسته این محصول','Open product category')} <ArrowUpLeft size={15}/></button></div>)}{!filteredProducts.length&&<p className="v2-fine">{pick('برای این دسته هنوز محصول یا نمونه‌ای ثبت نشده است.','No products or sample designs in this category yet.')}</p>}</div></div>}
 {tab==='pages'&&<div className="admin-columns"><form className="admin-editor" onSubmit={savePage}><h2>{pick('مدیریت محتوای صفحات و سربرگ اصلی','Manage pages and homepage hero')}</h2><label>{pick('صفحه','Page')}<select value={pageForm.slug} onChange={e=>{const p=pages.find(x=>x.slug===e.target.value);setPageForm(p||{slug:e.target.value,title:'',body:'',title_en:'',body_en:''})}}>{['home','about','contact','terms','privacy'].map(slug=><option value={slug} key={slug}>{pages.find(p=>p.slug===slug)?.title||slug}</option>)}</select></label><label>{pageForm.slug==='home'?pick('تیتر فارسی بخش آغازین','Hero headline (Persian)'):pick('عنوان فارسی صفحه','Persian page title')}<input required value={pageForm.title} onChange={e=>setPageForm(s=>({...s,title:e.target.value}))}/></label><label>{pick('عنوان انگلیسی صفحه یا بخش آغازین','English page title / Hero headline')}<input lang="en" dir="ltr" value={pageForm.title_en||''} onChange={e=>setPageForm(s=>({...s,title_en:e.target.value}))}/></label><label>{pageForm.slug==='home'?pick('توضیح فارسی بخش آغازین','Hero text (Persian)'):pick('محتوای فارسی صفحه','Persian page content')}<textarea className="admin-long" required value={pageForm.body} onChange={e=>setPageForm(s=>({...s,body:e.target.value}))}/></label><label>{pick('محتوای انگلیسی صفحه','English page text')}<textarea lang="en" dir="ltr" className="admin-long" value={pageForm.body_en||''} onChange={e=>setPageForm(s=>({...s,body_en:e.target.value}))}/></label><button className="v2-primary"><Save size={18}/> {pick('ذخیره و انتشار صفحه','Save and publish page')}</button></form><div className="admin-list"><h2>{pick('صفحات قابل مدیریت','Editable site pages')}</h2>{pages.map(p=><button className="admin-entry" key={p.slug} onClick={()=>setPageForm(p)}><strong>{p.title}</strong><span>{p.slug}</span></button>)}<p className="v2-fine">{pick('محتوا به‌صورت متن ساده ذخیره می‌شود؛ کد HTML اجرا نخواهد شد.','Content is saved as plain text. HTML code is not executed.')}</p></div></div>}
 {tab==='accounting'&&area==='commerce'&&<AccountingConsole/>}
 {tab==='carts'&&<div className="admin-columns"><form className="admin-editor" onSubmit={manualAction}><h2>{pick('ثبت سفارش برای مشتری','Create an order for a customer')}</h2><CustomerVisualPicker customers={customers} value={manual.user_id} onChange={id=>setManual(current=>({...current,user_id:id}))}/>
 <ProductVisualPicker products={manualProducts} value={manual.product_id} onChange={id=>{const product=manualProducts.find(p=>p.id===id);setManual(current=>({...current,product_id:id,action:product?.mode==='quote'||product?.source==='starter'?'quote':current.action}))}}/>
 <label>{pick('نوع اقدام','Action type')}
 <select value={manual.action} onChange={e=>setManual(prev=>({...prev,action:e.target.value}))}>
  <option value="cart">{pick('افزودن یا ویرایش سبد مشتری','Add or update customer cart')}</option>
  <option value="order">{pick('ثبت سفارش برای مشتری (قیمت ثابت)','Create fixed-price order')}</option>
  <option value="quote">{pick('ثبت درخواست استعلام به نام مشتری','Create customer quote request')}</option>
 </select></label><label>{pick('تعداد','Quantity')}<input type="number" min={1} max={100} value={manual.quantity} onChange={e=>setManual(s=>({...s,quantity:e.target.value}))}/></label><label>{pick('توضیح یا علت ویرایش','Notes or reason for change')}<textarea value={manual.note} onChange={e=>setManual(s=>({...s,note:e.target.value}))}/></label>
 {pickedProduct&&<div className="admin-editor-preview"><strong>{pick('پیش‌نمایش محصول انتخاب‌شده','Selected product preview')}</strong><AdminArtworkPreview kind="product" slug={pickedProduct.slug} name={pickedProduct.name} url={pickedProduct.image_url} large/><small>{pickedProduct.source==='starter'?pick('این یک نمونه‌طرح اولیه است و هنوز در محصولات دیتابیس ذخیره نشده است.','This starter design has not yet been saved as a database product.'):pick('محصول ثبت‌شده در فروشگاه','Saved store product')} • {pickedProduct.mode==='quote'?pick('نیازمند استعلام قیمت','Quote required'):Number(pickedProduct.price_toman).toLocaleString(locale==='fa'?'fa-IR':'en-US')+pick(' تومان',' Toman')}</small></div>}
 {manualProducts.length===0&&<p className="v2-notice" role="status">{pick('هیچ محصولی در این فهرست نیست. وضعیت اتصال دیتابیس را بررسی کنید یا در «مدیریت سایت ← محصولات» محصول جدید بسازید.','No products available. Check your database or create a product under Site management.')}</p>}
 {customers.length===0&&<p className="v2-notice" role="status">{pick('هنوز مشتری ثبت‌شده‌ای در دیتابیس پیدا نشد. مشتری ابتدا باید در سایت ثبت‌نام کند.','No customer accounts were found. A customer must register before you can select them.')}</p>}
 {manualProducts.length>0&&!hasFixedProducts&&<p className="v2-fine">{pick('در حال حاضر محصول قیمت‌دار برای سبد یا سفارش مستقیم وجود ندارد. نمونه‌طرح‌ها در فهرست قابل انتخاب‌اند و می‌توان برای آن‌ها استعلام ثبت کرد. برای خرید مستقیم، قیمت محصول را در بخش «مدیریت سایت ← محصولات» تعیین کنید.','There are no fixed-price products for direct carts or orders. Starter designs can be selected for quotes. Set a product price under Site management to enable direct ordering.')}</p>}
 {pickedProduct?.mode==='quote'&&manual.action!=='quote'&&<p className="v2-notice" role="alert">{pick('این محصول قیمت قطعی ندارد. «ثبت درخواست استعلام» را انتخاب کن، یا ابتدا آن را در بخش محصولات قیمت‌گذاری کن.','This product has no fixed price. Submit a quote request or set a price under Site management.')}</p>}
 <button className="v2-primary" disabled={busy||!manual.user_id||!pickedProduct||(pickedProduct.mode==='quote'&&manual.action!=='quote')}>{pick('ثبت تغییر برای مشتری','Save customer change')} <Plus size={18}/></button><p className="v2-fine">{pick('تغییرات سبد توسط مدیر در تاریخچه ثبت می‌شوند. لطفاً پیش از ثبت، اطلاعات مشتری را بررسی کنید.','Cart changes are recorded in the audit log. Verify the customer before saving.')}</p></form><div className="admin-list"><h2>{pick('سبدهای ثبت‌شده','Customer carts')}</h2>{carts.length===0&&<p className="v2-fine">{pick('هنوز سبدی از مشتریان ثبت نشده است. این بخش فقط اطلاعات واقعی کاربران را نشان می‌دهد.','No customer carts yet. This section shows real user records only.')}</p>}{carts.map(c=><div className="admin-cart" key={c.id}><div className="admin-customer-mini"><CustomerAvatar customer={customers.find(u=>u.id===c.user_id)||{display_name:'',email:''}} size="sm"/><strong>{customerName(c.user_id)}</strong></div>{c.cart_items.map(i=><div className="admin-cart-item" key={i.id}><span>{products.find(p=>p.id===i.product_id)?.name||i.product_id.slice(0,6)}</span><div><button title="کاهش" onClick={()=>changeCartItem(i.id,Math.max(0,i.quantity-1))}>−</button>{i.quantity}<button title="افزایش" onClick={()=>changeCartItem(i.id,Math.min(100,i.quantity+1))}>+</button><button title="حذف" onClick={()=>changeCartItem(i.id,0)}>{pick('حذف','Remove')}</button></div></div>)}</div>)}</div></div>}
 {tab==='orders'&&<div className="admin-list admin-wide"><h2>{pick('سفارش‌های ثبت‌شده','Orders')}</h2>{orders.length===0&&<p className="v2-fine">{pick('هنوز سفارش واقعی ثبت نشده است. سفارش نمایشی ساخته نمی‌شود.','No real orders found. No fake orders are generated.')}</p>}{orders.map(o=><div className="admin-order admin-order-expanded" key={o.id}><div className="admin-order-summary"><div><strong>{customerName(o.user_id)}</strong><small>#{o.id.slice(0,8)} • {o.total_toman.toLocaleString(locale==='fa'?'fa-IR':'en-US')} {pick('تومان','Toman')}</small></div><label>{pick('وضعیت سفارش','Order status')}<select value={orderStatusLabel(o.status,locale)} onChange={e=>changeOrderStatus(o.id,e.target.value)}>{['pending_review','awaiting_payment','in_production','ready','completed','cancelled'].map(s=><option key={s} value={s}>{orderStatusLabel(s,locale)}</option>)}</select></label></div><details><summary>{pick('مشاهده اقلام سفارش','View order items')} ({o.order_items?.length||0})</summary>{o.order_items?.map(i=><div className="admin-order-line" key={i.id}><strong>{i.title}</strong><span>{i.quantity} {pick('عدد','units')} × {i.unit_price_toman.toLocaleString(locale==='fa'?'fa-IR':'en-US')} {pick('تومان','Toman')}</span>{i.notes&&<small>{i.notes}</small>}</div>)}</details><form onSubmit={e=>{e.preventDefault();const field=new FormData(e.currentTarget);void changeOrderNote(o.id,String(field.get('note')||''))}}><label>{pick('یادداشت داخلی مدیریت','Internal admin note')}<textarea name="note" key={o.id+o.admin_note} defaultValue={o.admin_note||''} maxLength={2000} placeholder={pick("یادداشت مربوط به بررسی یا رسیدگی سفارش","Notes about order review or handling")}/></label><button type="submit" className="v2-outline" disabled={busy}>{pick('ثبت یادداشت','Save note')}</button></form></div>)}</div>}
 {tab==='quotes'&&<div className="admin-list admin-wide"><h2>{pick('درخواست‌های استعلام','Quote requests')}</h2>{quotes.map(q=><div className="admin-quote" key={q.id}><div><strong>{q.title} | {customerName(q.user_id)}</strong><p>{q.details}</p></div><select value={quoteStatusLabel(q.status,locale)} onChange={e=>changeQuote(q,'status',e.target.value)}>{['new','contacted','quoted','accepted','cancelled'].map(s=><option key={s} value={s}>{s}</option>)}</select><label>{pick('پاسخ پشتیبانی','Support response')}<input defaultValue={q.response} onBlur={e=>{if(q.response!==e.target.value)void changeQuote(q,'response',e.target.value)}}/></label></div>)}</div>}
 {tab==='customers'&&<div className="admin-list admin-wide"><h2>{pick('مشتریان و حساب‌ها','Customers and accounts')}</h2>{customers.length===0&&<p className="v2-fine">{pick('هنوز مشتری ثبت‌شده در این پایگاه داده وجود ندارد.','No customer records were found in this database.')}</p>}{customers.map(u=><div key={u.id} className="admin-order"><div className="admin-customer-mini"><CustomerAvatar customer={u}/><div><strong>{u.display_name||pick('بدون نام','Unnamed customer')}</strong><small dir="ltr">{u.email}</small></div></div><span>{u.role==='admin'?pick('مدیر','Admin'):pick('مشتری','Customer')}</span></div>)}</div>}
 <div className="admin-footnote"><Link href="/" className="v2-subtle" >{pick('مشاهده سایت','View website')} <ArrowUpLeft size={15}/></Link><span >{pick('عملیات مدیریت فقط پس از ورود با رمز مدیر، در سرور و با کلید خصوصی انجام می‌شود.','Admin operations require an authorized session and are executed securely on the server.')}</span></div></div></div>}
