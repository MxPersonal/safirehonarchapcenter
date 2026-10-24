'use client';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {Activity,ArrowDownLeft,ArrowUpRight,BarChart3,CalendarDays,CheckCircle2,Clock3,FilePlus2,RefreshCw,RotateCcw,TrendingDown,TrendingUp,WalletCards} from 'lucide-react';

type Kind='sale'|'other_income'|'expense'|'refund';
type Period='7d'|'30d'|'90d'|'365d'|'all';
type Entry={id:string;entry_type:Kind;category:string;amount_toman:number;occurred_at:string;payment_method:string;order_id:string|null;reference:string;note:string;reversal_of:string|null};
type Bucket={period:string;sales:number;otherIncome:number;expenses:number;refunds:number;net:number};
type Report={ok?:boolean;error?:string;count:number;period:Period;summary:{sales:number;otherIncome:number;expenses:number;refunds:number;net:number;loss:number;receipts:number};chart:Bucket[];expenseBreakdown:{category:string;total:number}[];recent:Entry[];pendingOrders:number|null;note:string};
const PERIODS:[Period,string][]= [['7d','۷ روز'],['30d','۳۰ روز'],['90d','۹۰ روز'],['365d','۱۲ ماه'],['all','تمام دوره']];
const types:Record<Kind,string>={sale:'فروش وصول‌شده',other_income:'سایر دریافتی‌ها',expense:'هزینه پرداخت‌شده',refund:'استرداد وجه'};
const categories:Record<string,string>={materials:'مواد اولیه',production:'هزینه تولید',delivery:'حمل و ارسال',salary:'حقوق و دستمزد',rent:'اجاره',marketing:'بازاریابی',utilities:'آب، برق و خدمات',equipment:'تجهیزات',other_expense:'سایر هزینه‌ها'};
const methods:Record<string,string>={cash:'نقدی',pos:'کارتخوان',transfer:'انتقال بانکی',gateway:'درگاه پرداخت',other:'سایر'};
const numeral=new Intl.NumberFormat('fa-IR');
const money=(n:number)=>numeral.format(n)+' تومان';
const initialForm={entry_type:'sale' as Kind,category:'sale',amount_toman:'',payment_method:'transfer',order_id:'',reference:'',note:'',occurred_at:new Date().toISOString().slice(0,10)};
function tooltipDate(x:string){try{return new Date(x).toLocaleDateString('fa-IR',{year:'numeric',month:'short',day:'numeric'})}catch{return x}}
function CategoryBar({name,total,max}:{name:string;total:number;max:number}){
 return <div className="finance-breakdown-row"><div><strong>{categories[name]||name}</strong><span>{money(total)}</span></div><div className="finance-bar-track"><span style={{width:`${Math.max(0,Math.min(100,max?total/max*100:0))}%`}}/></div></div>;
}
function TrendChart({data}:{data:Bucket[]}){
 const sliced=data.slice(-15);const max=Math.max(1,...sliced.map(d=>Math.max(d.sales+d.otherIncome,d.expenses+d.refunds)));
 if(!sliced.length)return <div className="finance-empty-chart"><BarChart3 size={32}/><strong>هنوز تراکنش ثبت‌شده‌ای در این دوره وجود ندارد.</strong><span>با ثبت اولین دریافت یا هزینه، نمودار ساخته می‌شود.</span></div>;
 return <div className="finance-bars" role="img" aria-label="مقایسه دریافت‌ها و هزینه‌ها بر اساس دوره زمانی">
  {sliced.map(point=><div className="finance-bar-column" key={point.period} title={`${point.period} | دریافتی: ${money(point.sales+point.otherIncome)} | خروجی: ${money(point.expenses+point.refunds)}`}>
   <div className="finance-bar-pair"><span className="finance-bar-in" style={{height:`${Math.max(0,Math.round((point.sales+point.otherIncome)/max*100))}%`}}/><span className="finance-bar-out" style={{height:`${Math.max(0,Math.round((point.expenses+point.refunds)/max*100))}%`}}/></div>
   <small dir="ltr">{point.period.slice(5)}</small>
  </div>)}
 </div>;
}
function Card({title,value,detail,icon,kind='normal'}:{title:string;value:string;detail:string;icon:React.ReactNode;kind?:'normal'|'negative'|'positive'}){
 return <article className={`finance-stat finance-stat-${kind}`}><div className="finance-stat-top"><span>{title}</span>{icon}</div><strong dir="ltr">{value}</strong><small>{detail}</small></article>;
}
export default function AccountingConsole(){
 const [period,setPeriod]=useState<Period>('30d');const [report,setReport]=useState<Report|null>(null);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [form,setForm]=useState(initialForm);
 const [confirmReverse,setConfirmReverse]=useState<string|null>(null),[reason,setReason]=useState('');
 const load=useCallback(async()=>{
  setLoading(true);setError('');try{const r=await fetch(`/admin/api/accounting?period=${period}`,{credentials:'same-origin',cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error(data.error||`خطای ${r.status}`);setReport(data);}
  catch(e){setError(e instanceof Error?e.message:'گزارش حسابداری در دسترس نیست.');setReport(null)}finally{setLoading(false)}
 },[period]);
 useEffect(()=>{void load()},[load]);
 async function submit(e:React.FormEvent){e.preventDefault();setSaving(true);setError('');setMessage('');
  try{const response=await fetch('/admin/api/accounting',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...form,amount_toman:Number(form.amount_toman),order_id:form.order_id.trim()||null,occurred_at:new Date(form.occurred_at+'T12:00:00').toISOString()})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'ذخیره انجام نشد');
   setMessage('سند مالی با موفقیت ثبت شد.');setForm({...initialForm,entry_type:form.entry_type,category:form.entry_type==='expense'?'materials':form.entry_type});await load();
  }catch(e){setError(e instanceof Error?e.message:'ثبت سند ناموفق بود.')}finally{setSaving(false)}
 }
 async function reverse(){if(!confirmReverse)return;setSaving(true);setError('');setMessage('');try{const r=await fetch('/admin/api/accounting',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reverse',id:confirmReverse,reason})});const x=await r.json();if(!r.ok)throw new Error(x.error||'اصلاح ثبت نشد.');setMessage('سند اصلاحی ثبت شد و سند اولیه در تاریخچه باقی ماند.');setConfirmReverse(null);setReason('');await load()}catch(e){setError(e instanceof Error?e.message:'امکان اصلاح سند نبود.')}finally{setSaving(false)}}
 const reversedIds=useMemo(()=>new Set(report?.recent.filter(e=>e.reversal_of).map(e=>e.reversal_of)||[]),[report]);
 const stats=report?.summary;
 const maxExpense=report?.expenseBreakdown[0]?.total||0;
 return <section className="finance-console" aria-label="حسابداری و مانیتورینگ مالی">
  <div className="finance-top"><div><span className="tiny-label">FINANCIAL CONTROL CENTER / SAFIRE HONAR</span><h2>حسابداری و مانیتورینگ فروش</h2><p>دریافت‌های واقعی، هزینه‌ها، بازپرداخت‌ها و نتیجه نقدی کسب‌وکار در یک نگاه.</p></div><div className="finance-toolbar"><label>بازه گزارش<select value={period} onChange={e=>setPeriod(e.target.value as Period)}>{PERIODS.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label><button type="button" className="v2-outline" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> به‌روزرسانی</button></div></div>
  <div className="finance-method-note"><Activity size={19}/><span>گزارش بر مبنای <strong>دریافت و پرداخت ثبت‌شده</strong> است، نه صرفاً مبلغ سفارش. این اعداد سود حسابداری رسمی، مانده بانک یا مالیات قطعی نیستند.</span></div>
  {error&&<div role="alert" className="finance-alert">{error}</div>}
  {message&&<div role="status" className="finance-success"><CheckCircle2 size={17}/>{message}</div>}
  {loading&&!report?<div className="finance-loading">در حال خواندن اسناد مالی...</div>:stats&&<>
   <div className="finance-stats">
    <Card title="فروش وصول‌شده" value={money(stats.sales)} detail="فقط مبالغ فروش دریافت‌شده" icon={<TrendingUp size={20}/>} kind="positive"/>
    <Card title="مجموع دریافتی" value={money(stats.receipts)} detail="فروش + درآمدهای متفرقه" icon={<ArrowDownLeft size={20}/>}/>
    <Card title="هزینه‌های پرداختی" value={money(stats.expenses)} detail="مواد اولیه، تولید و هزینه جاری" icon={<ArrowUpRight size={20}/>}/>
    <Card title="خالص جریان نقدی" value={money(stats.net)} detail={stats.net<0?'خروجی بیشتر از ورودی است':'پس از کسر هزینه و استرداد'} icon={stats.net<0?<TrendingDown size={20}/>:<WalletCards size={20}/>} kind={stats.net<0?'negative':'positive'}/>
   </div>
   <div className="finance-substats"><span>استرداد وجه: <strong>{money(stats.refunds)}</strong></span><span>زیان نقدی دوره: <strong>{money(stats.loss)}</strong></span><span>سفارش در انتظار بررسی/پرداخت: <strong>{report?.pendingOrders==null?'نامشخص':numeral.format(report.pendingOrders)}</strong></span><span>اسناد ثبت‌شده در بازه: <strong>{numeral.format(report?.count||0)}</strong></span></div>
   <div className="finance-chart-grid"><article className="finance-panel finance-trends"><div className="finance-panel-head"><div><span className="tiny-label">CASH IN & OUT</span><h3>روند دریافت و پرداخت</h3></div><div className="finance-legend"><span><i className="finance-key-in"/> دریافت‌ها</span><span><i className="finance-key-out"/> خروجی‌ها</span></div></div><TrendChart data={report?.chart||[]}/><p className="finance-small">نمایش مقایسه‌ای حداکثر ۱۵ بازه زمانی آخر؛ محاسبات KPI بر پایه تمام اسناد انتخاب‌شده است.</p></article>
   <article className="finance-panel"><div className="finance-panel-head"><div><span className="tiny-label">COST STRUCTURE</span><h3>هزینه‌ها به تفکیک</h3></div><BarChart3 size={22}/></div>{report?.expenseBreakdown.length?report.expenseBreakdown.map(x=><CategoryBar key={x.category} name={x.category} total={x.total} max={maxExpense}/>):<p className="finance-empty-short">هنوز هزینه‌ای در این دوره ثبت نشده است.</p>}</article></div>
  </>}
  <div className="finance-bottom-grid"><article className="finance-panel"><div className="finance-panel-head"><div><span className="tiny-label">NEW FINANCIAL RECORD</span><h3>ثبت دریافت یا هزینه</h3></div><FilePlus2 size={22}/></div>
   <form className="finance-form" onSubmit={submit}><label>نوع سند<select value={form.entry_type} onChange={e=>{const kind=e.target.value as Kind;setForm(x=>({...x,entry_type:kind,category:kind==='expense'?'materials':kind}))}}>{Object.entries(types).map(([key,title])=><option key={key} value={key}>{title}</option>)}</select></label>
    {form.entry_type==='expense'&&<label>دسته هزینه<select value={form.category} onChange={e=>setForm(x=>({...x,category:e.target.value}))}>{Object.entries(categories).map(([key,title])=><option key={key} value={key}>{title}</option>)}</select></label>}
    <label>مبلغ (تومان)<input required type="number" min="1" max="1000000000000" step="1" value={form.amount_toman} onChange={e=>setForm(x=>({...x,amount_toman:e.target.value}))} placeholder="مثلاً 2500000" dir="ltr"/></label>
    <label>تاریخ سند<input required type="date" value={form.occurred_at} onChange={e=>setForm(x=>({...x,occurred_at:e.target.value}))}/></label>
    <label>روش پرداخت<select value={form.payment_method} onChange={e=>setForm(x=>({...x,payment_method:e.target.value}))}>{Object.entries(methods).map(([key,name])=><option key={key} value={key}>{name}</option>)}</select></label>
    <label>شماره سفارش (اختیاری)<input dir="ltr" value={form.order_id} onChange={e=>setForm(x=>({...x,order_id:e.target.value}))} placeholder="UUID سفارش"/></label>
    <label>شماره رسید / مرجع<input value={form.reference} onChange={e=>setForm(x=>({...x,reference:e.target.value}))} maxLength={120}/></label>
    <label className="finance-full">شرح سند<textarea rows={3} maxLength={1500} value={form.note} onChange={e=>setForm(x=>({...x,note:e.target.value}))} placeholder="مثلاً دریافت وجه چاپ بنر یا هزینه خرید متریال"/></label>
    <button type="submit" disabled={saving||loading} className="v2-primary finance-full">{saving?'در حال ذخیره...':'ثبت سند مالی'} <FilePlus2 size={17}/></button>
    <small className="finance-full">ثبت فروش فقط پس از تأیید دریافت وجه انجام شود. برای اصلاح سند، از «ثبت سند برگشت» استفاده کن.</small>
   </form></article>
   <article className="finance-panel"><div className="finance-panel-head"><div><span className="tiny-label">AUDITABLE TRANSACTIONS</span><h3>آخرین اسناد مالی</h3></div><CalendarDays size={22}/></div>
    {report?.recent.length?<div className="finance-transactions">{report.recent.slice(0,30).map(item=><div className="finance-transaction" key={item.id}>
      <span className={`finance-type finance-type-${item.entry_type}`}>{item.reversal_of?'سند اصلاحی':types[item.entry_type]}</span>
      <div><strong>{item.entry_type==='expense'?categories[item.category]||item.category:types[item.entry_type]}</strong><small>{tooltipDate(item.occurred_at)} · {methods[item.payment_method]||item.payment_method}</small>{item.note&&<small>{item.note}</small>}</div>
      <div className="finance-transaction-tail"><strong>{item.reversal_of?'اصلاح ':' '}{money(item.amount_toman)}</strong>{!item.reversal_of&&!reversedIds.has(item.id)&&<button type="button" onClick={()=>{setConfirmReverse(item.id);setReason('')}} title="اصلاح بدون حذف سند"><RotateCcw size={13}/> اصلاح</button>}</div>
     </div>)}</div>:<p className="finance-empty-short">هیچ سندی در این دوره ثبت نشده است.</p>}
    {report&&report.recent.length>30&&<p className="finance-small">فقط ۳۰ سند اخیر نمایش داده شده؛ محاسبات شامل همه اسناد دوره است.</p>}
   </article></div>
   {confirmReverse&&<div className="finance-modal-backdrop"><div className="finance-modal" role="dialog" aria-modal="true" aria-labelledby="finance-reverse-title"><h3 id="finance-reverse-title">ثبت سند اصلاحی</h3><p>سند اولیه حذف نمی‌شود. سند جدید با اثر معکوس به سوابق اضافه خواهد شد.</p><label>دلیل اصلاح<textarea required minLength={5} value={reason} onChange={e=>setReason(e.target.value)} rows={3}/></label><div><button className="v2-outline" type="button" disabled={saving} onClick={()=>setConfirmReverse(null)}>انصراف</button><button className="v2-primary" type="button" disabled={saving||reason.trim().length<5} onClick={()=>void reverse()}>تأیید اصلاح</button></div></div></div>}
  </section>;
}
