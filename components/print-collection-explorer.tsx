'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpLeft, Search, ArrowLeft } from 'lucide-react';
import { localePath, intlNumber, type Locale } from '@/lib/i18n';
import type { StoreCategory } from '@/lib/store';

export default function PrintCollectionExplorer({ categories, locale }: { categories: StoreCategory[]; locale: Locale }) {
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [active, setActive] = useState('all');
  const english = locale === 'en';
  const normalized = query.trim().toLocaleLowerCase(locale === 'fa' ? 'fa-IR' : 'en-US');
  const filtered = useMemo(() => categories.filter(category =>
    (active === 'all' || active === category.id) &&
    (!normalized || [category.name, category.description ?? ''].some(value => value.toLocaleLowerCase().includes(normalized)))
  ), [categories, active, normalized]);
  const visible = (expanded || normalized || active !== 'all') ? filtered : filtered.slice(0, 6);
  const pills = categories.slice(0, 3);
  return <div className="sx-explorer">
    <div className="sx-explorer-controls">
      <div className="sx-filters" aria-label={english ? 'Filter product collections' : 'فیلتر دسته‌بندی محصولات'}>
        <button type="button" className={active === 'all' ? 'sx-filter active' : 'sx-filter'} aria-pressed={active === 'all'} onClick={() => { setActive('all'); setExpanded(false); }}>{english ? 'All collections' : 'همه دسته‌ها'}</button>
        {pills.map(category => <button type="button" key={category.id} className={active === category.id ? 'sx-filter active' : 'sx-filter'} aria-pressed={active === category.id} onClick={() => setActive(category.id)}>{category.name}</button>)}
      </div>
      <label className="sx-search"><Search size={18}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder={english ? 'Search collections...' : 'جست‌وجوی دسته‌بندی...'} aria-label={english ? 'Search print collections' : 'جست‌وجوی دسته‌بندی چاپ'} type="search"/></label>
    </div>
    <div className="sx-cards-grid">
      {visible.map((category, index) => <Link href={localePath('/catalog/' + category.slug, locale)} className="sx-collection-card" key={category.id}>
        <div className={'sx-collection-image sx-collection-tone-' + (index % 4)}>
          {category.image_url ? <img src={category.image_url} alt={category.name} loading="lazy" decoding="async"/> : <div className="sx-category-art" aria-hidden="true"><span className="sx-art-ring"/><span className="sx-art-disc"/><span className="sx-art-sheet"><i>{category.name}</i><small>SAFIRE HONAR / PRINT</small></span></div>}
          <span className="sx-collection-arrow"><ArrowUpLeft size={21}/></span>
        </div>
        <div className="sx-collection-info"><span className="sx-collection-index">/{intlNumber(categories.findIndex(x => x.id === category.id) + 1, locale).padStart(2, english ? '0' : '۰')} <span>{english ? 'PRINT FAMILY' : 'خانواده چاپ'}</span></span><h3>{category.name}</h3><p>{category.description}</p><span className="sx-collection-action">{english ? 'Explore collection' : 'مشاهده این مجموعه'} <ArrowUpLeft size={16}/></span></div>
      </Link>)}
    </div>
    {filtered.length === 0 && <div className="sx-explorer-empty">{english ? 'No collection matches your search.' : 'دسته‌بندی مطابق جست‌وجوی شما پیدا نشد.'}</div>}
    {!expanded && !normalized && active === 'all' && filtered.length > 6 && <button className="sx-show-more" type="button" onClick={() => setExpanded(true)}>{english ? 'Show more collections' : 'نمایش دسته‌بندی‌های بیشتر'} <ArrowLeft size={17}/></button>}
  </div>;
}
