import {NextRequest} from 'next/server';
import {authClient,limited,reply,trusted} from '@/lib/customer-auth-server';
import {verifyCheck} from '@/lib/customer-human-check';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!trusted(req))return reply({error:'INVALID_ORIGIN'},403);
 if(Number(req.headers.get('content-length')||0)>3000)return reply({error:'INVALID_REQUEST'},413);
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return reply({error:'INVALID_REQUEST'},400)}
 const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
 const password=typeof body.password==='string'?body.password:'';
 const name=typeof body.name==='string'?body.name.trim():'';
 if(!/^\S+@\S+\.\S+$/.test(email)||email.length>254||password.length<8||password.length>128||name.length<2||name.length>100)return reply({error:'INVALID_REQUEST'},400);
 if(!verifyCheck(body.checkToken,body.checkAnswer))return reply({error:'CHECK_FAILED'},400);
 if(limited(req,'signup:'+email))return reply({error:'RATE_LIMITED'},429);
 const response=reply({ok:true});
 const db=authClient(req,response);
 if(!db)return reply({error:'AUTH_NOT_CONFIGURED'},503);
 const {data,error}=await db.auth.signUp({email,password,options:{data:{display_name:name}}});
 if(error)return reply({error:error.status===429?'RATE_LIMITED':'SIGNUP_FAILED'},error.status===429?429:400);
 if(data.session&&data.user){
  // Supabase is currently configured to autoconfirm emails. Do not claim the user
  // verified mailbox ownership. Their session is returned via HttpOnly SSR cookies.
  return replyWithCookies(response,{ok:true,mode:'signed_in',emailVerified:false});
 }
 // If confirmed email is required, the user needs the actual Supabase email OTP.
 // A displayed on-screen number is only a human-check and cannot verify email ownership.
 return reply({ok:true,mode:'verify_email'});
}
function replyWithCookies(response:ReturnType<typeof reply>,body:unknown){
 const result=reply(body);
 response.cookies.getAll().forEach(c=>result.cookies.set(c.name,c.value,c));
 return result;
}
