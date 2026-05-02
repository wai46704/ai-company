# Astroブログ設計仕様

**作成日:** 2026-05-02  
**ステータス:** 承認済み

---

## 概要

Astroを使った個人ブログサイト。ポートフォリオ要素（About）とブログを組み合わせ、カラフル・フレンドリーなデザインで日本語コンテンツを発信する。GitHub Pagesで静的ホスティング。

---

## アーキテクチャ

### 技術スタック
- **フレームワーク:** Astro（静的出力 `output: 'static'`）
- **スタイリング:** カスタムCSS + CSS変数（Tailwind・UIフレームワークなし）
- **コンテンツ管理:** Astro Content Collections + Markdownファイル
- **デプロイ:** GitHub Pages（GitHub Actionsで自動デプロイ）

### プロジェクト構成

```
src/
  content/
    config.ts          ← Content Collectionsのスキーマ定義
    blog/
      *.md             ← 記事ファイル（frontmatter付きMarkdown）
  pages/
    index.astro        ← ホームページ
    about.astro        ← Aboutページ
    contact.astro      ← Contactページ
    blog/
      index.astro      ← ブログ一覧
      [slug].astro     ← 記事詳細（動的ルート）
  layouts/
    BaseLayout.astro   ← 共通HTML/head/ナビ/フッター
    BlogLayout.astro   ← 記事ページ用（前後記事ナビ付き）
  components/
    Header.astro       ← ナビゲーションバー
    Footer.astro       ← フッター
    PostCard.astro     ← 記事一覧用カードコンポーネント
  styles/
    global.css         ← CSS変数・リセット・共通スタイル
public/
  images/              ← 静的画像ファイル
  favicon.svg
astro.config.mjs
```

### データフロー

1. `src/content/blog/*.md` に記事を追加
2. `getCollection('blog')` でfrontmatterと本文を型安全に取得
3. ビルド時に全ページを静的HTMLとして出力
4. GitHub Actionsがビルド→GitHub Pagesに配信

---

## ページ仕様

### ホーム（`/`）
- **ヒーローセクション（左寄せ型）:** サイトタイトル・自己紹介文・CTAボタン、右側にアイコン
- **最新記事セクション:** `PostCard` コンポーネントを2列グリッドで最新4件表示

### About（`/about`）
- プロフィール文・スキル・経歴などを縦に並べる1カラムレイアウト

### ブログ一覧（`/blog`）
- `PostCard` を2列グリッドで全記事表示
- カードは絵文字バナー・カテゴリバッジ・タイトル・日付で構成

### 記事詳細（`/blog/[slug]`）
- `BlogLayout` を使用
- Markdownを本文としてレンダリング
- ページ下部に前後記事へのナビゲーション

### Contact（`/contact`）
- SNSリンク（GitHub・Twitter等）＋メールリンクをカード形式で表示
- フォームなし（静的サイトのため）

---

## コンテンツスキーマ

記事frontmatterの定義（`src/content/config.ts`）：

```ts
{
  title: string        // 記事タイトル
  pubDate: Date        // 公開日
  category: string     // カテゴリ（例: 開発・日常・デザイン）
  description: string  // 記事概要（一覧カードに表示）
  emoji: string        // カードバナーに使う絵文字
}
```

---

## スタイル設計

### カラーパレット（CSS変数）

カテゴリごとにグラデーションを定義し、カード・カテゴリバッジに自動適用：

```css
--gradient-dev:    linear-gradient(135deg, #667eea, #764ba2);  /* 開発 */
--gradient-daily:  linear-gradient(135deg, #f093fb, #f5576c);  /* 日常 */
--gradient-design: linear-gradient(135deg, #4facfe, #00f2fe);  /* デザイン */
--gradient-hero:   linear-gradient(135deg, #667eea, #f093fb);  /* ヒーロー共通 */
```

### レスポンシブ
- モバイル（〜640px）: カード1列、ヒーロー縦積み
- タブレット以上（641px〜）: カード2列、ヒーロー左寄せ

---

## デプロイ設定

### `astro.config.mjs`
```js
export default defineConfig({
  output: 'static',
  site: 'https://<username>.github.io',
  base: '/<repo-name>',  // リポジトリ名に応じて設定
})
```

### GitHub Actions（`.github/workflows/deploy.yml`）
- トリガー: `main` ブランチへのpush
- ステップ: checkout → Node.js セットアップ → `npm run build` → GitHub Pagesにデプロイ

---

## 非対応事項（スコープ外）

- 検索機能
- コメント機能
- ダークモード
- タグ・カテゴリフィルター
- お問い合わせフォーム（サーバー不要のため）
- 多言語対応（日本語のみ）
