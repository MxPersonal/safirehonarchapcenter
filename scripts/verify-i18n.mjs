import assert from 'node:assert/strict';
const origin=process.env.I18N_TEST_ORIGIN||'http://127.0.0.1:3100';
const routes=['/','/catalog','/catalog/banner','/designs','/services','/guide','/order','/login','/register','/about','/contact','/terms','/privacy','/pricing','/track','/admin/login'];
function visibleText(html){const body=html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]||html;return body.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'').replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,'').replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi,'').replace(/<[^>]*>/g,' ').replace(/&#\d+;|&#x[0-9a-f]+;|&[a-z]+;/gi,' ').replace(/\s+/g,' ').trim();}
let checks=0;
for(const suffix of routes){for(const locale of ['fa','en']){
 const url=origin+'/'+locale+(suffix==='/'?'':suffix);
 const response=await fetch(url,{redirect:'follow'});assert.equal(response.status,200,url+' HTTP status '+response.status);
 const html=await response.text();assert.match(html,new RegExp('<html[^>]*lang="'+locale+'"[^>]*dir="'+(locale==='fa'?'rtl':'ltr')+'"'),url+' lang/dir mismatch');
 const shown=visibleText(html);assert.ok(shown.length>50,url+' empty page');
 const words=shown.match(/[\u0600-\u06ff]+/g)||[];
 if(locale==='en')assert.ok(/Print products|Design gallery|Print services|Home/.test(shown),url+' missing translated English site navigation; untranslated product data may still be Persian by design');
 else assert.ok(words.length>=12,url+' Persian page missing Persian content: '+words.length);
 if(suffix==='/'||suffix==='/catalog'){
  const destination=locale==='fa'?'en':'fa';
  const other='/'+destination+(suffix==='/'?'':suffix);
  assert.ok(html.includes('href="'+other+'"'),url+' missing single opposite-language link');
  assert.ok(html.includes('language-toggle-single'),url+' missing one-button locale control');
 }
 checks++;}}
console.log('Bilingual SSR pages passed:',checks);
