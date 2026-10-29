'use client';
import {useEffect,useRef,useState} from 'react';

type HCaptchaAPI={
 render:(container:HTMLElement,options:{
   sitekey:string;hl:'fa'|'en';theme:'light'|'dark';
   callback:(token:string)=>void;
   'expired-callback':()=>void;
   'error-callback':(error?:unknown)=>void;
 })=>number|string;
 reset:(id?:number|string)=>void;
 remove?:(id:number|string)=>void;
};
declare global{
 interface Window{
  hcaptcha?:HCaptchaAPI;
  safirHCaptchaReady?:()=>void;
 }
}
type Props={
 siteKey:string;
 locale:'fa'|'en';
 resetSignal:number;
 onToken:(token:string)=>void;
 onExpire:()=>void;
};
/**
 * Only a public sitekey enters this browser component. Supabase Auth validates
 * tokens with the secret held in Supabase, not in our client or GitHub.
 * No external npm dependency is required; official hCaptcha script is loaded
 * once and explicitly renders a challenge after SDK initialization.
 */
export default function HCaptchaChallenge({siteKey,locale,resetSignal,onToken,onExpire}:Props){
 const element=useRef<HTMLDivElement>(null);
 const widget=useRef<number|string|null>(null);
 const callbacks=useRef({onToken,onExpire});
 callbacks.current={onToken,onExpire};
 const [state,setState]=useState<'loading'|'ready'|'error'>('loading');
 const [errorText,setErrorText]=useState('');
 useEffect(()=>{
  if(!siteKey){setState('error');setErrorText(locale==='fa'?'Site Key کپچا در Vercel تنظیم نشده است.':'The CAPTCHA site key is missing.');return}
  let mounted=true;
  let ownReady:()=>void;
  let previousReady:undefined|(()=>void);
  const render=()=>{
   if(!mounted||!window.hcaptcha||!element.current||widget.current!==null)return;
   try{
    const rootTheme=document.documentElement.getAttribute('data-theme');
    const dark=rootTheme==='dark'||document.documentElement.classList.contains('dark');
    widget.current=window.hcaptcha.render(element.current,{
     sitekey:siteKey,hl:locale,theme:dark?'dark':'light',
     callback:(token)=>{if(mounted)callbacks.current.onToken(token)},
     'expired-callback':()=>{if(mounted)callbacks.current.onExpire()},
     'error-callback':()=>{if(mounted){callbacks.current.onExpire();setState('error');setErrorText(locale==='fa'?'خطا در بارگذاری کپچا؛ صفحه را تازه‌سازی کن.':'CAPTCHA error. Reload the page and try again.');}}
    });
    if(mounted){setState('ready');setErrorText('')}
   }catch{if(mounted){setState('error');setErrorText(locale==='fa'?'بارگذاری کپچا ممکن نشد.':'Failed to render CAPTCHA.');}}
  };
  previousReady=window.safirHCaptchaReady;
  ownReady=()=>{previousReady?.();render()};
  window.safirHCaptchaReady=ownReady;
  if(window.hcaptcha){render();}
  else{
   let script=document.querySelector<HTMLScriptElement>('script[data-safir-hcaptcha]');
   if(!script){
    script=document.createElement('script');
    script.setAttribute('data-safir-hcaptcha','1');
    script.src='https://js.hcaptcha.com/1/api.js?render=explicit&recaptchacompat=off&onload=safirHCaptchaReady';
    script.async=true;script.defer=true;
    script.addEventListener('error',()=>{if(mounted){setState('error');setErrorText(locale==='fa'?'دسترسی به سرویس hCaptcha برقرار نیست.':'Unable to reach hCaptcha.');}},{once:true});
    document.head.appendChild(script);
   }
  }
  return()=>{
   mounted=false;
   if(widget.current!==null){
    try{window.hcaptcha?.remove?.(widget.current)}catch{/* next mount gets a new container */}
    widget.current=null;
   }
   if(window.safirHCaptchaReady===ownReady)window.safirHCaptchaReady=previousReady;
  };
 },[siteKey,locale]);
 useEffect(()=>{
  if(resetSignal>0&&widget.current!==null){
   try{window.hcaptcha?.reset(widget.current)}catch{/* challenge may already be unmounted */}
  }
 },[resetSignal]);
 return <div className="sh-hcaptcha-shell" aria-label={locale==='fa'?'تأیید امنیتی hCaptcha':'hCaptcha verification'}>
   {siteKey?<div className="sh-hcaptcha-widget" ref={element}/>:null}
   {state==='loading'&&siteKey&&<small role="status">{locale==='fa'?'در حال بارگذاری تأیید امنیتی…':'Loading CAPTCHA verification…'}</small>}
   {state==='error'&&<p className="sh-hcaptcha-error" role="alert">{errorText}</p>}
   {state==='ready'&&<small>{locale==='fa'?'برای ادامه، تأیید امنیتی بالا را کامل کن.':'Complete the verification above to continue.'}</small>}
  </div>;
}
