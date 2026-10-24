/** Pure accounting aggregates. All amounts are in toman; based on actual posted cash documents only. */
export type FinanceEntry={id:string;entry_type:'sale'|'other_income'|'expense'|'refund';category:string;amount_toman:number;order_id:string|null;occurred_at:string;payment_method:string;reference:string;note:string;reversal_of:string|null;created_at:string};
function bucketId(at:string,period:string){return period==='7d'||period==='30d'?at.slice(0,10):at.slice(0,7)}
export function buildSummary(entries:FinanceEntry[],period:string){
 const totals={sales:0,otherIncome:0,expenses:0,refunds:0,net:0,loss:0,receipts:0};
 const buckets=new Map<string,{period:string;sales:number;otherIncome:number;expenses:number;refunds:number;net:number}>();
 const costTypes=new Map<string,number>();
 for(const item of entries){
  // A correcting entry has the same type and amount as the original, but opposite cash effect.
  const amount=item.amount_toman*(item.reversal_of?-1:1);
  if(!Number.isSafeInteger(amount))throw new Error('Invalid financial amount');
  const key=bucketId(item.occurred_at,period);
  const bucket=buckets.get(key)||{period:key,sales:0,otherIncome:0,expenses:0,refunds:0,net:0};
  if(item.entry_type==='sale'){totals.sales+=amount;bucket.sales+=amount}
  if(item.entry_type==='other_income'){totals.otherIncome+=amount;bucket.otherIncome+=amount}
  if(item.entry_type==='expense'){totals.expenses+=amount;bucket.expenses+=amount;costTypes.set(item.category,(costTypes.get(item.category)||0)+amount)}
  if(item.entry_type==='refund'){totals.refunds+=amount;bucket.refunds+=amount}
  bucket.net=bucket.sales+bucket.otherIncome-bucket.expenses-bucket.refunds;
  buckets.set(key,bucket);
 }
 totals.receipts=totals.sales+totals.otherIncome;
 totals.net=totals.receipts-totals.expenses-totals.refunds;
 totals.loss=Math.max(0,-totals.net);
 for(const v of Object.values(totals))if(!Number.isSafeInteger(v))throw new Error('Financial sum exceeds supported range');
 const chart=[...buckets.values()].sort((a,b)=>a.period.localeCompare(b.period));
 const expenses=[...costTypes].filter(([,v])=>v>0).sort((a,b)=>b[1]-a[1]).map(([category,total])=>({category,total}));
 return {totals,chart,expenses};
}
