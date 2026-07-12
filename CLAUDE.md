# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## よく使うコマンド

```bash
npm run dev      # 開発サーバー起動（http://localhost:4321/ai-company/）
npm run build    # 静的サイトをビルド → dist/ に出力
npm run preview  # ビルド結果をローカルでプレビュー
```

## アーキテクチャ概要

Astro製の個人ブログサイト。GitHub Pagesに静的ホスティング。

- **コンテンツ管理:** `src/content/blog/*.md` に frontmatter 付き Markdown を追加するだけで記事公開
- **スタイリング:** `src/styles/global.css` の CSS 変数でカラーパレットを一元管理
- **カテゴリカラー:** `src/components/PostCard.astro` 内の `categoryStyles` オブジェクトで定義（開発・日常・デザイン）。新カテゴリ追加時はここに追記する
- **デプロイ:** `main` ブランチへの push で GitHub Actions が自動ビルド → GitHub Pages に配信

## 記事追加方法

`src/content/blog/<slug>.md` を作成し、以下の frontmatter を付与：

```yaml
---
title: "記事タイトル"
pubDate: 2026-01-01
category: "開発"   # 開発 / 日常 / デザイン
description: "記事の概要（一覧カードに表示）"
emoji: "💻"        # カードバナーの絵文字
---
```

## デプロイ設定

`astro.config.mjs` の `site`（GitHubユーザー名）と `base`（リポジトリ名）を実際の値に設定すること。

## やってほしいこと

- 新機能の追加や構造変更など、ある程度大きな変更をする前は必ずPlan Modeで計画を提示すること（記事のタイトル修正や誤字修正など軽微な変更は対象外）
- 全コードに日本語コメントを入れる（初心者でも読める命名）
- コミットメッセージは「(対象)変更内容」の形式
- ブログ記事を新規公開する前（`src/content/blog/` へ配置してpushする前）は、必ずSEO担当リク（riku-seo）に公開前チェック（title・description文字数、内部リンク、重複、URL表記）を依頼すること。「要修正」であれば反映してから公開する（詳細は `.claude/commands/asakai.md`）
