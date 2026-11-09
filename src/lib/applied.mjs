import {load} from 'cheerio';
import {withBase} from './paths.mjs';
export const appliedRoot='/teaching/applied-micro/';
export function appliedPage(html,key,base='/') {
 const $=load(html);
 const lang=key.split('/')[0];
 const title=$('article > h1').first().text();
 const heading=$('article > h1').first();
 heading.replaceWith($('<span class="entry-heading-anchor"></span>').attr('id',heading.attr('id')));
 const content=$('#main').html();
 const footer=$('footer').html();
 const nav=$('.header-links').html();
 const fragment=load(`<div class="applied-content"><div class="casebook-navigation">${nav}</div>${content}<div class="casebook-meta">${footer}</div></div>`,null,false);
 fragment('[href],[src]').each((_,el)=>{
  for(const attr of ['href','src']){
   const value=fragment(el).attr(attr);
   if(!value||/^(?:[a-z][a-z0-9+.-]*:|#|\/\/)/i.test(value))continue;
   const u=new URL(value,`https://materials.invalid/${key}`);
   let target=u.pathname.slice(1);
   if(target.endsWith('.html'))target=target.replace(/index\.html$/,'').replace(/\.html$/,'/');
   fragment(el).attr(attr,withBase(appliedRoot+target,base)+u.search+u.hash);
  }
 });
 return {title,lang,body:fragment.html()};
}
