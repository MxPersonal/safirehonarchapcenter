'use client';
import {useMemo,useState} from 'react';
import {Check,Search,UserRound,ImageOff} from 'lucide-react';
import AdminArtworkPreview from '@/components/admin-artwork-preview';

export type PickerProduct={id:string;slug:string;name:string;description?:string;mode:'fixed'|'quote';price_toman:number|null;image_url:string|null;source:'database'|'starter';active:boolean};
export type PickerCustomer={id:string;display_name:string;email:string;role:string;avatar_url?:string|null};
const initials=(value:string)=>Array.from(value.trim()).slice(0,2).join('')||'؟';
export function CustomerAvatar({customer,size='md'}:{customer:Pick<PickerCustomer,'display_name'|'avatar_url'|'email'>;size?:'md'|'sm'}){
 const [broken,setBroken]=useState(false);
 return <span className={'admin-customer-avatar '+(size==='sm'?'admin-customer-avatar-sm':'')} aria-hidden="true">
  {customer.avatar_url&&!broken?<img src={customer.avatar_url} alt="" loading="lazy" referrerPolicy="no-referrer" onError={()=>setBroken(true)}/>:<span><UserRound size={size==='sm'?17:23}/></span>}
 </span>;
}
export function CustomerVisualPicker({customers,value,onChange}:{customers:PickerCustomer[];value:string;onChange:(id:string)=>void}){
 const [query,setQuery]=useState('');
 const filtered=useMemo(()=>customers.filter(c=>[c.display_name,c.email].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),[customers,query]);
 return <div className="admin-picker-group">
  <label htmlFor="admin-customer-filter">انتخاب مشتری از روی نام و تصویر</label>
  <div className="admin-picker-filter"><Search size={18}/><input id="admin-customer-filter" value={query} onChange={e=>setQuery(e.target.value)} placeholder="جست‌وجوی نام یا ایمیل مشتری…" autoComplete="off"/></div>
  <div className="admin-customer-choices" role="radiogroup" aria-label="مشتری">
   {filtered.map(c=><button key={c.id} type="button" role="radio" aria-checked={value===c.id} className={'admin-customer-choice '+(value===c.id?'is-selected':'')} onClick={()=>onChange(c.id)}>
     <CustomerAvatar customer={c}/><span className="admin-picker-details"><strong>{c.display_name||'مشتری بدون نام'}</strong><small dir="ltr">{c.email}</small></span>{value===c.id&&<Check size={20} aria-hidden="true"/>}
   </button>)}
   {!filtered.length&&<div className="admin-picker-empty"><UserRound size={24}/> {customers.length?'مشتری مطابق جست‌وجو پیدا نشد.':'هنوز مشتری در دیتابیس ثبت نشده است.'}</div>}
  </div>
 </div>;
}
export function ProductVisualPicker({products,value,onChange}:{products:PickerProduct[];value:string;onChange:(id:string)=>void}){
 const [query,setQuery]=useState('');
 const filtered=useMemo(()=>products.filter(p=>[p.name,p.slug,p.description||''].join(' ').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),[products,query]);
 return <div className="admin-picker-group">
  <label htmlFor="admin-product-filter">انتخاب محصول از روی عکس و نام</label>
  <div className="admin-picker-filter"><Search size={18}/><input id="admin-product-filter" value={query} onChange={e=>setQuery(e.target.value)} placeholder="جست‌وجوی محصول یا نمونه‌طرح…" autoComplete="off"/></div>
  <div className="admin-product-choices" role="radiogroup" aria-label="محصول">
    {filtered.map(p=><button key={p.id} type="button" role="radio" aria-checked={value===p.id} className={'admin-product-choice '+(value===p.id?'is-selected':'')} onClick={()=>onChange(p.id)}>
      <AdminArtworkPreview kind="product" slug={p.slug} name={p.name} url={p.image_url}/>
      <span className="admin-picker-details"><strong>{p.name}</strong><small>{p.source==='starter'?'نمونه‌طرح سایت':p.mode==='fixed'?Number(p.price_toman).toLocaleString('fa-IR')+' تومان':'نیازمند استعلام'}</small></span>
      {value===p.id&&<span className="admin-product-selected"><Check size={16}/></span>}
    </button>)}
    {!filtered.length&&<div className="admin-picker-empty"><ImageOff size={24}/> {products.length?'محصول مطابق جست‌وجو یافت نشد.':'هنوز محصولی در فهرست وجود ندارد.'}</div>}
  </div>
 </div>;
}
