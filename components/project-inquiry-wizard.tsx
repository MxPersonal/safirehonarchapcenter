'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {UserRound,Mail,Phone,ArrowLeft,ArrowRight,Check,Clock3,FileText,PackageCheck,ShieldCheck} from 'lucide-react';
import {useI18n} from '@/components/locale-provider';

type Draft={first:string;last:string;email:string;mobile:string;service:string;quantity:string;size:string;material:string;description:string};
const blank:Draft={first:'',last:'',email:'',mobile:'',service:'',quantity:'1',size:'',material:'',description:''};
const storageKey='safir-print-request-v1';

/** Public 3-step UX, authenticated persistence through the pre-existing
 * /api/quote endpoint. No fake completion and no guest database writes.
 */
export default function ProjectInquiryWizard({embedded=false}:{embedded?:boolean}){
 const {pick,path,locale}=useI18n();
 const router=useRouter();
 const [draft,setDraft]=useState<Draft>(blank);
 const [step,setStep]=useState(1);
 const [loaded,setLoaded]=useState(false);
 const [busy,setBusy]=useState(false);
 const [accepted,setAccepted]=useState(false);
 const [error,setError]=useState('');
 const [submitted,setSubmitted]=useState(false);
 const [savedId,setSavedId]=useState('');
 useEffect(()=>{
  try{
   const stored=sessionStorage.getItem(storageKey);
   if(stored){
    const data=JSON.parse(stored) as {draft?:Partial<Draft>;step?:number};
    if(data.draft&&typeof data.draft==='object'){
     setDraft({...blank,...Object.fromEntries(Object.entries(blank).map(([key])=>[key,typeof data.draft?.[key as keyof Draft]==='string'?data.draft[key as keyof Draft]:'']))} as Draft);
     if(data.step===1||data.step===2||data.step===3)setStep(data.step);
    }
   }
  }catch{/* session storage may be blocked */}
  setLoaded(true);
 },[]);
 useEffect(()=>{
  if(!loaded||submitted)return;
  try{sessionStorage.setItem(storageKey,JSON.stringify({draft,step}))}catch{/* nonpersistent browser */}
 },[draft,step,loaded,submitted]);
 const set=(key:keyof Draft,value:string)=>{setError('');setDraft(previous=>({...previous,[key]:value}))};
 const title=(fa:string,en:string)=>pick(fa,en);
 function proceed(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();setError('');
  if(step===1){
   if(draft.first.trim().length<2||draft.last.trim().length<2||!/^.+@.+\..+$/.test(draft.email.trim())||draft.mobile.replace(/\D/g,'').length<9){
    setError(pick('نام، نام خانوادگی، ایمیل و شماره تماس معتبر را وارد کنید.','Enter a valid first name, last name, email and phone number.'));return;
   }
   setStep(2);return;
  }
  if(step===2){
   if(draft.service.trim().length<2||!Number.isInteger(Number(draft.quantity))||Number(draft.quantity)<1||draft.description.trim().length<5){
    setError(pick('نوع چاپ، تعداد و توضیحات پروژه را کامل کنید.','Complete the printing service, quantity and project description.'));return;
   }
   setStep(3);
  }
 }
 async function submit(){
  setError('');
  if(!accepted){setError(pick('برای ارسال، سیاست حریم خصوصی را تأیید کنید.','Please acknowledge the privacy policy before submission.'));return;}
  setBusy(true);
  try{
   const title=draft.service.trim().slice(0,120);
   const details=[
    'Name: '+draft.first.trim()+' '+draft.last.trim(),
    'Email: '+draft.email.trim(),
    'Mobile: '+draft.mobile.trim(),
    'Service: '+draft.service.trim(),
    'Quantity: '+draft.quantity,
    'Dimensions: '+(draft.size.trim()||'-'),
    'Material: '+(draft.material.trim()||'-'),
    'Project: '+draft.description.trim()
   ].join('\n');
   if(details.length>2000)throw new Error(pick('توضیحات سفارش بیش از حد طولانی است.','Project details are too long.'));
   const response=await fetch('/api/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({title,details})});
   if(response.status===401){
    try{sessionStorage.setItem(storageKey,JSON.stringify({draft,step:3}))}catch{}
    router.push(path('/login')+'?next='+encodeURIComponent(path('/order')));
    return;
   }
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||pick('ثبت درخواست ممکن نشد.','Unable to submit the request.'));
   setSavedId(String(result.id||''));setSubmitted(true);
   try{sessionStorage.removeItem(storageKey)}catch{}
  }catch(err){setError(err instanceof Error?err.message:pick('خطا در ارسال درخواست.','Submission failed.'))}
  finally{setBusy(false)}
 }
 if(submitted)return <div className="wf-wizard-wrap"><div className="wf-wizard-frame"><div className="wf-wizard-card wf-wizard-success" role="status"><PackageCheck size={50}/><h2>{pick('درخواست چاپ ثبت شد','Your print request was received')}</h2><p>{pick('درخواست در حساب کاربری شما ذخیره شده است. هزینه و شرایط اجرا پس از بررسی اعلام می‌شود.','Your request is saved to your account. Pricing and production details will be confirmed after review.')}</p>{savedId&&<small dir="ltr">#{savedId.slice(0,8)}</small>}<Link className="wf-wizard-next" href={path('/account')}>{pick('مشاهده حساب کاربری','Open your account')} <ArrowLeft size={20}/></Link></div></div></div>;
 return <div className={'wf-wizard-wrap'+(embedded?' wf-wizard-embedded':'')} dir={locale==='fa'?'rtl':'ltr'}>
  <div className="wf-wizard-frame">
   <div className="wf-wizard-card">
    <ol className="wf-wizard-steps" aria-label={pick('مراحل سفارش','Request steps')}>
     {[1,2,3].map(i=><li key={i} className={i===step?'current':i<step?'complete':''} aria-current={i===step?'step':undefined}>
      <span className="wf-wizard-step-number">{i<step?<Check size={18}/>:i}</span>
      <span className="wf-wizard-step-name">{i===1?pick('اطلاعات تماس','Contact'):i===2?pick('مشخصات پروژه','Project'):pick('بررسی و ارسال','Review')}</span>
     </li>)}
    </ol>
    <form className="wf-wizard-form" onSubmit={proceed}>
     {step===1&&<div className="wf-wizard-stage">
      <h2>{pick('چطور با شما در ارتباط باشیم؟','How can we reach you?')}</h2>
      <p>{pick('ابتدا اطلاعات تماس را وارد کنید. در مرحلهٔ بعد سراغ جزئیات پروژه می‌رویم.','Your contact details first. Project details will follow in the next step.')}</p>
      <div className="wf-wizard-fields">
       <label>{pick('نام','First name')}<span className="wf-wizard-input"><UserRound size={21}/><input autoComplete="given-name" required minLength={2} maxLength={70} value={draft.first} onChange={e=>set('first',e.target.value)} placeholder={pick('نام شما','Your first name')}/></span></label>
       <label>{pick('نام خانوادگی','Last name')}<span className="wf-wizard-input"><UserRound size={21}/><input autoComplete="family-name" required minLength={2} maxLength={70} value={draft.last} onChange={e=>set('last',e.target.value)} placeholder={pick('نام خانوادگی شما','Your last name')}/></span></label>
       <label>{pick('آدرس ایمیل','Email address')}<span className="wf-wizard-input"><Mail size={21}/><input type="email" dir="ltr" autoComplete="email" required maxLength={120} value={draft.email} onChange={e=>set('email',e.target.value)} placeholder="name@example.com"/></span></label>
       <label>{pick('شماره موبایل','Mobile number')}<span className="wf-wizard-input"><Phone size={21}/><input type="tel" dir="ltr" autoComplete="tel" required minLength={9} maxLength={22} value={draft.mobile} onChange={e=>set('mobile',e.target.value)} placeholder={pick('مثلاً ۰۹۱۲۱۲۳۴۵۶۷','Your mobile number')}/></span></label>
      </div>
      <p className="wf-wizard-privacy">{pick('اطلاعات در حین تکمیل فرم فقط در همین مرورگر نگه‌داری می‌شود. ارسال و ذخیره در حساب بعد از مرحلهٔ تأیید و ورود انجام می‌شود.','While completing this form, your draft stays only in this browser. Your request is submitted and saved after account sign-in and confirmation.')} <Link href={path('/privacy')} target="_blank">{pick('اطلاعات حریم خصوصی','Privacy information')}</Link></p>
     </div>}
     {step===2&&<div className="wf-wizard-stage">
      <h2>{pick('درباره پروژه‌ات بگو','Tell us about your project')}</h2>
      <p>{pick('نوع محصول، تعداد و نیازهای چاپ را بنویس. قیمت بعد از بررسی اعلام می‌شود.','Describe your printing requirements. Pricing is confirmed after review.')}</p>
      <div className="wf-wizard-fields">
       <label>{pick('نوع چاپ یا محصول','Print product or service')}<span className="wf-wizard-input"><FileText size={21}/><input required minLength={2} maxLength={120} value={draft.service} onChange={e=>set('service',e.target.value)} placeholder={pick('بنر، بروشور، کارت ویزیت...','Banner, brochure, business card...')}/></span></label>
       <label>{pick('تعداد','Quantity')}<span className="wf-wizard-input"><PackageCheck size={21}/><input type="number" min="1" max="100000" required value={draft.quantity} onChange={e=>set('quantity',e.target.value)}/></span></label>
       <label>{pick('ابعاد (اختیاری)','Dimensions (optional)')}<span className="wf-wizard-input"><FileText size={21}/><input maxLength={70} value={draft.size} onChange={e=>set('size',e.target.value)} placeholder={pick('مثلاً ۱۰۰ × ۲۰۰ سانتی‌متر','e.g. 100 × 200 cm')}/></span></label>
       <label>{pick('جنس یا متریال (اختیاری)','Material (optional)')}<span className="wf-wizard-input"><FileText size={21}/><input maxLength={80} value={draft.material} onChange={e=>set('material',e.target.value)} placeholder={pick('در صورت نامشخص‌بودن خالی بگذارید','Leave blank if unsure')}/></span></label>
       <label className="wf-wizard-wide">{pick('توضیحات چاپ و خواسته‌ها','Printing requirements')}<span className="wf-wizard-input wf-wizard-textarea"><FileText size={21}/><textarea required minLength={5} maxLength={1300} rows={4} value={draft.description} onChange={e=>set('description',e.target.value)} placeholder={pick('رنگ، اندازه، نوع استفاده، زمان موردنظر و توضیحات سفارش...','Colours, usage, requested schedule, and other project notes...')}/></span></label>
      </div>
     </div>}
     {step===3&&<div className="wf-wizard-stage">
      <h2>{pick('همه‌چیز آمادهٔ بررسی است','Review your details')}</h2>
      <p>{pick('پیش از ثبت، اطلاعات را یک‌بار مرور کن. برای ثبت نهایی ورود به حساب مشتری لازم است.','Double-check your information. Account sign-in is required to save the request.')}</p>
      <dl className="wf-wizard-review">
       <div><dt>{pick('نام','Name')}</dt><dd>{draft.first} {draft.last}</dd></div>
       <div><dt>{pick('ایمیل','Email')}</dt><dd dir="ltr">{draft.email}</dd></div>
       <div><dt>{pick('موبایل','Phone')}</dt><dd dir="ltr">{draft.mobile}</dd></div>
       <div><dt>{pick('محصول','Service')}</dt><dd>{draft.service}</dd></div>
       <div><dt>{pick('تعداد','Quantity')}</dt><dd>{draft.quantity}</dd></div>
       {draft.size&&<div><dt>{pick('ابعاد','Size')}</dt><dd>{draft.size}</dd></div>}
       {draft.material&&<div><dt>{pick('جنس','Material')}</dt><dd>{draft.material}</dd></div>}
       <div className="wf-wizard-wide"><dt>{pick('شرح درخواست','Description')}</dt><dd>{draft.description}</dd></div>
      </dl>
      <label className="wf-wizard-consent"><input type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>{pick('با ارسال این درخواست، با بررسی اطلاعات تماس و شرح پروژه برای پاسخ‌گویی موافقم و سیاست','I agree to the use of my contact and project details for responding to my request, and have read the')} <Link href={path('/privacy')} target="_blank">{pick('حریم خصوصی','privacy policy')}</Link> {pick('را مطالعه کرده‌ام.','.')}</span></label>
     </div>}
     {error&&<p className="wf-wizard-error" role="alert">{error}</p>}
     <footer className="wf-wizard-footer">
      <span className="wf-wizard-duration"><Clock3 size={17}/>{pick('حدود ۲ دقیقه','About 2 minutes')}</span>
      <div className="wf-wizard-buttons">
       {step>1&&<button type="button" className="wf-wizard-back" onClick={()=>{setStep(v=>v-1);setError('')}}>{pick('قبلی','Back')}</button>}
       {step<3?<button className="wf-wizard-next" type="submit">{pick('ادامه','Continue')} <ArrowLeft size={19}/></button>
         :<button type="button" disabled={busy||!accepted} className="wf-wizard-next" onClick={()=>void submit()}>{busy?pick('در حال ثبت...','Submitting...'):pick('ثبت درخواست چاپ','Submit print request')} <ArrowLeft size={19}/></button>}
      </div>
     </footer>
    </form>
   </div>
  </div>
 </div>;
}
