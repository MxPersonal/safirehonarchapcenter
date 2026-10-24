import type {Locale} from '@/lib/i18n';
const order:Record<string,[string,string]>={
 pending_review:['در انتظار بررسی','Pending review'],
 awaiting_payment:['در انتظار پرداخت','Awaiting payment'],
 in_production:['در حال چاپ','In production'],
 ready:['آماده تحویل','Ready for collection'],
 completed:['تکمیل‌شده','Completed'],
 cancelled:['لغوشده','Cancelled']
};
const quote:Record<string,[string,string]>={
 new:['درخواست جدید','New request'],
 contacted:['تماس برقرارشده','Contacted'],
 quoted:['قیمت اعلام‌شده','Price quoted'],
 accepted:['تأییدشده','Accepted'],
 cancelled:['لغوشده','Cancelled']
};
export function orderStatusLabel(status:string,locale:Locale){return (order[status]||[status,status])[locale==='fa'?0:1]}
export function quoteStatusLabel(status:string,locale:Locale){return (quote[status]||[status,status])[locale==='fa'?0:1]}
