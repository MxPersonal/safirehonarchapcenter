'use client';
import {useEffect,useState} from 'react';
import {ArrowUpLeft,BarChart3,Layers,ShoppingBag,Users,MessagesSquare,ReceiptText,RefreshCw,Wallet} from 'lucide-react';
import {useI18n} from '@/components/locale-provider';
import {orderStatusLabel} from '@/lib/status-labels';

type Item={id:string;active:boolean};
type Order={id:string;status:string;created_at:string};
type CashBucket={period:string;sales:number;otherIncome:number;expenses:number;refunds:number};
type CashReport={ok:boolean;summary:{receipts:number;sales:number;expenses:number;net:number};chart:CashBucket[]};
type Props={
 categories:Item[];products:Item[];customers:{id:string}[];orders:Order[];
 quotes:{id:string}[];carts:{id:string}[];hasLoaded:boolean;onNavigate:(key:string)=>void;
};
const safe=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)?n:0;

export default function AdminOverviewDashboard({categories,products,customers,orders,quotes,carts,hasLoaded,onNavigate}:Props){
 const {locale,pick}=useI18n();
 const [report,setReport]=useState<CashReport|null>(null);
 const [financeError,setFinanceError]=useState('');
 const [financeLoading,setFinanceLoading]=useState(true);
 const [today,setToday]=useState<string|null>(null);
 const number=(n:number)=>new Intl.NumberFormat(locale==='fa'?'fa-IR':'en-US').format(n);
 const money=(n:number)=>number(n)+(locale==='fa'?' تومان':' Toman');
 async function refreshFinance(){
  setFinanceLoading(true);setFinanceError('');
  try{
   const response=await fetch('/admin/api/accounting?period=30d',{credentials:'same-origin',cache:'no-store'});
   const data=await response.json();
   if(!response.ok||data?.ok!==true||!data.summary||!Array.isArray(data.chart))
     throw new Error(data?.error||pick('گزارش مالی معتبر نیست.','Financial report unavailable.'));
   setReport(data as CashReport);
  }catch(e){
   setReport(null);
   setFinanceError(e instanceof Error?e.message:pick('گزارش مالی در دسترس نیست.','Financial report unavailable.'));
  }finally{setFinanceLoading(false);}
 }
 useEffect(()=>{setToday(new Date().toISOString().slice(0,10));void refreshFinance();},[]);
 const kpis=[
  {tab:'categories',label:pick('دسته‌های فعال','Active categories'),value:categories.filter(x=>x.active).length,icon:Layers},
  {tab:'products',label:pick('محصولات فعال','Active products'),value:products.filter(x=>x.active).length,icon:ShoppingBag},
  {tab:'orders',label:pick('سفارش‌های بارگذاری‌شده','Loaded orders'),value:orders.length,icon:ReceiptText},
  {tab:'quotes',label:pick('استعلام‌های بارگذاری‌شده','Loaded quotes'),value:quotes.length,icon:MessagesSquare},
  {tab:'customers',label:pick('حساب‌های مشتری','Customer accounts'),value:customers.length,icon:Users},
  {tab:'carts',label:pick('سبدهای بارگذاری‌شده','Loaded carts'),value:carts.length,icon:ShoppingBag}
 ];
 const days=Array.from({length:7},(_,i)=>{
  const day=today?new Date(today+'T00:00:00Z'):null;
  if(!day)return {key:String(i),label:'',count:0};
  day.setUTCDate(day.getUTCDate()-(6-i));
  const key=day.toISOString().slice(0,10);
  return {key,label:new Intl.DateTimeFormat(locale==='fa'?'fa-IR':'en-US',{month:'numeric',day:'numeric',timeZone:'UTC'}).format(day),
   count:orders.filter(o=>o.created_at?.slice(0,10)===key).length};
 });
 const dayMax=Math.max(1,...days.map(x=>x.count));
 const statuses=[...new Set(orders.map(x=>x.status).filter(Boolean))]
  .map(status=>({status,count:orders.filter(o=>o.status===status).length})).sort((a,b)=>b.count-a.count);
 const statusMax=Math.max(1,...statuses.map(x=>x.count));
 const buckets=(report?.chart||[]).slice(-12);
 const financeMax=Math.max(1,...buckets.flatMap(x=>[safe(x.sales)+safe(x.otherIncome),safe(x.expenses)+safe(x.refunds)]));
 return <section className="sh-admin-dashboard" aria-label={pick('داشبورد مستقل مدیریت','Administration dashboard')}>
  <div className="sh-dash-heading"><div><span className="tiny-label">{pick('رکوردهای واقعی','ACTUAL DATABASE RECORDS')}</span><h2>{pick('نمای کلی مجموعه','Business overview')}</h2></div><small>{pick('آمار تعداد، بر اساس رکوردهای بارگذاری‌شده سرور','Counts based on records returned by the server')}</small></div>
  <div className="sh-dash-kpis" aria-busy={!hasLoaded}>
   {kpis.map(({tab,label,value,icon:Icon})=><button type="button" key={tab} className="sh-dash-kpi" onClick={()=>onNavigate(tab)}>
     <span><Icon size={19}/>{label}</span><strong>{hasLoaded?number(value):'…'}</strong><small>{pick('بازکردن بخش','Open section')} <ArrowUpLeft size={14}/></small>
   </button>)}
  </div>
  <div className="sh-dash-heading"><div><span className="tiny-label">{pick('اسناد سی روز گذشته','FINANCE / LAST 30 DAYS')}</span><h2>{pick('عملکرد نقدی ثبت‌شده','Recorded cash flow')}</h2></div>
   <button type="button" className="v2-outline" disabled={financeLoading} onClick={()=>void refreshFinance()}><RefreshCw size={16}/>{pick('بازخوانی مالی','Refresh finance')}</button>
  </div>
  {financeLoading&&!report&&<p className="sh-dash-info">{pick('در حال خواندن اسناد مالی…','Loading financial entries…')}</p>}
  {financeError&&<div className="sh-dash-info" role="alert"><strong>{pick('گزارش مالی در دسترس نیست:','Financial report unavailable:')}</strong> {financeError}<small>{pick('مقادیر ناموجود با صفر جایگزین نشده‌اند.','Unavailable values are not represented as zero.')}</small></div>}
  {report&&<div className="sh-dash-finance-kpis">
   {([
     [pick('دریافتی‌ها','Receipts'),report.summary.receipts,Wallet],
     [pick('فروش وصول‌شده','Collected sales'),report.summary.sales,ReceiptText],
     [pick('هزینه‌های پرداخت‌شده','Expenses paid'),report.summary.expenses,BarChart3],
     [pick('خالص جریان نقدی','Net cash flow'),report.summary.net,Wallet]
   ] as const).map(([label,value,Icon])=><article key={label} className="sh-dash-finance-kpi">
     <span><Icon size={19}/>{label}</span><strong>{money(safe(value))}</strong><small>{pick('بر اساس اسناد ثبت‌شده، تومان','From accounting entries, Toman')}</small>
   </article>)}
  </div>}
  <div className="sh-dash-charts">
   <article className="sh-dash-chart"><h3>{pick('روند دریافت و پرداخت','Cash in versus cash out')}</h3>
    {!report?<p className="sh-dash-info">{pick('نمودار با اتصال گزارش مالی نمایش داده می‌شود.','Chart requires an available finance report.')}</p>:buckets.length===0
     ?<p className="sh-dash-info">{pick('تراکنشی در این دوره ثبت نشده است.','No transactions in this period.')}</p>
     :<div className="sh-dash-finance-bars" role="img" aria-label={pick('مقایسه دریافتی و پرداختی','Receipts and payments chart')}>
       {buckets.map((bucket,i)=><div className="sh-dash-bucket" key={bucket.period+'-'+i} title={bucket.period+' | '+money(safe(bucket.sales)+safe(bucket.otherIncome))+' / '+money(safe(bucket.expenses)+safe(bucket.refunds))}>
        <div><i style={{height:(100*(safe(bucket.sales)+safe(bucket.otherIncome))/financeMax)+'%'}}/><i style={{height:(100*(safe(bucket.expenses)+safe(bucket.refunds))/financeMax)+'%'}}/></div>
        <small dir="ltr">{bucket.period.slice(5)}</small>
       </div>)}
      </div>}
    <p className="sh-dash-note">{pick('آبی: دریافتی؛ نارنجی: پرداختی. سفارش وصول‌نشده درآمد نیست.','Blue: receipts; orange: payments. Unpaid orders are not counted as revenue.')}</p>
   </article>
   <article className="sh-dash-chart"><h3>{pick('سفارش‌های هفت روز اخیر','Orders in the past seven days')}</h3>
    {!hasLoaded||!today?<p className="sh-dash-info">{pick('در حال بارگذاری…','Loading…')}</p>:
     <div className="sh-dash-days" role="img" aria-label={pick('نمودار تعداد سفارش روزانه','Daily order counts')}>
      {days.map(d=><div key={d.key} className="sh-dash-day" title={d.label+' : '+number(d.count)}>
       <strong>{number(d.count)}</strong><div><i style={{height:(100*d.count/dayMax)+'%'}}/></div><small>{d.label}</small>
      </div>)}
     </div>}
    <p className="sh-dash-note">{pick('بر مبنای سفارش‌های بارگذاری‌شده، حداکثر ۵۰۰ سفارش اخیر.','From loaded orders, limited to the 500 most recent records.')}</p>
   </article>
  </div>
  <article className="sh-dash-chart"><div className="sh-dash-heading">
    <h3>{pick('توزیع وضعیت سفارش‌ها','Order status distribution')}</h3>
    <button type="button" className="v2-outline" onClick={()=>onNavigate('orders')}>{pick('مدیریت سفارش‌ها','Manage orders')} <ArrowUpLeft size={15}/></button>
   </div>
   {!hasLoaded?<p className="sh-dash-info">{pick('در حال بارگذاری…','Loading…')}</p>
    :statuses.length===0?<p className="sh-dash-info">{pick('هنوز سفارشی در رکوردهای دریافتی وجود ندارد.','No orders in loaded records.')}</p>:
    <div className="sh-dash-status">{statuses.map(s=><div key={s.status}>
     <span>{orderStatusLabel(s.status,locale)}</span><div><i style={{width:(100*s.count/statusMax)+'%'}}/></div><strong>{number(s.count)}</strong>
    </div>)}</div>}
  </article>
 </section>;
}
