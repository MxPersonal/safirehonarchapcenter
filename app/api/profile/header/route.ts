import {NextResponse} from 'next/server';
import {currentCustomer} from '@/lib/supabase/server';
import {signedCustomerAvatar} from '@/lib/avatar';
export const dynamic='force-dynamic';
export async function GET(){
 const {db,user,profile}=await currentCustomer();
 if(!db||!user)return NextResponse.json({authenticated:false},{headers:{'Cache-Control':'private,no-store'}});
 const {data}=await db.from('profiles').select('avatar_path').eq('id',user.id).maybeSingle();
 const avatarUrl=await signedCustomerAvatar(user.id,data?.avatar_path);
 const {data:details}=await db.from('customer_details').select('first_name,last_name').eq('id',user.id).maybeSingle();
 const fullName=[details?.first_name,details?.last_name].filter(Boolean).join(' ');
 return NextResponse.json({authenticated:true,avatarUrl:avatarUrl||null,
  name:fullName||profile?.display_name||String(user.user_metadata?.display_name||'')||user.email||''},
  {headers:{'Cache-Control':'private,no-store'}});
}
