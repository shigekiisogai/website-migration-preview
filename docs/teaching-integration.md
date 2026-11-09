# 教育コンテンツの統合試作（2026-11-09）

Teaching、Course Materials、日本語ページの「自習用教材 / Self-study materials」から、次の教材へ進めます。

- `/teaching/applied-micro/`：日英11組の応用事例集。個人サイトの共通レイアウトを使用します。
- `/teaching/interactive/`：Interactive Microeconomicsの目次と7章。章間リンクは相対URLです。各ページ上部から個人サイトへ戻れます。

## 配信先を切り替える

```sh
npm run build:github            # /website-migration-preview/
npm run build:github:root       # /（将来のユーザーサイト）
PAGES_REPOSITORY=sisogai.github.io npm run build:github  # 同じく /
PAGES_BASE_PATH=/another-preview/ npm run build:github  # 明示したbase
npm run build:cloudflare        # 常に /
```

`PAGES_BASE_PATH` は `/` または `/repository/` 形式です。既定値は従来どおりです。`dist-github/` はビルドごとに置き換わるため、最後に使ったbaseとリンク検査時のbaseを合わせます。

```sh
npm ci --ignore-scripts
npm test
npm run build:github
npm run build:cloudflare
npm run test:applied
npm run check:publish
npm run check:links
npm run check:content
# ルート配信の追加検査
npm run build:github:root
node scripts/check-links.mjs dist-github /
# 試験公開向けの出力へ戻す
npm run build:github
```

`check:links` は全出力HTMLのhref/src、内部ファイル、フラグメント、base、重複ID、noindexを検査します。外部リンクは一覧に記録し、接続しません。結果は `.local/links-*.json` に保存します。

`check:content` は既存14ページの本文・リンクと移行時の比較基準を照合し、全差分を `.local/content-results.json` に記録します。今回の導線追加により3ページ×2ビルドで失敗します。比較基準の更新は本人の差分確認後に行います。既存の公開ワークフローはこの検査で停止する状態を維持しています。

## 素材と更新

- 応用事例集の生成済みHTML：`src/materials/applied/{ja,en}/`。これは統合時点のスナップショットです。`src/lib/applied.mjs` が本文・目次・状態表示・言語切替・出典欄を取り出し、内部リンクをAstroのパスへ変換します。
- ダウンロード用の原稿：`public/teaching/applied-micro/sources/`。日英Markdownと翻訳状態を保持します。今後の本文更新では、元の原稿を修正・再生成し、HTMLスナップショット、配布原稿、翻訳状態を一緒に差し替えます。公開前に日英対照と差分を確認します。
- 計算・操作：`public/teaching/applied-micro/assets/`。元の4本のJavaScriptを保持。`casebook.css` は元CSSを `.applied-content` 内に限定し、個人サイトの配色に合わせたものです。
- 既存教材：`public/teaching/interactive/`。teaching正本のcommitと元ファイルのSHA-256は `provenance/teaching-integration.json` に記録。更新時もorigin/mainを取得し、章間URLと戻りリンクを確認します。
- 教材の既存回帰テスト：`tests/interactive/`。応用事例集の計算・DOM操作テスト：`tests/applied/`（Cloudflareビルド後に実行）。DOMテストは描画・ブラウザーのCSP実行を確認するものとは区別します。

原稿中の「AI作成・原典未確認」、翻訳draft、架空データ・利用条件の表示を維持しています。本文・コード全体の公開ライセンスは元資料の記載どおり公開前の決定事項です。

## スクリプトと配信ヘッダー

共通LayoutにCSPのmetaを置き、通常ページは `script-src 'none'`、応用事例集は `'self'` を指定します。既存教材は元のinlineコードとKaTeX 0.16.9のCDNを使うため、教材HTMLのmetaでその範囲を許可します。外部CDNへの接続とColab資料の内容は今回の内部リンク検査に含みません。

Cloudflareの `_headers` は全ページにnoindex、nosniff、Referrer-Policy、`frame-ancestors 'none'` を付けます。他のCSP指示は各HTMLのmetaが担います。複数ルールのCSPを重ねるとスクリプト禁止が残るため、共通ヘッダーとHTMLの役割を分けています。[Cloudflare公式のヘッダー仕様](https://developers.cloudflare.com/workers/static-assets/headers/)も参照できます。

`npm run preview:cloudflare` の開発用registryは `.local/wrangler-registry` に置き、プロジェクト内で完結させます。ローカルHTTPで48ページの200、404、ヘッダーとmetaの組合せを検査しました。実ブラウザーでの表示・CSP実行とCDNによる数式描画は、公開前の確認事項です。
