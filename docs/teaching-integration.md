# 教育コンテンツの統合（2026-11-10）

Teachingは担当授業の一覧、Course Materialsは教材・資料への入口として使います。Teachingは年度・学期別の箇条書きで、対象が元原稿に明記された科目に対象を添えます。自習用教材への案内はCourse Materialsへの1件にまとめています。

- `/course-materials/`：講義ノート・問題・解答・自習用教材。既存のリンクを維持。
- `/teaching/applied-micro/`：応用事例集。日英11組のページ。
- `/teaching/interactive/`：Interactive Microeconomicsの目次と7章。

## ビルドと検査

```sh
npm test
npm run build:github
npm run build:cloudflare
npm run test:applied
npm run check:publish
npm run check:links
npm run check:redirects
npm run check:content
```

GitHub Pagesの既定baseは `/website-migration-preview/`、Cloudflareは `/` です。GitHub側は `PAGES_BASE_PATH=/` または `PAGES_REPOSITORY=sisogai.github.io` でもルート配信を指定できます。今回の実行結果・確認範囲はルートの `REPORT_ROUND3.md` に記録しています。

`check:content` は移行時の比較基準を保持します。ルート変更後も `canonicalRoute()` で新URLの本文を読み、14ページ×2ビルドを比較します。今回の差分は4ページ×2ビルドで、比較基準の承認・更新は行っていません。差分のある状態では既存の公開ワークフローがこの検査で停止します。

`check:links` は全出力HTMLのhref/src、内部ファイル、フラグメント、旧URLへの内部リンク、base、重複ID、noindexを検査します。外部リンクには接続しません。`check:redirects` は旧URL転送、公開対象から外したページの混入、応用事例集の廃止表示を両ビルドで検査します。結果は `.local/` に保存します。

Macでの今回のWXRテストには `WXR_TEST_PYTHON` で指定の作業用Pythonランチャーを渡しました。固定したローカルXMLテストデータだけを処理します。

## 表示と素材

共通ヘッダーは `src/lib/navigation.mjs` と `public/site-header.css` を共有します。`scripts/build.mjs` が8つのInteractive教材にもbaseに合わせたヘッダーを挿入します。ヘッダーはビルド出力で確認します。

Interactive教材の表示は `public/teaching/interactive/interactive-light.css` で白・淡い背景に調整しています。冒頭説明の文字サイズ・行間・横幅を整え、canvasはCSSの色変換で明るく表示します。HTMLの変更はこのCSSの読み込み1行です。本文、数式、KaTeX設定、計算・描画スクリプトを保持します。

応用事例集の原HTMLスナップショットは `src/materials/applied/{ja,en}/` に保持します。`src/lib/casebook-presentation.mjs` が承認された表示変更を適用し、`src/lib/applied.mjs` が共通レイアウト、折りたたむ目次、カード、言語切替、内部リンクを生成します。各カードとページの状態表示は外し、日英それぞれの目次に資料集全体の作成中案内を1件表示します。デモには説明用の架空データである旨を残しています。

配布Markdownは `public/teaching/applied-micro/sources/` にあり、AI・翻訳draft・事例別の状態表示を取り除いた版です。編集前の配布原稿は `.migration/round3/sources/` に退避しています。計算・操作用の4本のJavaScriptは保持しています。原HTML・JavaScript・inlineスクリプトのハッシュは `provenance/teaching-integration.json` と照合します。

本文とプログラム全体の公開ライセンスについては原資料の記載を維持しています。

## URLと公開範囲

`src/lib/redirects.json` に日本語スラッグ5件と英字URLの対応を記載しています。旧URLにmeta refresh・canonical・noindexを含む静的ページを両ビルドで生成します。新URLの一覧は `docs/page-map.md`、ナビゲーションは `src/lib/routes.json` を参照します。

Hermesの3ページと専用コンポーネントは `.migration/round3/hermes-personal-assistant/` に退避しています。この領域はGitと公開ビルドの対象外です。公開サイトマップを生成する設定はありません。

## CSPと配信設定

通常ページは `script-src 'none'`、応用事例集は `'self'`、既存Interactive教材はinlineコードとKaTeX 0.16.9のCDNを許可する既存metaを使います。Cloudflareの `_headers` と配信設定は維持しています。今回の検査は外部CDNへの接続・ブラウザー上の数式描画・公開環境のHTTP応答を含みません。
