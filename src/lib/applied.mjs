import {load} from 'cheerio';
import {withBase} from './paths.mjs';
export const appliedRoot='/teaching/applied-micro/';
export function appliedPage(html,key,base='/') {
 const $=load(html);
 const lang=key.split('/')[0];
 const title=$('article > h1').first().text();
 const heading=$('article > h1').first();
 heading.replaceWith($('<span class="entry-heading-anchor"></span>').attr('id',heading.attr('id')));
 // Keep source prose and anchors; make the long contents list opt-in.
 $('nav.contents').each((_,el)=>{
  const nav=$(el),label=nav.children('p').first();
  const details=$('<details class="contents"></details>').attr('aria-label',nav.attr('aria-label'));
  details.append($('<summary></summary>').text(label.text()));
  label.remove();details.append(nav.contents());nav.replaceWith(details);
 });
 const languages=$('.language-switch').first();
 const toolbar=$('<div class="casebook-toolbar"></div>');
 const trail=$('<nav></nav>').attr('aria-label',lang==='ja'?'パンくず':'Breadcrumb');
 trail.append($('<a></a>').attr('href',withBase('/teaching/',base)).text('Teaching / 授業'));
 trail.append($('<span aria-hidden="true">/</span>'));
 trail.append($('<a></a>').attr('href',key.includes('/cases/')||key.includes('/fields/')?'../index.html':'index.html').text(lang==='ja'?'応用事例集':'Casebook'));
 toolbar.append(trail,languages);
 // The overview has one catalogue. Its original context and field directory
 // remain available in a folded guide, including every existing anchor.
 if(key.endsWith('/index.html')) {
  const article=$('article');
  const intro=article.children('p').slice(0,2);
  const warning=intro.eq(1).remove().addClass('overview-warning');
  const context=intro.eq(0).remove();
  const cards=$('<div class="case-cards"></div>');
  const fieldLinks=$('#fields').next('ul').find('a');
  const fields=[fieldLinks.eq(0),fieldLinks.eq(1),fieldLinks.eq(3)];
  $('.case-catalogue tbody tr').each((i,row)=>{
   const cells=$(row).children(),link=cells.eq(1).find('a').clone();
   const card=$('<section class="case-card"></section>');
   card.append($('<h3></h3>').append(link));
   const tags=$('<div class="case-tags"></div>');
   tags.append(fields[i].clone().text(cells.eq(0).text()));
   tags.append($('<span></span>').text(cells.eq(2).text()));
   tags.append($('<span></span>').text(cells.eq(3).text()));
   card.append(tags);
   const level=$('.level-index a').toArray().find(a=>$(a).attr('href')===link.attr('href'));
   if(level)card.append($('<p class="case-entry-level"></p>').append($(level).clone()));
   cards.append(card);
  });
  $('.catalogue-wrap').replaceWith(cards);
  $('.level-index').remove();
  const guide=$('<details class="casebook-guide"><summary></summary></details>');
  guide.find('summary').text(lang==='ja'?'資料集の案内・分野・読み方':'About the casebook, fields and reading levels');
  guide.append(context);
  // Everything after the single catalogue is supporting information.
  cards.nextAll().appendTo(guide);
  article.append(guide);
  $('.page-meta').append(warning);
 }
 const meta=$('.page-meta');
 meta.addClass('casebook-warning').attr('role','note');
 meta.children('.stage').removeClass('stage');
 const content=$('#main').html();
 const footer=$('footer').html();
 const fragment=load(`<div class="applied-content">${content}<div class="casebook-meta">${footer}</div></div>`,null,false);
 // Rewrite both fragments in one pass, then separate the toolbar again.
 fragment.root().prepend(toolbar);
 fragment('[href],[src]').each((_,el)=>{
  for(const attr of ['href','src']){
   const value=fragment(el).attr(attr);
   if(!value||/^(?:[a-z][a-z0-9+.-]*:|#|\/)/i.test(value))continue;
   const u=new URL(value,`https://materials.invalid/${key}`);
   let target=u.pathname.slice(1);
   if(target.endsWith('.html'))target=target.replace(/index\.html$/,'').replace(/\.html$/,'/');
   fragment(el).attr(attr,withBase(appliedRoot+target,base)+u.search+u.hash);
  }
 });
 const toolbarHtml=fragment('.casebook-toolbar').toString();
 fragment('.casebook-toolbar').remove();
 return {title,lang,toolbar:toolbarHtml,body:fragment.html()};
}
