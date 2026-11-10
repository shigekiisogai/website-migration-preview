import {load} from 'cheerio';

export const developmentNotice={
 ja:'この資料集は作成中です。授業やゼミでの扱いに応じて内容を拡充していく予定です。',
 en:'This casebook is in development. We plan to expand it through use in courses and seminars.',
};
export const demoNote={ja:'デモの数値とデータは、説明用の架空データです。',en:'Demo values and data are fictional and provided for illustration.'};

// Presentation decisions apply to both HTML and downloadable Markdown.
// The imported HTML snapshots and calculation assets remain the source record.
export function cleanCasebookCopy(text) {
 return text
  .replace(/磯貝が作成中であり、今後、ゼミなどでの学生指導に実際に使いながら、内容を拡張していく予定です。/g,'')
  .replace(/It is being developed by Isogai, who plans to expand the materials through their use in student supervision, including seminars\./g,'')
  .replace(/各事例は構想段階を含み、本文・実例・文献情報には (?:<strong>|\*\*)AI作成・原典未確認(?:<\/strong>|\*\*) の部分があります。デモの数値とデータは教材用の架空のものです。/g,demoNote.ja)
  .replace(/The collection includes cases at the idea stage\. Parts of the text, applications, and references are (?:<strong>|\*\*)AI-drafted, sources not yet verified(?:<\/strong>|\*\*)\. Demo values and data are fictional teaching materials\./g,demoNote.en)
  .replace(/状態は「構想」[\s\S]*?翻訳状態は日英とも draft です。/g,'')
  .replace(/Project stages are Idea, Planning, Done in seminar, and Outcomes\. All three current cases are at the Idea stage\. Translation status is draft in both languages\./g,'')
  .replace(/各事例には「構想」「計画中」「ゼミで実施」「成果あり」の段階を表示します。いまは3事例とも構想段階です。/g,'')
  .replace(/Each case displays a stage: Idea, Planning, Done in seminar, or Outcomes\. All three current cases are at the Idea stage\./g,'')
  .replace(/(?:<strong>|\*\*)本文・実例・文献情報はAI作成・原典未確認(?:<\/strong>|\*\*)です。デモの計算検証と、学術的な内容の原典照合は、それぞれ記録します。数値や地図は教材用の架空データです。現実の企業・地域・学生の実績を示す数値は使っていません。/g,demoNote.ja)
  .replace(/(?:<strong>|\*\*)Text, applications, and references: AI-drafted, sources not yet verified(?:<\/strong>|\*\*)\. Computational checks of the demos and verification against academic sources are recorded separately\. Numerical values and maps are fictional teaching data\. They do not represent actual firms, places, or student achievements\./g,demoNote.en)
  .replace(/以下はすべて (?:<strong>|\*\*)AI作成・原典未確認(?:<\/strong>|\*\*)。公開前に[^\n<]*。/g,'')
  .replace(/All entries below are (?:<strong>|\*\*)AI-drafted, sources not yet verified(?:<\/strong>|\*\*)\. [^\n<]*before publication\./g,'')
  .replace(/(?:<strong>|\*\*)実例・文献説明はAI作成・原典未確認(?:<\/strong>|\*\*)です。/g,'')
  .replace(/(?:<strong>|\*\*)Applications and references: AI-drafted, sources not yet verified\.(?:<\/strong>|\*\*)/g,'')
  .replace(/実例・文献情報はすべて (?:<strong>|\*\*)AI作成・原典未確認(?:<\/strong>|\*\*)。/g,'')
  .replace(/All applications and references are (?:<strong>|\*\*)AI-drafted, sources not yet verified(?:<\/strong>|\*\*)\./g,'')
  .replace(/本文は (?:<strong>|\*\*)AI作成・原典未確認(?:<\/strong>|\*\*)。/g,'')
  .replace(/Text: (?:<strong>|\*\*)AI-drafted, sources not yet verified(?:<\/strong>|\*\*)\./g,'')
  .replace(/(?:<strong>|\*\*)AI作成・原典未確認(?:<\/strong>|\*\*)。/g,'')
  .replace(/(?:<strong>|\*\*)AI-drafted, sources not yet verified(?:<\/strong>|\*\*)\./g,'')
  .replace(/ゼミでの取組みは構想段階です。/g,'')
  .replace(/Seminar activities are at the Idea stage\./g,'');
}

export function presentCasebook(html) {
 const $=load(cleanCasebookCopy(html));
 $('.stage,.verification').remove();
 $('footer p').each((_,el)=>{if(/AI作成|AI-drafted|翻訳状態|Translation status|作成中の資料|Materials in development/.test($(el).text()))$(el).remove();});
 const labels=new Map([
  ['難易度と状態','難易度'],['事例の状態と今後の拡張','今後の拡張'],['この試作の確認状況','デモのデータ'],
  ['Case status and future development','Future development'],['Verification status of this prototype','Demo data'],
  ['Reading levels and project stages','Reading levels'],
 ]);
 $('h2,nav.contents a').each((_,el)=>{const node=$(el);if(labels.has(node.text()))node.text(labels.get(node.text()));});
 $('.page-meta > span').each((_,el)=>{$(el).text($(el).text().replace('構想一覧','分野一覧').replace(' · Ideas',' · Fields'));});
 $('p').each((_,el)=>{if(!$(el).text().trim()&&!$(el).children().length)$(el).remove();});
 return $.html();
}
