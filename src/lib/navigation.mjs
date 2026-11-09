import routes from './routes.json' with {type:'json'};
import {withBase} from './paths.mjs';

export const navigationItems=['research','teaching','course-materials','advising','japanese'].map(id=>{
 const page=routes.find(p=>p.id===id);
 return {...page,label:id==='japanese'?'日本語での情報':page.title};
});
const escape=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');

// Static markup shared by Astro pages and the imported interactive documents.
export function siteHeader(base,route='/') {
 const links=navigationItems.map(p=>`<li><a href="${escape(withBase(p.route,base))}"${p.route===route?' aria-current="page"':''}>${escape(p.label)}</a></li>`).join('');
 return `<header class="site-header personal-header"><a class="site-title" href="${escape(withBase('/',base))}">Shigeki ISOGAI</a><details class="mobile-menu"><summary>Menu / メニュー</summary><nav aria-label="Mobile navigation"><ul>${links}</ul></nav></details><nav class="desktop-menu" aria-label="Main navigation"><ul>${links}</ul></nav></header>`;
}
