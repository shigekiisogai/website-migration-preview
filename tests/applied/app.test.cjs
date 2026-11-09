'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const {Element}=require('./dom-stub.cjs');
const models=require('./load-asset.cjs')('models.js'),i18n=require('./load-asset.cjs')('i18n.js');
function load(page,options={}) {
  const document=new Element();document.innerHTML=fs.readFileSync(path.join(__dirname,'../../dist-cloudflare/teaching/applied-micro',page==='index.html'||page.endsWith('/index.html')?page:page.replace(/\.html$/,'/index.html')),'utf8');
  document.documentElement={lang:page.split('/')[0]};
  const storage=new Map(Object.entries(options.storage||{})),timers=new Map();let id=0,redirect=null;
  if(options.level)storage.set('isogai-showcase-level',options.level);
  const localStorage={getItem:k=>{if(options.denied)throw Error('storage denied');return storage.get(k)||null;},setItem:(k,v)=>{if(options.denied)throw Error('storage denied');storage.set(k,v);}};
  const context={window:{ShowcaseModels:models,ShowcaseI18n:i18n,location:{hash:options.hash||'',replace:url=>redirect=url}},navigator:{languages:options.languages||['ja-JP'],language:options.language||'ja'},document,localStorage,setInterval:fn=>{timers.set(++id,fn);return id;},clearInterval:id=>timers.delete(id)};
  vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../public/teaching/applied-micro/assets/language.js'),'utf8'),context);
  if(page!=='index.html')vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../../public/teaching/applied-micro/assets/app.js'),'utf8'),context);
  return {document,storage,timers,redirect,$:s=>document.querySelector(s),all:s=>document.querySelectorAll(s)};
}
for(const lang of ['ja','en']) {
  const english=lang==='en',page=name=>`${lang}/cases/${name}.html`;
  test(`${lang}: three levels, persistence and denied localStorage`,()=>{
    const app=load(page('matching-da'),{level:'2'});
    assert.ok(app.all('[data-level]').every(e=>e.hidden===(e.dataset.level!=='2')));
    app.all('[data-set-level]')[2].fire('click');assert.equal(app.storage.get('isogai-showcase-level'),'3');
    assert.ok(app.all('[data-level]').every(e=>e.hidden===(e.dataset.level!=='3')));
    const denied=load(page('matching-da'),{denied:true,level:'bad'});denied.all('[data-set-level]')[1].fire('click');
    assert.ok(denied.all('[data-level]').every(e=>e.hidden===(e.dataset.level!=='2')));
    const home=load(`${lang}/index.html`);
    for(const level of ['1','2','3']){
      home.all('[data-entry-level]').find(link=>link.dataset.entryLevel===level).fire('click');
      assert.equal(home.storage.get('isogai-showcase-level'),level);
    }
  });
  test(`${lang}: DA stepping, playback, stability, editing and comparisons`,()=>{
    const app=load(page('matching-da'));
    assert.match(app.$('#da-status').textContent,english?/No proposals/:/まだ提案/);
    for(let i=0;i<9;i++)app.$('#da-step').fire('click');
    assert.match(app.$('#da-status').textContent,english?/matching is final/:/確定/);assert.ok(app.$('#da-step').disabled);
    app.$('#da-check').fire('click');assert.match(app.$('#da-check-result').textContent,english?/0 blocking pairs/:/0組/);
    app.$('#da-compare').fire('click');assert.match(app.$('#da-comparison').innerHTML,english?/Student 1 ↔ Hospital 2/:/学生1 ↔ 病院2/);
    app.$('#da-unstable').fire('click');assert.match(app.$('#da-canvas').innerHTML,/blocking-line/);
    app.all('.prefs-student')[0].value='1,1,2';app.$('#da-apply').fire('click');assert.match(app.$('#da-error').textContent,english?/exactly once/:/各行/);
    app.all('.prefs-student')[0].value='2,1,3';app.$('#da-apply').fire('click');assert.equal(app.$('#da-error').textContent,'');
    app.$('#da-side').value='hospital';app.$('#da-side').fire('change');
    app.$('#da-play').fire('click');assert.equal(app.timers.size,1);app.$('#da-play').fire('click');assert.equal(app.timers.size,0);
    app.$('#da-play').fire('click');for(let i=0;i<9;i++)for(const callback of [...app.timers.values()])callback();
    assert.equal(app.timers.size,0);assert.match(app.$('#da-status').textContent,english?/matching is final/:/確定/);
    app.$('#da-reset').fire('click');assert.match(app.$('#da-status').textContent,english?/No proposals/:/まだ提案/);
  });
  test(`${lang}: demand sliders, reset, profits and maximum likelihood`,()=>{
    const app=load(page('discrete-choice-logit')),before=app.$('#logit-shares').innerHTML;
    app.$('#price-a').value='400';app.$('#price-a').fire('input');
    assert.notEqual(app.$('#logit-shares').innerHTML,before);assert.equal(app.$('#price-a-value').textContent,english?'400 yen':'400円');
    assert.match(app.$('#logit-profit').innerHTML,/current-point/);
    app.$('#logit-reset').fire('click');assert.equal(app.$('#logit-shares').innerHTML,before);
    app.$('#fit-logit').fire('click');assert.match(app.$('#fit-result').innerHTML,english?/Convergence criterion met/:/収束条件を満たしました/);assert.match(app.$('#fit-result').innerHTML,/-1\.199/);
  });
  test(`${lang}: town, payoffs, equilibria and population respond together`,()=>{
    const app=load(page('location-entry-game'));
    assert.match(app.$('#equilibria').textContent,english?/equilibria: 1\./:/1組/);assert.equal(app.all('[data-a]').length,16);
    app.all('[data-a]').find(e=>e.dataset.a==='2'&&e.dataset.b==='2').fire('click');
    assert.match(app.$('#location-result').innerHTML,english?/is a pure-strategy Nash equilibrium/:/この組合せは純粋戦略ナッシュ均衡です/);
    app.$('#population').value='.5';app.$('#population').fire('input');app.$('#fixed-cost').value='250';app.$('#fixed-cost').fire('input');
    assert.match(app.$('#equilibria').textContent,english?/Firm A: Stay out; firm B: Stay out/:/A社：出店しない、B社：出店しない/);
    assert.match(app.$('#town-map').innerHTML,english?/population: 220/:/220人/);assert.match(app.$('#entry-chart').innerHTML,/circle/);
    app.$('#site-a').value='0';app.$('#site-a').fire('change');assert.match(app.$('#location-result').innerHTML,/>0\.0</);
  });
}
test('Language: browser default, saved choice, invalid storage, deep links, and denied storage',()=>{
  const key='isogai-showcase-language';
  assert.equal(load('index.html',{languages:['ja-JP'],hash:'#cases'}).redirect,'/teaching/applied-micro/ja/#cases');
  assert.equal(load('index.html',{languages:['en-US']}).redirect,'/teaching/applied-micro/en/');
  assert.equal(load('index.html',{languages:['fr-FR']}).redirect,'/teaching/applied-micro/en/');
  assert.equal(load('index.html',{languages:[],language:'ja-JP'}).redirect,'/teaching/applied-micro/ja/');
  assert.equal(load('index.html',{storage:{[key]:'en'},languages:['ja']}).redirect,'/teaching/applied-micro/en/');
  assert.equal(load('index.html',{storage:{[key]:'bad'},languages:['ja']}).redirect,'/teaching/applied-micro/ja/');
  assert.equal(load('index.html',{denied:true,languages:['en']}).redirect,'/teaching/applied-micro/en/');
  const app=load('ja/cases/matching-da.html',{storage:{[key]:'en'}});
  assert.equal(app.redirect,null);app.all('[data-language]').find(e=>e.dataset.language==='en').fire('click');
  assert.equal(app.storage.get(key),'en');
  assert.equal(app.all('[data-language]').find(e=>e.dataset.language==='en').getAttribute('href'),'/teaching/applied-micro/en/cases/matching-da/');
  const denied=load('en/about.html',{denied:true});denied.all('[data-language]')[0].fire('click');assert.equal(denied.redirect,null);
});
test('Dictionaries: placeholder parity, no untranslated English strings, and identical numerical outputs',()=>{
  const {ja,en}=i18n.dictionaries;
  assert.deepEqual(Object.keys(ja),Object.keys(en));
  for(const key of Object.keys(ja)){
    assert.doesNotMatch(en[key],/[\u3040-\u30ff\u3400-\u9fff]/,key);
    const placeholders=s=>[...s.matchAll(/\{(\w+)\}/g)].map(m=>m[1]).sort();
    assert.deepEqual(placeholders(ja[key]),placeholders(en[key]),key);
  }
  for(const [page,selectors] of [['matching-da',['#da-canvas']],['discrete-choice-logit',['#logit-shares','#logit-profit']],['location-entry-game',['#town-map','#entry-chart']]]){
    const a=load(`ja/cases/${page}.html`),b=load(`en/cases/${page}.html`);
    const geometry=s=>s.replace(/aria-label="[^"]*"/g,'').replace(/<text\b[^>]*>.*?<\/text>/g,'');
    for(const selector of selectors)assert.equal(geometry(a.$(selector).innerHTML),geometry(b.$(selector).innerHTML));
    for(const node of b.all('.demo')) {
      const texts=[];function visit(el){texts.push(el.innerHTML);el.children.forEach(visit);}visit(node);
      assert.doesNotMatch(texts.join(''),/[\u3040-\u30ff\u3400-\u9fff]/);
    }
  }
});
