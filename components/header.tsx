'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ArrowUpLeft,ArrowLeft,Menu,Search,ShoppingBag,UserRound,UserRoundPlus,X,Phone,Mail,ChevronDown} from 'lucide-react';
import Brand from './brand';
import {browserDb} from '@/lib/supabase/client';
import {useI18n} from './locale-provider';
import LanguageSwitcher from './language-switcher';
import ThemeToggle from './theme-toggle';

export default function Header(){
 const {t,path,pick}=useI18n();
 const [open,setOpen]=useState(false);
 const [authenticated,setAuthenticated]=useState(false);
 const pathname=usePathname();
 useEffect(()=>{
  const db=browserDb();if(!db)return;
  let active=true;
  void db.auth.getUser().then(({data})=>{if(active)setAuthenticated(!!data.user)});
  const {data:listener}=db.auth.onAuthStateChange((_event,session)=>{if(active)setAuthenticated(!!session?.user)});
  return()=>{active=false;listener.subscription.unsubscribe()};
 },[]);
 useEffect(()=>{setOpen(false)},[pathname]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow='hidden';
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')setOpen(false)};
  window.addEventListener('keydown',onKey);
  return()=>{document.body.style.overflow=previous;window.removeEventListener('keydown',onKey)};
 },[open]);
 const links=[['/catalog',t.categories],['/designs',t.designs],['/services',t.services],['/guide',t.guide],['/about',t.about],['/contact',t.contact]] as const;
 const click=()=>setOpen(false);
 return <header className="site-header wf-header">
  <div className="wf-header-bar wf-container">
    <Link href={path('/')} className="wf-header-brand brand-anchor" aria-label={t.home} onClick={click}><Brand/></Link>
    <nav className="wf-nav-desktop" aria-label={pick('ناوبری اصلی','Main navigation')}>
      {links.map(([href,label])=><Link key={href} href={path(href)}>{label}</Link>)}
    </nav>
    <div className="wf-header-actions">
      <LanguageSwitcher compact/>
      <ThemeToggle/>
      {authenticated?<Link href={path('/account')} className="wf-header-account" aria-label={t.myAccount}><UserRound size={18}/></Link>:<Link href={path('/login')} className="wf-header-account" aria-label={t.login}><UserRound size={18}/></Link>}
      <Link className="wf-header-cta" href={path('/order')}>{pick('شروع سفارش','Start project')}<ArrowUpLeft size={16}/></Link>
      <button type="button" className={'wf-hamburger'+(open?' is-active':'')} aria-label={open?pick('بستن منو','Close menu'):pick('باز کردن منو','Open menu')} aria-expanded={open} aria-controls="wf-mobile-menu" onClick={()=>setOpen(x=>!x)}>{open?<X size={22}/>:<Menu size={22}/>}</button>
    </div>
  </div>
  {open&&<div id="wf-mobile-menu" className="wf-menu-overlay">
    <nav className="wf-menu-body wf-container" aria-label={pick('منوی همبرگری','Mobile menu')}>
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
