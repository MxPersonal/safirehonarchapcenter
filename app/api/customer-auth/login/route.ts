import {NextRequest} from 'next/server';
import {authClient,emailForIdentifier,limited,reply,trusted} from '@/lib/customer-auth-server';
import {verifyCheck} from '@/lib/customer-human-check';
export const runtime='nodejs';
export async function POST(req:NextRequest){
 if(!trusted(req))return reply({error:'INVALID_ORIGIN'},403);
 if(Number(req.headers.get('content-length')||0)>2200)return reply({error:'INVALID_REQUEST'},413);
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return reply({error:'INVALID_REQUEST'},400)}
 const identifier=typeof body?.identifier==='string'?body.identifier.trim():'';
 const password=typeof body?.password==='string'?body.password:'';
 if(!identifier||identifier.length>254||!password||password.length>128)return reply({error:'INVALID_REQUEST'},400);
 if(!verifyCheck(body.checkToken,body.checkAnswer))return reply({error:'CHECK_FAILED'},400);
 if(limited(req,identifier))return reply({error:'RATE_LIMITED'},429);
 const response=reply({ok:true});
 const db=authClient(req,response);
 if(!db)return reply({error:'AUTH_NOT_CONFIGURED'},503);
 let email:string|null=null;
 try{email=await emailForIdentifier(identifier)}catch{return reply({error:'INVALID_CREDENTIALS'},401)}
 if(!email)return reply({error:'INVALID_CREDENTIALS'},401);
 const {error}=await db.auth.signInWithPassword({email,password});
 if(error)return reply({error:'INVALID_CREDENTIALS'},401);
 return response;
}
