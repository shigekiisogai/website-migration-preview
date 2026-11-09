import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';
import {deploymentBase} from '../src/lib/deployment.mjs';
import {appliedPage} from '../src/lib/applied.mjs';
import {rewriteLink} from '../src/lib/paths.mjs';
test('deployment supports preview, user site, explicit base and Cloudflare',()=>{
 assert.equal(deploymentBase({DEPLOY_TARGET:'github'}),'/website-migration-preview/');
 assert.equal(deploymentBase({DEPLOY_TARGET:'github',PAGES_REPOSITORY:'sisogai.github.io'}),'/');
 assert.equal(deploymentBase({DEPLOY_TARGET:'github',PAGES_BASE_PATH:'/'}),'/');
 assert.equal(deploymentBase({DEPLOY_TARGET:'cloudflare',PAGES_BASE_PATH:'/preview/'}),'/');
 for(const base of ['//bad/','/../','relative','/foo?bar/'])assert.throws(()=>deploymentBase({DEPLOY_TARGET:'github',PAGES_BASE_PATH:base}));
});
test('new material links respect both deployment bases',()=>{
 for(const base of ['/','/website-migration-preview/'])assert.equal(rewriteLink('/teaching/interactive/',base),`${base}teaching/interactive/`);
});
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${p}/${e.name}`):[`${p}/${e.name}`]);
test('all 22 applied snapshots retain article text, IDs, controls and source downloads',()=>{
 const files=walk('src/materials/applied');assert.equal(files.length,22);
 for(const file of files){
  const raw=fs.readFileSync(file,'utf8'),source=load(raw),key=file.split('/applied/')[1];
  for(const base of ['/','/website-migration-preview/']){
   const page=appliedPage(raw,key,base),out=load(page.body);
   assert.equal(page.title+out('article').text(),source('article').text());
   for(const e of source('#main [id]').toArray())assert.ok(out('[id]').toArray().some(t=>out(t).attr('id')===source(e).attr('id')));
   assert.equal(out('.level-picker button').length,source('.level-picker button').length);
   assert.ok(out('a[download]').attr('href').startsWith(base+'teaching/applied-micro/sources/'));
   assert.ok(out('a[data-language]').toArray().every(e=>out(e).attr('href').startsWith(base+'teaching/applied-micro/')));
  }
 }
});
test('imported casebook assets and teaching inline calculations match recorded source hashes',async()=>{
 const {createHash}=await import('node:crypto');
 const hash=s=>createHash('sha256').update(s).digest('hex');
 const record=JSON.parse(fs.readFileSync('provenance/teaching-integration.json'));
 for(const [name,expected] of Object.entries(record.applied.assets))assert.equal(hash(fs.readFileSync('public/teaching/applied-micro/assets/'+name)),expected,name);
 for(const [key,expected] of Object.entries(record.applied.files))assert.equal(hash(fs.readFileSync('src/materials/applied/'+key)),expected,key);
 for(const [name,expected] of Object.entries(record.interactive.inlineScripts)){
  const html=fs.readFileSync('public/teaching/interactive/'+name,'utf8');
  assert.deepEqual([...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m=>hash(m[1])),expected,name);
 }
});
