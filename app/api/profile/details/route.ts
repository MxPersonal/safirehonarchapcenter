import {NextRequest,NextResponse} from 'next/server';
import {serverDb} from '@/lib/supabase/server';
export const runtime='nodejs';
export const dynamic='force-dynamic';
const respond=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
const fields=['first_name','last_name','mobile','landline','national_id','province','city','postal_code','address_line','map_url'] as const;
type Field=typeof fields[number];
const limits:Record<Field,number>={first_name:70,last_name:80,mobile:24,landline:24,national_id:10,province:80,city:80,postal_code:12,address_line:750,map_url:500};
function normalizeDigits(s:string){return s.replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632));}
function nationalIdValid(s:string){if(!/^\d{10}$/.test(s)||/^(\d)\1{9}$/.test(s))return false;
 const sum=s.slice(0,9).split('').reduce((v,d,i)=>v+Number(d)*(10-i),0);
 const remainder=sum%11;return Number(s[9])===(remainder<2?remainder:11-remainder);
}
function validMapLink(link:string){
 if(!link)return true;
 try{
  const u=new URL(link);
  const host=u.hostname.toLowerCase();
  return u.protocol==='https:'&&(
   host==='neshan.org'||host.endsWith('.neshan.org')||
   host==='google.com'||host.endsWith('.google.com')||host==='maps.app.goo.gl'||host==='goo.gl'
  );
 }catch{return false;}
}
async function authorized(){
 const db=await serverDb();
 if(!db)return {db:null,user:null};
 const {data,error}=await db.auth.getUser();
 return {db,user:error?null:data.user};
}
export async function GET(){
 const {db,user}=await authorized();
 if(!db||!user)return respond({error:'ابتدا وارد حساب شوید.'},401);
 const {data,error}=await db.from('customer_details').select(fields.join(',')).eq('id',user.id).maybeSingle();
 if(error)return respond({error:'جدول اطلاعات مشتری آماده نیست. Migration پروفایل را در دیتابیس همین سایت اعمال کنید.',setupRequired:true},503);
 return respond({ok:true,details:data||{}});
}
export async function POST(req:NextRequest){
 if(req.headers.get('origin')!==new URL(req.url).origin)return respond({error:'مبدأ درخواست نامعتبر است.'},403);
 if(Number(req.headers.get('content-length')||0)>5500)return respond({error:'حجم داده بیش از حد مجاز است.'},413);
 const {db,user}=await authorized();
 if(!db||!user)return respond({error:'ابتدا وارد حساب شوید.'},401);
 let input:Record<string,unknown>;
 try{input=await req.json()}catch{return respond({error:'اطلاعات نامعتبر است.'},400)}
 if(!input||typeof input!=='object'||Array.isArray(input))return respond({error:'ساختار اطلاعات نامعتبر است.'},400);
 const value={} as Record<Field,string>;
 for(const field of fields){
  const raw=input[field];
  if(typeof raw!=='string'||raw.length>limits[field]*3)return respond({error:'مقدار یکی از فیلدها نامعتبر است.'},400);
  const normalized=normalizeDigits(raw.trim());
  if(normalized.length>limits[field])return respond({error:'مقدار یکی از فیلدها طولانی است.'},400);
  value[field]=normalized;
 }
 if(value.national_id&&!nationalIdValid(value.national_id))return respond({error:'کد ملی معتبر نیست.'},400);
 if(value.mobile&&!/^[+0-9()\s-]{7,24}$/.test(value.mobile))return respond({error:'شماره همراه معتبر نیست.'},400);
 if(value.landline&&!/^[+0-9()\s-]{6,24}$/.test(value.landline))return respond({error:'شماره ثابت معتبر نیست.'},400);
 if(value.postal_code&&!/^\d{10}$/.test(value.postal_code))return respond({error:'کد پستی باید ده رقم باشد.'},400);
 if(!validMapLink(value.map_url))return respond({error:'لینک نقشه باید HTTPS و از Google Maps یا نشان باشد.'},400);
 const {error}=await db.from('customer_details').upsert({...value,id:user.id},{onConflict:'id'});
 if(error)return respond({error:'ذخیره اطلاعات انجام نشد. دسترسی RLS یا Migration پروفایل را بررسی کنید.',setupRequired:true},503);
 return respond({ok:true});
}
