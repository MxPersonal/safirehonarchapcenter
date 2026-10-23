'use client';
import {useState} from 'react';
import Artwork from '@/components/art';
import {getDesign} from '@/lib/catalog';
import {CategoryArtwork} from '@/components/showcase';
export default function AdminArtworkPreview({kind,slug,name,url,large=false}:{kind:'product'|'category';slug:string;name:string;url?:string|null;large?:boolean}){
 const [broken,setBroken]=useState(false);
 const design=kind==='product'?getDesign(slug):undefined;
 return <div className={large?'admin-artwork-preview admin-artwork-preview-large':'admin-artwork-preview'} aria-label={'پیش‌نمایش '+name}>
  {url&&!broken?<img src={url} alt={'عکس '+name} loading="lazy" onError={()=>setBroken(true)}/>:kind==='category'?<CategoryArtwork slug={slug} name={name} small={!large}/>:design?<Artwork design={{...design,name}}/>:<div className="admin-artwork-placeholder"><span>SAFIRE HONAR</span><strong>{name||'بدون نام'}</strong><small>عکس اختصاصی ندارد</small></div>}
  <span className="admin-artwork-caption">{url&&!broken?'عکس ثبت‌شده':'پیش‌نمایش گرافیکی اولیه'}</span>
 </div>;
}
