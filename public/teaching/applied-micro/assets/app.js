(function () {
  'use strict';
  const M=window.ShowcaseModels;
  const lang=document.documentElement.lang==='en'?'en':'ja';
  const t=(key,values)=>window.ShowcaseI18n.translate(lang,key,values);
  const $=(s,root=document)=>root.querySelector(s);
  const all=(s,root=document)=>[...root.querySelectorAll(s)];
  const number=n=>Math.round(n).toLocaleString(lang==='ja'?'ja-JP':'en-US');
  const pct=n=>(100*n).toFixed(1)+'%';
  let level='1';
  try {level=localStorage.getItem('isogai-showcase-level')||'1';} catch (_) {}
  function setLevel(value,save=true) {
    level=['1','2','3'].includes(value)?value:'1';
    all('[data-level]').forEach(el=>{el.hidden=el.dataset.level!==level;});
    all('[data-set-level]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.setLevel===level)));
    if(save) try {localStorage.setItem('isogai-showcase-level',level);} catch (_) {}
  }
  all('[data-set-level]').forEach(button=>button.addEventListener('click',()=>setLevel(button.dataset.setLevel)));
  all('[data-entry-level]').forEach(link=>link.addEventListener('click',()=>setLevel(link.dataset.entryLevel)));
  setLevel(level,false);
  function svg(content,label,viewBox='0 0 600 260') {
    return `<svg viewBox="${viewBox}" role="img" aria-label="${label}">${content}</svg>`;
  }
  function range(id,label,min,max,value,step=1,unit='') {
    return `<label class="slider-label" for="${id}">${label}<output id="${id}-value">${value}${unit}</output></label><input type="range" id="${id}" min="${min}" max="${max}" step="${step}" value="${value}">`;
  }
  function daDemo(el) {
    const initialS=[[0,1,2],[1,0,2],[0,1,2]],initialH=[[1,0,2],[0,1,2],[2,0,1]];
    let students=initialS,hospitals=initialH,side='student',run,cursor=0,timer=null;
    const editor=(rows,kind)=>`<fieldset><legend>${t(kind==='student'?'studentsHospitals':'hospitalsStudents')}</legend>${rows.map((r,i)=>`<label>${t(kind)}${i+1}<input class="prefs-${kind}" aria-label="${t(kind+'Rank',{n:i+1})}" value="${r.map(x=>x+1).join(', ')}"></label>`).join('')}</fieldset>`;
    el.innerHTML=`<div class="demo-heading"><span class="eyebrow">MATCHING LAB</span><h3>${t('daTitle')}</h3><p>${t('daIntro')}</p></div>
<details class="preference-editor"><summary>${t('edit')} <span>${t('example')}</span></summary><div class="two-col">${editor(initialS,'student')}${editor(initialH,'hospital')}</div><button id="da-apply">${t('apply')}</button><p id="da-error" class="error" role="alert"></p></details>
<div class="controls"><label>${t('side')} <select id="da-side"><option value="student">${t('studentSide')}</option><option value="hospital">${t('hospitalSide')}</option></select></label><button id="da-step" class="primary">${t('step')}</button><button id="da-play">${t('play')}</button><button id="da-reset">${t('reset')}</button></div>
<div id="da-canvas" class="diagram"></div><p class="small">${t('daLegend')}</p><p id="da-status" class="result" aria-live="polite"></p><div class="controls"><button id="da-check">${t('check')}</button><button id="da-compare">${t('compare')}</button><button id="da-unstable">${t('unstable')}</button></div><div id="da-check-result" aria-live="polite"></div><div id="da-comparison"></div><details><summary>${t('history')}</summary><ol id="da-history"></ol></details>`;
    function stop(){clearInterval(timer);timer=null;$('#da-play').textContent=t('play');}
    function current(){return cursor?run.history[cursor-1].match:Array(3).fill(-1);}
    function draw(match,pairs=[]) {
      let shapes='';
      match.forEach((h,s)=>{if(h>=0)shapes+=`<line class="held-line" x1="155" y1="${60+s*70}" x2="445" y2="${60+h*70}"/>`;});
      pairs.forEach(([s,h])=>{shapes+=`<line class="blocking-line" x1="155" y1="${60+s*70}" x2="445" y2="${60+h*70}"/>`;});
      const event=cursor?run.history[cursor-1]:null;
      if(event&&pairs.length===0){const s=side==='student'?event.proposer:event.receiver,h=side==='student'?event.receiver:event.proposer;shapes+=`<line class="proposal-line" x1="${side==='student'?155:445}" y1="${60+(side==='student'?s:h)*70}" x2="${side==='student'?445:155}" y2="${60+(side==='student'?h:s)*70}"/>`;}
      for(let i=0;i<3;i++)shapes+=`<rect x="25" y="${35+i*70}" width="130" height="50" rx="12" class="student-node"/><text x="90" y="${65+i*70}" text-anchor="middle">${t('student')}${i+1}</text><rect x="445" y="${35+i*70}" width="130" height="50" rx="12" class="hospital-node"/><text x="510" y="${65+i*70}" text-anchor="middle">${t('hospital')}${i+1}</text>`;
      $('#da-canvas').innerHTML=svg(shapes,t('daAlt'));
    }
    function description(event){return t('event',{p:t(side)+ (event.proposer+1),r:t(side==='student'?'hospital':'student')+(event.receiver+1),action:t(event.accepted?(event.previous>=0?'replace':'hold'):'reject')});}
    function render(){draw(current());$('#da-status').textContent=cursor?t('stepStatus',{n:cursor,description:description(run.history[cursor-1]),done:cursor===run.history.length?t('done'):''}):t('start');$('#da-step').disabled=cursor>=run.history.length;$('#da-play').disabled=cursor>=run.history.length;$('#da-history').innerHTML=run.history.slice(0,cursor).map(e=>`<li>${description(e)}</li>`).join('');$('#da-check-result').textContent='';}
    function reset(){stop();cursor=0;run=M.deferredAcceptance(students,hospitals,side);$('#da-comparison').textContent='';render();}
    function step(){if(cursor<run.history.length){cursor++;render();}if(cursor>=run.history.length)stop();}
    $('#da-step').onclick=step;
    $('#da-play').onclick=()=>{if(timer){stop();return;}$('#da-play').textContent=t('pause');timer=setInterval(step,1100);};
    $('#da-reset').onclick=reset;
    $('#da-side').onchange=e=>{side=e.target.value;reset();};
    $('#da-apply').onclick=()=>{try{const read=selector=>all(selector).map(input=>input.value.trim().split(/[\s,、]+/).map(x=>Number(x)-1));const s=read('.prefs-student'),h=read('.prefs-hospital');M.validatePreferences(s,h);students=s;hospitals=h;$('#da-error').textContent='';reset();}catch(_){$('#da-error').textContent=t('invalidPrefs');}};
    function check(match){const pairs=M.blockingPairs(students,hospitals,match);draw(match,pairs);$('#da-check-result').textContent=pairs.length?t('blocking',{pairs:pairs.map(([s,h])=>t('pair',{s:s+1,h:h+1})).join(t('separator'))}):t('stable');}
    $('#da-check').onclick=()=>{stop();check(current());};
    $('#da-compare').onclick=()=>{stop();$('#da-comparison').innerHTML=`<div class="comparison">${['student','hospital'].map(proposing=>{const result=M.deferredAcceptance(students,hospitals,proposing);return `<div><h4>${t('finalSide',{side:t(proposing+'Side')})}</h4><p>${result.match.map((h,s)=>`${t('student')}${s+1} ↔ ${t('hospital')}${h+1}`).join('<br>')}</p><p>${t('blockingCount',{n:M.blockingPairs(students,hospitals,result.match).length})}</p></div>`;}).join('')}</div><p>${t('compareNote')}</p>`;};
    $('#da-unstable').onclick=()=>{stop();const candidates=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]],match=candidates.find(m=>M.blockingPairs(students,hospitals,m).length);$('#da-status').textContent=t('comparisonStatus');check(match||[-1,-1,-1]);};
    reset();
  }
  function logitDemo(el) {
    el.innerHTML=`<div class="demo-heading"><span class="eyebrow">DEMAND LAB</span><h3>${t('logitTitle')}</h3><p>${t('logitIntro')}</p></div><div class="lab-grid"><div class="sliders">${range('price-a',t('priceA'),80,500,220,10,t('yen'))}${range('quality-a',t('qualityA'),0,5,3,0.1)}${range('price-b',t('priceB'),80,500,250,10,t('yen'))}${range('quality-b',t('qualityB'),0,5,3.4,0.1)}<p class="small">${t('costs')}</p><button id="logit-reset">${t('defaults')}</button></div><div><div id="logit-shares"></div><div id="logit-metrics" class="metrics" aria-live="polite"></div></div></div><h4>${t('profitHeading')}</h4><div id="logit-profit"></div><p class="small">${t('profitNote')}</p>`;
    function render(){
      const get=id=>+$('#'+id).value,prices=[get('price-a'),get('price-b')],quality=[get('quality-a'),get('quality-b')];
      for(const id of ['price-a','price-b','quality-a','quality-b'])$('#'+id+'-value').textContent=get(id)+(id.startsWith('price')?t('yen'):'');
      const d=M.demand(prices,quality),labels=[t('neither'),t('productA'),t('productB')];
      let bars='';d.probabilities.forEach((p,i)=>{bars+=`<text x="8" y="${36+i*65}">${labels[i]}</text><rect x="100" y="${16+i*65}" width="${370*p}" height="28" rx="4" class="bar-${i}"/><text x="${110+370*p}" y="${36+i*65}">${pct(p)}</text>`;});
      $('#logit-shares').innerHTML=svg(bars,t('sharesAlt')+labels.map((l,i)=>l+' '+pct(d.probabilities[i])).join(t('separator')),'0 0 560 205');
      $('#logit-metrics').innerHTML=[['salesA',d.quantities[1],'units'],['profitA',d.profits[0],'yen'],['profitB',d.profits[1],'yen']].map(([label,n,unit])=>`<div><small>${t(label)}</small><strong>${number(n)}<small>${t(unit)}</small></strong></div>`).join('');
      const points=Array.from({length:43},(_,i)=>[80+i*10,M.demand([80+i*10,prices[1]],quality).profits[0]]),ymax=Math.max(1000,...points.map(p=>p[1]))*1.12;
      const x=p=>60+(p-80)/420*490,y=p=>205-p/ymax*165;
      $('#logit-profit').innerHTML=svg(`<line class="axis" x1="60" y1="205" x2="560" y2="205"/><line class="axis" x1="60" y1="30" x2="60" y2="205"/><text x="5" y="24">${t('profitAxis')}</text><text x="6" y="55">${number(ymax)}</text><text x="30" y="208">0</text><polyline class="profit-line" points="${points.map(p=>`${x(p[0])},${y(p[1])}`).join(' ')}"/><circle class="current-point" cx="${x(prices[0])}" cy="${y(d.profits[0])}" r="7"/><text x="55" y="230">80</text><text x="580" y="230" text-anchor="end">500${t('yen')}</text><text x="240" y="250">${t('priceA')}</text>`,t('profitAlt',{profit:number(d.profits[0])}));
    }
    all('input',el).forEach(input=>input.addEventListener('input',render));
    $('#logit-reset').onclick=()=>{[220,3,250,3.4].forEach((v,i)=>all('input',el)[i].value=v);render();};render();
  }
  function mleDemo(el) {
    el.innerHTML=`<h3>${t('mleTitle')}</h3><p>${t('mleIntro')}</p><button class="primary" id="fit-logit">${t('fit')}</button><div id="fit-result" aria-live="polite"></div>`;
    $('#fit-logit').onclick=()=>{
      const data=M.syntheticChoices(),fit=M.fitLogit(data),observed=[0,0,0],predicted=[0,0,0];
      data.forEach(row=>{observed[row.y]++;M.softmax(row.x.map(x=>x[0]*fit.beta[0]+x[1]*fit.beta[1])).forEach((p,j)=>predicted[j]+=p);});
      $('#fit-result').innerHTML=`<p class="result">${t('fitStatus',{status:t(fit.converged?'converged':'notConverged'),n:fit.iterations,score:(Math.max(...fit.gradient.map(Math.abs))/fit.n).toExponential(2)})}</p><table><caption>${t('coefficients')}</caption><thead><tr><th>${t('coefficient')}</th><th>${t('truth')}</th><th>${t('estimate')}</th></tr></thead><tbody><tr><th>${t('price100')}</th><td>−1.200</td><td>${fit.beta[0].toFixed(3)}</td></tr><tr><th>${t('qualityUnit')}</th><td>0.900</td><td>${fit.beta[1].toFixed(3)}</td></tr></tbody></table><p>${t('likelihood',{before:fit.trace[0].toFixed(2),after:fit.ll.toFixed(2)})}</p><table><caption>${t('aggregate')}</caption><thead><tr><th>${t('option')}</th><th>${t('fictional')}</th><th>${t('fitted')}</th></tr></thead><tbody>${[t('neither'),'A','B'].map((l,j)=>`<tr><th>${l}</th><td>${pct(observed[j]/fit.n)}</td><td>${pct(predicted[j]/fit.n)}</td></tr>`).join('')}</tbody></table><p class="small">${t('mleNote')}</p>`;
    };
  }
  function locationDemo(el) {
    const names=['out','west','center','east'].map(key=>t(key));let selected=[1,3];
    el.innerHTML=`<div class="demo-heading"><span class="eyebrow">CITY LAB</span><h3>${t('entryTitle')}</h3><p>${t('entryIntro')}</p></div><div class="lab-grid"><div><div id="town-map"></div><p class="small">${t('townNote')}</p></div><div class="sliders">${range('population',t('population'),0.5,3,1,0.1,t('times'))}${range('fixed-cost',t('fixed'),20,250,100,10,t('teaching'))}<div class="two-col"><label>${t('firmA')}<select id="site-a">${names.map((n,i)=>`<option value="${i}" ${i===1?'selected':''}>${n}</option>`).join('')}</select></label><label>${t('firmB')}<select id="site-b">${names.map((n,i)=>`<option value="${i}" ${i===3?'selected':''}>${n}</option>`).join('')}</select></label></div><div id="location-result" class="result" aria-live="polite"></div></div></div><div id="payoff-table" class="table-scroll" tabindex="0" role="region" aria-label="${t('payoffCaption')}"></div><div id="equilibria" aria-live="polite"></div><h4>${t('entryHeading')}</h4><div id="entry-chart"></div><p class="small">${t('entryNote')}</p>`;
    function render(){
      const scale=+$('#population').value,cost=+$('#fixed-cost').value,matrix=M.payoffMatrix(scale,cost),eq=M.pureNash(matrix),[a,b]=selected;
      $('#population-value').textContent=scale.toFixed(1)+t('times');$('#fixed-cost-value').textContent=cost+t('teaching');$('#site-a').value=a;$('#site-b').value=b;
      let shapes='';for(const cell of M.town(scale)){const opacity=0.14+(cell.population/scale-8)/24*0.65;shapes+=`<rect x="${25+cell.x*62}" y="${18+cell.y*62}" width="58" height="58" rx="5" fill="rgb(${Math.round(238-100*opacity)},${Math.round(242-70*opacity)},${Math.round(218-90*opacity)})"/><text x="${54+cell.x*62}" y="${52+cell.y*62}" text-anchor="middle">${Math.round(cell.population)}</text>`;}
      [a,b].forEach((s,i)=>{if(!s)return;const [x,y]=M.locations[s],cx=43+x*62+i*22,cy=28+y*62;shapes+=i?`<rect class="company-b" x="${cx-10}" y="${cy-10}" width="20" height="20"/><text class="marker-text" x="${cx}" y="${cy+5}" text-anchor="middle">B</text>`:`<circle class="company-a" cx="${cx}" cy="${cy}" r="11"/><text class="marker-text" x="${cx}" y="${cy+5}" text-anchor="middle">A</text>`;});
      shapes+=`<text x="54" y="350" text-anchor="middle">${t('west')}</text><text x="178" y="350" text-anchor="middle">${t('center')}</text><text x="302" y="350" text-anchor="middle">${t('east')}</text>`;
      const total=number(M.town(scale).reduce((s,c)=>s+c.population,0));
      $('#town-map').innerHTML=svg(shapes,t('townAlt',{a:names[a],b:names[b],n:total}),'0 0 360 370');
      const payoff=matrix[a][b],isEq=eq.some(([i,j])=>a===i&&b===j);
      $('#location-result').innerHTML=`<p>${t('payoffA')} <strong>${payoff[0].toFixed(1)}</strong> / ${t('payoffB')} <strong>${payoff[1].toFixed(1)}</strong></p><p>${t(isEq?'isEq':'notEq')}</p><p class="small">${t('populationTotal',{n:total})}</p>`;
      $('#payoff-table').innerHTML=`<table class="payoff"><caption>${t('payoffCaption')}</caption><thead><tr><th scope="col">${t('payoffAxes')}</th>${names.map(n=>`<th scope="col">${n}</th>`).join('')}</tr></thead><tbody>${matrix.map((row,i)=>`<tr><th scope="row">${names[i]}</th>${row.map((p,j)=>{const equilibrium=eq.some(([x,y])=>x===i&&y===j);return `<td class="${equilibrium?'equilibrium':''}"><button data-a="${i}" data-b="${j}" aria-pressed="${i===a&&j===b}" aria-label="${t('cellAlt',{a:names[i],b:names[j],pa:p[0].toFixed(1),pb:p[1].toFixed(1),eq:equilibrium?t('eqSuffix'):''})}">${equilibrium?'★ ':''}${p.map(x=>x.toFixed(1)).join(', ')}</button></td>`;}).join('')}</tr>`).join('')}</tbody></table>`;
      all('[data-a]',el).forEach(button=>button.onclick=()=>{selected=[+button.dataset.a,+button.dataset.b];render();});
      $('#equilibria').textContent=eq.length?t('eqList',{n:eq.length,pairs:eq.map(([i,j])=>t('eqPair',{a:names[i],b:names[j]})).join(t('separator'))}):t('noEq');
      let chart=`<line class="axis" x1="55" y1="205" x2="560" y2="205"/><text x="8" y="25">${t('storeCount')}</text>`;
      [0,1,2].forEach(n=>chart+=`<line class="grid-line" x1="55" y1="${195-n*70}" x2="550" y2="${195-n*70}"/><text x="25" y="${201-n*70}">${n}</text>`);
      for(let k=0;k<=25;k++){const s=0.5+k/10,x=55+k/25*490,counts=[...new Set(M.pureNash(M.payoffMatrix(s,cost)).map(([i,j])=>(i>0?1:0)+(j>0?1:0)))];if(counts.length)counts.forEach(n=>chart+=`<circle cx="${x}" cy="${195-n*70}" r="${Math.abs(s-scale)<0.01?7:4}" class="${Math.abs(s-scale)<0.01?'current-point':'entry-point'}"/>`);else chart+=`<text x="${x}" y="220">×</text>`;}
      chart+=`<text x="48" y="235">0.5${t('times')}</text><text x="525" y="235">3${t('times')}</text><text x="250" y="255">${t('population')}</text>`;
      $('#entry-chart').innerHTML=svg(chart,t('entryAlt'));
    }
    all('input',el).forEach(input=>input.oninput=render);$('#site-a').onchange=e=>{selected[0]=+e.target.value;render();};$('#site-b').onchange=e=>{selected[1]=+e.target.value;render();};render();
  }
  if($('#demo-da'))daDemo($('#demo-da'));
  if($('#demo-logit'))logitDemo($('#demo-logit'));
  if($('#demo-mle'))mleDemo($('#demo-mle'));
  if($('#demo-location'))locationDemo($('#demo-location'));
})();
