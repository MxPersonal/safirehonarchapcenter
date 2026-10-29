import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {normalizedPhone,OTP_PROOF_COOKIE,proofMatches,validOrigin} from '@/lib/otpy-server';
export const runtime='nodejs';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:NextRequest){
 if(!validOrigin(request))return reply({error:'INVALID_ORIGIN'},403);
 if(Number(request.headers.get('content-length')||0)>4096)return reply({error:'INVALID_REQUEST'},413);
 let value:unknown;
 try{value=await request.json()}catch{return reply({error:'INVALID_REQUEST'},400)}
 const body=value as {phone?:unknown;email?:unknown;password?:unknown;name?:unknown}|null;
 const phone=normalizedPhone(body?.phone);
 const email=typeof body?.email==='string'?body.email.trim().toLowerCase():'';
 const password=typeof body?.password==='string'?body.password:'';
 const name=typeof body?.name==='string'?body.name.trim():'';
 if(!phone||!/^\S+@\S+\.\S+$/.test(email)||email.length>254||
   password.length<8||password.length>128||name.length<2||name.length>100)return reply({error:'INVALID_REQUEST'},400);
 if(!proofMatches(request.cookies.get(OTP_PROOF_COOKIE)?.value,phone))return reply({error:'PHONE_VERIFICATION_REQUIRED'},403);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return reply({error:'AUTH_NOT_CONFIGURED'},503);
 const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
 const {data,error}=await db.auth.signUp({email,password,options:{data:{display_name:name,registration_phone:phone}}});
 if(error)return reply({error:error.message},error.status===429?429:400);
 if(data.session)return reply({error:'EMAIL_CONFIRMATION_REQUIRED_IN_SUPABASE'},409);
 const response=reply({ok:true});
 response.cookies.set(OTP_PROOF_COOKIE,'',{httpOnly:true,path:'/',maxAge:0});
 return response;
}
