'use client';
import {useEffect,useState} from 'react';
import {useI18n} from '@/components/locale-provider';
import {browserDb} from '@/lib/supabase/client';
import {CheckCircle2,KeyRound,MapPin,Save,ShieldAlert,ExternalLink} from 'lucide-react';
type Field='first_name'|'last_name'|'mobile'|'landline'|'national_id'|'province'|'city'|'postal_code'|'address_line'|'map_url';
type Details=Record<Field,string>;
const empty:Details={first_name:'',last_name:'',mobile:'',landline:'',national_id:'',province:'',city:'',postal_code:'',address_line:'',map_url:''};
const items:Array<{key:Field;fa:string;en:string;placeholder?:string;wide?:boolean}>= [
 {key:'first_name',fa:'نام',en:'First name'},
 {key:'last_name',fa:'نام خانوادگی',en:'Last name'},
 {key:'mobile',fa:'تلفن همراه',en:'Mobile',placeholder:'0912...'},
 {key:'landline',fa:'تلفن ثابت',en:'Landline',placeholder:'021...'},
 {key:'national_id',fa:'کد ملی (اختیاری)',en:'National ID (optional)',placeholder:'۱۰ رقم'},
 {key:'postal_code',fa:'کد پستی (اختیاری)',en:'Postal code (optional)',placeholder:'۱۰ رقم'},
 {key:'province',fa:'استان',en:'Province'},
 {key:'city',fa:'شهر',en:'City'},
 {key:'address_line',fa:'نشانی کامل تحویل سفارش',en:'Full delivery address',wide:true},
 {key:'map_url',fa:'لینک موقعیت در نشان یا Google Maps (اختیاری)',en:'Neshan or Google Maps link (optional)',placeholder:'https://...',wide:true}
];
export default function CustomerProfileEditor({email,verified}:{email:string;verified:boolean}){
 const {pick,locale}=useI18n();
 const [details,setDetails]=useState<Details>(empty),[loading,setLoading]=useState(true),[saving,setSaving]=useState(false);
 const [notice,setNotice]=useState(''),[error,setError]=useState(''),[setup,setSetup]=useState(false);
 const [mapPreview,setMapPreview]=useState(false),[locating,setLocating]=useState(false);
 const [current,setCurrent]=useState(''),[password,setPassword]=useState(''),[repeat,setRepeat]=useState(''),[changing,setChanging]=useState(false),[securityMessage,setSecurityMessage]=useState('');
 useEffect(()=>{
  let mounted=true;
  void fetch('/api/profile/details',{cache:'no-store',credentials:'same-origin'}).then(async res=>{
   const data=await res.json();
   if(!mounted)return;
   if(!res.ok){setError(data.error||pick('امکان دریافت پروفایل نیست.','Cannot load profile.'));setSetup(Boolean(data.setupRequired));return}
   const next={...empty};
   for(const key of Object.keys(empty) as Field[])next[key]=typeof data.details?.[key]==='string'?data.details[key]:'';
   setDetails(next);
  }).catch(()=>{if(mounted)setError(pick('خطا در اتصال به پروفایل.','Could not connect to profile.'))})
   .finally(()=>{if(mounted)setLoading(false)});
  return()=>{mounted=false};
 },[]);
 async function save(e:React.FormEvent){
  e.preventDefault();setNotice('');setError('');setSaving(true);
  try{
   const res=await fetch('/api/profile/details',{method:'POST',credentials:'same-origin',
    headers:{'Content-Type':'application/json'},body:JSON.stringify(details)});
   const data=await res.json();
   if(!res.ok)throw new Error(data.error||pick('ثبت اطلاعات انجام نشد.','Could not save.'));
   setNotice(pick('اطلاعات پروفایل ذخیره شد.','Your details were saved.'));
   window.dispatchEvent(new Event('safir-profile-changed'));
   window.location.reload();
  }catch(e){setError(e instanceof Error?e.message:pick('ثبت انجام نشد.','Save failed.'))}
  finally{setSaving(false)}
 }
 async function changePassword(e:React.FormEvent){
  e.preventDefault();setSecurityMessage('');
  if(password.length<8||password!==repeat){setSecurityMessage(pick('رمز جدید حداقل هشت نویسه و مطابق تکرار آن باشد.','New password must be at least 8 characters and match confirmation.'));return}
  const db=browserDb();
  if(!db){setSecurityMessage(pick('سرویس ورود در دسترس نیست.','Auth service unavailable.'));return}
  setChanging(true);
  try{
   const {error:reauth}=await db.auth.signInWithPassword({email,password:current});
   if(reauth)throw new Error(pick('گذرواژه فعلی صحیح نیست یا ورود مجدد ممکن نشد.','Current password could not be verified.'));
   const {error:update}=await db.auth.updateUser({password});
   if(update)throw update;
   setCurrent('');setPassword('');setRepeat('');
   setSecurityMessage(pick('رمز عبور تغییر کرد.','Password updated.'));
  }catch(e){setSecurityMessage(e instanceof Error?e.message:pick('تغییر رمز انجام نشد.','Password change failed.'))}
  finally{setChanging(false)}
 }
 function capturePosition(){
  if(!navigator.geolocation){setError(pick('مرورگر موقعیت‌یابی را پشتیبانی نمی‌کند.','Geolocation is unsupported.'));return}
  setLocating(true);setError('');
  navigator.geolocation.getCurrentPosition(
   ({coords})=>{setDetails(d=>({...d,map_url:'https://www.google.com/maps/search/?api=1&query='+coords.latitude.toFixed(6)+','+coords.longitude.toFixed(6)}));setLocating(false);},
   ()=>{setError(pick('دسترسی به موقعیت داده نشد. لینک نقشه را دستی وارد کن.','Location permission was not granted. Paste a map link instead.'));setLocating(false);},
   {enableHighAccuracy:false,timeout:12000,maximumAge:0}
  );
 }
 const address=[details.address_line,details.city,details.province].filter(Boolean).join('، ');
 const mapLink=details.map_url||(address?'https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(address):'');
 return <div className="sh-profile-settings">
  <section className="sh-customer-card">
   <div className="sh-profile-section-head"><div><span className="tiny-label">{pick('اطلاعات حساب مشتری','CUSTOMER DETAILS')}</span><h2>{pick('اطلاعات فردی و نشانی','Personal and delivery details')}</h2></div><MapPin size={22}/></div>
   <p className="sh-profile-hint">{pick('فیلدهای هویتی اختیاری‌اند. اطلاعات را فقط در صورت نیاز به صدور فاکتور یا ارسال سفارش وارد کن.','Identity fields are optional. Provide them only when needed for invoicing or shipping.')}</p>
   {loading?<p>{pick('در حال بارگذاری…','Loading…')}</p>:<>
    {setup&&<p className="sh-profile-warning" role="alert"><ShieldAlert size={17}/>{pick('برای ذخیره اطلاعات تکمیلی، Migration پروفایل باید در Supabase همین سایت اجرا شود.','The profile migration must be applied to the site’s Supabase project before saving.')}</p>}
    <form className="sh-profile-fields" onSubmit={save}>
     {items.map(item=><label key={item.key} className={item.wide?'sh-field-wide':''}>
      <span>{locale==='fa'?item.fa:item.en}</span>
      {item.key==='address_line'?<textarea rows={3} maxLength={750} value={details.address_line} onChange={e=>setDetails(d=>({...d,address_line:e.target.value}))} placeholder={pick('خیابان، کوچه، پلاک و واحد','Street, building and unit')}/>
       :<input dir={['mobile','landline','national_id','postal_code','map_url'].includes(item.key)?'ltr':undefined}
        inputMode={['mobile','landline','national_id','postal_code'].includes(item.key)?'numeric':undefined}
        value={details[item.key]} maxLength={item.key==='map_url'?500:item.key==='national_id'?10:item.key==='postal_code'?10:item.key==='first_name'?70:item.key==='last_name'?80:120}
        placeholder={item.placeholder} onChange={e=>setDetails(d=>({...d,[item.key]:e.target.value}))}/>}
     </label>)}
     <div className="sh-map-actions sh-field-wide">
      <button type="button" className="v2-outline" disabled={locating} onClick={capturePosition}><MapPin size={16}/>{locating?pick('در حال دریافت…','Finding location…'):pick('ثبت موقعیت فعلی با اجازه من','Use my current location')}</button>
      {mapLink&&<><a className="sh-map-link" href={mapLink} target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/>{pick('بازکردن در نقشه','Open in maps')}</a>
      <button type="button" className="v2-outline" onClick={()=>setMapPreview(v=>!v)}>{mapPreview?pick('بستن پیش‌نمایش','Hide preview'):pick('پیش‌نمایش نقشه Google','Preview Google map')}</button></>}
     </div>
     {mapPreview&&address&&<div className="sh-map-preview sh-field-wide"><iframe title={pick('پیش‌نمایش آدرس در گوگل مپس','Google Maps address preview')} loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={'https://maps.google.com/maps?q='+encodeURIComponent(address)+'&output=embed'}/></div>}
     {error&&<p role="alert" className="sh-profile-warning sh-field-wide">{error}</p>}
     {notice&&<p role="status" className="sh-profile-success sh-field-wide"><CheckCircle2 size={18}/>{notice}</p>}
     <button type="submit" className="sh-profile-save sh-field-wide" disabled={saving||setup}><Save size={18}/>{saving?pick('در حال ذخیره…','Saving…'):pick('ذخیره اطلاعات پروفایل','Save profile details')}</button>
    </form>
   </>}
  </section>
  <section className="sh-customer-card">
   <div className="sh-profile-section-head"><div><span className="tiny-label">{pick('امنیت حساب','ACCOUNT SECURITY')}</span><h2>{pick('ایمیل و گذرواژه','Email and password')}</h2></div><KeyRound size={22}/></div>
   <div className="sh-profile-email"><div><small>{pick('ایمیل حساب','Account email')}</small><strong dir="ltr">{email}</strong></div><span className={verified?'is-verified':'is-unverified'}>{verified?pick('تأییدشده','Verified'):pick('تأییدنشده','Unverified')}</span></div>
   <p className="sh-profile-hint">{pick('تغییر ایمیل نیازمند تأیید مالکیت نشانی جدید است؛ این بخش فعلاً فقط نمایش ایمیل تأییدشده را فراهم می‌کند.','Changing email requires ownership verification; this panel currently displays the verified address.')}</p>
   <form onSubmit={changePassword} className="sh-profile-fields">
    <label className="sh-field-wide"><span>{pick('گذرواژه فعلی','Current password')}</span><input type="password" autoComplete="current-password" required value={current} onChange={e=>setCurrent(e.target.value)}/></label>
    <label><span>{pick('گذرواژه جدید','New password')}</span><input type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e=>setPassword(e.target.value)}/></label>
    <label><span>{pick('تکرار گذرواژه جدید','Confirm new password')}</span><input type="password" autoComplete="new-password" minLength={8} required value={repeat} onChange={e=>setRepeat(e.target.value)}/></label>
    {securityMessage&&<p className="sh-field-wide" role="status">{securityMessage}</p>}
    <button type="submit" disabled={changing} className="sh-profile-save sh-field-wide"><KeyRound size={18}/>{changing?pick('در حال بررسی…','Updating…'):pick('تغییر گذرواژه','Update password')}</button>
   </form>
  </section>
 </div>;
}
