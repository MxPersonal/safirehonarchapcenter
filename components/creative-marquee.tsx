import type {Locale} from '@/lib/i18n';

/** A single message that moves across the strip. No duplicated content.
 * Motion CSS travels with the HTML, independent of separately cached CSS assets. */
export default function CreativeMarquee({locale}:{locale:Locale}){
 const fa=locale==='fa';
 const accessible=fa?'داستانت را با چاپ ماندگار کن':'Print your story. Make it loud.';
 return <section className="expressive-marquee-block creative-marquee safir-single-ticker" aria-label={accessible}>
  <style>{"\n.safir-single-ticker{overflow:hidden!important;isolation:isolate;min-width:0}\n.safir-single-ticker > .safir-ticker-viewport{\n width:100%!important;min-width:0;max-width:100%;\n overflow:hidden!important;display:block!important;\n padding:4px 0!important;direction:ltr!important;\n text-align:left!important;white-space:nowrap!important;\n}\n.safir-single-ticker .safir-ticker-message{\n display:inline-flex!important;flex-wrap:nowrap!important;\n justify-content:flex-start!important;align-items:center!important;\n width:max-content!important;max-width:none!important;\n white-space:nowrap!important;vertical-align:middle;\n gap:clamp(28px,6.5vw,95px)!important;\n margin:0!important;padding:0!important;\n direction:ltr!important;line-height:1.55!important;\n transform:translate3d(85vw,0,0);will-change:transform;\n animation:safir-single-scroll 17s linear -4.5s infinite!important;\n}\n.safir-single-ticker .safir-ticker-piece{\n display:inline-block!important;flex:0 0 auto!important;\n white-space:nowrap!important;word-break:keep-all!important;\n font:900 clamp(36px,5.8vw,82px)/1.4 Arial,system-ui,sans-serif!important;\n letter-spacing:-.035em!important;color:#fff8f0!important;\n text-align:center!important;\n}\nhtml[lang=\"fa\"] .safir-single-ticker .safir-ticker-piece{\n font:400 clamp(34px,5.5vw,76px)/1.55 var(--font-display),'Lalezar',Tahoma,sans-serif!important;\n letter-spacing:0!important;direction:rtl!important;\n}\n.safir-single-ticker .safir-ticker-piece.safir-accent{color:#d4ff82!important}\n.safir-single-ticker .safir-ticker-piece.safir-coral{color:#ffcdc0!important}\n.safir-single-ticker .safir-ticker-star{\n font:900 clamp(40px,5vw,67px)/1 Arial,sans-serif!important;\n color:#ffd1b9!important;flex:0 0 auto!important;\n}\n@keyframes safir-single-scroll{\n from{transform:translate3d(85vw,0,0)}\n to{transform:translate3d(-100%,0,0)}\n}\n@media(max-width:680px){\n .safir-single-ticker{padding:21px 0!important}\n .safir-single-ticker .safir-ticker-message{gap:38px!important;animation-duration:15s!important;animation-delay:-5s!important}\n .safir-single-ticker .safir-ticker-piece{font-size:36px!important}\n html[lang=\"fa\"] .safir-single-ticker .safir-ticker-piece{font-size:35px!important}\n .safir-single-ticker .safir-ticker-star{font-size:40px!important}\n}\n@media(prefers-reduced-motion:reduce){\n .safir-single-ticker .safir-ticker-message{\n  animation:none!important;transform:translate3d(0,0,0)!important;\n  will-change:auto!important\n }\n}"}</style>
  <div className="safir-ticker-viewport" aria-hidden="true">
   <p className="safir-ticker-message" lang={locale}>
    {fa?<>
     <span className="safir-ticker-piece safir-accent">داستانت را</span>
     <span className="safir-ticker-star">✳</span>
     <span className="safir-ticker-piece">با چاپ</span>
     <span className="safir-ticker-star">✳</span>
     <span className="safir-ticker-piece safir-coral">ماندگار کن!</span>
    </>:<>
     <span className="safir-ticker-piece safir-accent">PRINT YOUR STORY.</span>
     <span className="safir-ticker-star">✳</span>
     <span className="safir-ticker-piece safir-coral">MAKE IT LOUD.</span>
    </>}
   </p>
  </div>
 </section>;
}
