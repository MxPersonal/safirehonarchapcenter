import {designEnglish} from '@/lib/translated-content';
import type {Locale} from '@/lib/i18n';
import type {Design} from '@/lib/catalog';
export default function Artwork({design,hero=false,locale='fa'}:{design:Design,hero?:boolean,locale?:Locale}){
 const v=design.variant;
 const title:Record<number,string>={1:'یاد عزیزان\nماندگار',2:'به یاد\nماندنی',3:'جشن بگیر!',4:'تولدت\nمبارک',5:'سفر به\nروشنایی',6:'یک شروع\nتازه',7:'هویت تو\nاینجاست',8:'با بهترین\nآرزوها'};
 const enTitles:Record<number,string>={1:'FOREVER\\nREMEMBERED',2:'IN LOVING\\nMEMORY',3:'CELEBRATE!',4:'HAPPY\\nBIRTHDAY',5:'A JOURNEY\\nOF LIGHT',6:'A FRESH\\nSTART',7:'YOUR IDENTITY\\nMATTERS',8:'BEST\\nWISHES'};
 return <div className={`artwork artwork-${v} ${hero?'artwork-hero':''}`} role="img" aria-label={locale==='en'?'Design preview: '+(designEnglish[design.slug]?.[0]||design.slug):`پیش‌نمایش نمونه ${design.name}`}>
  <div className="art-pattern"/><div className="art-outline"/><span className="art-mini">SAFIRE HONAR / CONCEPT DESIGN</span><span className="art-star">{v===5?'✺':v===1||v===2?'✦':'✳'}</span><span className="art-title">{locale==='en'?enTitles[v]:title[v]}</span><span className="art-foot">{locale==='en'?'CONCEPT DESIGN · CUSTOMIZABLE':'طرح نمایشی · قابل شخصی‌سازی'}</span>
 </div>
}
