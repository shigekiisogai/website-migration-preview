import fs from 'node:fs';
import path from 'node:path';
import {siteHeader} from '../src/lib/navigation.mjs';
import {withBase} from '../src/lib/paths.mjs';

export function integrateInteractiveHeader(dir,base) {
 const root=path.join(dir,'teaching/interactive');
 for(const file of fs.readdirSync(root).filter(f=>f.endsWith('.html'))) {
  const target=path.join(root,file);
  let html=fs.readFileSync(target,'utf8');
  const previous=/<nav aria-label="Personal website"[^>]*>[\s\S]*?<\/nav>/;
  if(!previous.test(html))throw new Error(`${file}: expected imported website navigation`);
  html=html.replace(previous,siteHeader(base,'/teaching/'));
  html=html.replace('</head>',`<link rel="stylesheet" href="${withBase('/site-header.css',base)}">\n</head>`);
  fs.writeFileSync(target,html);
 }
}
