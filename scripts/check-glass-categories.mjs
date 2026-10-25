import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=file=>readFileSync(new URL('../'+file,import.meta.url),'utf8');
const css=read('app/glass-refinements.css');
const glass=read('app/glass-aurora.css');
const page=read('app/page.tsx');
const layout=read('app/layout.tsx');
const admin=read('components/admin-console.tsx');
const api=read('app/admin/api/route.ts');
const store=read('lib/store.ts');
const checks=[
 ['theme-aware light hero',css.includes("html:not([data-theme='dark']) .pw-hero{")],
 ['dark hero is a separate palette',css.includes("html[data-theme='dark'] .pw-hero{")],
 ['light hero uses legible dark typography',css.includes("html:not([data-theme='dark']) .pw-hero h1")],
 ['home graphic has FA/EN copy',page.includes('هنر<br/>در<br/><i>چاپ.</i>')&&page.includes('MADE<br/>TO<br/><i>PRINT.</i>')],
 ['no visual ticker again',!page.includes('CreativeMarquee')],
 ['light card physically rises',css.includes('--glass-rise:-17px')&&css.includes('0 17px 0 -5px #becde0')],
 ['no light neon reflections on cards',css.includes("html:not([data-theme='dark']) :is(")&&css.includes('opacity:0!important;display:none!important')],
 ['touch cards get a non-neon depth treatment',css.includes('.glass-touched{')&&css.includes('--glass-rise:-12px')],
 ['light card respects reduced-motion preference',css.includes('@media(prefers-reduced-motion:reduce)')],
 ['category hierarchy shown in product form',admin.includes('admin-category-picker')&&admin.includes('mainCategoryRows.map(parent=><optgroup')],
 ['product list may be filtered by parent/subcategory',admin.includes('admin-product-category-tools')&&admin.includes('visibleCategoryIds?.has')],
 ['categorized product can open category editor',admin.includes('editCategoryById(pForm.category_id)')],
 ['categories can drill down to products',admin.includes('browseCategoryProducts(c.id)')],
 ['orphaned product links are clearly flagged',admin.includes('invalidProducts.length>0')],
 ['repair only for starter products',api.includes('async function repairStarterCategoryLinks')&&api.includes('starterBySlug')],
 ['repair preserves already valid links',api.includes('validCategoryIds.has(product.category_id)')],
 ['new product is validated against real DB category',api.includes("db.from('categories').select('id').eq('id',category_id)")],
 ['admin action retains authorized session and origin check',api.includes("if(!await allowed())")&&api.includes("origin!==new URL(req.url).origin")],
 ['category-based store product query still descends tree',store.includes('categoryDescendants(all,category)')],
 ['product contents do not change with language',!store.includes("translatedFields(p,locale,'product')")],
 ['CSS refinement included LAST',layout.includes("import './glass-refinements.css';")]
];
for(const [name,ok] of checks)console.log((ok?'PASS ':'FAIL ')+name);
assert.ok(checks.every(([,ok])=>ok),'Refinement regression');
let depth=0;
for(const c of css){if(c==='{')depth++;else if(c==='}')depth--;assert.ok(depth>=0,'unexpected closing CSS brace');}
assert.equal(depth,0,'unbalanced CSS');
console.log('PASS: '+checks.length+' glass/card/category regression tests');
