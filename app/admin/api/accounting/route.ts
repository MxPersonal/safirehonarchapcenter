import {NextRequest, NextResponse} from 'next/server';
import {validAdminSession} from '@/lib/admin/credentials';
import {adminDatabase} from '@/lib/admin/server-db';
import {buildSummary, type FinanceEntry} from '@/lib/admin/accounting-core';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TYPES=['sale','other_income','expense','refund'] as const;
const METHODS=['cash','pos','transfer','gateway','other'] as const;
const EXPENSES=['materials','production','delivery','salary','rent','marketing','utilities','equipment','other_expense'] as const;
const PERIODS=['7d','30d','90d','365d','all'] as const;
type EntryType=typeof TYPES[number];
const json=(data:unknown,status=200)=>NextResponse.json(data,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
const text=(v:unknown,length=255)=>typeof v==='string'?v.trim().slice(0,length):'';
const isUuid=(v:unknown)=>typeof v==='string'&&UUID.test(v);
const fail=(message:string,status=400)=>json({error:message},status);
function dbError(code?:string){
 if(code==='42P01'||code==='PGRST205')return 'جدول حسابداری هنوز در Supabase ساخته نشده است. فایل Migration بخش حسابداری را اجرا کنید.';
 if(code==='42501')return 'دسترسی جدول حسابداری در Supabase درست تنظیم نشده است؛ مجوز service_role را بررسی کنید.';
 if(code==='23505')return 'این اصلاح قبلاً ثبت شده است و دوباره قابل اعمال نیست.';
 if(code==='23503')return 'سفارش انتخاب‌شده در دیتابیس وجود ندارد.';
 return 'عملیات پایگاه داده انجام نشد. ساختار جدول و اتصال Supabase را بررسی کنید.';
}
function fromPeriod(period:string,now:Date):string|null{
 if(period==='all')return null;
 const days=Number(period.replace('d',''));
 const from=new Date(now);from.setUTCDate(from.getUTCDate()-days);return from.toISOString();
}

export async function GET(req:NextRequest){
 if(!await validAdminSession())return fail('دسترسی مدیریت معتبر نیست.',401);
 const db=adminDatabase();if(!db)return fail('اتصال اختصاصی دیتابیس در Vercel کامل نیست.',503);
 const period=req.nextUrl.searchParams.get('period')||'30d';
 if(!PERIODS.includes(period as typeof PERIODS[number]))return fail('دوره گزارش نامعتبر است.');
 const from=fromPeriod(period,new Date());
 const columns='id,entry_type,category,amount_toman,order_id,occurred_at,payment_method,reference,note,reversal_of,created_at';
 const rows:FinanceEntry[]=[];const PAGE=1000,MAX=30000;
 try{
  for(let start=0;start<MAX;start+=PAGE){
   let q=db.from('finance_entries').select(columns);
   if(from)q=q.gte('occurred_at',from);
   const {data,error}=await q.order('occurred_at',{ascending:false}).order('id',{ascending:false}).range(start,start+PAGE-1);
   if(error)return fail(dbError(error.code),error.code==='42P01'||error.code==='PGRST205'?409:503);
   const batch=(data||[]) as FinanceEntry[];
   rows.push(...batch);
   if(batch.length<PAGE)break;
   if(rows.length===MAX)return fail('تعداد سندها زیاد است و گزارش بدون تجمیع سمت دیتابیس کامل نمی‌شود؛ از گزارش دوره کوتاه‌تر استفاده کنید.',413);
  }
  const {count:pending,error:orderError}=await db.from('orders').select('id',{count:'exact',head:true}).in('status',['pending_review','awaiting_payment']);
  const report=buildSummary(rows,period);
  return json({ok:true,period,count:rows.length,summary:report.totals,chart:report.chart,expenseBreakdown:report.expenses,
   recent:rows.slice(0,100),pendingOrders:orderError?null:pending,
   note:'گزارش نقدی بر مبنای دریافتی‌ها و هزینه‌های ثبت‌شده است؛ سفارش‌های فاقد وصول، درآمد محسوب نمی‌شوند. سود حسابداری رسمی و مالیات جداگانه محاسبه می‌شوند.'});
 }catch{return fail('محاسبه گزارش مالی ممکن نشد؛ داده‌های مالی یا اتصال سرور را بررسی کنید.',503)}
}

export async function POST(req:NextRequest){
 if(!await validAdminSession())return fail('دسترسی مدیریت معتبر نیست.',401);
 const origin=req.headers.get('origin');
 if(!origin||origin!==new URL(req.url).origin)return fail('درخواست خارج از سایت مجاز نیست.',403);
 const size=Number(req.headers.get('content-length')||0);
 if(size>8192)return fail('حجم اطلاعات مالی نامعتبر است.',413);
 const db=adminDatabase();if(!db)return fail('اتصال اختصاصی دیتابیس آماده نیست.',503);
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return fail('داده ارسال‌شده معتبر نیست.');}
 if(!body||typeof body!=='object'||Array.isArray(body))return fail('ساختار سند معتبر نیست.');
 if(body.action==='reverse'){
  const id=body.id;
  if(!isUuid(id)||text(body.reason,300).length<5)return fail('شناسه سند و علت اصلاح (حداقل پنج حرف) الزامی است.');
  const {data:original,error:loadError}=await db.from('finance_entries').select('*').eq('id',id).maybeSingle();
  if(loadError)return fail(dbError(loadError.code),503);
  if(!original||original.reversal_of)return fail('این سند قابل برگشت نیست.');
  const {data,error}=await db.from('finance_entries').insert({entry_type:original.entry_type,category:original.category,
   amount_toman:original.amount_toman,order_id:original.order_id,payment_method:original.payment_method,
   reference:`REV-${original.id.slice(0,8)}`,note:`اصلاح سند: ${text(body.reason,300)}`,
   reversal_of:original.id,occurred_at:new Date().toISOString()}).select('id').single();
  if(error)return fail(dbError(error.code),409);
  return json({ok:true,id:data?.id});
 }
 if(body.action!=='create')return fail('عملیات ناشناخته است.');
 const entry_type=text(body.entry_type,30),category=text(body.category,60),payment_method=text(body.payment_method,30);
 const amount=Number(body.amount_toman),order_id=body.order_id;
 if(!TYPES.includes(entry_type as EntryType)||!METHODS.includes(payment_method as typeof METHODS[number]))return fail('نوع تراکنش یا روش پرداخت صحیح نیست.');
 if(!Number.isSafeInteger(amount)||amount<1||amount>1_000_000_000_000)return fail('مبلغ باید یک عدد صحیح مثبت به تومان باشد.');
 if(entry_type==='expense'&&!EXPENSES.includes(category as typeof EXPENSES[number]))return fail('دسته هزینه معتبر نیست.');
 if(entry_type!=='expense'&&category!==entry_type)return fail('دسته تراکنش معتبر نیست.');
 if(order_id&&!isUuid(order_id))return fail('شناسه سفارش معتبر نیست.');
 const occurred_at=text(body.occurred_at,40),at=new Date(occurred_at);
 if(!occurred_at||Number.isNaN(at.valueOf())||at.valueOf()>Date.now()+86400000||at.valueOf()<new Date('2000-01-01').valueOf())return fail('تاریخ تراکنش معتبر نیست.');
 const {data,error}=await db.from('finance_entries').insert({entry_type,category,amount_toman:amount,order_id:order_id||null,
  occurred_at:at.toISOString(),payment_method,reference:text(body.reference,120),note:text(body.note,1500)}).select('id').single();
 if(error)return fail(dbError(error.code),409);
 return json({ok:true,id:data?.id});
}
