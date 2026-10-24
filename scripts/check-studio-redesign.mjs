import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=(file)=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const home=read('app/page.tsx');
const css=read('app/printworks.css');
const layout=read('app/layout.tsx');
const admin=read('components/admin-console.tsx');
const store=read('lib/store.ts');
const header=read('components/header.tsx');
const checks=[
 ['printworks hero with CMS-managed copy',home.includes('className="pw-hero"')&&home.includes("cmsPage('home',locale)")],
 ['purple ticker entirely removed',!home.includes('CreativeMarquee')&&!home.includes('expressive-marquee-block')&&!home.includes('expressive-ribbon')],
 ['legacy collage hero removed',!home.includes('HeroExperience')&&!home.includes('studio-sheet')],
 ['site categories still Supabase-backed',home.includes('storeCategories(locale)')&&home.includes('mainCategories(all)')],
 ['featured products still database-backed',home.includes('storeGalleryProducts(locale)')],
 ['product/category links preserve selected locale',home.includes("path('/catalog/'+c.slug)")],
 ['commerce/quotes preserved',home.includes("path('/order')")&&home.includes("path('/catalog')")],
 ['single new theme loaded last',layout.includes("import './printworks.css'")&&!layout.includes("import './studio-redesign.css'")],
 ['purple stylesheets disabled',!layout.includes("import './prism-ink.css'")&&!layout.includes("import './marquee-motion.css'")],
 ['product data remains language-invariant',!store.includes("translatedFields(p,locale,'product')")],
 ['category names can still be translated',store.includes("translatedFields(c,locale,'category')")],
 ['real operations sidebar present',admin.includes('className="pw-admin-sidebar"')&&admin.includes('pw-admin-navigation')],
 ['site and commerce navigation both present',admin.includes('siteTabs.map(')&&admin.includes('commerceTabs.map(')],
 ['existing CRUD branches untouched',admin.includes("tab==='categories'")&&admin.includes("tab==='products'")&&admin.includes("tab==='orders'")],
 ['real data metrics (no fake values)',admin.includes('studio-admin-overview')&&admin.includes('setHasLoaded(true)')],
 ['full UI family styling',css.includes('.finance-console')&&css.includes('.v2-catalog-card')&&css.includes('.pw-admin-workspace')&&css.includes('.v3-auth-shell')],
 ['mobile layout and accessibility',css.includes('@media(max-width:700px)')&&css.includes('prefers-reduced-motion:reduce')],
 ['distinct typography and palette',css.includes('--pw-dark:#141820')&&css.includes('--pw-accent:#ef6546')],
 ['language toggle remains',header.includes('<LanguageSwitcher compact/>')]
];
for(const [name,ok] of checks)console.log((ok?'PASS ':'FAIL ')+name);
assert.ok(checks.every(([,ok])=>ok),'Printworks regression detected');
console.log('Printworks redesign checks: '+checks.length+' passed.');
