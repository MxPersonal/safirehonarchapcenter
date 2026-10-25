'use client';
import Image from 'next/image';
import {useI18n} from '@/components/locale-provider';

export default function Brand({compact=false}:{compact?:boolean}){
 const {pick}=useI18n();
 return <span className={`brand v2-brand theme-aware-brand ${compact?'brand-compact':''}`}>
  <span className="brand-emblem" aria-hidden="true">
   <Image className="brand-logo-light" src="/safir-logo-light.png" alt="" width={400} height={293} priority sizes="(max-width:700px) 100px, 140px"/>
   <Image className="brand-logo-dark" src="/safir-logo-dark.png" alt="" width={400} height={288} priority sizes="(max-width:700px) 100px, 140px"/>
  </span>
  <span className="brand-copy"><strong>{pick('چاپ سفیر هنر','Safire Honar')}</strong><small>{pick('استودیو تخصصی چاپ و طراحی','PRINT & DESIGN STUDIO')}</small></span>
 </span>;
}
