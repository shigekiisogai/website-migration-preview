import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {load} from 'cheerio';
import redirects from '../src/lib/redirects.json' with {type:'json'};
import {rewriteLink} from '../src/lib/paths.mjs';

test('all legacy routes and percent-encoded links resolve to ASCII destinations with query and fragment intact',()=>{
 for(const base of ['/','/preview/'])for(const [from,to] of Object.entries(redirects)){
  for(const source of [from,encodeURI(from),'https://shigekiisogai.wordpress.com'+encodeURI(from)])
   assert.equal(rewriteLink(source+'?ref=course#notes',base),base+to.slice(1)+'?ref=course#notes');
 }
});
test('teaching is a simple list with one materials guide and the existing course inventory',()=>{
 const text=fs.readFileSync('src/content/pages/teaching.md','utf8'),$=load(text);
 assert.doesNotMatch(text,/course-list|<h3>|—|資料リンク未掲載|Materials not listed/);
 assert.equal($('li').length,27);
 assert.equal((text.match(/\]\(\/course-materials\/\)/g)||[]).length,1);
 assert.equal($('li a').length,0);
});
