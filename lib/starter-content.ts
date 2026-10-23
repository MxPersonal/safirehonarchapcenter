/** Public, illustrative content that shipped in the first version of this site.
 * The admin displays these previews until the owner imports them into Supabase.
 * Importing never overwrites existing database records with the same slug.
 */
import {demoCategories} from '@/lib/store';
import {designs} from '@/lib/catalog';

export const starterCategories = demoCategories.map(({id,isSample,...c})=>({
  slug:c.slug,name:c.name,description:c.description,theme:c.theme,
  image_url:c.image_url,active:true,sort_order:c.sort_order??0,
  parent_slug:c.parent_id?demoCategories.find(x=>x.id===c.parent_id)?.slug||null:null,
}));
export const starterProducts = designs.map((design,index)=>({
 slug:design.slug,name:design.name,description:`${design.subtitle} (نمونه گرافیکی نمایشی؛ قیمت و امکان اجرا نیازمند تأیید است)`,
 category_slug:design.category,mode:'quote' as const,price_toman:null,image_url:null,active:true,
 showcase_code:design.code,sort_order:index,
}));
export const starterPages = [
 {slug:'home',title:'چاپ، فقط چاپ نیست؛ یک هنره!',body:'از بنرهای چندمتری تا ظرافت یک کارت ویزیت. هر سفارشی می‌تونه یک اثر متفاوت باشه. دسته‌بندی‌ات رو انتخاب کن، نمونه‌ها رو ببین و سفارش مخصوص خودت رو بساز.'},
 {slug:'about',title:'درباره چاپ سفیر هنر',body:'چاپ سفیر هنر بستری برای مشاهده نمونه‌ها، شخصی‌سازی طرح‌ها و ثبت درخواست خدمات چاپ است. اطلاعات رسمی مجموعه از پنل مدیریت تکمیل خواهد شد.'},
 {slug:'contact',title:'تماس با ما',body:'برای نمایش شماره‌های تماس، ساعات کاری و آدرس صحیح، اطلاعات کسب‌وکار باید توسط مدیر وارد شود.'},
 {slug:'terms',title:'قوانین و شرایط سفارش',body:'متن رسمی قوانین هنوز ثبت نشده است. تا انتشار شرایط تأییدشده، ثبت سفارش و پرداخت قطعی فعال نیست.'},
 {slug:'privacy',title:'سیاست حریم خصوصی',body:'متن سیاست حریم خصوصی نیازمند بازبینی و انتشار توسط مدیر کسب‌وکار است.'},
];
