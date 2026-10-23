import {NextResponse} from 'next/server';import {currentCustomer} from '@/lib/supabase/server';
export async function POST(req:Request){const {db,user}=await currentCustomer();if(!db)return NextResponse.json({error:'دیتابیس تنظیم نشده است.'},{status:503});if(!user)return NextResponse.json({error:'ورود لازم است.'},{status:401});
 try{const body=await req.json();const productId=String(body.productId||''),qty=Number(body.quantity),notes=String(body.notes||'').slice(0,2000);
 if(!/^[a-f\d-]{36}$/i.test(productId)||!Number.isInteger(qty)||qty<1||qty>100)return NextResponse.json({error:'مشخصات محصول معتبر نیست.'},{status:400});
 const {data:product}=await db.from('products').select('id,mode,price_toman,active').eq('id',productId).eq('active',true).maybeSingle();if(!product||product.mode!=='fixed'||product.price_toman===null)return NextResponse.json({error:'این محصول قیمت قطعی و فعال ندارد.'},{status:400});
 const {data:cart,error:ce}=await db.from('carts').upsert({user_id:user.id},{onConflict:'user_id'}).select('id').single();if(ce||!cart)return NextResponse.json({error:'خطا در ساخت سبد.'},{status:500});
 const {error}=await db.from('cart_items').upsert({cart_id:cart.id,product_id:product.id,quantity:qty,notes},{onConflict:'cart_id,product_id'});
 if(error)return NextResponse.json({error:'خطای ثبت در سبد.'},{status:500});return NextResponse.json({ok:true});
 }catch{return NextResponse.json({error:'درخواست نامعتبر است.'},{status:400})}}
