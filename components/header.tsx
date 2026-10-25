'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowUpLeft,Menu,Search,ShoppingBag,UserRound,UserRoundPlus,X} from 'lucide-react';
import Brand from './brand';
import {browserDb} from '@/lib/supabase/client';
import {useI18n} from './locale-provider';
import LanguageSwitcher from './language-switcher';
import ThemeToggle from './theme-toggle';
export default function Header(){
 const {locale,t,path,pick}=useI18n();
 const [open,setOpen]=useState(false),[authenticated,setAuthenticated]=useState(false);
 useEffect(()=>{const db=browserDb();if(!db)return;let active=true;
  void db.auth.getUser().then(({data})=>{if(active)setAuthenticated(!!data.user)});
  const {data:listener}=db.auth.onAuthStateChange((_event,session)=>{if(active)setAuthenticated(!!session?.user)});
  return()=>{active=false;listener.subscription.unsubscribe()};
 },[]);
 const links=[['/catalog',t.categories],['/designs',t.designs],['/services',t.services],['/order',t.order],['/guide',t.guide],['/about',t.about]] as const;
 return <>
  <div className="announcement"><span className="announce-dot"/>{pick('سفیر هنر، جایی برای جان‌گرفتن ایده‌ها','Safire Honar. Where ideas come to life.')} <span className="announcement-sep">/</span><Link href={path('/catalog')}>{pick('انتخاب نوع محصول','Explore print products')} <ArrowUpLeft size={13}/></Link></div>
  <header className="site-header"><div className="container header-inner">
   <Link className="brand-anchor" href={path('/')} aria-label={t.home}><Brand/></Link>
   <nav className="nav-desktop" aria-label={pick('ناوبری اصلی','Main navigation')}>{links.map(([href,title])=><Link key={href} href={path(href)}>{title}</Link>)}</nav>
   <div className="header-actions">
    <LanguageSwitcher compact/>
    <ThemeToggle/>
    <Link className="icon-button only-desktop" href={path('/catalog')} aria-label={t.products}><Search size={20}/></Link>
    {authenticated?<><Link className="v3-auth-nav-link" href={path('/account')}><UserRound size={17}/>{t.myAccount}</Link><Link className="icon-button cart-button" href={path('/account')} aria-label={t.cart}><ShoppingBag size={20}/></Link></>:<><Link className="v3-auth-nav-link v3-signin-nav" href={path('/login')}><UserRound size={17}/>{t.login}</Link><Link className="v3-auth-nav-register" href={path('/register')}><UserRoundPlus size={17}/>{t.register}</Link></>}
    <Link className="header-order-button" href={path('/order')}>{pick('شروع سفارش','Start an order')} <ArrowUpLeft size={17}/></Link>
    <button className="icon-button menu-toggle" aria-label={open?pick('بستن منو','Close menu'):pick('باز کردن منو','Open menu')} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button>
   </div>
  </div>
  {open&&<nav className="mobile-menu" aria-label={pick('ناوبری موبایل','Mobile menu')}>
   {[[...links],[['/contact',t.contact],['/terms',t.terms]]].flat().map(([href,label])=><Link href={path(href)} key={href} onClick={()=>setOpen(false)}>{label}<ArrowUpLeft size={16}/></Link>)}
   {(authenticated?[['/account',t.myAccount]]:[['/register',t.register],['/login',t.login]]).map(([href,label])=><Link key={href} onClick={()=>setOpen(false)} href={path(href)}>{label}<UserRound size={16}/></Link>)}
  </nav>}
 </header>
 </>;
}
