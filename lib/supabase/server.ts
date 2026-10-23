import 'server-only';
import {createServerClient} from '@supabase/ssr';
import {cookies} from 'next/headers';
export async function serverDb(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!key)return null;
 const store=await cookies();
 return createServerClient(url,key,{cookies:{
  getAll(){return store.getAll()},
  setAll(items:Array<{name:string;value:string;options?:any}>){try{items.forEach(({name,value,options})=>store.set(name,value,options))}catch{/* Server Component read-only cookie store: handled by proxy. */}}
 }});
}
export async function currentCustomer(){const db=await serverDb();if(!db)return {db:null,user:null,profile:null};
 const {data:{user},error}=await db.auth.getUser();if(error||!user)return {db,user:null,profile:null};
 const {data:profile}=await db.from('profiles').select('id,display_name,role').eq('id',user.id).maybeSingle();
 return {db,user,profile};
}
