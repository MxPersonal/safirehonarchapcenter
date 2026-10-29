import 'server-only';
import {createHmac,timingSafeEqual} from 'node:crypto';
import type {NextRequest} from 'next/server';

export const OTP_PROOF_COOKIE='safir_phone_proof';
const PROOF_LIFETIME_MS=10*60*1000;
const windowMs=60*1000;
// Best-effort per-instance throttling; provider limits and production edge rate
// limiting must also be used since serverless instances do not share memory.
const requests=new Map<string,number>();
export function normalizedPhone(value:unknown){
 if(typeof value!=='string')return null;
 const phone=value.trim().replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[\s-]/g,'');
 return /^09\d{9}$/.test(phone)?phone:null;
}
export function validOrigin(request:NextRequest){
 const origin=request.headers.get('origin');
 if(!origin)return false;
 try{return new URL(origin).origin===request.nextUrl.origin}catch{return false}
}
export function throttle(request:NextRequest,phone:string){
 const now=Date.now();
 if(requests.size>1500){for(const [key,time] of requests){if(now-time>windowMs)requests.delete(key)}}
 const ip=request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()||'unknown';
 const fingerprint=createHmac('sha256',process.env.OTPY_API_KEY||'rate-limit').update(ip+'|'+phone).digest('hex');
 const prior=requests.get(fingerprint)||0;
 if(now-prior<windowMs)return false;
 requests.set(fingerprint,now);return true;
}
function key(){const value=process.env.OTPY_API_KEY?.trim();if(!value)throw new Error('OTPY_UNCONFIGURED');return value}
export async function callOtpy(endpoint:'send'|'verify',payload:{phone:string;code?:string}){
 const response=await fetch('https://api.otpy.ir/v1/otp/'+endpoint,{
  method:'POST',headers:{Authorization:'Bearer '+key(),'Content-Type':'application/json'},
  body:JSON.stringify(payload),cache:'no-store',signal:AbortSignal.timeout(15000),
 });
 if(!response.ok){const error=new Error('OTPY_REQUEST_FAILED');Object.assign(error,{status:response.status});throw error}
 return await response.json() as {verified?:boolean;ttl_seconds?:number;request_id?:string};
}
function signature(payload:string){
 return createHmac('sha256',key()).update('safir-phone-proof:v1:'+payload).digest('base64url');
}
export function createPhoneProof(phone:string){
 const payload=phone+':'+String(Date.now()+PROOF_LIFETIME_MS);
 return Buffer.from(payload).toString('base64url')+'.'+signature(payload);
}
export function proofMatches(value:string|undefined,phone:string){
 if(!value||value.length>300)return false;
 const [encoded,sig,...rest]=value.split('.');
 if(!encoded||!sig||rest.length)return false;
 try{
  const payload=Buffer.from(encoded,'base64url').toString('utf8');
  const [savedPhone,expires]=payload.split(':');
  const expected=Buffer.from(signature(payload));
  const received=Buffer.from(sig);
  return expected.length===received.length&&timingSafeEqual(expected,received)&&
   savedPhone===phone&&/^\d{13}$/.test(expires||'')&&
   Date.now()<Number(expires)&&Number(expires)-Date.now()<=PROOF_LIFETIME_MS;
 }catch{return false}
}
