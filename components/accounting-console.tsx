'use client';
import {useI18n} from '@/components/locale-provider';
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
const englishTypes:Record<Kind,string>={sale:'Collected sales',other_income:'Other income',expense:'Paid expenses',refund:'Refund'};
const englishCategories:Record<string,string>={materials:'Materials',production:'Production',delivery:'Shipping',salary:'Salaries',rent:'Rent',marketing:'Marketing',utilities:'Utilities',equipment:'Equipment',other_expense:'Other expenses'};
const englishMethods:Record<string,string>={cash:'Cash',pos:'POS terminal',transfer:'Bank transfer',gateway:'Payment gateway',other:'Other'};
const money=(n:number,locale:'fa'|'en')=>new Intl.NumberFormat(locale==='fa'?'fa-IR':'en-US').format(n)+(locale==='fa'?' تومان':' Toman');
const initialForm={entry_type:'sale' as Kind,category:'sale',amount_toman:'',payment_method:'transfer',order_id:'',reference:'',note:'',occurred_at:new Date().toISOString().slice(0,10)};
function tooltipDate(x:string,locale:'fa'|'en'){try{return new Date(x).toLocaleDateString(locale==='fa'?'fa-IR':'en-US',{year:'numeric',month:'short',day:'numeric'})}catch{return x}}
function CategoryBar({name,total,max}:{name:string;total:number;max:number}){
 const {locale}=useI18n();
 return <div className="finance-breakdown-row"><div><strong>{(locale==='en'?englishCategories:categories)[name]||name}</strong><span>{money(total,locale)}</span></div><div className="finance-bar-track"><span style={{width:`${Math.max(0,Math.min(100,max?total/max*100:0))}%`}}/></div></div>;
}
function TrendChart({data}:{data:Bucket[]}){
 const {locale,pick}=useI18n();
 const sliced=data.slice(-15);const max=Math.max(1,...sliced.map(d=>Math.max(d.sales+d.otherIncome,d.expenses+d.refunds)));
 if(!sliced.length)return <div className="finance-empty-chart"><BarChart3 size={32}/><strong>{pick('هنوز تراکنش ثبت‌شده‌ای در این دوره وجود ندارد.','No transactions in this period yet.')}</strong><span>{pick('با ثبت اولین دریافت یا هزینه، نمودار ساخته می‌شود.','Record a payment or expense to start the chart.')}</span></div>;
 return <div className="finance-bars" role="img" aria-label={pick("مقایسه دریافت‌ها و هزینه‌ها بر اساس دوره زمانی","Comparison of cash received and paid over time")}>
  {sliced.map(point=><div className="finance-bar-column" key={point.period} title={`${point.period} | ${pick('دریافتی','Received')}: ${money(point.sales+point.otherIncome,locale)} | ${pick('خروجی','Paid')}: ${money(point.expenses+point.refunds,locale)}`}>
   <div className="finance-bar-pair"><span className="finance-bar-in" style={{height:`${Math.max(0,Math.round((point.sales+point.otherIncome)/max*100))}%`}}/><span className="finance-bar-out" style={{height:`${Math.max(0,Math.round((point.expenses+point.refunds)/max*100))}%`}}/></div>
   <small dir="ltr">{point.period.slice(5)}</small>
  </div>)}
 </div>;
}
function Card({title,value,detail,icon,kind='normal'}:{title:string;value:string;detail:string;icon:React.ReactNode;kind?:'normal'|'negative'|'positive'}){
 return <article className={`finance-stat finance-stat-${kind}`}><div className="finance-stat-top"><span>{title}</span>{icon}</div><strong dir="ltr">{value}</strong><small>{detail}</small></article>;
}
export default function AccountingConsole(){
 const {locale,pick}=useI18n();
 const numeral=new Intl.NumberFormat(locale==='fa'?'fa-IR':'en-US');
 const [period,setPeriod]=useState<Period>('30d');const [report,setReport]=useState<Report|null>(null);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [form,setForm]=useState(initialForm);
 const [confirmReverse,setConfirmReverse]=useState<string|null>(null),[reason,setReason]=useState('');
 const load=useCallback(async()=>{
  setLoading(true);setError('');try{const r=await fetch(`/admin/api/accounting?period=${period}`,{credentials:'same-origin',cache:'no-store'});const data=await r.json();if(!r.ok)throw new Error((locale==='fa'?data.error:undefined)||`HTTP ${r.status}`);setReport(data);}
  catch(e){setError(e instanceof Error?e.message:pick('گزارش حسابداری در دسترس نیست.','Accounting report is unavailable.'));setReport(null)}finally{setLoading(false)}
 },[period]);
 useEffect(()=>{void load()},[load]);
 async function submit(e:React.FormEvent){e.preventDefault();setSaving(true);setError('');setMessage('');
  try{const response=await fetch('/admin/api/accounting',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'create',...form,amount_toman:Number(form.amount_toman),order_id:form.order_id.trim()||null,occurred_at:new Date(form.occurred_at+'T12:00:00').toISOString()})});
   const data=await response.json();if(!response.ok)throw new Error((locale==='fa'?data.error:undefined)||pick('ذخیره انجام نشد','Save failed'));
   setMessage(pick('سند مالی با موفقیت ثبت شد.','Financial record saved.'));setForm({...initialForm,entry_type:form.entry_type,category:form.entry_type==='expense'?'materials':form.entry_type});await load();
  }catch(e){setError(e instanceof Error?e.message:pick('ثبت سند ناموفق بود.','Could not save transaction.'))}finally{setSaving(false)}
 }
 async function reverse(){if(!confirmReverse)return;setSaving(true);setError('');setMessage('');try{const r=await fetch('/admin/api/accounting',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'reverse',id:confirmReverse,reason})});const x=await r.json();if(!r.ok)throw new Error((locale==='fa'?x.error:undefined)||pick('اصلاح ثبت نشد.','Reversal failed'));setMessage(pick('سند اصلاحی ثبت شد و سند اولیه در تاریخچه باقی ماند.','Reversal recorded. The original entry is preserved.'));setConfirmReverse(null);setReason('');await load()}catch(e){setError(e instanceof Error?e.message:pick('امکان اصلاح سند نبود.','Could not reverse transaction.'))}finally{setSaving(false)}}
 const reversedIds=useMemo(()=>new Set(report?.recent.filter(e=>e.reversal_of).map(e=>e.reversal_of)||[]),[report]);
 const stats=report?.summary;
 const maxExpense=report?.expenseBreakdown[0]?.total||0;
 return <section className="finance-console" aria-label={pick("حسابداری و مانیتورینگ مالی","Accounting and financial monitoring")}>
  <div className="finance-top"><div><span className="tiny-label">{pick('مرکز پایش مالی / سفیر هنر','FINANCIAL CONTROL CENTER / SAFIRE HONAR')}</span><h2>{pick('حسابداری و مانیتورینگ فروش','Accounting and sales monitoring')}</h2><p>{pick('دریافت‌های واقعی، هزینه‌ها، بازپرداخت‌ها و نتیجه نقدی کسب‌وکار در یک نگاه.','Monitor collected sales, payments, expenses, refunds and cash flow in one place.')}</p></div><div className="finance-toolbar"><label>{pick('بازه گزارش','Report period')}<select value={period} onChange={e=>setPeriod(e.target.value as Period)}>{PERIODS.map(([v,l])=><option key={v} value={v}>{locale==='en'?({'7d':'7 days','30d':'30 days','90d':'90 days','365d':'12 months',all:'All time'} as Record<Period,string>)[v]:l}</option>)}</select></label><button type="button" className="v2-outline" disabled={loading} onClick={()=>void load()}><RefreshCw size={16}/> {pick('به‌روزرسانی','Refresh')}</button></div></div>
  <div className="finance-method-note"><Activity size={19}/><span>{pick('گزارش بر مبنای','Reports use')} <strong>{pick('دریافت و پرداخت ثبت‌شده','recorded receipts and payments')}</strong> {pick('است، نه صرفاً مبلغ سفارش. این اعداد سود حسابداری رسمی، مانده بانک یا مالیات قطعی نیستند.','rather than unpaid order values. These figures do not constitute formal accounting profit, bank balance or confirmed tax figures.')}</span></div>
  {error&&<div role="alert" className="finance-alert">{error}</div>}
  {message&&<div role="status" className="finance-success"><CheckCircle2 size={17}/>{message}</div>}
  {loading&&!report?<div className="finance-loading">{pick('در حال خواندن اسناد مالی...','Loading financial records...')}</div>:stats&&<>
   <div className="finance-stats">
    <Card title={pick("فروش وصول‌شده","Collected sales")} value={money(stats.sales,locale)} detail={pick("فقط مبالغ فروش دریافت‌شده","Only confirmed sales receipts")} icon={<TrendingUp size={20}/>} kind="positive"/>
    <Card title={pick("مجموع دریافتی","Total receipts")} value={money(stats.receipts,locale)} detail={pick("فروش + درآمدهای متفرقه","Sales and other receipts")} icon={<ArrowDownLeft size={20}/>}/>
    <Card title={pick("هزینه‌های پرداختی","Paid expenses")} value={money(stats.expenses,locale)} detail={pick("مواد اولیه، تولید و هزینه جاری","Materials, production and operating expenses")} icon={<ArrowUpRight size={20}/>}/>
    <Card title={pick("خالص جریان نقدی","Net cash flow")} value={money(stats.net,locale)} detail={stats.net<0?pick('خروجی بیشتر از ورودی است','More paid out than received'):pick('پس از کسر هزینه و استرداد','After expenses and refunds')} icon={stats.net<0?<TrendingDown size={20}/>:<WalletCards size={20}/>} kind={stats.net<0?'negative':'positive'}/>
   </div>
   <div className="finance-substats"><span>{pick('استرداد وجه:','Refunds:')} <strong>{money(stats.refunds,locale)}</strong></span><span>{pick('زیان نقدی دوره:','Cash shortfall:')} <strong>{money(stats.loss,locale)}</strong></span><span>{pick('سفارش در انتظار بررسی/پرداخت:','Orders awaiting review/payment:')} <strong>{report?.pendingOrders==null?pick('نامشخص','Unknown'):numeral.format(report.pendingOrders)}</strong></span><span>{pick('اسناد ثبت‌شده در بازه:','Recorded transactions:')} <strong>{numeral.format(report?.count||0)}</strong></span></div>
   <div className="finance-chart-grid"><article className="finance-panel finance-trends"><div className="finance-panel-head"><div><span className="tiny-label">{pick('دریافتی و پرداختی','CASH IN & OUT')}</span><h3>{pick('روند دریافت و پرداخت','Receipts and payments')}</h3></div><div className="finance-legend"><span><i className="finance-key-in"/> {pick('دریافت‌ها','Receipts')}</span><span><i className="finance-key-out"/> {pick('خروجی‌ها','Payments')}</span></div></div><TrendChart data={report?.chart||[]}/><p className="finance-small">{pick('نمایش مقایسه‌ای حداکثر ۱۵ بازه زمانی آخر؛ محاسبات KPI بر پایه تمام اسناد انتخاب‌شده است.','The chart shows up to 15 recent intervals; key figures use all records in the selected period.')}</p></article>
   <article className="finance-panel"><div className="finance-panel-head"><div><span className="tiny-label">{pick('ساختار هزینه‌ها','COST STRUCTURE')}</span><h3>{pick('هزینه‌ها به تفکیک','Expense breakdown')}</h3></div><BarChart3 size={22}/></div>{report?.expenseBreakdown.length?report.expenseBreakdown.map(x=><CategoryBar key={x.category} name={x.category} total={x.total} max={maxExpense}/>):<p className="finance-empty-short">{pick('هنوز هزینه‌ای در این دوره ثبت نشده است.','No expenses in this period.')}</p>}</article></div>
  </>}
  <div className="finance-bottom-grid"><article className="finance-panel"><div className="finance-panel-head"><div><span className="tiny-label">{pick('سند مالی جدید','NEW FINANCIAL RECORD')}</span><h3>{pick('ثبت دریافت یا هزینه','Record a receipt or expense')}</h3></div><FilePlus2 size={22}/></div>
   <form className="finance-form" onSubmit={submit}><label>{pick('نوع سند','Transaction type')}<select value={form.entry_type} onChange={e=>{const kind=e.target.value as Kind;setForm(x=>({...x,entry_type:kind,category:kind==='expense'?'materials':kind}))}}>{Object.entries(types).map(([key,title])=><option key={key} value={key}>{(locale==='en'?englishTypes:types)[key as Kind]}</option>)}</select></label>
    {form.entry_type==='expense'&&<label>{pick('دسته هزینه','Expense category')}<select value={form.category} onChange={e=>setForm(x=>({...x,category:e.target.value}))}>{Object.entries(categories).map(([key,title])=><option key={key} value={key}>{(locale==='en'?englishCategories:categories)[key]}</option>)}</select></label>}
    <label>{pick('مبلغ (تومان)','Amount (Toman)')}<input required type="number" min="1" max="1000000000000" step="1" value={form.amount_toman} onChange={e=>setForm(x=>({...x,amount_toman:e.target.value}))} placeholder={pick("مثلاً 2500000","e.g. 2500000")} dir="ltr"/></label>
    <label>{pick('تاریخ سند','Transaction date')}<input required type="date" value={form.occurred_at} onChange={e=>setForm(x=>({...x,occurred_at:e.target.value}))}/></label>
    <label>{pick('روش پرداخت','Payment method')}<select value={form.payment_method} onChange={e=>setForm(x=>({...x,payment_method:e.target.value}))}>{Object.entries(methods).map(([key,name])=><option key={key} value={key}>{(locale==='en'?englishMethods:methods)[key]}</option>)}</select></label>
    <label>{pick('شماره سفارش (اختیاری)','Order ID (optional)')}<input dir="ltr" value={form.order_id} onChange={e=>setForm(x=>({...x,order_id:e.target.value}))} placeholder={pick("UUID سفارش","Order UUID")}/></label>
    <label>{pick('شماره رسید / مرجع','Receipt / reference')}<input value={form.reference} onChange={e=>setForm(x=>({...x,reference:e.target.value}))} maxLength={120}/></label>
    <label className="finance-full">{pick('شرح سند','Description')}<textarea rows={3} maxLength={1500} value={form.note} onChange={e=>setForm(x=>({...x,note:e.target.value}))} placeholder={pick("مثلاً دریافت وجه چاپ بنر یا هزینه خرید متریال","e.g. Banner payment or materials purchase")}/></label>
    <button type="submit" disabled={saving||loading} className="v2-primary finance-full">{saving?pick('در حال ذخیره...','Saving...'):pick('ثبت سند مالی','Save transaction')} <FilePlus2 size={17}/></button>
    <small className="finance-full">{pick('ثبت فروش فقط پس از تأیید دریافت وجه انجام شود. برای اصلاح سند، از «ثبت سند برگشت» استفاده کن.','Record sales only after confirming payment. Correct errors using a reversing entry.')}</small>
   </form></article>
   <article className="finance-panel"><div className="finance-panel-head"><div><span className="tiny-label">{pick('تراکنش‌های قابل پیگیری','AUDITABLE TRANSACTIONS')}</span><h3>{pick('آخرین اسناد مالی','Recent transactions')}</h3></div><CalendarDays size={22}/></div>
    {report?.recent.length?<div className="finance-transactions">{report.recent.slice(0,30).map(item=><div className="finance-transaction" key={item.id}>
      <span className={`finance-type finance-type-${item.entry_type}`}>{item.reversal_of?pick('سند اصلاحی','Reversal'):(locale==='en'?englishTypes:types)[item.entry_type]}</span>
      <div><strong>{item.entry_type==='expense'?((locale==='en'?englishCategories:categories)[item.category]||item.category):(locale==='en'?englishTypes:types)[item.entry_type]}</strong><small>{tooltipDate(item.occurred_at,locale)} · {(locale==='en'?englishMethods:methods)[item.payment_method]||item.payment_method}</small>{item.note&&<small>{item.note}</small>}</div>
      <div className="finance-transaction-tail"><strong>{item.reversal_of?pick('اصلاح ','Correction '):' '}{money(item.amount_toman,locale)}</strong>{!item.reversal_of&&!reversedIds.has(item.id)&&<button type="button" onClick={()=>{setConfirmReverse(item.id);setReason('')}} title={pick("اصلاح بدون حذف سند","Reverse without deleting original entry")}><RotateCcw size={13}/> {pick('اصلاح','Correct')}</button>}</div>
     </div>)}</div>:<p className="finance-empty-short">{pick('هیچ سندی در این دوره ثبت نشده است.','No transactions in this period.')}</p>}
    {report&&report.recent.length>30&&<p className="finance-small">{pick('فقط ۳۰ سند اخیر نمایش داده شده؛ محاسبات شامل همه اسناد دوره است.','Only the 30 latest records are shown; totals cover the full period.')}</p>}
   </article></div>
   {confirmReverse&&<div className="finance-modal-backdrop"><div className="finance-modal" role="dialog" aria-modal="true" aria-labelledby="finance-reverse-title"><h3 id="finance-reverse-title">{pick('ثبت سند اصلاحی','Reverse a transaction')}</h3><p>{pick('سند اولیه حذف نمی‌شود. سند جدید با اثر معکوس به سوابق اضافه خواهد شد.','The original is preserved and an offsetting transaction is recorded.')}</p><label>{pick('دلیل اصلاح','Reason for reversal')}<textarea required minLength={5} value={reason} onChange={e=>setReason(e.target.value)} rows={3}/></label><div><button className="v2-outline" type="button" disabled={saving} onClick={()=>setConfirmReverse(null)}>{pick('انصراف','Cancel')}</button><button className="v2-primary" type="button" disabled={saving||reason.trim().length<5} onClick={()=>void reverse()}>{pick('تأیید اصلاح','Confirm reversal')}</button></div></div></div>}
  </section>;
}
