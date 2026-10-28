import {NextRequest,NextResponse} from 'next/server';
import {revalidatePath} from 'next/cache';
import {validAdminSession} from '@/lib/admin/credentials';
import {adminDatabase} from '@/lib/admin/server-db';
import {SOCIAL_SLUG,parseSocialLinks} from '@/lib/social-links';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(value:unknown,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'no-store'}});
const dbError=(error:{code?:string;message?:string}|null|undefined,operation:'read'|'write')=>{
 const code=error?.code||'UNKNOWN';
 const action=operation==='read'?'خواندن':'ذخیره';
 if(['42P01','PGRST205','PGRST106'].includes(code))return {code,error:'جدول site_pages در دیتابیس متصل وجود ندارد یا در Data API قابل دسترسی نیست. ساختار دیتابیس را بررسی و Migration اصلاحی شبکه‌های اجتماعی را اجرا کنید.'};
 if(code==='42501')return {code,error:'مجوز دسترسی به جدول site_pages کافی نیست. مجوزهای service_role و RLS را بررسی کنید.'};
 if(code==='42703')return {code,error:'ستون‌های موردنیاز جدول site_pages کامل نیستند. Migration اولیه فروشگاه را بررسی کنید.'};
 return {code,error:`خطای ${action} تنظیمات شبکه‌های اجتماعی در دیتابیس (کد: ${code}). اتصال Supabase و مجوزها را بررسی کنید.`};
};

export async function GET(){
 if(!await validAdminSession())return respond({error:'نشست مدیریت منقضی شده است. دوباره وارد پنل مدیریت شوید.',code:'SESSION_EXPIRED'},401);
 const db=adminDatabase();
 if(!db)return respond({error:'اتصال خصوصی Supabase تنظیم نشده؛ در Vercel به SUPABASE_URL و SUPABASE_SECRET_KEY نیاز است.',code:'DB_NOT_CONFIGURED'},503);
 const {data,error}=await db.from('site_pages').select('body').eq('slug',SOCIAL_SLUG).maybeSingle();
 if(error){console.error('[socials/read] database error',error.code);return respond(dbError(error,'read'),503)}
 return respond({items:parseSocialLinks(data?.body)});
}
export async function PUT(req:NextRequest){
 if(!await validAdminSession())return respond({error:'دسترسی مدیر لازم است.'},401);
 const origin=req.headers.get('origin');
 if(!origin)return respond({error:'درخواست بدون مبدأ معتبر قابل قبول نیست.'},403);
 try{if(new URL(origin).host!==req.nextUrl.host)return respond({error:'مبدأ درخواست مجاز نیست.'},403)}
 catch{return respond({error:'مبدأ درخواست نامعتبر است.'},403)}
 const db=adminDatabase();
 if(!db)return respond({error:'اتصال مدیریتی دیتابیس تنظیم نشده است.'},503);
 const raw=await req.text();
 if(raw.length>24000)return respond({error:'فهرست بیش از حد بزرگ است.'},413);
 let payload:unknown;
 try{payload=JSON.parse(raw)}catch{return respond({error:'داده ارسالی معتبر نیست.'},400)}
 if(!payload||typeof payload!=='object'||!Array.isArray((payload as {items?:unknown}).items))return respond({error:'فهرست لینک‌ها معتبر نیست.'},400);
 const items=(payload as {items:unknown[]}).items;
 if(items.length>20)return respond({error:'حداکثر ۲۰ لینک قابل ثبت است.'},400);
 const validated=parseSocialLinks(items);
 if(validated.length!==items.length)return respond({error:'عنوان، URL، شناسه یا تصویر یکی از لینک‌ها نامعتبر یا تکراری است. آدرس را با https:// وارد کنید.'},400);
 const {error}=await db.from('site_pages').upsert({slug:SOCIAL_SLUG,title:'Social links',body:JSON.stringify(validated),updated_at:new Date().toISOString()},{onConflict:'slug'});
 if(error){console.error('[socials/write] database error',error.code);return respond(dbError(error,'write'),503)}
 revalidatePath('/', 'layout');
 return respond({ok:true,items:validated});
}
