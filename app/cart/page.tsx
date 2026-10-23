import {redirect} from 'next/navigation';
import {currentCustomer} from '@/lib/supabase/server';
export const dynamic='force-dynamic';
export default async function Cart(){const {db,user}=await currentCustomer();if(db&&!user)redirect('/login?next=/account');redirect('/account')}
