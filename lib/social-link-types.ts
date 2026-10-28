export const SOCIAL_SLUG='social-links';
export const SOCIAL_ICON_OPTIONS=[
 'instagram','telegram','youtube','linkedin','github','facebook','x','tiktok',
 'eitaa','rubika','pinterest','whatsapp','website','globe','send','music','message'
] as const;
export type SocialIcon=(typeof SOCIAL_ICON_OPTIONS)[number];
export type SocialLink={
 id:string;label:string;icon:SocialIcon;url:string;imageUrl:string;active:boolean
};
const allowed=new Set<string>(SOCIAL_ICON_OPTIONS);
export function safePublicUrl(raw:string):string|null{
 try{const url=new URL(raw);if(!['https:','http:'].includes(url.protocol)||!url.hostname||url.username||url.password)return null;
 if(/^(localhost|127\.|0\.0\.0\.0|::1)$/i.test(url.hostname))return null;
 return url.toString();
 }catch{return null;}
}
export function parseSocialLinks(input:unknown):SocialLink[]{
 const data=typeof input==='string'?(()=>{try{return JSON.parse(input)}catch{return []}})():input;
 if(!Array.isArray(data))return [];
 const ids=new Set<string>();
 const rows:SocialLink[]=[];
 for(const obj of data.slice(0,20)){
  if(!obj||typeof obj!=='object')continue;
  const row=obj as Record<string,unknown>;
  const id=typeof row.id==='string'&&/^[a-zA-Z0-9_-]{1,48}$/.test(row.id)?row.id:'';
  const label=typeof row.label==='string'?row.label.trim().slice(0,55):'';
  const icon=typeof row.icon==='string'&&allowed.has(row.icon)?row.icon as SocialIcon:'globe';
  const url=typeof row.url==='string'?safePublicUrl(row.url.trim()):null;
  const imageUrl=typeof row.imageUrl==='string'&&row.imageUrl.trim()?safePublicUrl(row.imageUrl.trim()):null;
  if(!id||!label||!url||ids.has(id))continue;
  ids.add(id);
  rows.push({id,label,icon,url,imageUrl:imageUrl||'',active:row.active!==false});
 }
 return rows;
}
