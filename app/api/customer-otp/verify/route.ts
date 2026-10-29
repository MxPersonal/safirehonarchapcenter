import {NextRequest,NextResponse} from 'next/server';
import {callOtpy,createPhoneProof,normalizedPhone,OTP_PROOF_COOKIE,validOrigin} from '@/lib/otpy-server';
export const runtime='nodejs';
const reply=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:NextRequest){
 if(!validOrigin(request))return reply({error:'INVALID_ORIGIN'},403);
 if(Number(request.headers.get('content-length')||0)>1024)return reply({error:'INVALID_REQUEST'},413);
 let body:unknown;
 try{body=await request.json()}catch{return reply({error:'INVALID_REQUEST'},400)}
 const value=body as {phone?:unknown;code?:unknown}|null;
 const phone=normalizedPhone(value?.phone),code=value?.code;
 if(!phone||typeof code!=='string'||!/^\d{4,8}$/.test(code))return reply({error:'INVALID_REQUEST'},400);
 if(!process.env.OTPY_API_KEY)return reply({error:'OTPY_NOT_CONFIGURED'},503);
 try{
  const result=await callOtpy('verify',{phone,code});
  if(result.verified!==true)return reply({verified:false},400);
  const response=reply({verified:true});
  response.cookies.set(OTP_PROOF_COOKIE,createPhoneProof(phone),{
   httpOnly:true,secure:process.env.NODE_ENV==='production',sameSite:'lax',path:'/',maxAge:600,
  });
  return response;
 }catch{return reply({error:'OTP_VERIFY_FAILED'},502)}
}
