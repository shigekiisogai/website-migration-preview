import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import redirects from '../src/lib/redirects.json' with {type:'json'};
import routes from '../src/lib/routes.json' with {type:'json'};
import {deploymentBase} from '../src/lib/deployment.mjs';
import {withBase} from '../src/lib/paths.mjs';

const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const results=[];
for(const target of ['github','cloudflare']){
 const dir=`dist-${target}`,base=deploymentBase({...process.env,DEPLOY_TARGET:target});
 for(const [from,to] of Object.entries(redirects)){
  const file=path.join(dir,from,'index.html'),$=load(fs.readFileSync(file,'utf8'));
  const destination=withBase(to,base);
  assert.equal($('meta[http-equiv="refresh"]').attr('content'),`0; url=${destination}`,file);
  assert.equal($('link[rel="canonical"]').attr('href'),destination,file);
  assert.match($('meta[name="robots"]').attr('content'),/noindex/,file);
  assert.equal($('a').attr('href'),destination,file);
  assert.equal($('script').length,0,file);
  const canonical=load(fs.readFileSync(path.join(dir,to,'index.html'),'utf8'));
  assert.equal(canonical('h1.entry-title').length,1,to);
  assert.equal(canonical('meta[http-equiv="refresh"]').length,0,to);
  results.push({target,from,to:destination,result:'PASS'});
 }
 for(const file of walk(dir)){
  const relative=path.relative(dir,file);
  assert.doesNotMatch(relative,/hermes-personal-assistant/i,file);
  if(/\.(?:html|xml|json|txt|md)$/.test(file)){
   const text=fs.readFileSync(file,'utf8');
   assert.doesNotMatch(text,/hermes.personal.assistant/i,file);
   if(relative.startsWith('teaching/applied-micro/'))assert.doesNotMatch(text,/AI作成|原典未確認|AI-drafted|sources not yet verified|translation_status|Translation status|翻訳状態|\bdraft\b/,file);
  }
 }
 for(const page of routes)assert.match(page.route,/^[\x20-\x7E]+$/);
}
fs.mkdirSync('.local',{recursive:true});
fs.writeFileSync('.local/redirect-results.json',JSON.stringify(results,null,2)+'\n');
console.log(`PASS: ${results.length} redirects; both builds exclude private pages and retired casebook labels`);
