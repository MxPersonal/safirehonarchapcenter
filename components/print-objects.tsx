import type {ReactNode} from 'react';
/** Type-specific original graphic mockups, not fabricated customer work photos. */
export default function PrintObject({slug,name}:{slug:string;name:string}){
 let object:ReactNode;
 switch(slug){
 case 'banner': case 'condolence': case 'birthday': case 'events': case 'pilgrimage':
  object=<div className="v3-object-banner"><span className="v3-object-eyebrow">THE MOMENT / 001</span><strong>هر لحظه<br/>یک <i>اثر.</i></strong><span className="v3-object-banner-orbit"/><small>SAFIRE HONAR PRINT STUDIO</small></div>;break;
 case 'brochure': case 'brochure-bifold': case 'brochure-trifold':
  object=<div className="v3-object-brochure"><div className="v3-brochure-left"><small>ISSUE NO. 01</small><strong>CREATE<br/>IMPACT.</strong><span>✳</span></div><div className="v3-brochure-right"><span>OUR<br/>WORLD</span><i/><small>STUDIO COLLECTION</small></div></div>;break;
 case 'business-card':case 'card-matte':case 'card-special':
  object=<div className="v3-object-business"><div className="v3-business-back">STUDIO <b>SH.</b><span>THE ART OF FIRST IMPRESSION</span></div><div className="v3-business-front"><b>SH.</b><span>سفیر هنر</span><small>PRINT STUDIO · 2026</small></div></div>;break;
 case 'signboard':case 'raised-letters':case 'lightbox':case 'shop-signs':
  object=<div className="v3-object-sign"><div className="v3-sign-top">S A F I R E</div><div className="v3-sign-letters">هنر<span>✳</span></div><small>BUILT TO STAND OUT</small></div>;break;
 case 'sticker': case 'product-label': case 'window-sticker':
  object=<div className="v3-object-stickers"><div className="v3-sticker-1"><b>FRESH</b><span>PRINT CLUB</span></div><div className="v3-sticker-2">✳<span>CREATIVE STUDIO</span></div><div className="v3-sticker-3"><span>SH.</span><b>100% IDEAS</b></div></div>;break;
 case 'flyer':
  object=<div className="v3-object-flyer"><span>LIMITED EDITION / 01</span><strong>DESIGN<br/>MATTERS.</strong><i>✷</i><small>AN IDEA WORTH SHARING</small></div>;break;
 case 'packaging':
  object=<div className="v3-object-box"><div className="v3-box-top">SAFIRE / HONAR</div><div className="v3-box-face"><span>SH</span><b>حس خوب<br/>باز کردن</b><small>PACKAGING THAT SPEAKS</small></div><div className="v3-box-side">SH·01</div></div>;break;
 case 'exhibition':
  object=<div className="v3-object-exhibition"><div className="v3-stand-left"><strong>BE<br/>SEEN.</strong><small>SH / 01</small></div><div className="v3-stand-right"><span>✳</span><b>ایده‌ها<br/>جلوه می‌کنند.</b></div><div className="v3-stand-floor"/></div>;break;
 default:
  object=<div className="v3-object-generic"><span>SAFIRE HONAR / PRINT</span><b>{name}</b><strong>✳</strong></div>;
 }
 return <div className={`v3-print-object v3-type-${slug}`} aria-label={`ماکاپ نمایشی ${name}`} role="img"><div className="v3-object-light"/>{object}<span className="v3-object-shadow"/></div>
}
