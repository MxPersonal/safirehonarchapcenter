import {NextRequest,NextResponse} from 'next/server';
import {callOtpy,normalizedPhone,throttle,validOrigin} from '@/lib/otpy-server';
export const runtime='nodejs';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:NextRequest){
 if(!validOrigin(request))return reply({error:'INVALID_ORIGIN'},403);
 if(Number(request.headers.get('content-length')||0)>1024)return reply({error:'INVALID_REQUEST'},413);
 let body:unknown;
 try{body=await request.json()}catch{return reply({error:'INVALID_REQUEST'},400)}
 const phone=normalizedPhone((body as {phone?:unknown})?.phone);
 if(!phone)return reply({error:'INVALID_PHONE'},400);
 if(!process.env.OTPY_API_KEY)return reply({error:'OTPY_NOT_CONFIGURED'},503);
 if(!throttle(request,phone))return reply({error:'RATE_LIMITED'},429);
 try{
  const result=await callOtpy('send',{phone});
  return reply({ok:true,ttlSeconds:result.ttl_seconds||null});
 }catch(error){
  const status=typeof error==='object'&&error!==null&&'status' in error?Number(error.status):0;
  return reply({error:status===429?'RATE_LIMITED':'OTP_SEND_FAILED'},status===429?429:502);
 }
}
