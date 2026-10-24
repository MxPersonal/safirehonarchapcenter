'use client';
import Image from 'next/image';
import {useI18n} from '@/components/locale-provider';
export default function Brand({compact=false}:{compact?:boolean}){const {pick}=useI18n();return <span className={`brand v2-brand ${compact?'brand-compact':''}`}><span className="brand-emblem" aria-hidden="true"><Image src="/brand-white.png" alt="" width={145} height={109} priority /></span><span className="brand-copy"><strong>{pick('چاپ سفیر هنر','Safire Honar')}</strong><small>{pick('استودیو تخصصی چاپ و طراحی','PRINT & DESIGN STUDIO')}</small></span></span>}
