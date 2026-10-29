'use client';
import Link from 'next/link';
import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpLeft,ArrowLeft,Menu,Search,ShoppingBag,UserRound,UserRoundPlus,X,Phone,Mail,ChevronDown} from 'lucide-react';
import Brand from './brand';
import {browserDb} from '@/lib/supabase/client';
import {useI18n} from './locale-provider';
import LanguageSwitcher from './language-switcher';
import ThemeToggle from './theme-toggle';
import SiteSearchPanel from './site-search-panel';

export default function Header(){
 const {t,path,pick}=useI18n();
 const [open,setOpen]=useState(false);
 const [searchOpen,setSearchOpen]=useState(false);
 const searchToggle=useRef<HTMLButtonElement>(null);
 const [authenticated,setAuthenticated]=useState(false);
 const [authChecked,setAuthChecked]=useState(false),[profileAvatar,setProfileAvatar]=useState<string|null>(null),[accountName,setAccountName]=useState('');
 const pathname=usePathname();
 useEffect(()=>{
  const db=browserDb();if(!db){setAuthChecked(true);return;}
  let active=true;
  async function refreshAccount(){
    const {data}=await db!.auth.getUser();
    if(!active)return;
    setAuthenticated(Boolean(data.user));setAuthChecked(true);
    if(!data.user){setProfileAvatar(null);setAccountName('');return;}
    try{
      const res=await fetch('/api/profile/header',{credentials:'same-origin',cache:'no-store'});
      if(!res.ok)return;
      const info=await res.json();
      if(active){setProfileAvatar(info.avatarUrl||null);setAccountName(info.name||'');}
    }catch{/* fallback icon */}
  }
  void refreshAccount();
  const {data:listener}=db.auth.onAuthStateChange(()=>{void refreshAccount()});
  const update=()=>{void refreshAccount()};
  window.addEventListener('safir-profile-changed',update);
  return()=>{active=false;listener.subscription.unsubscribe();window.removeEventListener('safir-profile-changed',update)};
 },[]);
 useEffect(()=>{setOpen(false);setSearchOpen(false)},[pathname]);
 useEffect(()=>{
  const desktop=window.matchMedia('(min-width: 1440px)');
  const closeMobileOnDesktop=()=>{if(desktop.matches)setOpen(false)};
  closeMobileOnDesktop();
  desktop.addEventListener('change',closeMobileOnDesktop);
  return()=>desktop.removeEventListener('change',closeMobileOnDesktop);
 },[]);
 useEffect(()=>{
  const keydown=(event:KeyboardEvent)=>{
   const target=event.target as HTMLElement|null;
   const typing=!!target&&(target.matches('input,textarea,select')||target.isContentEditable);
   if(event.key==='Escape'&&searchOpen){setSearchOpen(false);searchToggle.current?.focus()}
   if((event.key==='/'&&!typing)||(event.key.toLowerCase()==='k'&&(event.ctrlKey||event.metaKey))){
    event.preventDefault();setOpen(false);setSearchOpen(true);
   }
  };
  document.addEventListener('keydown',keydown);
  return()=>document.removeEventListener('keydown',keydown);
 },[searchOpen]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};
  window.addEventListener('keydown',onKey);
  return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)};
 },[open]);
 const links=[['/catalog',t.categories],['/designs',t.designs],['/services',t.services],['/guide',t.guide],['/about',t.about],['/contact',t.contact]] as const;
 const click=()=>{setOpen(false);setSearchOpen(false)};
 const toggleSearch=()=>{setSearchOpen(current=>!current);setOpen(false)};
 return <header className="site-header wf-header">
  <div className="wf-header-bar wf-container" dir="rtl">
    <div className="wf-header-right" dir="rtl">
      <Link href={path('/')} dir="rtl" className="wf-header-brand brand-anchor" aria-label={t.home} onClick={click}><Brand/></Link>
      <button type="button" className={'wf-hamburger'+(open?' is-active':'')} aria-label={open?pick('بستن منو','Close menu'):pick('باز کردن منو','Open menu')} aria-expanded={open} aria-controls="wf-mobile-menu" onClick={()=>{setSearchOpen(false);setOpen(x=>!x)}}>{open?<X size={22}/>:<Menu size={22}/>}</button>
    </div>
    <nav className="wf-nav-desktop wf-main-nav" dir={pick('rtl','ltr')}
      aria-label={pick('ناوبری اصلی سایت','Main website navigation')}>
      {links.map(([href,label])=><Link key={href} href={path(href)}
        aria-current={pathname===path(href)||pathname?.startsWith(path(href)+'/')?'page':undefined}
        onClick={click}>{label}</Link>)}
    </nav>
    <div className="wf-header-actions" dir="ltr" aria-label={pick("ابزارهای سایت","Website tools")}>
      <button ref={searchToggle} type="button" className={"wf-header-search"+(searchOpen?" is-active":"")} aria-label={searchOpen?pick("بستن جست‌وجو","Close search"):pick("بازکردن جست‌وجو در سایت","Open website search")} title={pick("جست‌وجوی پیشرفته","Advanced site search")} aria-controls="wf-global-search" aria-expanded={searchOpen} onClick={toggleSearch}>{searchOpen?<X size={19}/>:<Search size={19}/>}</button>
      <LanguageSwitcher compact/>
      <ThemeToggle/>
      <Link href={path(authenticated?'/account':'/login')} className="wf-auth-link"
        aria-label={authenticated?pick('ورود به حساب کاربری','Open customer account'):pick('ورود / ثبت‌نام','Sign in / Sign up')}
        title={authenticated?(accountName||t.myAccount):pick('ورود / ثبت‌نام','Sign in / Sign up')}>
        {authenticated&&profileAvatar?<img src={profileAvatar} alt="" className="wf-auth-avatar"/>:<UserRound size={19}/>}
        <span>{!authChecked?pick('حساب','Account'):authenticated?pick('حساب من','My account'):pick('ورود','Sign in')}</span>
      </Link>
      <Link className="wf-header-cta" href={path('/order')}>{pick('شروع سفارش','Start project')}<ArrowUpLeft size={16}/></Link>
    </div>
  </div>
  <SiteSearchPanel open={searchOpen} onClose={()=>{setSearchOpen(false);searchToggle.current?.focus()}}/>
  {open&&<div id="wf-mobile-menu" className="wf-menu-overlay">
    <nav dir={pick('rtl','ltr')} className="wf-menu-body wf-container" aria-label={pick('منوی همبرگری','Mobile menu')}>
      <div className="wf-menu-list">
        {links.map(([href,label])=><Link key={href} href={path(href)} onClick={click}>{label}<ArrowUpLeft size={19}/></Link>)}
        <Link href={path('/order')} onClick={click}>{t.order}<ArrowUpLeft size={19}/></Link>
        <Link href={path(authenticated?'/account':'/login')} onClick={click}>{authenticated?t.myAccount:pick('ورود / ثبت‌نام','Sign in / Sign up')}<ArrowUpLeft size={19}/></Link>
      </div>
      <div className="wf-menu-bottom">
        <Link className="wf-menu-start" href={path('/order')} onClick={click}>{pick('سفارش اختصاصی','Start your print request')}<ArrowUpLeft size={20}/></Link>
        <div className="wf-menu-shortcuts"><Link href={path('/contact')} onClick={click}><Phone size={17}/>{pick('تماس','Contact')}</Link><Link href={path('/catalog')} onClick={click}><Search size={17}/>{pick('محصولات','Catalogue')}</Link><Link href={path('/account')} onClick={click}><UserRound size={17}/>{t.myAccount}</Link></div>
      </div>
    </nav>
  </div>}
 </header>;
}
