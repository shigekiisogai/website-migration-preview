import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {load} from 'cheerio';
import {deploymentBase} from '../src/lib/deployment.mjs';
import {appliedPage} from '../src/lib/applied.mjs';
import {rewriteLink} from '../src/lib/paths.mjs';
import {integrateInteractiveHeader} from '../scripts/interactive-header.mjs';
test('both builds give all interactive documents the personal navigation and preserve inline teaching scripts',()=>{
 const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'site-header-test-'));
 try {
  for(const base of ['/','/website-migration-preview/']) {
   const root=path.join(temporary,'teaching/interactive');
   fs.mkdirSync(root,{recursive:true});
   const originals=new Map(fs.readdirSync('public/teaching/interactive').filter(f=>f.endsWith('.html')).map(file=>[file,fs.readFileSync('public/teaching/interactive/'+file,'utf8')]));
   assert.equal(originals.size,8);
   for(const [file,html] of originals)fs.writeFileSync(path.join(root,file),html);
   integrateInteractiveHeader(temporary,base);
   for(const [file,html] of originals) {
    const source=load(html),out=load(fs.readFileSync(path.join(root,file),'utf8'));
    assert.equal(out('.personal-header').length,1);
    assert.equal(out('.site-title').attr('href'),base);
    assert.equal(out('.desktop-menu a').length,5);
    assert.ok(out('.desktop-menu a').toArray().every(a=>out(a).attr('href').startsWith(base)));
    assert.equal(out('link[href$="site-header.css"]').attr('href'),base+'site-header.css');
    assert.deepEqual(out('script:not([src])').toArray().map(e=>out(e).html()),source('script:not([src])').toArray().map(e=>source(e).html()));
   }
  }
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});
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
   const page=appliedPage(raw,key,base),out=load(page.toolbar+page.body);
   if(!key.endsWith('/index.html'))assert.equal(page.title+out('article').text(),source('article').text());
   else {
    // The overview intentionally changes catalogue layout and reading order.
    // Every original prose paragraph and each case title must survive.
    for(const p of source('article > p').toArray())assert.ok(out.root().text().includes(source(p).text()),`${key}: overview prose retained`);
    const sourceCases=source('.case-catalogue tbody th a').toArray().map(a=>source(a).text());
    assert.deepEqual(out('.case-card h3 a').toArray().map(a=>out(a).text()),sourceCases);
    assert.equal(out('.case-card').length,3);
    assert.equal(out('.case-catalogue,.level-index').length,0);
    assert.equal(out('[data-entry-level]').length,3);
   }
   assert.equal(out('details.contents:not([open])').length,1);
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
