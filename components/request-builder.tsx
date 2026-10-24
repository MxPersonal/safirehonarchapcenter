'use client';
import {useSearchParams} from 'next/navigation';
import {Suspense,useState} from 'react';
import {Check,Copy,FileUp,Info} from 'lucide-react';
import {useI18n} from '@/components/locale-provider';
const services=[
 ['چاپ بنر','Banner printing'],['چاپ فلکس','Flex printing'],['استیکر و وینیل','Stickers and vinyl'],
 ['مش و سولیت','Mesh and solit'],['رول‌آپ و سازه نمایشگاهی','Roll-up and exhibition displays'],['سایر خدمات','Other services']];
const materials=[['نیاز به مشاوره','Advice needed'],['بنر','Banner vinyl'],['فلکس','Flex'],['وینیل / استیکر','Vinyl / Sticker'],['مش','Mesh'],['سولیت','Solit']];
function Form({mode}:{mode:'order'|'price'}){
 const {locale,pick}=useI18n(),params=useSearchParams();
 const [service,setService]=useState(params.get('service')||services[0][0]);
 const [width,setWidth]=useState(''),[height,setHeight]=useState(''),[qty,setQty]=useState('1'),[material,setMaterial]=useState(materials[0][0]);
 const [notes,setNotes]=useState(''),[file,setFile]=useState<File|null>(null),[copied,setCopied]=useState(false),[err,setErr]=useState('');
 const shown=(list:string[][],key:string)=>list.find(v=>v[0]===key)?.[locale==='fa'?0:1]||key;
 const request=locale==='en'?'Quote request':'درخواست استعلام قیمت';
 const output=locale==='en'?
 `Quote request | Safire Honar\nService: ${shown(services,service)}\nDimensions: ${width||'Not specified'} × ${height||'Not specified'} cm\nQuantity: ${qty}\nMaterial: ${shown(materials,material)}\nNotes: ${notes||'-'}\nLocal file (not uploaded): ${file?.name||'None'}\n\nPlease confirm feasibility, price and delivery time.`:
 `درخواست استعلام قیمت | چاپ سفیر هنر\nخدمت: ${service}\nابعاد: ${width||'مشخص نشده'} × ${height||'مشخص نشده'} سانتی‌متر\nتعداد: ${qty}\nجنس: ${material}\nتوضیحات: ${notes||'-'}\nفایل انتخاب شده (ارسال نشده): ${file?.name||'ندارد'}\n\nلطفاً امکان اجرا، قیمت و زمان آماده‌سازی را اعلام کنید.`;
 async function copy(){
  if(!width.trim()||!height.trim()){setErr(pick('لطفاً عرض و ارتفاع را مشخص کنید.','Enter width and height.'));return;}
  setErr('');
  try{await navigator.clipboard.writeText(output);setCopied(true);setTimeout(()=>setCopied(false),2500);}
  catch{setErr(pick('کپی خودکار ممکن نشد. متن خروجی را دستی کپی کنید.','Could not copy automatically. Copy the text manually.'));}
 }
 return <div className="request-layout"><div className="request-form">
  <div className="form-heading"><span className="section-label">{pick('درخواست شما','YOUR REQUEST')}</span>
   <h2>{pick('مشخصات پروژه‌ات','Your project details')}</h2>
   <p>{pick('اطلاعات را آماده کن تا بتوانی برای استعلام در اختیار مجموعه قرار بدهی.','Prepare a detailed request to share with our print team.')}</p>
  </div>
  <div className="form-fields">
   <label className="input-label">{pick('نوع خدمت','Print service')}<select value={service} onChange={e=>setService(e.target.value)}>{services.map(([fa,en])=><option key={fa} value={fa}>{locale==='en'?en:fa}</option>)}</select></label>
   <div className="input-pair">
    <label className="input-label">{pick('عرض (سانتی‌متر)','Width (cm)')}<input type="number" min="1" step="any" placeholder={pick('مثلاً ۱۰۰','e.g. 100')} value={width} onChange={e=>setWidth(e.target.value)}/></label>
    <label className="input-label">{pick('ارتفاع (سانتی‌متر)','Height (cm)')}<input type="number" min="1" step="any" placeholder={pick('مثلاً ۲۰۰','e.g. 200')} value={height} onChange={e=>setHeight(e.target.value)}/></label>
   </div>
   <div className="input-pair">
    <label className="input-label">{pick('تعداد','Quantity')}<input type="number" min="1" max="10000" value={qty} onChange={e=>setQty(e.target.value)}/></label>
    <label className="input-label">{pick('متریال','Material')}<select value={material} onChange={e=>setMaterial(e.target.value)}>{materials.map(([fa,en])=><option key={fa} value={fa}>{locale==='en'?en:fa}</option>)}</select></label>
   </div>
   <label className="input-label">{pick('جزئیات بیشتر','Additional notes')}<textarea rows={5} placeholder={pick('نوع نصب، محل استفاده، زمان موردنظر یا سایر نکات...','Installation, intended use, timeframe or other details...')} value={notes} onChange={e=>setNotes(e.target.value)}/></label>
   <label className="upload-zone"><FileUp size={27}/><strong>{file?file.name:pick('فایل چاپی داری؟ انتخاب کن','Have a print file? Select it')}</strong>
    <span>{pick('فقط انتخاب فایل روی دستگاه شما؛ در این نسخه فایل آپلود یا ارسال نمی‌شود.','The file is only selected locally. It is not uploaded or sent by this form.')}</span>
    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,.svg" onChange={e=>setFile(e.target.files?.[0]||null)}/>
   </label>
   {file&&<button className="small-link" type="button" onClick={()=>setFile(null)}>{pick('حذف فایل انتخاب‌شده','Remove selected file')}</button>}
  </div>
 </div>
 <aside className="request-summary"><span className="section-label">{pick('خلاصه پروژه','PROJECT SUMMARY')}</span>
  <h2>{pick('خلاصه درخواست','Request summary')}</h2>
  <div className="summary-line"><span>{pick('نوع چاپ','Service')}</span><b>{shown(services,service)}</b></div>
  <div className="summary-line"><span>{pick('اندازه','Dimensions')}</span><b>{width&&height?`${width} × ${height} cm`:pick('تکمیل نشده','Incomplete')}</b></div>
  <div className="summary-line"><span>{pick('تعداد','Quantity')}</span><b>{qty||'−'}</b></div>
  <div className="summary-line"><span>{pick('جنس','Material')}</span><b>{shown(materials,material)}</b></div>
  <div className="summary-price"><span>{pick('مبلغ تقریبی','Estimated cost')}</span><strong>{pick('نیازمند استعلام','Quote required')}</strong><p>{pick('قیمت‌گذاری خودکار تا زمان ثبت تعرفه‌های تأییدشده فعال نیست.','Automated pricing is unavailable until rates are approved.')}</p></div>
  <div className="info-alert"><Info size={18}/><p>{pick('خروجی این فرم صرفاً یک متن آماده است و به چاپخانه ارسال نمی‌شود.','This tool prepares copyable text only. It does not send your request.')}</p></div>
  {err&&<p role="alert" className="form-error">{err}</p>}
  <button onClick={copy} className="button button-primary button-wide">{copied?pick('کپی شد','Copied'):pick('کپی متن درخواست','Copy request text')} {copied?<Check size={19}/>:<Copy size={19}/>}</button>
  <details className="request-output"><summary>{pick('نمایش متن آماده ارسال','Show prepared text')}</summary><pre>{output}</pre></details>
 </aside></div>;
}
export default function RequestBuilder({mode}:{mode:'order'|'price'}){return <Suspense fallback={<p>Loading quote form...</p>}><Form mode={mode}/></Suspense>}
