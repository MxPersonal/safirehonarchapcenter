export type CartItem = {id:string; slug:string; title:string; code:string; width:string; material:string; quantity:number; customText:string; delivery:string; addedAt:number;};
const KEY='safir-honar-cart-v1';
export function getCart():CartItem[]{
 if(typeof window==='undefined') return [];
 try {const raw=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(raw)?raw.filter(x=>x&&typeof x.id==='string'):[];} catch{return [];}
}
export function saveCart(items:CartItem[]){if(typeof window!=='undefined'){localStorage.setItem(KEY,JSON.stringify(items));window.dispatchEvent(new Event('safir-cart-change'));}}
export function addCart(item:CartItem){saveCart([...getCart(),item]);}
export function removeCart(id:string){saveCart(getCart().filter(x=>x.id!==id));}
export function changeQuantity(id:string,delta:number){saveCart(getCart().map(x=>x.id===id?{...x,quantity:Math.max(1,x.quantity+delta)}:x));}
export function buildOrderText(items:CartItem[]){return ['درخواست بررسی سفارش | چاپ سفیر هنر','',...items.map((x,i)=>`${i+1}. ${x.title} (${x.code})\nابعاد: ${x.width}\nمتریال: ${x.material}\nتعداد: ${x.quantity}\nروش دریافت: ${x.delivery}\nمتن: ${x.customText || 'بدون متن سفارشی'}`),'','لطفاً قیمت، امکان اجرا و زمان تحویل را اعلام فرمایید.'].join('\n');}
