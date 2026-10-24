import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const home=read('app/page.tsx');
const ticker=read('components/creative-marquee.tsx');
const store=read('lib/store.ts');
const cards=read('components/showcase.tsx');
const gallery=read('components/design-card.tsx');
const sample=read('app/designs/[slug]/page.tsx');
const admin=read('components/admin-artwork-preview.tsx');

assert.ok(home.includes('<CreativeMarquee locale={locale}/>'),'Homepage must render ticker.');
assert.ok(ticker.includes('safir-single-ticker'),'Dedicated single-line ticker required.');
assert.ok(ticker.includes('<style>{'),'Ticker CSS must travel in the HTML.');
assert.ok(ticker.includes('animation:safir-single-scroll'),'Ticker must animate without separately cached CSS.');
assert.ok(ticker.includes('translate3d(-100%,0,0)'),'Ticker must move entirely across the viewport.');
assert.ok(ticker.includes('white-space:nowrap'),'Text may not wrap vertically.');
assert.ok(ticker.includes('gap:38px'),'Mobile text must have ample horizontal spacing.');
assert.ok(!ticker.includes('[0,1].map'),'Do not duplicate ticker content; one message only.');
assert.ok(!ticker.includes('creative-marquee-copy'),'Avoid duplicate, vertically stacking tracks.');
assert.ok(ticker.includes('prefers-reduced-motion:reduce'),'Respect accessibility settings.');
assert.ok(!store.includes("translatedFields(p,locale,'product')"),'Product data must stay unchanged across locales.');
assert.ok(store.includes("translatedFields(c,locale,'category')"),'Categories must be localized.');
assert.ok(cards.includes('locale="fa"'),'Product image/artwork should not change on language switch.');
assert.ok(gallery.includes('locale="fa"'),'Design product art must remain stable.');
assert.ok(sample.includes('const title=d.name;'),'Existing design product titles must remain stable.');
assert.ok(admin.includes('locale="fa"'),'Admin product preview must not change on language switch.');

console.log('PASS: 16 invariants for single-line animated ticker and stable products.');
