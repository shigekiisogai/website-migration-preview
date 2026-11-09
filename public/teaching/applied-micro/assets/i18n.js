/* All demo-facing text. Computation stays in models.js; both languages share app.js. */
(function(root){
  'use strict';
  const messages={
    daTitle:['DAアルゴリズムの逐次計算','Step-by-step deferred acceptance'],
    daIntro:['架空の学生3人と病院3か所。各病院の定員は1人。番号を好む順に並べてください。','Three fictional students and three hospitals, with one position per hospital. Rank the numbers from most to least preferred.'],
    edit:['選好を編集する','Edit preferences'], example:['各行は例：1, 2, 3','Example row: 1, 2, 3'],
    studentsHospitals:['学生 → 病院','Students → Hospitals'],hospitalsStudents:['病院 → 学生','Hospitals → Students'],
    student:['学生','Student '],hospital:['病院','Hospital '],
    studentRank:['学生{n}が好む病院の順序','Student {n}: hospital ranking'],hospitalRank:['病院{n}が好む学生の順序','Hospital {n}: student ranking'],
    apply:['選好を反映して最初から','Apply preferences and restart'],side:['提案する側','Proposing side'],studentSide:['学生側','Students'],hospitalSide:['病院側','Hospitals'],
    step:['1手進める','Next proposal'],play:['自動再生','Play'],pause:['一時停止','Pause'],reset:['最初から','Restart'],
    daLegend:['緑の実線：保留中の組 ／ 橙の点線：今回の提案 ／ 赤い破線：ブロッキングペア','Solid green: tentative matches / Dotted orange: current proposal / Dashed red: blocking pairs'],
    check:['今の割当ての安定性をチェック','Check current stability'],compare:['両側の最終結果を比較','Compare final matchings'],unstable:['不安定な割当ての例','An unstable matching'],history:['提案の履歴','Proposal history'],
    daAlt:['左が学生、右が病院。緑の実線は保留中の組、橙の点線は今回の提案、赤い破線はブロッキングペア。','Students on the left, hospitals on the right. Solid green lines show tentative matches, dotted orange lines the current proposal, and dashed red lines blocking pairs.'],
    replace:['新しい提案を保留し、前の相手を解放','holds the new proposal and releases the previous partner'],hold:['提案を保留','holds the proposal'],reject:['提案を断り、現在の相手を保留','rejects the proposal and keeps the current partner'],
    event:['{p} → {r}：{action}','{p} → {r}: {action}'],stepStatus:['第{n}手　{description}{done}','Proposal {n}: {description}{done}'],done:['。割当てが確定しました。','. The matching is final.'],start:['まだ提案していません。「1手進める」を押してください。','No proposals yet. Select “Next proposal” to begin.'],
    invalidPrefs:['各行に1・2・3を1回ずつ入力してください。','Enter 1, 2, and 3 exactly once in each row.'],
    pair:['学生{s}と病院{h}','Student {s} and hospital {h}'],separator:['、','; '],
    blocking:['ブロッキングペア：{pairs}。赤い破線の組は、互いに今より好む相手です。','Blocking pairs: {pairs}. Each red dashed pair prefers one another to their current partners.'],stable:['ブロッキングペアは0組。この仮定のもとで安定です。','0 blocking pairs. The matching is stable under these assumptions.'],
    finalSide:['{side}提案の最終結果','Final matching: {side} propose'],blockingCount:['ブロッキングペア {n}組','Blocking pairs: {n}'],
    compareNote:['初期の選好では、学生側提案と病院側提案で学生1・2の相手が変わります。','With the initial preferences, students 1 and 2 receive different partners depending on which side proposes.'],comparisonStatus:['比較用の割当てです。次の操作でDAの表示に戻ります。','A matching for comparison. The next DA step restores the algorithm display.'],
    logitTitle:['価格・品質と需要予測','Price, quality, and demand prediction'],logitIntro:['架空のドリンクA・Bと「買わない」。1,000人が1回ずつ選ぶ市場を考えます。','Fictional drinks A and B, plus the option to buy neither. A market of 1,000 people, each choosing once.'],
    priceA:['Aの価格','Price of A'],priceB:['Bの価格','Price of B'],qualityA:['Aの品質','Quality of A'],qualityB:['Bの品質','Quality of B'],yen:['円',' yen'],units:['本',' units'],
    costs:['品質は教材用の指標（0〜5）。単位当たり費用は両商品とも80円、固定費用は0円です。','Quality is a teaching index (0–5). Both products have a unit cost of 80 yen and zero fixed costs.'],defaults:['初期値に戻す','Restore defaults'],
    profitHeading:['Aの価格と利潤（Bの価格・両商品の品質は固定）','Price and profit for A (holding B’s price and both qualities fixed)'],profitNote:['折れ線は80〜500円を10円刻みで計算。点は現在の価格。スライダーで、この範囲の利潤が高い価格を探してみましょう。','The line uses prices from 80 to 500 yen in 10-yen steps. The dot marks the current price. Use the slider to find a price with a high profit in this range.'],
    neither:['買わない','Neither'],productA:['商品A','Product A'],productB:['商品B','Product B'],sharesAlt:['選択確率と予測市場シェア：','Choice probabilities and predicted market shares: '],salesA:['Aの予測販売数','Predicted sales of A'],profitA:['Aの利潤','Profit of A'],profitB:['Bの利潤','Profit of B'],profitAxis:['利潤（円）','Profit (yen)'],profitAlt:['Aの価格に対する利潤。現在の利潤{profit}円。','Profit as a function of A’s price. Current profit: {profit} yen.'],
    mleTitle:['架空の選択データから係数を推定する','Estimate coefficients from fictional choices'],mleIntro:['固定seed 20261029で1,800人の独立した選択を生成。真の係数は価格（100円単位）−1.2、品質0.9です。上のスライダーとは独立した実験です。','Generate 1,800 independent choices with fixed seed 20261029. True coefficients: −1.2 on price (per 100 yen) and 0.9 on quality. This experiment is independent of the sliders above.'],fit:['架空データで最尤推定を実行','Run maximum likelihood on fictional data'],converged:['収束条件を満たしました','Convergence criterion met'],notConverged:['収束未確認：推定結果は保留','Convergence unconfirmed: estimates are provisional'],fitStatus:['{status}（反復 {n}回、平均スコア最大絶対値 {score}）。','{status} ({n} iterations; largest absolute average score: {score}).'],coefficients:['生成に使った係数と最尤推定値','Data-generating coefficients and maximum likelihood estimates'],coefficient:['係数','Coefficient'],truth:['真の値','True value'],estimate:['推定値','Estimate'],price100:['価格（100円単位）','Price (per 100 yen)'],qualityUnit:['品質（1単位）','Quality (per unit)'],likelihood:['対数尤度：{before} → {after}。有限標本では推定値は真の値とずれます。','Log-likelihood: {before} → {after}. Estimates differ from the true values in finite samples.'],aggregate:['同じ選択集合について集計したシェア','Shares aggregated over the same choice sets'],option:['選択肢','Alternative'],fictional:['架空データ','Fictional data'],fitted:['推定モデル','Fitted model'],mleNote:['標準誤差・信頼区間は今回のデモの対象外。実データでは識別、分離、情報行列、反復回答の依存なども確認します。','Standard errors and confidence intervals are outside this demo’s scope. With real data, also examine identification, separation, the information matrix, and dependence across repeated responses.'],
    out:['出店しない','Stay out'],west:['西','West'],center:['中央','Center'],east:['東','East'],firmA:['A社','Firm A'],firmB:['B社','Firm B'],
    entryTitle:['2社の立地選択と参入均衡','Location choice and entry equilibria with two firms'],entryIntro:['架空の5×5の街。各社は最大1店を出し、同時に場所を選びます。','A fictional 5×5 town. Each firm can open at most one store; both choose simultaneously.'],townNote:['数字は各区画の人口。濃い区画ほど人口が多い。丸がA社、四角がB社。候補地は西・中央・東です。','Numbers show population in each cell; darker cells have more residents. A circle marks firm A and a square firm B. Candidate locations are West, Center, and East.'],population:['人口倍率','Population multiplier'],fixed:['1店の固定費用','Fixed cost per store'],times:['倍','×'],teaching:['教材単位',' teaching units'],
    entryHeading:['人口と均衡における出店数','Population and equilibrium store counts'],entryNote:['各人口倍率で全16通りを再計算。点は純粋戦略ナッシュ均衡での出店数（0〜2店）。同じ倍率に複数の点があれば、出店数の異なる均衡があります。均衡がなければ×を表示します。','All 16 choice pairs are recalculated at each population multiplier. Dots show the number of stores (0–2) in pure-strategy Nash equilibria. Multiple dots at a multiplier indicate equilibria with different store counts. A × indicates no pure-strategy equilibrium.'],townAlt:['架空の街。A社：{a}、B社：{b}。人口合計{n}人。','Fictional town. Firm A: {a}; firm B: {b}. Total population: {n}.'],payoffA:['A社の利得','Firm A’s payoff'],payoffB:['B社の利得','Firm B’s payoff'],isEq:['この組合せは純粋戦略ナッシュ均衡です。','This pair of choices is a pure-strategy Nash equilibrium.'],notEq:['一方の企業が単独で選択を変えると利得を増やせます。','A firm can increase its payoff by changing its choice unilaterally.'],populationTotal:['人口合計 {n}人 ／ 利得は教材単位','Total population: {n} / Payoffs in teaching units'],payoffCaption:['利得表（A社, B社）— セルを押すと街に反映。★は均衡。','Payoffs (firm A, firm B). Select a cell to update the map. ★ marks an equilibrium.'],payoffAxes:['A社 ↓ ／ B社 →','Firm A ↓ / Firm B →'],cellAlt:['A社{a}、B社{b}、利得{pa}と{pb}{eq}','Firm A: {a}; firm B: {b}; payoffs {pa} and {pb}{eq}'],eqSuffix:['、均衡','; equilibrium'],eqPair:['（A社：{a}、B社：{b}）','(Firm A: {a}; firm B: {b})'],eqList:['純粋戦略ナッシュ均衡 {n}組：{pairs}','Pure-strategy Nash equilibria: {n}. {pairs}'],noEq:['純粋戦略ナッシュ均衡はありません。混合戦略の探索は今回の範囲外です。','There is no pure-strategy Nash equilibrium. Searching for mixed-strategy equilibria is outside this demo’s scope.'],storeCount:['出店数','Stores'],entryAlt:['人口倍率と純粋戦略ナッシュ均衡における出店数の関係','Population multiplier and the number of stores in pure-strategy Nash equilibria']
  };
  const dictionaries={ja:{},en:{}};
  for(const [key,values] of Object.entries(messages)){dictionaries.ja[key]=values[0];dictionaries.en[key]=values[1];}
  function translate(lang,key,values={}) {
    if(!(key in dictionaries[lang]))throw Error('Missing translation: '+lang+'/'+key);
    return dictionaries[lang][key].replace(/\{(\w+)\}/g,(_,name)=>{
      if(!(name in values))throw Error('Missing interpolation: '+key+'/'+name);
      return String(values[name]);
    });
  }
  const api={dictionaries,translate};
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.ShowcaseI18n=api;
})(typeof window==='object'?window:globalThis);
