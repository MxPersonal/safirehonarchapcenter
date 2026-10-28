import 'server-only';
import {serverDb} from '@/lib/supabase/server';
import {SOCIAL_SLUG,parseSocialLinks} from '@/lib/social-link-types';
import type {SocialLink} from '@/lib/social-link-types';
export {SOCIAL_SLUG,parseSocialLinks} from '@/lib/social-link-types';
export async function siteSocialLinks():Promise<SocialLink[]>{
 const db=await serverDb();
 if(!db)return [];
 const {data,error}=await db.from('site_pages').select('body').eq('slug',SOCIAL_SLUG).maybeSingle();
 if(error||!data)return [];
 return parseSocialLinks(data.body).filter(item=>item.active);
}
