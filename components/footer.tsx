import Link from 'next/link';import {ArrowUpLeft,Instagram,Mail,MapPin,Phone} from 'lucide-react';import Brand from './brand';
export default function Footer(){const phone=process.env.NEXT_PUBLIC_BUSINESS_PHONE;const email=process.env.NEXT_PUBLIC_BUSINESS_EMAIL;const city=process.env.NEXT_PUBLIC_BUSINESS_CITY;
 return <footer className="footer"><div className="container">
 <div className="footer-top"><div className="footer-about"><Link href="/" className="footer-brand"><Brand/></Link><p>جایی برای تبدیل ایده‌های شما به اثری که دیده می‌شود. از انتخاب طرح تا آماده‌سازی برای چاپ، همراه شما هستیم.</p><div className="social-row">{phone&&<a href={`tel:${phone}`} aria-label="تماس تلفنی"><Phone size={18}/></a>}{email&&<a href={`mailto:${email}`} aria-label="ایمیل"><Mail size={18}/></a>}</div></div>
 <div className="footer-column"><h3>سفارش و خدمات</h3><Link href="/designs">طرح‌های آماده</Link><Link href="/services">خدمات چاپ</Link><Link href="/pricing">استعلام قیمت</Link><Link href="/order">ارسال مشخصات سفارش</Link></div>
 <div className="footer-column"><h3>راهنمای مشتری</h3><Link href="/guide">راهنمای فایل چاپی</Link><Link href="/track">پیگیری سفارش</Link><Link href="/cart">سبد سفارش</Link><Link href="/contact">تماس با ما</Link></div>
 <div className="footer-column"><h3>چاپ سفیر هنر</h3><Link href="/about">درباره ما</Link>{city&&<span><MapPin size={15}/> {city}</span>}{phone&&<a href={`tel:${phone}`}>{phone}</a>}{!phone&&<span>راه ارتباطی پس از تکمیل اطلاعات کسب‌وکار فعال می‌شود.</span>}<Link href="/contact">اطلاعات تماس <ArrowUpLeft size={14}/></Link></div></div>
 <div className="footer-bottom"><span>© {new Date().getFullYear()} چاپ سفیر هنر. تمامی حقوق محفوظ است.</span><span lang="en" dir="ltr">CRAFTED WITH PRECISION · SAFIRE HONAR</span></div></div></footer>
}
