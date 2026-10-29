import 'server-only';
import {createHmac} from 'node:crypto';
import {createServerClient} from '@supabase/ssr';
import {createClient} from '@supabase/supabase-js';
import {NextRequest,NextResponse} from 'next/server';

const attempts=new Map<string,{count:number,until:number}>();
export function reply(body:unknown,status=200){
 return NextResponse.json(body,{status,headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
}
export function trusted(request:NextRequest){
 const origin=request.headers.get('origin');
 return !!origin&&origin===request.nextUrl.origin;
}
export function limited(request:NextRequest,identity:string){
 const secret=process.env.AUTH0_SECRET||'safir-auth';
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 const key=createHmac('sha256',secret).update(ip+'|'+identity.toLowerCase()).digest('hex');
 const now=Date.now(),current=attempts.get(key);
 if(attempts.size>5000)for(const [k,v] of attempts)if(v.until<=now)attempts.delete(k);
 if(current?.until&&current.until>now&&current.count>=9)return true;
 attempts.set(key,{count:(current&&current.until>now?current.count:0)+1,until:current?.until&&current.until>now?current.until:now+15*60*1000});
 return false;
}
export function authClient(request:NextRequest,response:NextResponse){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 return createServerClient(url,key,{cookies:{
  getAll(){return request.cookies.getAll()},
  setAll(items){for(const {name,value,options} of items)response.cookies.set(name,value,options)}
 }});
}
function normalizePhone(input:string){
 let phone=input.trim().replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[\s()-]/g,'');
 if(phone.startsWith('+98'))phone='0'+phone.slice(3);
 else if(phone.startsWith('0098'))phone='0'+phone.slice(4);
 else if(phone.startsWith('98'))phone='0'+phone.slice(2);
 return /^09\d{9}$/.test(phone)?phone:null;
}
export async function emailForIdentifier(value:string):Promise<string|null>{
 if(value.includes('@'))return /^\S+@\S+\.\S+$/.test(value)&&value.length<=254?value.trim().toLowerCase():null;
 const mobile=normalizePhone(value);
 if(!mobile)return null;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!url||!secret)return null;
 const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 // A profile phone is only a login alias; it is NOT proof of phone ownership.
 // On duplicates, fail closed instead of choosing the wrong customer's identity.
 const variants=[mobile,'+98'+mobile.slice(1),'0098'+mobile.slice(1)];
 const {data,error}=await admin.from('customer_details').select('id').in('mobile',variants).limit(2);
 if(error||!data||data.length!==1)return null;
 const {data:userData,error:userError}=await admin.auth.admin.getUserById(data[0].id);
 if(userError||!userData.user?.email)return null;
 return userData.user.email;
}
