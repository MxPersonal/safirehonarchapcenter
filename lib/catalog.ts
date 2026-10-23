export type CategoryId = 'condolence' | 'birthday' | 'pilgrimage' | 'business' | 'sticker' | 'events';
export type Design = {slug: string; code: string; name: string; category: CategoryId; tag: string; variant: number; subtitle: string;};
export const categories: { id: CategoryId; name: string; en: string; blurb: string; icon: string }[] = [
  {id:'condolence', name:'بنر تسلیت', en:'CONDOLENCE', blurb:'طرح‌های آرام، محترمانه و ماندگار', icon:'✳'},
  {id:'birthday', name:'بنر تولد', en:'BIRTHDAY', blurb:'برای جشن‌های به‌یادماندنی', icon:'✦'},
  {id:'pilgrimage', name:'زیارتی و مذهبی', en:'PILGRIMAGE', blurb:'حج، کربلا و مناسبت‌های مذهبی', icon:'☼'},
  {id:'business', name:'تبلیغاتی و افتتاحیه', en:'BUSINESS', blurb:'چاپ برای دیده‌شدن کسب‌وکار', icon:'↗'},
  {id:'sticker', name:'استیکر و لیبل', en:'STICKERS', blurb:'جزئیات کوچک، اثرگذاری بزرگ', icon:'◈'},
  {id:'events', name:'مناسبت‌ها', en:'EVENTS', blurb:'از تبریک تا قدردانی', icon:'✺'},
];
// Original showcase concepts only. NOT claims about stock, commercial products or real prices.
export const designs: Design[] = [
  {slug:'aramesh',code:'SH-101',name:'طرح آرامش',category:'condolence',tag:'تسلیت',variant:1,subtitle:'تایپوگرافی رسمی با فضایی آرام'},
  {slug:'yadegar',code:'SH-102',name:'طرح یادگار',category:'condolence',tag:'تسلیت',variant:2,subtitle:'ترکیب مشکی و طلایی'},
  {slug:'tavalod',code:'SH-201',name:'طرح جشن',category:'birthday',tag:'تولد',variant:3,subtitle:'رنگ‌های جسورانه و فضای شاد'},
  {slug:'shadi',code:'SH-202',name:'طرح شادباش',category:'birthday',tag:'تولد',variant:4,subtitle:'ترکیب رنگی مدرن'},
  {slug:'ziarat',code:'SH-301',name:'طرح زیارت',category:'pilgrimage',tag:'زیارتی',variant:5,subtitle:'نقوش هندسی و زمینه سنتی'},
  {slug:'roshan',code:'SH-401',name:'طرح شروع تازه',category:'business',tag:'افتتاحیه',variant:6,subtitle:'جلوه‌ای شفاف برای برند شما'},
  {slug:'brandmark',code:'SH-501',name:'طرح هویت',category:'sticker',tag:'استیکر',variant:7,subtitle:'کاربردی برای بسته‌بندی و کسب‌وکار'},
  {slug:'tabrik',code:'SH-601',name:'طرح تبریک',category:'events',tag:'مناسبتی',variant:8,subtitle:'ساخته‌شده برای لحظه‌های ویژه'},
];
export const printServices = [
  {title:'چاپ بنر',subtitle:'برای مراسم، تبلیغات و رویدادها',number:'01',kind:'banner'},
  {title:'چاپ فلکس',subtitle:'برای تابلوها و سازه‌های نورپردازی',number:'02',kind:'flex'},
  {title:'استیکر و وینیل',subtitle:'برای سطوح، ویترین و بسته‌بندی',number:'03',kind:'sticker'},
  {title:'مش و سولیت',subtitle:'برای کاربردهای خاص نمایشگاهی',number:'04',kind:'mesh'},
  {title:'رول‌آپ و سازه',subtitle:'برای نمایشگاه، غرفه و فروشگاه',number:'05',kind:'rollup'},
  {title:'سفارش اختصاصی',subtitle:'با فایل آماده یا طراحی سفارشی',number:'06',kind:'custom'},
];
export const moneyNote='قیمت نهایی پس از بررسی مشخصات و تأیید چاپخانه اعلام می‌شود.';
export function getDesign(slug:string){return designs.find(d=>d.slug===slug);}
export function categoryName(id:CategoryId){return categories.find(x=>x.id===id)?.name || '';}
