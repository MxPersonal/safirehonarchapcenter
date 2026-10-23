import type {Design} from '@/lib/catalog';
export default function Artwork({design,hero=false}:{design:Design,hero?:boolean}){
 const v=design.variant;
 const title:Record<number,string>={1:'یاد عزیزان\nماندگار',2:'به یاد\nماندنی',3:'جشن بگیر!',4:'تولدت\nمبارک',5:'سفر به\nروشنایی',6:'یک شروع\nتازه',7:'هویت تو\nاینجاست',8:'با بهترین\nآرزوها'};
 return <div className={`artwork artwork-${v} ${hero?'artwork-hero':''}`} role="img" aria-label={`پیش‌نمایش نمونه ${design.name}`}>
  <div className="art-pattern"/><div className="art-outline"/><span className="art-mini">SAFIRE HONAR / CONCEPT DESIGN</span><span className="art-star">{v===5?'✺':v===1||v===2?'✦':'✳'}</span><span className="art-title">{title[v]}</span><span className="art-foot">طرح نمایشی · قابل شخصی‌سازی</span>
 </div>
}
