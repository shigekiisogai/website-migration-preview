import fs from 'node:fs';
import path from 'node:path';
import {load} from 'cheerio';
import {deploymentBase} from '../src/lib/deployment.mjs';
import redirects from '../src/lib/redirects.json' with {type:'json'};
const dir=process.argv[2]||'dist-github';
const base=process.argv[3]??deploymentBase({ ...process.env, DEPLOY_TARGET:dir==='dist-github'?'github':'cloudflare' });
const origin='https://sisogai.github.io';
const walk=p=>fs.readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(p,e.name)):[path.join(p,e.name)]);
const errors=[],external=new Set(),documents=new Map();let references=0;
const htmlFiles=walk(dir).filter(f=>f.endsWith('.html'));
for(const file of htmlFiles)documents.set(file,load(fs.readFileSync(file,'utf8')));
for(const [file,$] of documents){
 const url=new URL(base+path.relative(dir,file).split(path.sep).join('/'),origin);
 const ids=$('[id]').toArray().map(e=>$(e).attr('id'));
 if(new Set(ids).size!==ids.length)errors.push(`${file}: duplicate id`);
 if(!$('meta[name="robots"]').attr('content')?.includes('noindex'))errors.push(`${file}: missing noindex`);
 for(const el of $('[href],[src]').toArray())for(const attr of ['href','src']){
  const value=$(el).attr(attr);if(value===undefined)continue;
  references++;
  let u;try{u=new URL(value,url);}catch{errors.push(`${file}: invalid ${attr} ${value}`);continue;}
  if(!['http:','https:'].includes(u.protocol))continue;
  if(u.origin!==origin){external.add(u.href);continue;}
  const decoded=decodeURIComponent(u.pathname);
  if(!decoded.startsWith(base)){errors.push(`${file}: escaped base ${value}`);continue;}
  const rel=decoded.slice(base.length);
  if(Object.hasOwn(redirects,'/'+rel.replace(/index\.html$/,'')))errors.push(`${file}: legacy internal link ${value}`);
  let target=path.join(dir,rel);
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,'index.html');
  if(!fs.existsSync(target)){errors.push(`${file}: missing ${value} -> ${target}`);continue;}
  if(u.hash&&documents.has(target)){
   const t=documents.get(target),fragment=decodeURIComponent(u.hash.slice(1));
   if(!t('[id],a[name]').toArray().some(e=>t(e).attr('id')===fragment||t(e).attr('name')===fragment))errors.push(`${file}: missing fragment ${value}`);
  }
 }
}
const result={dir,base,pages:htmlFiles.length,references,external:[...external].sort(),errors,result:errors.length?'FAIL':'PASS'};
fs.mkdirSync('.local',{recursive:true});fs.writeFileSync(`.local/links-${dir}-${base==='/'?'root':'subpath'}.json`,JSON.stringify(result,null,2)+'\n');
console.log(`${result.result}: ${result.pages} pages, ${references} href/src references, base ${base}; ${errors.length} errors`);
if(errors.length){console.error(errors.join('\n'));process.exitCode=1;}
