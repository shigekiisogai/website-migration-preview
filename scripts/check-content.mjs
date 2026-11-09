import fs from 'node:fs';
import assert from 'node:assert/strict';
import {load} from 'cheerio';
import {rewriteLink} from '../src/lib/paths.mjs';
import {deploymentBase} from '../src/lib/deployment.mjs';
const pages=JSON.parse(fs.readFileSync('provenance/pages.json'));
const differences=[],errors=[];let checks=0;
for(const [dir,base] of [['dist-github',deploymentBase({...process.env,DEPLOY_TARGET:'github'})],['dist-cloudflare','/']]){
 for(const p of pages){
  const html=fs.readFileSync(`${dir}${p.route}index.html`,'utf8'),$=load(html);
  const text=$('.entry-content').text().replace(/\s+/gu,'');
  const links=$('.entry-content a[href]').toArray().map(el=>({text:$(el).text().trim(),href:$(el).attr('href')}));
  const expected=p.links.map(l=>({...l,href:rewriteLink(l.href,base)}));
  if(text!==p.text||JSON.stringify(links)!==JSON.stringify(expected))differences.push({dir,id:p.id,route:p.route,textChanged:text!==p.text,addedLinks:links.filter(l=>!expected.some(e=>JSON.stringify(e)===JSON.stringify(l))),removedLinks:expected.filter(l=>!links.some(e=>JSON.stringify(e)===JSON.stringify(l)))});
  try{
   for(const anchor of p.anchors)assert.ok($('[id]').toArray().some(e=>$(e).attr('id')===anchor),`${p.id}: missing anchor ${anchor}`);
   assert.match($('meta[name="robots"]').attr('content'),/noindex/);
   assert.equal($('script,iframe,object,embed,form').length,0,'No active content in original pages');
   assert.ok(!html.includes('\uFFFD'),'No replacement characters');
   assert.equal($('h1.entry-title').length,1);
  }catch(e){errors.push(`${dir}: ${p.id}: ${e.message}`);}
  checks++;
 }
 const err=load(fs.readFileSync(`${dir}/404.html`,'utf8'));
 assert.match(err('meta[name=robots]').attr('content'),/noindex/);
 assert.ok(err('a').toArray().some(e=>err(e).attr('href')===base));
}
const summary={pages:pages.length,buildPageComparisons:checks,differences,errors,result:differences.length||errors.length?'FAIL':'PASS'};
fs.mkdirSync('.local',{recursive:true});fs.writeFileSync('.local/content-results.json',JSON.stringify(summary,null,2)+'\n');
for(const d of differences)console.error(`${d.dir}: ${d.id}: textChanged=${d.textChanged}, addedLinks=${d.addedLinks.length}, removedLinks=${d.removedLinks.length}`);
console.log(`${summary.result}: ${checks} baseline comparisons; ${differences.length} content differences; ${errors.length} structural errors`);
if(errors.length)console.error(errors.join('\n'));
if(summary.result==='FAIL')process.exitCode=1;
