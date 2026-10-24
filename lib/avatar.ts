import 'server-only';
import {adminDatabase} from '@/lib/admin/server-db';
export const AVATAR_BUCKET='customer-avatars';
export function belongsToUser(path:string,userId:string):boolean{
 return path.startsWith(userId+'/')&&/^[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|jpg|webp)$/.test(path);
}
export async function signedCustomerAvatar(userId:string,path:string|null|undefined):Promise<string|null>{
 if(!path||!belongsToUser(path,userId))return null;
 const db=adminDatabase();if(!db)return null;
 const {data,error}=await db.storage.from(AVATAR_BUCKET).createSignedUrl(path,60*60);
 return !error?data?.signedUrl||null:null;
}
