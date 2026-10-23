import {NextResponse} from 'next/server';import {currentCustomer} from '@/lib/supabase/server';
export async function POST(req:Request){const {db,user}=await currentCustomer();if(!db)return NextResponse.json({error:'دیتابیس تنظیم نشده است.'},{status:503});if(!user)return NextResponse.json({error:'ورود لازم است.'},{status:401});
 try{const b=await req.json(),title=String(b.title||'استعلام چاپ').trim().slice(0,120),details=String(b.details||'').trim().slice(0,2000),productId=b.productId?String(b.productId):null;
 if(title.length<2||details.length<5)return NextResponse.json({error:'مشخصات درخواست را کامل کنید.'},{status:400});
 if(productId){const {data:p}=await db.from('products').select('id,mode').eq('id',productId).eq('active',true).maybeSingle();if(!p||p.mode!=='quote')return NextResponse.json({error:'درخواست قیمت این محصول فعال نیست.'},{status:400})}
 const {data,error}=await db.from('quotes').insert({user_id:user.id,product_id:productId,title,details}).select('id').single();if(error)return NextResponse.json({error:'ثبت درخواست انجام نشد.'},{status:500});return NextResponse.json({ok:true,id:data.id})
 }catch{return NextResponse.json({error:'درخواست معتبر نیست.'},{status:400})}}
