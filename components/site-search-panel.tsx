'use client';

import {useEffect,useRef,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowUpLeft,Boxes,Check,ChevronDown,FileText,Filter,Package,RotateCcw,Search,SlidersHorizontal,X} from 'lucide-react';
import {useI18n} from '@/components/locale-provider';

type Kind='product'|'category'|'page';
type Row={id:string;kind:Kind;title:string;description:string;href:string;imageUrl:string|null;
 price:number|null;mode:'fixed'|'quote'|null;categoryId:string|null;slug:string;sample:boolean};
type Payload={items:Row[];total:number;categories:Array<{slug:string;name:string;level:number;parentId:string|null}>;limited:boolean};
const empty:Payload={items:[],total:0,categories:[],limited:false};

export default function SiteSearchPanel({open,onClose}:{open:boolean;onClose:()=>void}){
 const {locale,pick,path}=useI18n();
 const router=useRouter();
 const input=useRef<HTMLInputElement>(null);
 const [q,setQ]=useState('');
 const [kind,setKind]=useState<'all'|Kind>('all');
 const [category,setCategory]=useState('all');
 const [pricing,setPricing]=useState<'all'|'fixed'|'quote'>('all');
 const [sort,setSort]=useState<'relevance'|'title'|'price'>('relevance');
 const [data,setData]=useState<Payload>(empty);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [showFilters,setShowFilters]=useState(false);
 const [hasFetched,setHasFetched]=useState(false);
 const [settledQ,setSettledQ]=useState(q);

 useEffect(()=>{if(open)input.current?.focus()},[open]);
 useEffect(()=>{
  if(!open)return;
  const id=window.setTimeout(()=>setSettledQ(q),230);
  return()=>window.clearTimeout(id);
 },[open,q]);
 useEffect(()=>{
  if(!open)return;
  const ctrl=new AbortController();
  const query=new URLSearchParams({q:settledQ,locale,kind,category,pricing,sort});
  setLoading(true);setError('');
  void fetch('/api/site-search?'+query.toString(),{signal:ctrl.signal,cache:'no-store'})
    .then(async res=>{const body=await res.json();if(!res.ok)throw Error(body.error||'Search unavailable');return body as Payload})
    .then(body=>{if(!ctrl.signal.aborted){setData(body);setHasFetched(true)}})
    .catch(err=>{if(!ctrl.signal.aborted)setError(err instanceof Error?err.message:String(err))})
    .finally(()=>{if(!ctrl.signal.aborted)setLoading(false)});
  return()=>ctrl.abort();
 },[open,settledQ,locale,kind,category,pricing,sort]);
 function reset(){setQ('');setKind('all');setCategory('all');setPricing('all');setSort('relevance');input.current?.focus()}
 const filtersApplied=kind!=='all'||category!=='all'||pricing!=='all'||sort!=='relevance';
 const countLabel=locale==='fa'?new Intl.NumberFormat('fa-IR').format(data.total):String(data.total);
 const close=()=>onClose();
 function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();
  if(!loading&&data.items.length){router.push(data.items[0].href);close()}
 }
 return <div id="wf-global-search" className="wf-global-search" data-open={open?'true':'false'} inert={!open} aria-hidden={!open}>
  <div className="wf-global-search-scroll">
   <div className="wf-search-inner" dir={locale==='fa'?'rtl':'ltr'}>
    <header className="wf-search-top">
     <div><span className="wf-search-eyebrow"><Search size={15} aria-hidden="true"/>{pick('جست‌وجوی سراسری','SITE-WIDE SEARCH')}</span>
       <h2 id="wf-search-heading">{pick('دنبال چه محصول یا خدمتی هستید؟','What would you like to find?')}</h2>
     </div>
     <button type="button" className="wf-search-close" onClick={close} aria-label={pick('بستن جست‌وجو','Close search')}><X size={21}/></button>
    </header>
    <form role="search" className="wf-search-form" onSubmit={submit} aria-label={pick('جست‌وجو در سایت','Search the website')}>
      <Search size={23} className="wf-search-leading" aria-hidden="true"/>
      <input ref={input} type="search" enterKeyHint="search" autoComplete="off"
        value={q} onChange={e=>setQ(e.target.value.slice(0,90))} maxLength={90}
        placeholder={pick('مثلاً کارت ویزیت، بنر، بروشور یا خدمات چاپ...','Search business cards, banners, brochures, services...')}
        aria-label={pick('عبارت مورد جست‌وجو','Search query')} aria-controls="wf-search-results"/>
      {q&&<button type="button" className="wf-search-clear" onClick={()=>{setQ('');input.current?.focus()}} aria-label={pick('پاک‌کردن عبارت','Clear search')}><X size={17}/></button>}
      <button type="button" className={'wf-search-filter-toggle'+(showFilters?' selected':'')} aria-expanded={showFilters} aria-controls="wf-search-filters" onClick={()=>setShowFilters(s=>!s)}>
        <SlidersHorizontal size={17} aria-hidden="true"/> <span>{pick('فیلترها','Filters')}</span>{filtersApplied&&<i aria-label={pick('فیلتر فعال','Filter active')}/>}
      </button>
      <button type="submit" disabled={!data.items.length||loading} className="wf-search-go">{pick('جست‌وجو','Search')}<ArrowUpLeft size={17}/></button>
    </form>
    <div className="wf-search-kind" role="group" aria-label={pick('نوع نتایج','Result type')}>
      {([
        ['all',pick('همه نتایج','All results')],
        ['product',pick('محصولات','Products')],
        ['category',pick('دسته‌بندی‌ها','Categories')],
        ['page',pick('صفحات و راهنما','Pages & guides')]
      ] as const).map(([id,label])=><button key={id} type="button" className={kind===id?'active':''} aria-pressed={kind===id} onClick={()=>setKind(id)}>{label}</button>)}
    </div>
    <div id="wf-search-filters" className="wf-search-filter-clip" data-expanded={showFilters?'true':'false'}>
     <div className="wf-search-filter-grid">
      <label>{pick('دسته‌بندی محصول','Product category')}
       <select value={category} onChange={e=>setCategory(e.target.value)}>
        <option value="all">{pick('همه دسته‌بندی‌ها','All categories')}</option>
        {data.categories.map(c=><option key={c.slug} value={c.slug}>{c.level?'↳  ':''}{c.name}</option>)}
       </select>
      </label>
      <label>{pick('نوع قیمت‌گذاری','Price type')}
       <select value={pricing} onChange={e=>setPricing(e.target.value as 'all'|'fixed'|'quote')}>
        <option value="all">{pick('همه انواع','All types')}</option>
        <option value="fixed">{pick('قیمت مشخص','Fixed price')}</option>
        <option value="quote">{pick('نیازمند استعلام','Quote required')}</option>
       </select>
      </label>
      <label>{pick('مرتب‌سازی','Sort by')}
       <select value={sort} onChange={e=>setSort(e.target.value as 'relevance'|'title'|'price')}>
        <option value="relevance">{pick('مرتبط‌ترین','Most relevant')}</option>
        <option value="title">{pick('نام محصول یا صفحه','Alphabetical')}</option>
        <option value="price">{pick('قیمت از کمتر به بیشتر','Lowest price first')}</option>
       </select>
      </label>
      <button type="button" className="wf-search-reset" onClick={reset}><RotateCcw size={17}/>{pick('حذف فیلترها','Reset filters')}</button>
     </div>
    </div>
    <div className="wf-search-results-head">
      <span>{q.trim()?pick('نتایج جست‌وجو','Search results'):pick('کاوش در محتوای سایت','Explore the website')}</span>
      <span role="status" aria-live="polite">{loading?pick('در حال جست‌وجو...','Searching...'):hasFetched?countLabel+' '+pick('نتیجه','results'):''}</span>
    </div>
    <div id="wf-search-results" className="wf-search-results" aria-busy={loading}>
     {error?<div className="wf-search-empty" role="alert"><p>{pick('ارتباط با جست‌وجو برقرار نشد. دوباره تلاش کنید.','Search is temporarily unavailable. Please retry.')}</p><button type="button" onClick={()=>setSettledQ(q)}><RotateCcw size={17}/>{pick('تلاش دوباره','Retry')}</button></div>:
      !loading&&hasFetched&&data.items.length===0?
       <div className="wf-search-empty"><Search size={30}/><strong>{pick('نتیجه‌ای پیدا نشد','No matching results')}</strong>
         <p>{pick('عبارت دیگری وارد کنید یا فیلترها را حذف کنید. برای سفارش اختصاصی می‌توانید درخواستتان را ارسال کنید.','Try another keyword or remove filters. You can also send a custom printing inquiry.')}</p>
         <button type="button" onClick={reset}>{pick('پاک‌کردن فیلترها','Reset filters')}</button>
         <Link href={path('/order')} onClick={close}>{pick('سفارش اختصاصی','Custom request')} <ArrowUpLeft size={16}/></Link>
       </div>:
      <div className="wf-search-result-list">
       {data.items.map(item=><Link key={item.kind+':'+item.id} className="wf-search-result" href={item.href} onClick={close}>
        <span className="wf-search-result-thumb">
         {item.imageUrl?<img src={item.imageUrl} alt="" loading="lazy"/>:
          item.kind==='product'?<Package size={22}/>:item.kind==='category'?<Boxes size={22}/>:<FileText size={22}/>}
        </span>
        <span className="wf-search-result-copy">
         <span className="wf-search-result-type">{item.kind==='product'?pick('محصول','Product'):item.kind==='category'?pick('دسته‌بندی','Category'):pick('صفحه سایت','Page')}{item.sample&&' · '+pick('نمونهٔ اولیه','Starter example')}</span>
         <strong>{item.title}</strong>
         {item.description&&<small>{item.description}</small>}
        </span>
        <span className="wf-search-result-tail">
          {item.kind==='product'&&<em>{item.mode==='fixed'&&item.price!==null?
           new Intl.NumberFormat(locale==='fa'?'fa-IR':'en-US').format(item.price)+' '+pick('تومان','Toman'):
           pick('استعلام قیمت','Quote required')}</em>}
          <ArrowUpLeft size={18} aria-hidden="true"/>
        </span>
       </Link>)}
      </div>}
    </div>
    {!loading&&hasFetched&&data.total>data.items.length&&<p className="wf-search-hint">{pick('نتایج بیشتری وجود دارد؛ برای دقیق‌ترشدن، عبارت جست‌وجو و فیلترها را محدود کنید.','More results exist. Narrow your search or apply filters to find a closer match.')}</p>}
    {data.limited&&<p className="wf-search-hint">{pick('در فروشگاه‌های بزرگ، جست‌وجو به نخستین ۱۰۰۰ محصول منتشرشده محدود است.','For large catalogues, the search currently covers the first 1,000 published products.')}</p>}
   </div>
  </div>
 </div>;
}
