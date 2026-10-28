'use client';
import {useEffect,useState} from 'react';
import {ArrowDown,ArrowUp,Plus,Save,Trash2,ExternalLink} from 'lucide-react';
import {useI18n} from '@/components/locale-provider';
import {SOCIAL_ICON_OPTIONS,type SocialLink,type SocialIcon} from '@/lib/social-link-types';
import SocialIconView from '@/components/social-icon-view';

const labels:Record<SocialIcon,string>={
 instagram:'Instagram',telegram:'Telegram',youtube:'YouTube',linkedin:'LinkedIn',
 github:'GitHub',facebook:'Facebook',x:'X / Twitter',tiktok:'TikTok',
 eitaa:'Eitaa',rubika:'Rubika',pinterest:'Pinterest',whatsapp:'WhatsApp',
 website:'Website',globe:'Globe',send:'Send',music:'Music',message:'Message'
};
export default function SocialSettingsEditor(){
 const {pick}=useI18n();
 const [items,setItems]=useState<SocialLink[]>([]);
 const [loading,setLoading]=useState(true);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState('');
 const [error,setError]=useState('');
 useEffect(()=>{
  let active=true;
  void fetch('/admin/api/socials',{credentials:'same-origin',cache:'no-store'})
   .then(async res=>{const data=await res.json();if(!res.ok)throw Error(data.error||'Fetch failed');if(active)setItems(data.items||[])})
   .catch(err=>{if(active)setError(err instanceof Error?err.message:String(err))})
   .finally(()=>{if(active)setLoading(false)});
  return()=>{active=false};
 },[]);
 function update(id:string,patch:Partial<SocialLink>){setItems(rows=>rows.map(row=>row.id===id?{...row,...patch}:row))}
 function move(index:number,by:number){setItems(rows=>{const to=index+by;if(to<0||to>=rows.length)return rows;const next=[...rows];[next[index],next[to]]=[next[to],next[index]];return next})}
 function add(){
  setItems(rows=>rows.length>=20?rows:[...rows,{id:'soc'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),label:'',icon:'instagram',url:'https://',imageUrl:'',active:true}]);
 }
 async function save(e:React.FormEvent){
  e.preventDefault();setError('');setMessage('');setBusy(true);
  try{
   const res=await fetch('/admin/api/socials',{method:'PUT',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({items})});
   const data=await res.json();
   if(!res.ok)throw Error(data.error||'Save failed');
   setItems(data.items);
   setMessage(pick('شبکه‌های اجتماعی ذخیره شدند و در نوار تماس سایت نمایش داده می‌شوند.','Social links saved. Active channels now appear in the contact dock.'));
  }catch(err){setError(err instanceof Error?err.message:pick('ذخیره ممکن نشد.','Save failed.'))}
  finally{setBusy(false)}
 }
 return <div className="wf-social-admin">
  <div className="wf-social-admin-head">
   <h2>{pick('مدیریت شبکه‌های اجتماعی و آیکون‌های تماس','Manage social networks and contact icons')}</h2>
   <p>{pick('برای هر شبکه، عنوان، آیکون یا تصویر دلخواه، لینک و ترتیب نمایش را مشخص کن. سه آیکون اصلی تلفن، واتساپ و ایمیل از متغیرهای محیطی سایت تنظیم می‌شوند.','Set each channel’s title, icon or custom image, URL and display order. The original phone, WhatsApp and email buttons use site environment settings.')}</p>
  </div>
  {loading?<p role="status">{pick('بارگذاری تنظیمات...','Loading social settings...')}</p>:<form onSubmit={save}>
   <div className="wf-social-admin-list">
    {items.map((item,index)=><fieldset className="wf-social-admin-item" key={item.id}>
     <legend>{pick('شبکه','Channel')} {index+1}</legend>
     <div className="wf-social-admin-top">
      <span className="wf-social-admin-preview">
       {item.imageUrl?<img src={item.imageUrl} alt="" width="30" height="30"/>:<SocialIconView name={item.icon} size={24}/>}
      </span>
      <div className="wf-social-admin-controls">
       <button type="button" title={pick('بالا','Move up')} aria-label={pick('انتقال به بالا','Move up')} disabled={index===0} onClick={()=>move(index,-1)}><ArrowUp size={18}/></button>
       <button type="button" title={pick('پایین','Move down')} aria-label={pick('انتقال به پایین','Move down')} disabled={index===items.length-1} onClick={()=>move(index,1)}><ArrowDown size={18}/></button>
       <button type="button" title={pick('حذف','Remove')} aria-label={pick('حذف شبکه','Remove channel')} onClick={()=>setItems(rows=>rows.filter(x=>x.id!==item.id))}><Trash2 size={18}/></button>
      </div>
     </div>
     <div className="wf-social-admin-fields">
      <label>{pick('عنوان شبکه','Label')}<input required maxLength={55} value={item.label} onChange={e=>update(item.id,{label:e.target.value})} placeholder="Instagram"/></label>
      <label>{pick('انتخاب آیکون','Choose icon')}<select value={item.icon} onChange={e=>update(item.id,{icon:e.target.value as SocialIcon})}>{SOCIAL_ICON_OPTIONS.map(key=><option value={key} key={key}>{labels[key]}</option>)}</select></label>
      <label className="wf-social-admin-wide">{pick('آدرس صفحه یا پروفایل (https://)','Profile URL (https://)')}<input type="url" required dir="ltr" value={item.url} onChange={e=>update(item.id,{url:e.target.value})} placeholder="https://example.com/your-profile"/></label>
      <label className="wf-social-admin-wide">{pick('آدرس تصویر آیکون دلخواه (اختیاری)','Custom icon image URL (optional)')}<input type="url" dir="ltr" value={item.imageUrl} onChange={e=>update(item.id,{imageUrl:e.target.value})} placeholder="https://.../icon.png"/></label>
      <label className="wf-social-admin-check"><input type="checkbox" checked={item.active} onChange={e=>update(item.id,{active:e.target.checked})}/>{pick('نمایش در سایت','Visible on website')}</label>
     </div>
    </fieldset>)}
   </div>
   <div className="wf-social-admin-actions">
    <button type="button" className="v2-outline" disabled={items.length>=20} onClick={add}><Plus size={17}/>{pick('افزودن شبکه جدید','Add another social network')}</button>
    <button type="submit" className="v2-primary" disabled={busy}>{busy?pick('در حال ذخیره...','Saving...'):pick('ذخیره و انتشار','Save and publish')} <Save size={17}/></button>
   </div>
   <p className="v2-fine">{pick('حداکثر ۲۰ لینک قابل ثبت است. فقط URL معتبر http/https پذیرفته می‌شود. نیازی به دیپلوی مجدد نیست.','You can save up to 20 links. Only valid http/https URLs are accepted, and no new deployment is needed.')}</p>
   {error&&<p role="alert" className="form-error">{error}</p>}
   {message&&<p role="status" className="v2-notice">{message}</p>}
  </form>}
 </div>;
}
