import {NextRequest,NextResponse} from 'next/server';
import {createServerClient} from '@supabase/ssr';
import type {Locale} from '@/lib/i18n';

/** Real locale URLs (/fa and /en) wrap the existing page tree without
 * duplicating routes or exposing credentials to client code. */
export async function proxy(request:NextRequest){
 const pathname=request.nextUrl.pathname;
 const match=pathname.match(/^\/(fa|en)(?=\/|$)/);
 const cookie=request.cookies.get('safir_locale')?.value;
 const isSystem=pathname==='/api'||pathname.startsWith('/api/')||pathname==='/auth'||pathname.startsWith('/auth/');
 const isStatic=pathname.startsWith('/_next/')||pathname.startsWith('/.well-known/')||/\.[a-z0-9]{2,5}$/i.test(pathname);
 const locale:Locale=match?(match[1] as Locale):cookie==='en'?'en':'fa';
 if(!match&&!isSystem&&!isStatic&&locale==='en'&&(request.method==='GET'||request.method==='HEAD')){
  const dest=request.nextUrl.clone();dest.pathname='/en'+(pathname==='/'?'':pathname);
  return NextResponse.redirect(dest);
 }
 const headers=new Headers(request.headers);
 headers.set('x-safir-locale',locale);
 if(match)request.cookies.set('safir_locale',locale);
 const destination=request.nextUrl.clone();
 if(match)destination.pathname=pathname.slice(match[0].length)||'/';
 const makeResponse=()=>match?
  NextResponse.rewrite(destination,{request:{headers}}):
  NextResponse.next({request:{headers}});
 let response=makeResponse();
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 const protectedPage=destination.pathname.startsWith('/account')||destination.pathname.startsWith('/admin')||
  destination.pathname.startsWith('/api/')||destination.pathname.startsWith('/shop')||
  ['/order','/login','/register'].includes(destination.pathname)||destination.pathname.startsWith('/auth/');
 if(url&&key&&protectedPage){
  const client=createServerClient(url,key,{cookies:{
   getAll(){return request.cookies.getAll()},
   setAll(items:Array<{name:string;value:string;options?:any}>){
    items.forEach(({name,value})=>request.cookies.set(name,value));
    headers.set('cookie',request.cookies.toString());
    response=makeResponse();
    items.forEach(({name,value,options})=>response.cookies.set(name,value,options));
   }
  }});
  await client.auth.getClaims();
 }
 if(match)response.cookies.set('safir_locale',locale,{path:'/',httpOnly:false,sameSite:'lax',secure:process.env.NODE_ENV==='production',maxAge:60*60*24*365});
 return response;
}
export const config={matcher:['/((?!_next/|.*\\..*).*)']};
