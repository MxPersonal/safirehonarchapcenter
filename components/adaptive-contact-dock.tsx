'use client';

import {useEffect,useRef,useState} from 'react';
import {usePathname} from 'next/navigation';
import {ChevronLeft,ChevronRight,Phone,Mail} from 'lucide-react';
import type {Locale} from '@/lib/i18n';

type ManualState='open'|'closed'|null;
type Props={locale:Locale;phone:string;email:string;whatsapp:string;contactPage:string};

/** Returns whether rendered text (not simply a large section's box)
 * would be covered by the physical footprint of the expanded contact panel.
 * Expensive geometry is limited to nodes already intersecting that footprint.
 */
function coversText(area:DOMRect):boolean {
  const left=area.left-5;
  const right=area.right+5;
  const top=area.top-5;
  const bottom=area.bottom+5;
  const candidates=document.querySelectorAll<HTMLElement>(
    'main h1,main h2,main h3,main h4,main p,main li,main a,main button,main label,main strong,main small,main summary'
  );
  for(const element of candidates) {
    if(element.closest('[aria-hidden="true"],[hidden]'))continue;
    const r=element.getBoundingClientRect();
    if(r.right<=left||r.left>=right||r.bottom<=top||r.top>=bottom)continue;
    const walker=document.createTreeWalker(element,NodeFilter.SHOW_TEXT);
    let node:Node|null;
    while((node=walker.nextNode())) {
      if(!node.textContent?.trim())continue;
      const range=document.createRange();
      range.selectNodeContents(node);
      const lines=range.getClientRects();
      for(let i=0;i<lines.length;i++) {
        const rect=lines[i];
        if(rect.width>0&&rect.height>0&&rect.right>left&&rect.left<right&&rect.bottom>top&&rect.top<bottom) {
          range.detach();
          return true;
        }
      }
      range.detach();
    }
  }
  return false;
}

const whatsappMark=<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.198.297-.767.966-.94 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.476-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.133-.133.297-.347.446-.52.149-.174.198-.298.297-.496.099-.198.05-.372-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.273.297-1.04 1.016-1.04 2.479s1.064 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.261.489 1.692.625.711.227 1.358.195 1.869.118.57-.085 1.758-.719 2.005-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zm-5.462 7.508h-.004a9.875 9.875 0 0 1-5.032-1.378l-.361-.214-3.742.982.999-3.648-.235-.374a9.866 9.866 0 0 1-1.51-5.26c.002-5.45 4.437-9.884 9.889-9.884a9.825 9.825 0 0 1 6.995 2.898 9.825 9.825 0 0 1 2.896 6.996c-.002 5.45-4.437 9.884-9.895 9.884zM12.01.13C5.457.13.124 5.463.12 12.017a11.83 11.83 0 0 0 1.587 5.931L.02 24l6.2-1.627a11.894 11.894 0 0 0 5.785 1.474h.005c6.552 0 11.886-5.333 11.89-11.886A11.823 11.823 0 0 0 20.436 3.5 11.822 11.822 0 0 0 12.01.13z"/>
</svg>;

export default function AdaptiveContactDock({locale,phone,email,whatsapp,contactPage}:Props){
  const pathname=usePathname();
  const [autoHidden,setAutoHidden]=useState(false);
  const [manual,setManual]=useState<ManualState>(null);
  const expanded=manual==='open'||(manual===null&&!autoHidden);
  const anchor=useRef<HTMLElement|null>(null);
  const manualOpenedAt=useRef(0);
  const expandedRef=useRef(expanded);
  const manualRef=useRef(manual);
  expandedRef.current=expanded;
  manualRef.current=manual;
  const fa=locale==='fa';
  const callLabel=phone?(fa?'تماس تلفنی با سفیر هنر':'Call Safire Honar'):(fa?'شماره ثبت نشده، مشاهده تماس با ما':'Phone not configured, open contact page');
  const waLabel=whatsapp?(fa?'گفت‌وگو در واتساپ':'WhatsApp chat'):(fa?'واتساپ ثبت نشده، مشاهده تماس با ما':'WhatsApp unavailable, open contact page');
  const mailLabel=email?(fa?'ارسال ایمیل':'Send email'):(fa?'ایمیل ثبت نشده، مشاهده تماس با ما':'Email unavailable, open contact page');
  const channels=[
    {id:'phone',href:phone?'tel:'+phone:contactPage,title:callLabel,icon:<Phone size={22} strokeWidth={2} aria-hidden="true"/>},
    {id:'whatsapp',href:whatsapp?'https://wa.me/'+whatsapp:contactPage,title:waLabel,icon:whatsappMark,external:!!whatsapp},
    {id:'email',href:email?'mailto:'+email:contactPage,title:mailLabel,icon:<Mail size={22} strokeWidth={2} aria-hidden="true"/>}
  ];

  useEffect(()=>{
    setManual(null);
    setAutoHidden(false);
  },[pathname]);

  useEffect(()=>{
    let frame=0;
    let delay:number|undefined;
    let visible=true;

    const evaluate=()=>{
      if(!visible||!anchor.current)return;
      // A click to reopen takes precedence until the next meaningful scroll.
      if(manualRef.current==='closed')return;
      if(manualRef.current==='open'){
        if(Math.abs(window.scrollY-manualOpenedAt.current)<110)return;
        setManual(null);
      }
      const rect=anchor.current.getBoundingClientRect();
      setAutoHidden(coversText(rect));
    };

    const schedule=()=>{
      if(frame||delay)return;
      delay=window.setTimeout(()=>{
        delay=undefined;
        frame=window.requestAnimationFrame(()=>{
          frame=0;
          evaluate();
        });
      },85);
    };

    const observe=()=>{
      visible=!document.hidden;
      if(visible)schedule();
    };

    // Initial check after hydration, then passive checks while scrolling.
    schedule();
    window.addEventListener('scroll',schedule,{passive:true});
    window.addEventListener('resize',schedule,{passive:true});
    document.addEventListener('visibilitychange',observe);
    return()=>{
      window.removeEventListener('scroll',schedule);
      window.removeEventListener('resize',schedule);
      document.removeEventListener('visibilitychange',observe);
      if(frame)window.cancelAnimationFrame(frame);
      if(delay)window.clearTimeout(delay);
    };
  },[pathname]);

  const toggle=()=>{
    if(expandedRef.current) {
      setManual('closed');
    } else {
      manualOpenedAt.current=window.scrollY;
      setManual('open');
    }
  };

  return <aside
    className={'wf-smart-dock'+(expanded?' is-expanded':' is-collapsed')}
    ref={anchor}
    dir="ltr"
    aria-label={fa?'ارتباط سریع با سفیر هنر':'Safire Honar quick contact'}>
    <div id="safir-contact-channels" className="wf-smart-dock-panel" aria-hidden={!expanded}>
      {channels.map(channel=><a
        key={channel.id}
        className={'wf-smart-dock-link wf-smart-dock-'+channel.id}
        href={channel.href}
        title={channel.title}
        aria-label={channel.title}
        target={channel.external?'_blank':undefined}
        rel={channel.external?'noopener noreferrer':undefined}
        tabIndex={expanded?0:-1}>
          {channel.icon}
      </a>)}
    </div>
    <button type="button"
      className="wf-smart-dock-toggle"
      aria-controls="safir-contact-channels"
      aria-expanded={expanded}
      onClick={toggle}
      title={expanded?(fa?'جمع‌کردن راه‌های ارتباطی':'Hide contact shortcuts'):(fa?'نمایش راه‌های ارتباطی':'Show contact shortcuts')}
      aria-label={expanded?(fa?'جمع‌کردن نوار تماس':'Hide contact dock'):(fa?'بازکردن نوار تماس':'Open contact dock')}>
      {expanded?<ChevronRight size={21} aria-hidden="true"/>:<ChevronLeft size={21} aria-hidden="true"/>}
    </button>
  </aside>;
}
