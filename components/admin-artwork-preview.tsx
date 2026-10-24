'use client';
import {useI18n} from '@/components/locale-provider';
import {useState} from 'react';
import Artwork from '@/components/art';
import {getDesign} from '@/lib/catalog';
import PrintMockup from '@/components/print-mockups';
export default function AdminArtworkPreview({kind,slug,name,url,large=false}:{kind:'product'|'category';slug:string;name:string;url?:string|null;large?:boolean}){
 const {locale,pick}=useI18n();
 const [broken,setBroken]=useState(false);
 const design=kind==='product'?getDesign(slug):undefined;
 return <div className={large?'admin-artwork-preview admin-artwork-preview-large':'admin-artwork-preview'} aria-label={pick('پیش‌نمایش ','Preview of ')+name}>
  {url&&!broken?<img src={url} alt={pick('عکس ','Photo of ')+name} loading="lazy" onError={()=>setBroken(true)}/>:kind==='category'?<div className="showcase-art admin-preview-mockup"><PrintMockup slug={slug} name={name} locale={locale}/></div>:design?<Artwork design={{...design,name}} locale="fa"/>:<div className="admin-artwork-placeholder"><span>{pick('چاپ سفیر هنر','SAFIRE HONAR')}</span><strong>{name||pick('بدون نام','Unnamed')}</strong><small>{pick('عکس اختصاصی ندارد','No custom image')}</small></div>}
  <span className="admin-artwork-caption">{url&&!broken?pick('عکس ثبت‌شده','Uploaded photo'):pick('پیش‌نمایش گرافیکی اولیه','Illustrative mockup')}</span>
 </div>;
}
