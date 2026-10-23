import {NextRequest,NextResponse} from 'next/server';
import {serverDb} from '@/lib/supabase/server';
export async function GET(req:NextRequest){
 const db=await serverDb();if(!db)return NextResponse.redirect(new URL('/login?error=configuration',req.url));
 const token_hash=req.nextUrl.searchParams.get('token_hash');const code=req.nextUrl.searchParams.get('code');
 const type=req.nextUrl.searchParams.get('type');
 let error;
 if(token_hash&&type==='email'){const result=await db.auth.verifyOtp({token_hash,type:'email'});error=result.error}
 else if(code){const result=await db.auth.exchangeCodeForSession(code);error=result.error}
 else return NextResponse.redirect(new URL('/login?error=confirmation',req.url));
 if(error)return NextResponse.redirect(new URL('/login?error=confirmation',req.url));
 await db.auth.signOut({scope:'local'});
 return NextResponse.redirect(new URL('/login?verified=1',req.url));
}
