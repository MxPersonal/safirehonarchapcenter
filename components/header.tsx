'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowUpLeft,Menu,Search,ShoppingBag,UserRound,UserRoundPlus,X} from 'lucide-react';
import Brand from './brand';
import {browserDb} from '@/lib/supabase/client';
const links=[['/catalog','محصولات چاپی'],['/designs','گالری طرح‌ها'],['/services','خدمات چاپ'],['/order','سفارش اختصاصی'],['/guide','راهنمای چاپ'],['/about','درباره ما']];
export default function Header(){
 const [open,setOpen]=useState(false),[authenticated,setAuthenticated]=useState(false);
 useEffect(()=>{const db=browserDb();if(!db)return;let active=true;
  void db.auth.getUser().then(({data})=>{if(active)setAuthenticated(!!data.user)});
  const {data:listener}=db.auth.onAuthStateChange((_event,session)=>{if(active)setAuthenticated(!!session?.user)});
  return()=>{active=false;listener.subscription.unsubscribe()};
 },[]);
 return <>
 <div className="announcement"><span className="announce-dot"/> سفیر هنر، جایی برای جان‌گرفتن ایده‌ها <span className="announcement-sep">/</span><Link href="/catalog">انتخاب نوع محصول <ArrowUpLeft size={13}/></Link></div>
 <header className="site-header"><div className="container header-inner"><Link className="brand-anchor" href="/" aria-label="صفحه اصلی"><Brand/></Link>
 <nav className="nav-desktop" aria-label="ناوبری اصلی">{links.map(([href,title])=><Link key={href} href={href}>{title}</Link>)}</nav>
 <div className="header-actions"><Link className="icon-button only-desktop" href="/catalog" aria-label="مشاهده محصولات چاپی"><Search size={20}/></Link>
 {authenticated?<><Link className="v3-auth-nav-link" href="/account"><UserRound size={17}/> حساب من</Link><Link className="icon-button cart-button" href="/account" aria-label="سبد و سفارش‌های من"><ShoppingBag size={20}/></Link></>:<><Link className="v3-auth-nav-link v3-signin-nav" href="/login"><UserRound size={17}/> ورود</Link><Link className="v3-auth-nav-register" href="/register"><UserRoundPlus size={17}/> ثبت‌نام</Link></>}
 <Link className="header-order-button" href="/order">شروع سفارش <ArrowUpLeft size={17}/></Link><button className="icon-button menu-toggle" aria-label={open?'بستن منو':'باز کردن منو'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button></div></div>
 {open&&<nav className="mobile-menu" aria-label="ناوبری موبایل">{[...links,['/contact','تماس با ما'],['/terms','قوانین']].map(([href,label])=><Link href={href} key={href} onClick={()=>setOpen(false)}>{label}<ArrowUpLeft size={16}/></Link>)}{(authenticated?[['/account','حساب و سفارش‌های من']]:[['/register','ثبت‌نام مشتری'],['/login','ورود مشتری']]).map(([href,label])=><Link key={href} onClick={()=>setOpen(false)} href={href}>{label}<UserRound size={16}/></Link>)}</nav>}
 </header></>
}
