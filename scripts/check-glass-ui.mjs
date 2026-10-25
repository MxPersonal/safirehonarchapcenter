import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const css=read('app/glass-aurora.css');
const layout=read('app/layout.tsx');
const interaction=read('components/glass-interactions.tsx');
const store=read('lib/store.ts');
const home=read('app/page.tsx');
const header=read('components/header.tsx');

const checks=[
 ['Final glass stylesheet is loaded',layout.includes("import './theme-logos.css';import './glass-aurora.css';")],
 ['Pointer interaction component mounts once',layout.includes('<GlassInteractions/>')],
 ['Supports actual homepage category cards',css.includes('.pw-category-item')],
 ['Supports database product cards',css.includes('.shop-tile')],
 ['Supports gallery and catalogue cards',css.includes('.v2-catalog-card')&&css.includes('.design-card')],
 ['Glass blur and layered surface are configured',css.includes('backdrop-filter:var(--glass-blur)')&&css.includes('linear-gradient(145deg,rgba(255,255,255,.78)')],
 ['Neon cyan-purple hues on outlines',css.includes('--glass-cyan:#33cde5')&&css.includes('--glass-purple:#8c79fa')],
 ['Perspective rotations activated',css.includes('rotateX(var(--glass-rx,0deg)) rotateY(var(--glass-ry,0deg))')],
 ['Mouse tilt maps pointer coordinates to subtle rotations',interaction.includes("(.5-py)*7.2")&&interaction.includes("(px-.5)*7.2")],
 ['Hover lifts with restrained depth',css.includes('--glass-rise:-11px')&&css.includes('hover::after')],
 ['Touch lift never prevents navigation',interaction.includes("event.pointerType!=='touch'")&&interaction.includes("card.classList.add('glass-touched')")&&!interaction.includes('preventDefault(')],
 ['Touch lift auto-resets',interaction.includes('},320)')&&interaction.includes("card.classList.remove('glass-touched')")],
 ['Supports dark theme',css.includes("html[data-theme='dark'] .site-header")],
 ['Customer login text and inputs stay readable in dark mode',css.includes("html[data-theme='dark'] .v3-auth-fields input:not([type=checkbox])")],
 ['Keyboard navigation retains focus ring',css.includes('a:focus-visible,button:focus-visible')],
 ['Motion disability respected',css.includes('@media(prefers-reduced-motion:reduce)')&&interaction.includes("prefers-reduced-motion: reduce")],
 ['Mobile is not forced into hover',css.includes('@media(hover:hover) and (pointer:fine)')],
 ['Responsive glass cards',css.includes('@media(max-width:700px)')],
 ['Site locale toggle retained',header.includes('<LanguageSwitcher compact/>')],
 ['Product translations still do not alter identity',!store.includes("translatedFields(p,locale,'product')")],
 ['No duplicate legacy marquee',!home.includes('<CreativeMarquee')]
];
for(const [name,pass] of checks)console.log((pass?'PASS ':'FAIL ')+name);
assert.ok(checks.every(([,pass])=>pass),'Glass interaction or styling regression');
let depth=0,min=0;
for(const char of css){if(char==='{')depth++;else if(char==='}')depth--;min=Math.min(min,depth);}
assert.equal(depth,0,'Unbalanced CSS braces');
assert.equal(min,0,'Unexpected CSS close brace');
console.log(checks.length+' Aurora Glass checks passed.');
