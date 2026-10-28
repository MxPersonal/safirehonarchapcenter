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
 const pathname=usePathname();
 useEffect(()=>{
  const db=browserDb();if(!db)return;
  let active=true;
  void db.auth.getUser().then(({data})=>{if(active)setAuthenticated(!!data.user)});
  const {data:listener}=db.auth.onAuthStateChange((_event,session)=>{if(active)setAuthenticated(!!session?.user)});
  return()=>{active=false;listener.subscription.unsubscribe()};
 },[]);
 useEffect(()=>{setOpen(false);setSearchOpen(false)},[pathname]);
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
    <div className="wf-header-actions" dir="ltr" aria-label={pick("ابزارهای سایت","Website tools")}>
      <button ref={searchToggle} type="button" className={"wf-header-search"+(searchOpen?" is-active":"")} aria-label={searchOpen?pick("بستن جست‌وجو","Close search"):pick("بازکردن جست‌وجو در سایت","Open website search")} title={pick("جست‌وجوی پیشرفته","Advanced site search")} aria-controls="wf-global-search" aria-expanded={searchOpen} onClick={toggleSearch}>{searchOpen?<X size={19}/>:<Search size={19}/>}</button>
      <LanguageSwitcher compact/>
      <ThemeToggle/>
      {authenticated?<Link href={path('/account')} className="wf-header-account" aria-label={t.myAccount}><UserRound size={18}/></Link>:<Link href={path('/login')} className="wf-header-account" aria-label={t.login}><UserRound size={18}/></Link>}
      <Link className="wf-header-cta" href={path('/order')}>{pick('شروع سفارش','Start project')}<ArrowUpLeft size={16}/></Link>
    </div>
  </div>
  <SiteSearchPanel open={searchOpen} onClose={()=>{setSearchOpen(false);searchToggle.current?.focus()}}/>
  {open&&<div id="wf-mobile-menu" className="wf-menu-overlay">
    <nav dir={pick('rtl','ltr')} className="wf-menu-body wf-container" aria-label={pick('منوی همبرگری','Mobile menu')}>
      <div className="wf-menu-list">
        {links.map(([href,label])=><Link key={href} href={path(href)} onClick={click}>{label}<ArrowUpLeft size={19}/></Link>)}
        <Link href={path('/order')} onClick={click}>{t.order}<ArrowUpLeft size={19}/></Link>
        <Link href={path(authenticated?'/account':'/register')} onClick={click}>{authenticated?t.myAccount:t.register}<ArrowUpLeft size={19}/></Link>
      </div>
      <div className="wf-menu-bottom">
        <Link className="wf-menu-start" href={path('/order')} onClick={click}>{pick('سفارش اختصاصی','Start your print request')}<ArrowUpLeft size={20}/></Link>
        <div className="wf-menu-shortcuts"><Link href={path('/contact')} onClick={click}><Phone size={17}/>{pick('تماس','Contact')}</Link><Link href={path('/catalog')} onClick={click}><Search size={17}/>{pick('محصولات','Catalogue')}</Link><Link href={path('/account')} onClick={click}><UserRound size={17}/>{t.myAccount}</Link></div>
      </div>
    </nav>
  </div>}
 </header>;
}
