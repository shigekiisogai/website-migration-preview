'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('./load-asset.cjs')('models.js');
const permutations=[[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]];
const approx=(a,b,tolerance=1e-9)=>assert.ok(Math.abs(a-b)<tolerance,`${a} != ${b}`);

test('DA: opposite proposing sides yield the expected two stable assignments',()=>{
  const s=[[0,1,2],[1,0,2],[0,1,2]],h=[[1,0,2],[0,1,2],[2,0,1]];
  assert.deepEqual(M.deferredAcceptance(s,h,'student').match,[0,1,2]);
  assert.deepEqual(M.deferredAcceptance(s,h,'hospital').match,[1,0,2]);
  for(const side of ['student','hospital']) assert.deepEqual(M.blockingPairs(s,h,M.deferredAcceptance(s,h,side).match),[]);
  assert.ok(M.deferredAcceptance(s,h).history.some(step=>!step.accepted));
});
test('DA: 300 seeded preference profiles, termination, stability and proposer optimality',()=>{
  const random=M.rng(71);
  for(let sample=0;sample<300;sample++) {
    const s=Array.from({length:3},()=>permutations[Math.floor(random()*6)]),h=Array.from({length:3},()=>permutations[Math.floor(random()*6)]);
    const stable=permutations.filter(match=>M.blockingPairs(s,h,match).length===0);
    for(const side of ['student','hospital']) {
      const result=M.deferredAcceptance(s,h,side);
      assert.ok(result.history.length<=9);
      assert.equal(new Set(result.match).size,3);
      assert.equal(M.blockingPairs(s,h,result.match).length,0);
      assert.equal(new Set(result.history.map(e=>`${e.proposer},${e.receiver}`)).size,result.history.length);
      for(const other of stable) for(let i=0;i<3;i++) {
        if(side==='student') assert.ok(s[i].indexOf(result.match[i])<=s[i].indexOf(other[i]));
        else assert.ok(h[i].indexOf(result.match.indexOf(i))<=h[i].indexOf(other.indexOf(i)));
      }
    }
  }
});
test('DA: blocking pairs include unmatched participants; malformed rankings rejected',()=>{
  const prefs=[[0,1],[0,1]];
  assert.deepEqual(M.blockingPairs(prefs,prefs,[1,0]),[[0,0]]);
  assert.equal(M.blockingPairs(prefs,prefs,[-1,-1]).length,4);
  assert.throws(()=>M.deferredAcceptance([[0,0],[0,1]],prefs));
  assert.throws(()=>M.deferredAcceptance([[0,2],[0,1]],prefs));
  assert.throws(()=>M.blockingPairs(prefs,prefs,[0,0]));
  assert.deepEqual(M.deferredAcceptance([[0]],[[0]]).match,[0]);
});
test('Logit: probabilities sum to one including outside option, even at extreme utilities',()=>{
  for(const v of [[0,0,0],[1000,1001,-1000],[-1000,-1001,-1002],[0,10000,1]]) {
    const p=M.softmax(v);approx(p.reduce((a,b)=>a+b,0),1);assert.ok(p.every(x=>x>=0&&x<=1));
  }
  assert.deepEqual(M.softmax([0,0,0]),[1/3,1/3,1/3]);
  assert.throws(()=>M.softmax([NaN,0]));
});
test('Logit: price, quality, quantities and cost units follow the stated model',()=>{
  const base=M.demand([220,250],[3,3.4]),higherPrice=M.demand([230,250],[3,3.4]),higherQuality=M.demand([220,250],[3.1,3.4]);
  assert.ok(higherPrice.probabilities[1]<base.probabilities[1]);
  assert.ok(higherQuality.probabilities[1]>base.probabilities[1]);
  approx(base.quantities.reduce((a,b)=>a+b,0),1000);
  approx(base.profits[0],140*1000*base.probabilities[1]);
  approx(M.demand([80,250],[3,3.4]).profits[0],0);
  approx(higherPrice.probabilities[0]/higherPrice.probabilities[2],base.probabilities[0]/base.probabilities[2]);
});
test('MLE: analytic gradient and information agree with finite differences',()=>{
  const data=M.syntheticChoices(50,19),beta=[-.8,.6],base=M.likelihood(data,beta),eps=1e-5;
  for(let a=0;a<2;a++) {
    const plus=beta.slice(),minus=beta.slice();plus[a]+=eps;minus[a]-=eps;
    const p=M.likelihood(data,plus),m=M.likelihood(data,minus);
    approx((p.ll-m.ll)/(2*eps),base.gradient[a],1e-6);
    for(let b=0;b<2;b++) approx(-(p.gradient[b]-m.gradient[b])/(2*eps),base.information[b][a],1e-5);
  }
});
test('MLE: reproducible classroom sample converges, improves likelihood and recovers coefficients',()=>{
  const data=M.syntheticChoices(),fit=M.fitLogit(data);
  assert.deepEqual(data.slice(0,4),M.syntheticChoices().slice(0,4));
  assert.ok(fit.converged);assert.ok(fit.trace.every((x,i)=>i===0||x>=fit.trace[i-1]-1e-8));
  approx(fit.beta[0],-1.2,.15);approx(fit.beta[1],.9,.15);
  assert.ok(Math.max(...fit.gradient.map(Math.abs))/data.length<1e-8);
  assert.equal(M.fitLogit(data,0).converged,false);
});
test('MLE: independently generated 12000 choices recover a different parameter vector',()=>{
  // Independent RNG, probability calculation and categorical sampling.
  let seed=191;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const truth=[-.7,1.1],data=[];
  for(let i=0;i<12000;i++) {
    const x=[[0,0],[1+4*random(),5*random()],[1+4*random(),5*random()]];
    const weights=x.map(r=>Math.exp(r[0]*truth[0]+r[1]*truth[1])),sum=weights.reduce((a,b)=>a+b,0),u=random()*sum;
    const y=u<weights[0]?0:u<weights[0]+weights[1]?1:2;data.push({x,y});
  }
  const fit=M.fitLogit(data);assert.ok(fit.converged);fit.beta.forEach((x,i)=>approx(x,truth[i],.08));
});
test('Location: population, no entry, central catchment and co-location tie sharing',()=>{
  approx(M.town().reduce((s,c)=>s+c.population,0),440);
  assert.deepEqual(M.locationPayoffs(0,0),[0,0]);
  assert.deepEqual(M.locationPayoffs(2,0),[196,0]);
  assert.deepEqual(M.locationPayoffs(2,2),[48,48]);
  for(let a=0;a<4;a++) for(let b=0;b<4;b++) assert.deepEqual(M.locationPayoffs(a,b),M.locationPayoffs(b,a).reverse());
});
test('Nash enumeration: dominant strategies, multiple equilibria, ties and no pure equilibrium',()=>{
  assert.deepEqual(M.pureNash([[[3,3],[0,5]],[[5,0],[1,1]]]),[[1,1]]);
  assert.deepEqual(M.pureNash([[[2,2],[0,0]],[[0,0],[1,1]]]),[[0,0],[1,1]]);
  assert.deepEqual(M.pureNash([[[1,-1],[-1,1]],[[-1,1],[1,-1]]]),[]);
  assert.equal(M.pureNash([[[0,0],[0,0]],[[0,0],[0,0]]]).length,4);
});
test('Location: enumerated equilibria satisfy all unilateral deviation inequalities',()=>{
  for(const scale of [.5,1,1.7,3]) for(const cost of [20,100,250]) {
    const table=M.payoffMatrix(scale,cost),eq=M.pureNash(table);
    for(let a=0;a<4;a++) for(let b=0;b<4;b++) {
      let profitableDeviation=false;
      for(let choice=0;choice<4;choice++) if(table[choice][b][0]>table[a][b][0]+1e-9||table[a][choice][1]>table[a][b][1]+1e-9) profitableDeviation=true;
      assert.equal(eq.some(([i,j])=>i===a&&j===b),!profitableDeviation);
    }
  }
  assert.deepEqual(M.pureNash(M.payoffMatrix(.5,250)),[[0,0]]);
  assert.ok(M.pureNash(M.payoffMatrix(3,20)).every(([a,b])=>a>0&&b>0));
});
