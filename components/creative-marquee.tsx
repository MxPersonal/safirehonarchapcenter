import type {Locale} from '@/lib/i18n';

/**
 * A seamless typographic conveyor with two exactly matching copies.
 * Direction is deliberately left-to-right at the TRACK level for stable
 * transform arithmetic, while each FA phrase has RTL bidi isolation.
 * This is decorative; a single localized sentence is exposed via aria-label.
 */
export default function CreativeMarquee({locale}:{locale:Locale}){
 const fa=locale==='fa';
 const words=fa
  ? [{text:'داستانت را',style:'lime'},{text:'با چاپ',style:'plain'},{text:'ماندگار کن',style:'coral'},{text:'✳',style:'star'}]
  : [{text:'PRINT YOUR',style:'lime'},{text:'STORY.',style:'plain'},{text:'MAKE IT LOUD.',style:'coral'},{text:'✳',style:'star'}];
 const accessible=fa?'داستانت را با چاپ ماندگار کن':'Print your story. Make it loud.';
 return <section className="expressive-marquee-block creative-marquee" aria-label={accessible}>
  <div className="creative-marquee-track" aria-hidden="true">
   {[0,1].map(copy=><div className="creative-marquee-copy" key={copy} lang={locale} dir={fa?'rtl':'ltr'}>
    {words.map((word,i)=><span className={'creative-marquee-word creative-marquee-'+word.style} key={i}>{word.text}</span>)}
   </div>)}
  </div>
 </section>;
}
