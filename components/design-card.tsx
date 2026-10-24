import type {Locale} from '@/lib/i18n';
import {localePath} from '@/lib/i18n';
import Link from 'next/link';import {ArrowUpLeft} from 'lucide-react';import {Design} from '@/lib/catalog';import Artwork from './art';
export default function DesignCard({design,locale='fa'}:{design:Design;locale?:Locale}){return <Link className="design-card" href={localePath('/designs/'+design.slug,locale)}><div className="design-image"><Artwork design={design} locale="fa"/><span className="design-code">{design.code}</span></div><div className="design-info"><div><span className="card-eyebrow">{locale==='en'?design.category.toUpperCase():design.tag}</span><h3>{design.name}</h3><p>{design.subtitle}</p></div><span className="arrow-round"><ArrowUpLeft size={20}/></span></div></Link>}
