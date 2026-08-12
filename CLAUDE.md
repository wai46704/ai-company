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
- **カテゴリカラー:** `src/components/PostCard.astro` 内の `categoryStyles` オブジェクトで定義。新カテゴリ追加時はここに追記する（未登録のカテゴリを使うとカードが既定のグレー系になる）
- **デプロイ:** `main` ブランチへの push で GitHub Actions が自動ビルド → GitHub Pages に配信

## 記事追加方法

`src/content/blog/<slug>.md` を作成し、以下の frontmatter を付与：

```yaml
---
title: "記事タイトル"
pubDate: 2026-01-01
category: "お金"   # 下の一覧から選ぶ
description: "記事の概要（一覧カードに表示）"
emoji: "💰"        # カードバナーの絵文字
heroImage: "/images/hero/<slug>.jpg"   # アイキャッチ画像（任意）
---
```

### カテゴリ一覧

`src/components/PostCard.astro` の `categoryStyles` に登録済みのもの。

| カテゴリ | 用途 | 記事数（2026-08-13時点） |
|---|---|---|
| **お金** | 家計・投資・保険・年金・税金 | 18本 |
| **セキュリティ** | 詐欺対策・PC/スマホの防御 | 3本 |
| **開発** | AI編集部の運営記録など | 2本 |
| 日常 | （現在は未使用） | 0本 |
| デザイン | （現在は未使用） | 0本 |

### 任意の frontmatter

- `heroImage`: アイキャッチ画像のパス。**画像本体は `public/images/hero/` に置く。**
  記事は `src/`、画像は `public/` と離れているため、**画像の追加漏れ（未追跡のまま）が起きやすい。公開前に `git status` で `public/` を必ず確認する**
- `series` / `episode`: 連載記事に付ける（例: `series: "AI編集部の成長記録"` ＋ `episode: 2`）

## デプロイ設定

`astro.config.mjs` の `site`（GitHubユーザー名）と `base`（リポジトリ名）を実際の値に設定すること。

## やってほしいこと

- 新機能の追加や構造変更など、ある程度大きな変更をする前は必ずPlan Modeで計画を提示すること（記事のタイトル修正や誤字修正など軽微な変更は対象外）
- 全コードに日本語コメントを入れる（初心者でも読める命名）
- コミットメッセージは「(対象)変更内容」の形式
- ブログ記事を新規公開する前（`src/content/blog/` へ配置してpushする前）は、必ずSEO担当リク（riku-seo）に公開前チェック（title・description文字数、内部リンク、重複、URL表記）を依頼すること。「要修正」であれば反映してから公開する（詳細は `.claude/commands/asakai.md`）
