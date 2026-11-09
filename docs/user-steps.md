# 本人が行う操作

GitHub Pagesの試験公開は完了しています。追加のログイン操作は不要です。WordPressを従来どおり利用できます。

試験サイト: <https://sisogai.github.io/website-migration-preview/>

ソース: <https://github.com/sisogai/website-migration-preview>

## Cloudflareにも公開する場合

1. Cloudflareのアカウントを用意し、Workers Freeプランを確認してください。
2. このプロジェクトのターミナルで `npx --no-install wrangler login` を実行し、ブラウザーでログイン・承認してください。
3. 公開先アカウントと専用Worker名を確認し、`npm run deploy:cloudflare` を実行してください。
4. 表示されたURLを開き、Home、Research、講義資料、日本語ページ、404を確認してください。

GitHubとの自動連携を希望する場合は、Cloudflare上でこの新規リポジトリへのアクセスを承認し、[Cloudflare設定](cloudflare.md)のコマンドを登録してください。

## 試作を確認する場合

公開URLから文章・研究業績・教材リンク・画面を確認してください。Google Drive資料は従来のリンク先を利用するため、必要な資料を本人の通常の環境で開き、共有設定が意図どおりであることを確認できます。

WordPress XMLの提出は任意です。後から利用する場合はREADMEの抽出コマンドを使えます。

独自ドメインへの切り替え、WordPressの停止、学生限定機能、AI機能、課金は今回の作業に含めていません。これらを進めるときは別途決定できます。

## 教育コンテンツ統合試作をローカルで確認する

`integrate-teaching-20261109` ブランチで `npm run build:cloudflare`、`npm run preview:cloudflare` を実行し、localhostのTeaching・Course Materials・日本語ページから2種類の教材へ進んでください。公開サイトは従来の状態です。日英切替、難易度切替、デモ操作、スマートフォン表示をご確認ください。配信先の切替は [教育コンテンツ統合](teaching-integration.md) に記載しています。
