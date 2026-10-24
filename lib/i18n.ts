export type Locale='fa'|'en';
export const isLocale=(s:string):s is Locale=>s==='fa'||s==='en';
export const dir=(locale:Locale)=>locale==='fa'?'rtl':'ltr';
export function localePath(href:string,locale:Locale):string{
 if(!href.startsWith('/')||href.startsWith('//'))return href;
 const clean=href.replace(/^\/(?:fa|en)(?=\/|$)/,'')||'/';
 return '/'+locale+(clean==='/'?'':clean);
}
export function localeFromPath(path:string):Locale{
 return path==='/en'||path.startsWith('/en/')?'en':'fa';
}
export function bilingual(locale:Locale,fa:string,en:string){return locale==='en'?en:fa;}
export const common={
 fa:{home:'خانه',categories:'دسته‌بندی محصولات',products:'محصولات',designs:'گالری طرح‌ها',services:'خدمات چاپ',order:'سفارش اختصاصی',guide:'راهنمای چاپ',about:'درباره ما',contact:'تماس با ما',login:'ورود',register:'ثبت‌نام',myAccount:'حساب من',cart:'سبد خرید',admin:'پنل مدیریت',search:'جست‌وجو',all:'همه',view:'مشاهده',details:'جزئیات',quote:'استعلام قیمت',price:'قیمت',currency:'تومان',customer:'مشتری',submit:'ثبت',back:'بازگشت',language:'زبان',logout:'خروج',terms:'قوانین و شرایط',privacy:'حریم خصوصی',welcome:'خوش آمدید'},
 en:{home:'Home',categories:'Print products',products:'Products',designs:'Design gallery',services:'Print services',order:'Custom order',guide:'Print guide',about:'About us',contact:'Contact',login:'Log in',register:'Sign up',myAccount:'My account',cart:'Cart',admin:'Admin dashboard',search:'Search',all:'All',view:'View',details:'Details',quote:'Request a quote',price:'Price',currency:'Toman',customer:'Customer',submit:'Submit',back:'Back',language:'Language',logout:'Log out',terms:'Terms and conditions',privacy:'Privacy policy',welcome:'Welcome'}
} as const;
export function intlNumber(value:number,locale:Locale){return new Intl.NumberFormat(locale==='fa'?'fa-IR':'en-US').format(value)}
