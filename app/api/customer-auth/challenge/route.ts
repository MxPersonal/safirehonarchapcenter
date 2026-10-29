import {NextResponse} from 'next/server';
import {issueCheck} from '@/lib/customer-human-check';
export const runtime='nodejs';
export async function GET(){
 try{
  return NextResponse.json(issueCheck(),{headers:{'Cache-Control':'no-store, private','X-Content-Type-Options':'nosniff'}});
 }catch{return NextResponse.json({error:'CHECK_UNAVAILABLE'},{status:503,headers:{'Cache-Control':'no-store'}})}
}
