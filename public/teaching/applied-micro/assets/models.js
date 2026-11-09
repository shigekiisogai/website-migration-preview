/* Pure computational core. Browser global + CommonJS for offline node tests. */
(function (root) {
  'use strict';
  function validatePreferences(left, right) {
    const n = left.length;
    if (!n || right.length !== n) throw Error('両側を同じ人数にしてください。');
    for (const rows of [left, right]) for (const row of rows) {
      if (row.length !== n || new Set(row).size !== n || row.some(x => !Number.isInteger(x) || x < 0 || x >= n))
        throw Error('各行に相手の番号を1回ずつ、好む順に入力してください。');
    }
  }
  function deferredAcceptance(students, hospitals, side = 'student') {
    validatePreferences(students, hospitals);
    if (!['student', 'hospital'].includes(side)) throw Error('Unknown proposing side');
    const [p, r] = side === 'student' ? [students, hospitals] : [hospitals, students];
    const n = p.length, held = Array(n).fill(-1), match = Array(n).fill(-1), next = Array(n).fill(0);
    const ranks = r.map(row => Array.from({length:n}, (_,i) => row.indexOf(i)));
    const history = [];
    while (true) {
      const proposer = match.findIndex((x,i) => x === -1 && next[i] < n);
      if (proposer === -1) break;
      const receiver = p[proposer][next[proposer]++], previous = held[receiver];
      const accepted = previous === -1 || ranks[receiver][proposer] < ranks[receiver][previous];
      if (accepted) {
        if (previous !== -1) match[previous] = -1;
        held[receiver] = proposer; match[proposer] = receiver;
      }
      const studentMatch = side === 'student' ? match.slice() : held.slice();
      history.push({proposer, receiver, previous, accepted, match: studentMatch});
    }
    return {match: side === 'student' ? match.slice() : held.slice(), history};
  }
  function blockingPairs(students, hospitals, match) {
    validatePreferences(students, hospitals);
    const n=students.length;
    if (match.length!==n || match.some(x=>!Number.isInteger(x)||x < -1||x>=n) || new Set(match.filter(x=>x>=0)).size!==match.filter(x=>x>=0).length) throw Error('割当てが不正です。');
    const pairs=[];
    students.forEach((prefs,s) => hospitals.forEach((hp,h) => {
      const incumbent=match.indexOf(h);
      if ((match[s]===-1 || prefs.indexOf(h)<prefs.indexOf(match[s])) &&
          (incumbent===-1 || hp.indexOf(s)<hp.indexOf(incumbent))) pairs.push([s,h]);
    }));
    return pairs;
  }
  function softmax(utilities) {
    if (!utilities.length || utilities.some(x=>!Number.isFinite(x))) throw Error('効用は有限の数値にしてください。');
    const max=Math.max(...utilities), exps=utilities.map(x=>Math.exp(x-max)), total=exps.reduce((a,b)=>a+b,0);
    return exps.map(x=>x/total);
  }
  function demand(prices, qualities, population=1000, cost=80) {
    const probabilities=softmax([0,...prices.map((p,j)=>-1.2*p/100+0.9*qualities[j])]);
    return {probabilities, quantities:probabilities.map(p=>population*p), profits:prices.map((p,j)=>(p-cost)*population*probabilities[j+1])};
  }
  function rng(seed) {
    let s=seed>>>0;
    return ()=>{s=(Math.imul(1664525,s)+1013904223)>>>0;return s/4294967296;};
  }
  function syntheticChoices(n=1800, seed=20261029) {
    const random=rng(seed), data=[];
    for(let i=0;i<n;i++) {
      const x=[[0,0],[1+4*random(),5*random()],[1+4*random(),5*random()]];
      const p=softmax(x.map(v=>-1.2*v[0]+0.9*v[1]));
      let u=random(), y=0; while(y<2 && u>p[y]) {u-=p[y];y++;}
      data.push({x,y});
    }
    return data;
  }
  function likelihood(data, beta) {
    let ll=0; const gradient=[0,0], information=[[0,0],[0,0]];
    for(const {x,y} of data) {
      const v=x.map(row=>row[0]*beta[0]+row[1]*beta[1]);
      const p=softmax(v), max=Math.max(...v);
      ll+=v[y]-max-Math.log(v.reduce((s,z)=>s+Math.exp(z-max),0));
      const mean=[0,0];
      for(let j=0;j<x.length;j++) for(let a=0;a<2;a++) mean[a]+=p[j]*x[j][a];
      for(let a=0;a<2;a++) {
        gradient[a]+=x[y][a]-mean[a];
        for(let b=0;b<2;b++) for(let j=0;j<x.length;j++) information[a][b]+=p[j]*(x[j][a]-mean[a])*(x[j][b]-mean[b]);
      }
    }
    return {ll, gradient, information};
  }
  function fitLogit(data, maxIterations=60) {
    let beta=[0,0], current=likelihood(data,beta), iterations=0, converged=false;
    const trace=[current.ll];
    for(;iterations<maxIterations;iterations++) {
      if(Math.max(...current.gradient.map(Math.abs))/data.length<1e-8) {converged=true;break;}
      const [[a,b],[c,d]]=current.information, det=a*d-b*c;
      if(!Number.isFinite(det)||det<1e-10) break;
      const [g,h]=current.gradient, step=[(d*g-b*h)/det,(a*h-c*g)/det];
      let scale=1, candidate, result;
      while(scale>1e-9) {
        candidate=beta.map((v,i)=>v+scale*step[i]); result=likelihood(data,candidate);
        if(result.ll>=current.ll-1e-10) break;
        scale/=2;
      }
      if(scale<=1e-9) break;
      beta=candidate; current=result; trace.push(current.ll);
    }
    converged=converged||Math.max(...current.gradient.map(Math.abs))/data.length<1e-8;
    return {beta, ...current, iterations, converged, trace, n:data.length};
  }
  const locations=[null,[0,2],[2,2],[4,2]];
  function town(scale=1) {
    return Array.from({length:25},(_,i)=>({x:i%5,y:Math.floor(i/5),population:scale*(8+6*(4-Math.abs(i%5-2)-Math.abs(Math.floor(i/5)-2)))}));
  }
  function locationPayoffs(a,b,scale=1,fixedCost=100) {
    const sales=[0,0];
    for(const cell of town(scale)) {
      const distances=[a,b].map(s=>s===0?Infinity:Math.abs(cell.x-locations[s][0])+Math.abs(cell.y-locations[s][1]));
      const nearest=Math.min(...distances);
      if(nearest>2) continue;
      const winners=distances.map((d,i)=>d===nearest?i:-1).filter(i=>i>=0);
      for(const i of winners) sales[i]+=cell.population/winners.length;
    }
    return sales.map((s,i)=>[a,b][i]===0?0:s-fixedCost);
  }
  function payoffMatrix(scale=1,fixedCost=100) {
    return Array.from({length:4},(_,a)=>Array.from({length:4},(_,b)=>locationPayoffs(a,b,scale,fixedCost)));
  }
  function pureNash(matrix,tolerance=1e-9) {
    const equilibria=[];
    for(let a=0;a<matrix.length;a++) for(let b=0;b<matrix[0].length;b++) {
      if(matrix.every(row=>row[b][0]<=matrix[a][b][0]+tolerance) && matrix[a].every(cell=>cell[1]<=matrix[a][b][1]+tolerance)) equilibria.push([a,b]);
    }
    return equilibria;
  }
  const api={validatePreferences,deferredAcceptance,blockingPairs,softmax,demand,rng,syntheticChoices,likelihood,fitLogit,town,locations,locationPayoffs,payoffMatrix,pureNash};
  if(typeof module==='object' && module.exports) module.exports=api;
  else root.ShowcaseModels=api;
})(typeof globalThis!=='undefined'?globalThis:this);
