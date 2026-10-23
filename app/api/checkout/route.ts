import {NextResponse} from 'next/server';import {currentCustomer} from '@/lib/supabase/server';
export async function POST(req:Request){const {db,user}=await currentCustomer();if(!db)return NextResponse.json({error:'دیتابیس تنظیم نشده است.'},{status:503});if(!user)return NextResponse.json({error:'ورود لازم است.'},{status:401});
 const b=await req.json().catch(()=>({}));const {data,error}=await db.rpc('checkout_fixed_cart',{p_note:String(b.note||'').slice(0,2000)});if(error)return NextResponse.json({error:'سبد معتبر نیست یا امکان ثبت آن وجود ندارد.'},{status:400});return NextResponse.json({ok:true,orderId:data,status:'pending_review'});
}
