import {NextRequest,NextResponse} from 'next/server';
import {randomUUID} from 'node:crypto';
import {serverDb} from '@/lib/supabase/server';
import {adminDatabase} from '@/lib/admin/server-db';
import {AVATAR_BUCKET,belongsToUser,signedCustomerAvatar} from '@/lib/avatar';

export const runtime='nodejs';
export const dynamic='force-dynamic';
const response=(body:Record<string,unknown>,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'no-store'}});
const validOrigin=(req:NextRequest)=>{const o=req.headers.get('origin');return Boolean(o&&o===new URL(req.url).origin)};
async function session(){
 const auth=await serverDb();
 if(!auth)return null;
 const {data:{user},error}=await auth.auth.getUser();
 return error||!user?null:{user,auth};
}
function fileType(bytes:Uint8Array):'jpg'|'png'|'webp'|null{
 if(bytes.length>3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff)return 'jpg';
 if(bytes.length>8&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v))return 'png';
 if(bytes.length>12&&String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP')return 'webp';
 return null;
}
export async function POST(req:NextRequest){
 if(!validOrigin(req))return response({error:'درخواست از مبدأ نامعتبر ارسال شده است.'},403);
 const length=Number(req.headers.get('content-length')||0);
 if(length>3*1024*1024+16000)return response({error:'حجم فایل بیشتر از حد مجاز است.'},413);
 const state=await session();
 if(!state)return response({error:'ابتدا به حساب مشتری وارد شوید.'},401);
 const admin=adminDatabase();
 if(!admin)return response({error:'اتصال امن ذخیره‌سازی سایت آماده نیست.'},503);
 let form:FormData;
 try{form=await req.formData()}catch{return response({error:'فایل قابل دریافت نیست.'},400)}
 const file=form.get('avatar');
 if(!(file instanceof File)||file.size<1||file.size>3*1024*1024)return response({error:'عکس باید حداکثر ۳ مگابایت باشد.'},400);
 const allowed:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
 if(!allowed[file.type])return response({error:'فقط عکس PNG، JPEG یا WebP پذیرفته می‌شود.'},400);
 const bytes=new Uint8Array(await file.arrayBuffer());
 const ext=fileType(bytes);
 if(!ext||allowed[file.type]!==ext)return response({error:'نوع واقعی تصویر با پسوند آن مطابقت ندارد.'},400);
 const {user}=state;
 const key=user.id+'/'+randomUUID()+'.'+ext;
 const bucket=admin.storage.from(AVATAR_BUCKET);
 const {error:uploadError}=await bucket.upload(key,bytes,{contentType:file.type,cacheControl:'3600',upsert:false});
 if(uploadError)return response({error:'آپلود تصویر انجام نشد. ایجاد فضای خصوصی عکس‌ها در دیتابیس را بررسی کنید.'},400);
 const before=await admin.from('profiles').select('avatar_path').eq('id',user.id).maybeSingle();
 const oldPath=(before.data as {avatar_path?:string}|null)?.avatar_path;
 const {data:changed,error:updateError}=await admin.from('profiles').update({avatar_path:key}).eq('id',user.id).select('id').maybeSingle();
 if(updateError||!changed){
  await bucket.remove([key]);
  return response({error:'ثبت عکس در حساب انجام نشد. ابتدا Migration عکس پروفایل را اجرا کنید.'},409);
 }
 const signed=await signedCustomerAvatar(user.id,key);
 if(oldPath&&oldPath!==key&&belongsToUser(oldPath,user.id))await bucket.remove([oldPath]);
 return response({ok:true,url:signed});
}
export async function DELETE(req:NextRequest){
 if(!validOrigin(req))return response({error:'درخواست از مبدأ نامعتبر است.'},403);
 const state=await session();
 if(!state)return response({error:'ابتدا وارد حساب شوید.'},401);
 const admin=adminDatabase();
 if(!admin)return response({error:'اتصال ذخیره‌سازی آماده نیست.'},503);
 const {user}=state;
 const before=await admin.from('profiles').select('avatar_path').eq('id',user.id).maybeSingle();
 if(before.error)return response({error:'امکان بررسی عکس وجود ندارد.'},409);
 const old=(before.data as {avatar_path?:string}|null)?.avatar_path;
 const changed=await admin.from('profiles').update({avatar_path:null}).eq('id',user.id).select('id').maybeSingle();
 if(changed.error||!changed.data)return response({error:'حذف عکس از پروفایل ذخیره نشد.'},409);
 if(old&&belongsToUser(old,user.id))await admin.storage.from(AVATAR_BUCKET).remove([old]);
 return response({ok:true,url:null});
}
