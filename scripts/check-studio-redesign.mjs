import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const home=read('app/page.tsx');
const css=read('app/studio-redesign.css');
const layout=read('app/layout.tsx');
const admin=read('components/admin-console.tsx');
const store=read('lib/store.ts');
const header=read('components/header.tsx');

const checks=[
 ['new hero and localized CMS title', home.includes('className="studio-hero"')&&home.includes("cmsPage('home',locale)")],
 ['purple marquee is removed, not hidden',!home.includes('CreativeMarquee')&&!home.includes('expressive-marquee-block')&&!home.includes('expressive-ribbon')],
 ['no legacy kinetic hero component',!home.includes('HeroExperience')],
 ['site product categories remain database-backed',home.includes('storeCategories(locale)')&&home.includes('mainCategories(allCategories)')],
 ['published products remain database-backed',home.includes('storeGalleryProducts(locale)')],
 ['product links stay locale-aware',home.includes("url('/catalog/'+category.slug)")],
 ['core commerce workflow preserved',home.includes("url('/order')")&&home.includes("url('/catalog')")],
 ['new theme is loaded as last layer',layout.includes("import './studio-redesign.css';")],
 ['previous purple design assets excluded',!layout.includes("import './prism-ink.css'")&&!layout.includes("import './marquee-motion.css'")],
 ['preserve original product names across languages',!store.includes("translatedFields(p,locale,'product')")],
 ['keep translated site categories',store.includes("translatedFields(c,locale,'category')")],
 ['admin includes real data overview',admin.includes('studio-admin-overview')&&admin.includes('setHasLoaded(true)')],
 ['admin quick links do not fake counts',admin.includes('products.filter(p=>p.active).length')&&admin.includes('customers.length')],
 ['bilingual switch retained',header.includes('<LanguageSwitcher compact/>')],
 ['dashboard, finance and other route styling exists',css.includes('.finance-console')&&css.includes('.admin-area-switcher')&&css.includes('.v2-catalog-card')],
 ['mobile and reduced motion supported',css.includes('@media(max-width:680px)')&&css.includes('prefers-reduced-motion:reduce')],
 ['new palette is not purple',css.includes('--studio-deep:#113d36')&&css.includes('--studio-paper:#f7f7f2')]
];
for(const [label,ok] of checks){if(!ok)console.error('FAIL',label);else console.log('PASS',label);}
assert.ok(checks.every(([,ok])=>ok),'Redesign regression detected');
console.log('Studio 26: '+checks.length+' source-level regressions passed.');
