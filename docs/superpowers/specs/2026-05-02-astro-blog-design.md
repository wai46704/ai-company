# Astroブログ設計仕様

**作成日:** 2026-05-02  
**ステータス:** 承認済み・稼働中  
**最終更新:** 2026-08-20（実コードとの鮮度チェックを反映：スキーマ・カテゴリ・アイキャッチ・連載機能・独自ドメイン・sitemap・redirects・メルマガCTA・privacyページを現状に合わせて追記）

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
    privacy.astro      ← プライバシーポリシー（後から追加）
    blog/
      index.astro      ← ブログ一覧
      [slug].astro     ← 記事詳細（動的ルート）
  layouts/
    BaseLayout.astro   ← 共通HTML/head/ナビ/フッター
    BlogLayout.astro   ← 記事ページ用（アイキャッチ／連載ナビ／前後記事ナビ）
  components/
    Header.astro       ← ナビゲーションバー
    Footer.astro       ← フッター
    PostCard.astro     ← 記事一覧用カードコンポーネント（カテゴリ配色もここに集約）
    NewsletterCTA.astro ← メルマガ登録の誘導（BlogLayoutに組込・後から追加）
  styles/
    global.css         ← CSS変数・リセット・共通スタイル
public/
  images/hero/         ← 記事アイキャッチ（heroImage の実体）
  images/              ← その他の静的画像
  CNAME                ← 独自ドメイン設定（GitHub Pages）
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
- `heroImage` があれば本文の一番上にアイキャッチ画像を表示
- Markdownを本文としてレンダリング
- 本文下に `NewsletterCTA`（メルマガ登録の誘導）
- `series` があれば「📖 連載〈連載名〉第N回」ラベルと、同じ連載の**全話リストを自動生成**（`episode` 昇順・現在の記事に「▶ この記事」表示。話が増えても手作業不要）
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
  category: string     // カテゴリ（主力は「お金」「セキュリティ」。他に開発・日常・デザイン）
  description: string  // 記事概要（一覧カードに表示）
  emoji: string        // カードバナーに使う絵文字
  heroImage?: string   // アイキャッチ画像のパス（任意）。例 "/images/hero/<slug>.jpg"。実体は public/images/hero/
  series?: string      // 連載名（任意）。例 "AI編集部の成長記録"。設定時のみ連載ラベル＋全話リストを表示
  episode?: number     // 連載の何話目か（任意）。全話リストはこの昇順で並ぶ
}
```

> 実装は `src/content/config.ts`。`heroImage` / `series` / `episode` は運用開始後に追加した任意項目（未設定の既存記事はこれまで通り表示される）。

---

## スタイル設計

### カラーパレット

- **ヒーロー共通グラデーション**は `global.css` の CSS変数 `--gradient-hero` で定義（ヘッダー・各ページの見出し等で使用）。
- **カテゴリ別の配色**は `src/components/PostCard.astro` の `categoryStyles` オブジェクトに集約（当初は global.css の CSS変数だったが、カテゴリ追加のたびに触るのが1か所で済むよう移行）。新カテゴリを追加するときはここに1行足す。未登録カテゴリはグレー系にフォールバック。

```ts
// PostCard.astro の categoryStyles（抜粋）
'お金':        { gradient: '…#f7971e→#ffd200', color: '#f7971e' },
'セキュリティ': { gradient: '…#11998e→#38ef7d', color: '#11998e' },
'開発' / '日常' / 'デザイン': …（初期からの3カテゴリ）
```

```css
/* global.css に残す共通変数 */
--gradient-hero: linear-gradient(135deg, #667eea, #f093fb);  /* ヒーロー共通 */
```

### レスポンシブ
- モバイル（〜640px）: カード1列、ヒーロー縦積み
- タブレット以上（641px〜）: カード2列、ヒーロー左寄せ

---

## デプロイ設定

### `astro.config.mjs`（現状：独自ドメインで運用中）
```js
export default defineConfig({
  output: 'static',
  site: 'https://naoki-blog.com',   // 独自ドメイン（public/CNAME とセット）
  trailingSlash: 'always',          // 全URL末尾スラッシュ必須。内部リンクは /blog/xxx/ で書く
  integrations: [sitemap()],        // @astrojs/sitemap で sitemap を自動生成
  redirects: { … },                 // 統廃合で非公開にした旧記事URL→現行記事へ転送（2026-08時点で約10件）
})
```

- **`base` は未設定**（独自ドメインなのでサブパス不要。開発サーバーも `/` で開く）。当初計画の `github.io` + `base:/<repo>` から移行済み。
- **redirects**：Astroは転送用スタブHTMLに自動で `noindex` を付ける。Search Consoleの「noindexで除外」が転送件数ぶん増えるのは正常。

### GitHub Actions（`.github/workflows/deploy.yml`）
- トリガー: `main` ブランチへのpush
- ステップ: checkout → Node.js セットアップ → `npm run build` → GitHub Pagesにデプロイ

---

## 非対応事項（スコープ外・現在も未実装）

- 検索機能
- コメント機能
- ダークモード
- タグ・カテゴリフィルター
- お問い合わせフォーム（サーバー不要のため）
- 多言語対応（日本語のみ）

## 運用開始後に追加した機能（初期スコープ外だったが実装済み）

- アイキャッチ画像（`heroImage`）
- 連載機能（`series` / `episode` と全話ナビ）
- メルマガ登録CTA（`NewsletterCTA`）
- sitemap 自動生成（`@astrojs/sitemap`）
- 旧記事の301リダイレクト（`redirects`）
- プライバシーポリシーページ（`privacy.astro`）
- カテゴリ「お金」「セキュリティ」の追加
