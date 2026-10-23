'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {ArrowUpLeft,Menu,Search,ShoppingBag,UserRound,X} from 'lucide-react';
import Brand from './brand';
import {getCart} from '@/lib/cart';
const links=[['/designs','طرح‌های آماده'],['/services','خدمات چاپ'],['/pricing','استعلام قیمت'],['/guide','راهنمای چاپ'],['/track','پیگیری سفارش']];
export default function Header(){
 const [open,setOpen]=useState(false);const [count,setCount]=useState(0);
 useEffect(()=>{const refresh=()=>setCount(getCart().reduce((s,x)=>s+x.quantity,0));refresh();window.addEventListener('safir-cart-change',refresh);return()=>window.removeEventListener('safir-cart-change',refresh)},[]);
 return <><div className="announcement"><span className="announce-dot"/> کیفیت از جزئیات شروع می‌شود <span className="announcement-sep">/</span> سفارش چاپ با سلیقه شما <Link href="/order">شروع سفارش <ArrowUpLeft size={13}/></Link></div>
 <header className="site-header"><div className="container header-inner">
 <Link className="brand-anchor" href="/" aria-label="صفحه اصلی چاپ سفیر هنر"><Brand/></Link>
 <nav className="nav-desktop" aria-label="ناوبری اصلی">{links.map(([href,label])=><Link key={href} href={href}>{label}</Link>)}</nav>
 <div className="header-actions"><Link className="icon-button only-desktop" href="/designs" aria-label="جستجو بین طرح‌ها"><Search size={20}/></Link><Link className="icon-button cart-button" href="/cart" aria-label="سبد سفارش"><ShoppingBag size={21}/>{count>0&&<span className="cart-count">{count}</span>}</Link><Link className="header-order-button" href="/order">ثبت سفارش <ArrowUpLeft size={17}/></Link><button className="icon-button menu-toggle" aria-label={open?'بستن منو':'باز کردن منو'} aria-expanded={open} onClick={()=>setOpen(!open)}>{open?<X size={23}/>:<Menu size={23}/>}</button></div>
 </div>{open&&<nav className="mobile-menu" aria-label="ناوبری موبایل">{links.map(([href,label])=><Link key={href} onClick={()=>setOpen(false)} href={href}>{label}<ArrowUpLeft size={16}/></Link>)}<Link onClick={()=>setOpen(false)} href="/cart">سبد سفارش<ShoppingBag size={16}/></Link><Link onClick={()=>setOpen(false)} href="/contact">تماس با ما<UserRound size={16}/></Link></nav>}</header></>
}
