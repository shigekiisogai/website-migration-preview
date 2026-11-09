(function () {
  'use strict';
  const key='isogai-showcase-language';
  const valid=value=>value==='ja'||value==='en';
  const save=value=>{try{localStorage.setItem(key,value);}catch(_) { /* Private browsing may deny storage. */ }};
  document.querySelectorAll('[data-language]').forEach(link=>link.addEventListener('click',()=>save(link.dataset.language)));
  // Explicit /ja/ and /en/ links always keep their requested language.
  if(!document.querySelector('[data-language-entry]')) return;
  let preferred;
  try{preferred=localStorage.getItem(key);}catch(_){}
  if(!valid(preferred)) {
    const first=(navigator.languages&&navigator.languages[0])||navigator.language||'en';
    preferred=first.toLowerCase().split('-')[0]==='ja'?'ja':'en';
  }
  save(preferred);
  const target=[...document.querySelectorAll('[data-language]')].find(link=>link.dataset.language===preferred);
  window.location.replace(target.getAttribute('href')+window.location.hash);
})();
