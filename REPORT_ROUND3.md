# Round 3 実装報告（2026-11-10）

## 前半：変更点と本人に見てほしい点

指定の6項目を作業ブランチ `integrate-teaching-20261109` に実装しました。

1. **Teaching / 授業**：27件の担当授業を年度・学期別の箇条書きに整理しました。過去の所属先と担当期間も保持しています。対象が原稿に明記された科目には学部・大学院の対象を添え、未記載の対象には推測を加えていません。科目カード、資料リンク、「—」「資料リンク未掲載」を取り除き、冒頭にCourse Materialsへの短い案内を1件残しました。
2. **Course Materials / 講義資料**：教材・資料への入口として維持しています。作業開始時点のHTMLリンク23件はすべて保持しています。Homeの自習用教材リンクもこのページの教材案内へ向けました。
3. **Interactive教材**：白と淡い青を基調に、個人サイトと調和する色へ変更しました。冒頭説明の文字サイズ・行間・横幅を整えました。目次と7章のHTML変更は共通CSSを読む1行だけです。本文・数式・KaTeX設定・計算スクリプトは保持しています。既存の暗いcanvas描画はCSSの色変換で明るく表示します。
4. **応用事例集**：カードとページ冒頭の事例別状態表示を取り除きました。日英それぞれの目次に、資料集全体についての案内を1か所置いています。日本語は指定文「この資料集は作成中です。授業やゼミでの扱いに応じて内容を拡充していく予定です。」です。AI・原典未確認・翻訳draftの表示は公開HTMLと配布Markdownから外し、デモの数値・データが説明用の架空データである旨の短い注記を保持しました。計算用JavaScriptは保持しています。
5. **Hermesページの公開終了**：紹介・privacy・termsの3ページと専用コンポーネントを `.migration/round3/hermes-personal-assistant/` に退避しました。公開ルートと出力に含めず、公開ビルド全体のファイル名・HTML・XML・JSON・テキスト・Markdownを検査しています。サイトマップ生成設定はもともとありません。テストでは公開ページとしての期待値を設けず、出力への混入を禁止しています。
6. **英字URL**：日本語スラッグ5件を下表のURLに変更しました。両ビルドで旧URLにmeta refresh・canonical・noindexを出力し、全内部リンク検査で旧URLへのリンクも検出するようにしました。

| 旧URL | 新URL（Cloudflareのルート配信） |
|---|---|
| `/講義資料-course-materials/` | `/course-materials/` |
| `/日本語/` | `/ja/` |
| `/advising-policy-指導を希望する方へ/` | `/advising/` |
| `/ゲーム理論（2025年度前期）/` | `/game-theory-2025/` |
| `/日本語教材の使用について（gbc生向け）/` | `/japanese-materials-policy/` |

GitHub Pagesでは上記の前に `/website-migration-preview` が付きます。

### 見ていただきたい点

- `/teaching/`：年度・学期の並び、簡潔さ、対象が明記された授業の表示。
- `/course-materials/`：教材への入口と既存リンクの並び。
- `/teaching/interactive/` と各章：冒頭説明の読みやすさ、明るい配色、グラフの線・ラベルの見やすさ。特に第3章の3D図と第4章の複数曲線。
- `/teaching/applied-micro/ja/` と `/teaching/applied-micro/en/`：作成中案内の位置、状態表示を外したカード、架空データ注記の大きさ。

ブラウザー確認は接続先が利用できず停止しました。画面の目視確認・ブラウザーでのmeta refresh実行・CDN経由の数式描画は今回の確認範囲に含まれていません。下記の静的検査とローカルHTTP応答を確認済みです。

## 後半：記録

### 作業範囲

- ブランチ：`integrate-teaching-20261109`。開始時は未変更で、作業開始コミットは `b684919`。
- 変更対象：指定の個人サイトリポジトリ内。
- main、Pages設定、Cloudflare配信設定、公開ワークフロー、他リポジトリは維持しました。今回の操作は作業ブランチへのcommit・pushです。
- 元HTMLスナップショット・来歴ハッシュ・`provenance/pages.json` の比較基準は保持しました。
- 元の配布Markdownも `.migration/round3/sources/` に退避しました。`.migration/` と `.local/` はGit・公開出力の対象外です。
- 移行元の出典URLは来歴として保持し、公開ページの内部導線を英字URLに統一しました。

### 検証結果

| 検証 | 結果 |
|---|---|
| `npm test` | PASS：48件、失敗0件 |
| `npm run build:github` | PASS：Astro生成43ページ＋Interactive静的HTML8ページ |
| `npm run build:cloudflare` | PASS：同上 |
| `npm run test:applied` | PASS：21件、失敗0件 |
| `npm run check:links` | PASS：両ビルドとも51 HTML、1,680 href/src参照、エラー0件 |
| `npm run check:redirects` | PASS：5旧URL×2ビルド＝10件。meta refresh・canonical・noindex・転送先を確認 |
| ローカルHTTP検査 | PASS：旧URLと転送先10組の200、Hermes関連3 URL×2配信形態の404 |
| 公開対象除外検査 | PASS：両ビルドにHermesのファイル・ルート・リンクを検出せず。応用事例集の廃止表示も検出せず |
| 保持確認 | PASS：Interactive全8 HTMLはCSS読み込み1行を除いて作業開始時と完全一致。Course MaterialsのHTMLリンク23件を保持 |
| `npm run check:publish` | PASS：136ファイルのファイル名・内容検査 |
| `npm run check:content` | 差分あり：28比較中8件、構造エラー0件。比較基準を保持 |
| ブラウザー確認 | 接続先が利用できず停止。再試行なし |

WXRテストは `WXR_TEST_PYTHON` に指定の作業用Pythonランチャーを渡して実行しました。テストで作成する固定のローカルXMLだけを処理し、DTD/entity宣言の拒否も検査しました。

各テスト・content検査は1回実行しました。成功した両ビルドは、最終CSSで第3章の数値表示・第4章の図の外枠・第6章のボタンのコントラストを補正した後、最終成果物をそろえるため各1回追加生成しました。`git diff --check` が配布Markdownの単独の行末スペース9件を検出し、該当スペースを除去しました。この検査の自動再実行は行っていません。最終ビルドには空白調整済みのMarkdownを含めています。失敗したcontent検査とブラウザー操作も再試行していません。

### check:content 差分一覧

移行時の比較基準との差分です。今回より前の教材統合による差分も含みます。URLの英字化は既存比較基準を `canonicalRoute()` 経由で読むことで比較し、基準ファイルは変更していません。

| ビルド | ページ | 本文差分 | 追加リンク | 削除リンク |
|---|---|---|---:|---:|
| GitHub | Home | あり | 1 | 0 |
| GitHub | Course Materials | あり | 3 | 1 |
| GitHub | Teaching | あり | 1 | 0 |
| GitHub | 日本語 | あり | 2 | 0 |
| Cloudflare | Home | あり | 1 | 0 |
| Cloudflare | Course Materials | あり | 3 | 1 |
| Cloudflare | Teaching | あり | 1 | 0 |
| Cloudflare | 日本語 | あり | 2 | 0 |

リンク差分の内訳は両ビルドで同じです。GitHub側はbaseが付きます。

- Home：自習用教材リンクを `/course-materials/#self-study-materials` に追加。
- Course Materials：応用事例集、Interactive教材、既存のInteractive Visualizationsリンクのローカル教材URLを追加。移行時の比較基準にある外部の `https://sisogai.github.io/teaching/index.html` が削除扱いです。この置換は今回の開始時点ですでに存在し、今回の23リンク保持確認とは比較対象が異なります。
- Teaching：Course Materialsへの案内を追加。
- 日本語：応用事例集とInteractive教材へのリンクを追加。

既存の公開ワークフローでは `check:content` が差分により停止する状態を維持しています。

### 主な実装とログ

- `src/lib/redirects.json`、`src/lib/paths.mjs`、`src/pages/[...slug].astro`：英字URLと旧URL転送。
- `src/lib/casebook-presentation.mjs`、`src/lib/applied.mjs`：元スナップショットを保持した表示変換。
- `public/teaching/interactive/interactive-light.css`：教材の明るい配色と冒頭説明の組版。
- `scripts/check-redirects.mjs`、`tests/round3.test.mjs`：転送・公開除外・授業一覧の回帰検査。
- `.local/round3/*.log`：各実行の標準出力・標準エラー。
- `.local/content-results.json`：content差分の詳細。
- `.local/links-dist-*.json`：全内部リンク検査の詳細。
- `.local/redirect-results.json`：旧URL転送10件。
- `.local/round3/http-results.json`、`preservation-results.json`：HTTP応答と保持確認。

実装コミット `36d2110`（`Implement approved teaching presentation and English routes`）を `origin/integrate-teaching-20261109` へpushし、成功とリモート追跡ブランチとの一致を確認しました。この成功記録は追加の記録用コミットに含め、同じブランチへ送ります。認証情報を出力する操作は行っていません。
