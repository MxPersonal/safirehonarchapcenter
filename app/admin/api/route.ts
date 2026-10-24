import {NextRequest, NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {revalidatePath} from 'next/cache';
import {validAdminSession} from '@/lib/admin/credentials';
import {adminDatabase} from '@/lib/admin/server-db';
import {starterCategories,starterProducts,starterPages} from '@/lib/starter-content';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SLUG = /^[a-z0-9][a-z0-9-]{1,79}$/;
const pages = ['home','about','contact','terms','privacy'];
const themes = ['coral','ink','gold','teal','violet','cobalt'];
const orderStates = ['pending_review','awaiting_payment','in_production','ready','completed','cancelled'];
const quoteStates = ['new','contacted','quoted','accepted','cancelled'];
const s=(value:unknown,max=500)=>typeof value==='string'?value.trim().slice(0,max):'';
const uuid=(value:unknown)=>typeof value==='string'&&UUID.test(value);
const bool=(value:unknown)=>value===true;
const int=(value:unknown,min:number,max:number)=>Number.isInteger(Number(value))&&Number(value)>=min&&Number(value)<=max ? Number(value) : null;
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store'}});
function safeError(err:{code?:string;message?:string}|null|undefined){
 if (!err) return null;
 if (err.code==='42P01'||err.code==='PGRST205'||err.code==='42703') return 'ساختار دیتابیس کامل نیست؛ Migration فروشگاه و سلسله‌مراتب دسته‌ها را در Supabase اجرا کنید.';
 return err.message||'خطای دیتابیس';
}
async function allowed(){return validAdminSession()}
async function queryAll(){
 const starter={categories:starterCategories,products:starterProducts,pages:starterPages};
 const db=adminDatabase();if(!db)return {categories:[],products:[],manualProducts:starterProducts.map(p=>({...p,id:'starter:'+p.slug,source:'starter' as const})),pages:[],customers:[],carts:[],orders:[],quotes:[],starter,warnings:['اتصال مدیریتی دیتابیس آماده نیست؛ محتواهای فعلی سایت را می‌بینید، ولی برای ذخیره باید اتصال خصوصی Supabase کامل شود.']};
 const jobs = [
  db.from('categories').select('*').order('sort_order').limit(500),
  db.from('products').select('*').order('created_at',{ascending:false}).limit(500),
  db.from('site_pages').select('slug,title,body').limit(20),
  db.from('profiles').select('id,display_name,email,role').limit(500),
  db.from('carts').select('id,user_id,cart_items(id,product_id,quantity,notes)').limit(500),
  db.from('orders').select('id,user_id,status,total_toman,admin_note,created_at,order_items(id,title,quantity,unit_price_toman,notes)').order('created_at',{ascending:false}).limit(500),
  db.from('quotes').select('id,user_id,title,details,status,response').order('created_at',{ascending:false}).limit(500),
 ];
 const data=await Promise.all(jobs);
 const keys=['categories','products','pages','customers','carts','orders','quotes'] as const;
 const out:Record<string,unknown>={};const warnings:string[]=[];
 keys.forEach((key,i)=>{out[key]=data[i].data||[];if(data[i].error)warnings.push(`${key}: ${safeError(data[i].error)}`)});
 // The public site initially renders eight built-in examples from source code.
 // Present those examples in manual order forms until they have been imported.
 // Database rows always win by slug, including inactive rows: never resurrect a hidden product.
 const catalogRows=(out.products||[]) as Array<{id:string;slug:string;name:string;mode:'fixed'|'quote';price_toman:number|null;active:boolean;image_url:string|null}>;
 const knownSlugs=new Set(catalogRows.map(p=>p.slug));
 const manualProducts=[
  ...catalogRows.filter(p=>p.active).map(p=>({...p,source:'database' as const})),
  ...starterProducts.filter(p=>!knownSlugs.has(p.slug)).map(p=>({...p,id:'starter:'+p.slug,source:'starter' as const}))
 ];
 return {...out,manualProducts,warnings,starter};
}
export async function GET(){
 if(!await allowed())return json({error:'ورود مدیریت معتبر نیست'},401);
 try {const data=await queryAll();return json(data)} catch {return json({error:'ارتباط دیتابیس برقرار نشد. اتصال Supabase را بررسی کنید.'},503)}
}

async function upload(req:NextRequest){
 const db=adminDatabase();if(!db)return json({error:'کلید مدیریت پایگاه داده تنظیم نشده است.'},503);
 const data=await req.formData();const file=data.get('file');
 if(!(file instanceof File)||file.size<1||file.size>5*1024*1024)return json({error:'فایل باید بین ۱ بایت و ۵ مگابایت باشد.'},400);
 const allowedTypes=['image/png','image/jpeg','image/webp'];
 if(!allowedTypes.includes(file.type))return json({error:'فرمت فایل باید PNG یا JPG یا WebP باشد.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());
 const png=bytes[0]===137&&bytes[1]===80&&bytes[2]===78&&bytes[3]===71;
 const jpg=bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 const webp=bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 if(!(file.type==='image/png'&&png||file.type==='image/jpeg'&&jpg||file.type==='image/webp'&&webp))return json({error:'ساختار فایل با نوع تصویر مطابقت ندارد.'},400);
 const ext=file.type==='image/png'?'png':file.type==='image/jpeg'?'jpg':'webp';
 const path=`admin/${randomUUID()}.${ext}`;
 const {error}=await db.storage.from('public-catalog').upload(path,bytes,{contentType:file.type,upsert:false});
 if(error)return json({error:safeError(error)},400);
 return json({url:db.storage.from('public-catalog').getPublicUrl(path).data.publicUrl});
}


/** Import originals without ever overwriting user-created categories, products, images, prices or pages.
 * Failures are reported per record. Phases are dependency-ordered and batched to limit latency. */
async function importCurrentSite(){
 const db=adminDatabase();if(!db)return json({error:'کلید مدیریت Supabase تنظیم نشده است.'},503);
 const checks=await Promise.all([
  db.from('categories').select('id,slug,parent_id').limit(1),
  db.from('products').select('id,slug,category_id').limit(1),
  db.from('site_pages').select('slug,title,body').limit(1)
 ]);
 const names=['دسته‌بندی‌ها','محصولات','صفحات'];
 const broken=checks.findIndex(c=>c.error);
 if(broken>=0)return json({error:'ساختار '+names[broken]+' ناقص است: '+safeError(checks[broken].error)+'. ابتدا Migration را در پایگاه داده همین سایت اجرا کنید.'},409);
 const existing=await Promise.all([db.from('categories').select('id,slug'),db.from('products').select('slug'),db.from('site_pages').select('slug')]);
 if(existing.some(x=>x.error))return json({error:'خواندن فهرست محتوای فعلی دیتابیس با خطا روبه‌رو شد.'},409);
 const bySlug=new Map((existing[0].data||[]).map(c=>[c.slug,c.id]));
 const productSlugs=new Set((existing[1].data||[]).map(p=>p.slug));
 const pageSlugs=new Set((existing[2].data||[]).map(p=>p.slug));
 const progress={categories:{added:0,existing:0,failed:0},products:{added:0,existing:0,failed:0},pages:{added:0,existing:0,failed:0}};
 const failed:Array<{kind:string;slug:string;reason:string}>=[];
 const batch=async <T,>(items:T[],fn:(item:T)=>Promise<void>)=>{for(let i=0;i<items.length;i+=5)await Promise.all(items.slice(i,i+5).map(fn))};
 const roots=starterCategories.filter(c=>!c.parent_slug),children=starterCategories.filter(c=>c.parent_slug);
 for(const phase of [roots,children]) await batch(phase,async c=>{
   if(bySlug.has(c.slug)){progress.categories.existing++;return;}
   const parent_id=c.parent_slug?bySlug.get(c.parent_slug):null;
   if(c.parent_slug&&!parent_id){progress.categories.failed++;failed.push({kind:'دسته',slug:c.slug,reason:'دسته والد یافت نشد: '+c.parent_slug});return;}
   const {parent_slug,...row}=c;
   const out=await db.from('categories').upsert({...row,parent_id},{onConflict:'slug',ignoreDuplicates:true}).select('id,slug').maybeSingle();
   if(out.error){progress.categories.failed++;failed.push({kind:'دسته',slug:c.slug,reason:safeError(out.error)||'خطای نامشخص'});return;}
   if(out.data){bySlug.set(c.slug,out.data.id);progress.categories.added++;}
   else{const check=await db.from('categories').select('id').eq('slug',c.slug).maybeSingle();
    if(check.data){bySlug.set(c.slug,check.data.id);progress.categories.existing++;}
    else{progress.categories.failed++;failed.push({kind:'دسته',slug:c.slug,reason:safeError(check.error)||'بعد از ذخیره پیدا نشد'});}
   }
 });
 await batch(starterProducts,async p=>{
  if(productSlugs.has(p.slug)){progress.products.existing++;return;}
  const category_id=bySlug.get(p.category_slug);
  if(!category_id){progress.products.failed++;failed.push({kind:'محصول',slug:p.slug,reason:'دسته محصول هنوز ثبت نشده است: '+p.category_slug});return;}
  const {category_slug,showcase_code,sort_order,...row}=p;
  const out=await db.from('products').upsert({...row,category_id,description:showcase_code+' | '+row.description},{onConflict:'slug',ignoreDuplicates:true}).select('slug').maybeSingle();
  if(out.error){progress.products.failed++;failed.push({kind:'محصول',slug:p.slug,reason:safeError(out.error)||'خطای نامشخص'});return;}
  progress.products[out.data?'added':'existing']++;
 });
 await batch(starterPages.filter(p=>p.slug!=='home'),async p=>{
  if(pageSlugs.has(p.slug)){progress.pages.existing++;return;}
  const out=await db.from('site_pages').upsert(p,{onConflict:'slug',ignoreDuplicates:true}).select('slug').maybeSingle();
  if(out.error){progress.pages.failed++;failed.push({kind:'صفحه',slug:p.slug,reason:safeError(out.error)||'خطای نامشخص'});return;}
  progress.pages[out.data?'added':'existing']++;
 });
 revalidatePath('/');revalidatePath('/catalog');revalidatePath('/designs');revalidatePath('/services');
 for(const p of starterPages)revalidatePath('/'+p.slug);
 return json({ok:failed.length===0,partial:failed.length>0,progress,failed,summary:failed.length?
   'همگام‌سازی ناقص است؛ علت خطای هر مورد در گزارش زیر مشخص شده و تغییرات قبلی حفظ شده‌اند.':
   'محتوای باقی‌مانده همگام شد؛ محتوای قبلی، عکس‌ها و قیمت‌ها تغییر نکردند.'});
}

export async function POST(req:NextRequest){
 if(!await allowed())return json({error:'ابتدا با حساب مدیریت وارد شوید.'},401);
 const origin=req.headers.get('origin');if(!origin||origin!==new URL(req.url).origin)return json({error:'درخواست خارج از سایت مجاز نیست.'},403);
 const length=Number(req.headers.get('content-length')||0);
 if(length>6*1024*1024)return json({error:'حجم درخواست بیش از حد مجاز است.'},413);
 if(req.headers.get('content-type')?.startsWith('multipart/form-data'))return upload(req);
 if(length>65536)return json({error:'درخواست بیش از حد بزرگ است.'},413);
 let payload:Record<string,unknown>;
 try {payload=await req.json();} catch {return json({error:'فرمت درخواست معتبر نیست.'},400)}
 const db=adminDatabase();if(!db)return json({error:'کلید اتصال اختصاصی Supabase در سرور تنظیم نشده است.'},503);
 const action=s(payload.action,40);
 if(action==='importCurrentSite')return importCurrentSite();
 const value=payload.value && typeof payload.value==='object'&&!Array.isArray(payload.value)?payload.value as Record<string,unknown>:{};
 const id=s(payload.id,40);
 let error: {message:string;code?:string}|null=null;
 let changed:unknown=null;
 try {
  if(action==='saveCategory'){
   const slug=s(value.slug,80),name=s(value.name,160),parent_id=value.parent_id;
   if(!SLUG.test(slug)||!name||s(value.description,5000).length>5000||parent_id && !uuid(parent_id)||id && !uuid(id))return json({error:'اطلاعات دسته‌بندی نامعتبر است.'},400);
   const theme=s(value.theme,20);
   const row={slug,name,description:s(value.description,3000),theme:themes.includes(theme)?theme:'coral',image_url:s(value.image_url,2000)||null,parent_id:parent_id||null,sort_order:int(value.sort_order,-10000,10000)??0,active:bool(value.active)};
   const r=id?await db.from('categories').update(row).eq('id',id).select('id').single():await db.from('categories').insert(row).select('id').single();error=r.error;changed=r.data;
  }else if(action==='saveProduct'){
   const slug=s(value.slug,80),name=s(value.name,160),mode=s(value.mode,20),category_id=value.category_id;
   const price=mode==='fixed'?int(value.price_toman,0,1_000_000_000_000):null;
   if(!SLUG.test(slug)||!name||!uuid(category_id)||!['fixed','quote'].includes(mode)||mode==='fixed'&&price===null||id&&!uuid(id))return json({error:'نام، دسته‌بندی یا قیمت محصول صحیح نیست.'},400);
   const row={slug,name,description:s(value.description,6000),category_id,mode,price_toman:price,image_url:s(value.image_url,2000)||null,active:bool(value.active)};
   const r=id?await db.from('products').update(row).eq('id',id).select('id').single():await db.from('products').insert(row).select('id').single();error=r.error;changed=r.data;
  }else if(action==='savePage'){
   const slug=s(value.slug,30),title=s(value.title,160),body=s(value.body,20000);
   if(!pages.includes(slug)||!title||!body)return json({error:'عنوان یا محتوای صفحه معتبر نیست.'},400);
   const r=await db.from('site_pages').upsert({slug,title,body,updated_at:new Date().toISOString()},{onConflict:'slug'}).select('slug').single();error=r.error;changed=r.data;
  }else if(action==='cartItem'){
   if(!uuid(id))return json({error:'شناسه آیتم سبد نامعتبر است.'},400);
   const quantity=int(value.quantity,0,100);if(quantity===null)return json({error:'تعداد باید بین صفر تا صد باشد.'},400);
   const before=await db.from('cart_items').select('*,carts(user_id)').eq('id',id).single();
   if(before.error)return json({error:safeError(before.error)},400);
   const owner=(before.data?.carts as {user_id:string}|null)?.user_id;
   if(!owner)return json({error:'مالک سبد مشخص نیست.'},400);
   const r=quantity===0?await db.from('cart_items').delete().eq('id',id):await db.from('cart_items').update({quantity}).eq('id',id);error=r.error;
   if(!error){await db.from('audit_logs').insert({target_user_id:owner,entity:'cart_item',entity_id:id,action:quantity===0?'ADMIN_REMOVE':'ADMIN_UPDATE',before_data:before.data,after_data:{quantity,reason:s(value.reason,500)}});}
  }else if(action==='manual'){
   const user_id=s(value.user_id,40),reference=s(value.product_id,120),quantity=int(value.quantity,1,100),mode=s(value.mode,20),note=s(value.note,2000);
   const sample=reference.startsWith('starter:')?starterProducts.find(p=>p.slug===reference.slice(8)):undefined;
   if(!uuid(user_id)||quantity===null||!['cart','order','quote'].includes(mode)||!(uuid(reference)||sample))
    return json({error:'مشتری، محصول یا تعداد انتخاب‌شده معتبر نیست.'},400);
   const customer=await db.from('profiles').select('id').eq('id',user_id).maybeSingle();
   if(customer.error)return json({error:safeError(customer.error)},400);
   if(!customer.data)return json({error:'این مشتری هنوز در جدول حساب‌های سایت ثبت نشده است.'},400);
   if(sample){
    // Built-in showcase artwork is not a priced product and has no database product ID.
    // A quote can still be recorded under the customer without inventing a sale.
    if(mode!=='quote')return json({error:'این نمونه‌طرح قیمت قطعی ندارد. «ثبت استعلام» را انتخاب کنید یا ابتدا در مدیریت محصولات برای آن قیمت ثابت تعیین کنید.'},400);
    const result=await db.from('quotes').insert({user_id,product_id:null,title:sample.name,details:note||'درخواست نمونه‌طرح '+sample.slug+' توسط مدیریت ثبت شد.'}).select('id').single();
    error=result.error;changed=result.data;
   }else{
    const product_id=reference;
    const product=await db.from('products').select('id,name,mode,price_toman,active').eq('id',product_id).maybeSingle();
    if(product.error)return json({error:safeError(product.error)},400);
    if(!product.data?.active)return json({error:'محصول غیرفعال یا حذف شده است. فهرست محصولات را بازخوانی کنید.'},400);
    if(mode!=='quote'&&(product.data.mode!=='fixed'||product.data.price_toman===null))
     return json({error:'برای سبد خرید یا سفارش مستقیم فقط محصولات دارای قیمت قطعی مجازند. برای این محصول استعلام ثبت کنید.'},400);
    if(mode==='cart'){
     let cart=await db.from('carts').select('id').eq('user_id',user_id).maybeSingle();
     if(cart.error)return json({error:safeError(cart.error)},400);
     if(!cart.data){const c=await db.from('carts').insert({user_id}).select('id').single();if(c.error)return json({error:safeError(c.error)},400);cart=c;}
     const r=await db.from('cart_items').upsert({cart_id:cart.data!.id,product_id,quantity,notes:note},{onConflict:'cart_id,product_id'}).select('id').single();error=r.error;changed=r.data;
    }else if(mode==='quote'){
     const r=await db.from('quotes').insert({user_id,product_id,title:product.data.name,details:note||'ثبت‌شده توسط مدیریت'}).select('id').single();error=r.error;changed=r.data;
    }else{
     const total=product.data.price_toman!*quantity;
     if(!Number.isSafeInteger(total))return json({error:'مبلغ سفارش بیش از حد مجاز است.'},400);
     const r=await db.from('orders').insert({user_id,total_toman:total,admin_note:note}).select('id').single();
     if(r.error)return json({error:safeError(r.error)},400);
     const detail=await db.from('order_items').insert({order_id:r.data.id,product_id,title:product.data.name,unit_price_toman:product.data.price_toman,quantity,notes:note});
     if(detail.error)return json({error:'سفارش ساخته شد ولی ثبت اقلام شکست خورد؛ قبل از ارسال مجدد وضعیت سفارش را بررسی کنید.'},409);
     changed=r.data;
    }
   }
   if(!error)await db.from('audit_logs').insert({target_user_id:user_id,entity:mode,entity_id:(changed as {id?:string})?.id||reference,action:'ADMIN_CREATE',after_data:{product_reference:reference,quantity,reason:note}});
  }else if(action==='orderStatus'){
   if(!uuid(id)||!orderStates.includes(s(value.status,40)))return json({error:'شناسه یا وضعیت سفارش صحیح نیست.'},400);
   const r=await db.from('orders').update({status:value.status}).eq('id',id).select('user_id').single();error=r.error;changed=r.data;
   if(!error&&r.data)await db.from('audit_logs').insert({target_user_id:r.data.user_id,entity:'order',entity_id:id,action:'ADMIN_STATUS',after_data:{status:value.status}});
  }else if(action==='orderNote'){
   if(!uuid(id))return json({error:'شناسه سفارش نامعتبر است.'},400);
   const note=s(value.note,2000);
   const out=await db.from('orders').update({admin_note:note}).eq('id',id).select('user_id').single();error=out.error;changed=out.data;
   if(!error&&out.data)await db.from('audit_logs').insert({target_user_id:out.data.user_id,entity:'order',entity_id:id,action:'ADMIN_NOTE',after_data:{note}});
  }else if(action==='quote'){
   if(!uuid(id))return json({error:'شناسه درخواست نامعتبر است.'},400);
   const field=s(value.field,20);if(!['status','response'].includes(field))return json({error:'نوع ویرایش صحیح نیست.'},400);
   const update=field==='status'?{status:s(value.text,30)}:{response:s(value.text,5000)};
   if(field==='status'&&!quoteStates.includes(update.status||''))return json({error:'وضعیت درخواست نامعتبر است.'},400);
   const r=await db.from('quotes').update(update).eq('id',id).select('user_id').single();error=r.error;changed=r.data;
   if(!error&&r.data)await db.from('audit_logs').insert({target_user_id:r.data.user_id,entity:'quote',entity_id:id,action:'ADMIN_EDIT',after_data:update});
  } else return json({error:'عملیات مدیریت ناشناخته است.'},400);
  if(error)return json({error:safeError(error)},400);
  revalidatePath('/');revalidatePath('/catalog');revalidatePath('/about');revalidatePath('/contact');revalidatePath('/terms');revalidatePath('/privacy');
  return json({ok:true,data:changed});
 }catch{return json({error:'انجام عملیات ممکن نشد؛ تنظیمات دیتابیس و داده‌های ورودی را بررسی کنید.'},500)}
}
