# Astroブログ実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Astroで個人ブログサイト（ホーム・About・ブログ・Contact）を構築し、GitHub Pagesにデプロイできる状態にする

**Architecture:** Astro Content CollectionsでMarkdown記事を型安全に管理し、ビルド時に静的HTMLを出力。カスタムCSS変数でカテゴリ別グラデーションを実現。GitHub Actionsで `main` push時に自動デプロイ。

**Tech Stack:** Astro v4+, TypeScript, カスタムCSS, GitHub Actions

---

## ファイル構成

```
src/
  content/
    config.ts              ← Content Collectionsスキーマ（zod）
    blog/
      hello-astro.md       ← サンプル記事1
      books-2024.md        ← サンプル記事2
      color-theory.md      ← サンプル記事3
  pages/
    index.astro            ← ホーム（ヒーロー左寄せ + 最新4件グリッド）
    about.astro            ← About（プロフィール・スキル・リンク）
    contact.astro          ← Contact（SNSリンクカード）
    blog/
      index.astro          ← ブログ一覧（カード2列グリッド）
      [slug].astro         ← 記事詳細（動的ルート・前後ナビ付き）
  layouts/
    BaseLayout.astro       ← 共通HTML/head/ナビ/フッター
    BlogLayout.astro       ← 記事ページ用（前後記事ナビ付き）
  components/
    Header.astro           ← ナビゲーションバー（スティッキー）
    Footer.astro           ← フッター
    PostCard.astro         ← 記事カード（カテゴリ別グラデーション）
  styles/
    global.css             ← CSS変数・リセット・共通スタイル
public/
  favicon.svg
.github/
  workflows/
    deploy.yml             ← GitHub Pages自動デプロイ
astro.config.mjs
```

---

## Task 1: Astroプロジェクト初期化

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`

- [ ] **Step 1: `ai-company` ディレクトリでAstroを初期化する**

```bash
cd /c/Users/naoki/Documents/ai-company
npm create astro@latest . -- --template minimal --skip-houston --no-git
```

プロンプトが表示された場合の選択:
- TypeScript: Yes (strict)
- Install dependencies: Yes

- [ ] **Step 2: `astro.config.mjs` を更新する**

```js
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  site: 'https://<your-github-username>.github.io',
  base: '/ai-company',
});
```

※ `<your-github-username>` はGitHubのユーザー名、`/ai-company` はリポジトリ名に合わせて変更すること。

- [ ] **Step 3: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: `dist/` ディレクトリが生成され、エラーなし

- [ ] **Step 4: コミット**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore src/
git commit -m "feat: Astroプロジェクト初期化"
```

---

## Task 2: グローバルCSS設定

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: `src/styles/global.css` を作成する**

```css
/* ===== CSS変数 ===== */
:root {
  /* カテゴリグラデーション */
  --gradient-dev:    linear-gradient(135deg, #667eea, #764ba2);
  --gradient-daily:  linear-gradient(135deg, #f093fb, #f5576c);
  --gradient-design: linear-gradient(135deg, #4facfe, #00f2fe);
  --gradient-hero:   linear-gradient(135deg, #667eea, #f093fb);

  /* カテゴリカラー（バッジ用） */
  --color-dev:    #667eea;
  --color-daily:  #f093fb;
  --color-design: #4facfe;

  /* テキスト */
  --text-primary:   #1a1a1a;
  --text-secondary: #555555;
  --text-muted:     #888888;

  /* 背景・ボーダー */
  --bg-page:      #fafafa;
  --bg-card:      #ffffff;
  --border-color: #eeeeee;

  /* コンポーネント */
  --radius-card: 12px;
  --shadow-card: 0 2px 12px rgba(0, 0, 0, 0.08);
  --max-width:   800px;
}

/* ===== リセット ===== */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  font-family: -apple-system, BlinkMacSystemFont, 'Hiragino Sans', 'Noto Sans JP', sans-serif;
  font-size: 16px;
  line-height: 1.7;
  color: var(--text-primary);
  background: var(--bg-page);
}

a {
  color: inherit;
  text-decoration: none;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

/* ===== ユーティリティ ===== */
.container {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 20px;
}
```

- [ ] **Step 2: コミット**

```bash
git add src/styles/global.css
git commit -m "feat: グローバルCSS変数・リセットを追加"
```

---

## Task 3: Content Collectionsスキーマ定義

**Files:**
- Create: `src/content/config.ts`

- [ ] **Step 1: `src/content/config.ts` を作成する**

```ts
import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    category: z.string(),
    description: z.string(),
    emoji: z.string(),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/content/config.ts
git commit -m "feat: Content Collectionsスキーマを定義"
```

---

## Task 4: サンプル記事を追加

**Files:**
- Create: `src/content/blog/hello-astro.md`
- Create: `src/content/blog/books-2024.md`
- Create: `src/content/blog/color-theory.md`

- [ ] **Step 1: `src/content/blog/hello-astro.md` を作成する**

```markdown
---
title: "Astroでブログを作った話"
pubDate: 2026-04-01
category: "開発"
description: "静的サイトジェネレーターAstroを使ってブログを構築した記録です。"
emoji: "💻"
---

## Astroとは

AstroはコンテンツファーストなWebフレームワークです。デフォルトでJavaScriptをほぼゼロに抑え、高速な静的サイトを生成できます。

## なぜAstroを選んだか

- **速い**: デフォルトでJSゼロ出力
- **使いやすい**: Markdownで記事を書けばOK
- **柔軟**: ReactやVueも混在できる

## まとめ

ブログ用途であればAstroは最高の選択肢のひとつです。
```

- [ ] **Step 2: `src/content/blog/books-2024.md` を作成する**

```markdown
---
title: "最近読んでよかった本3冊"
pubDate: 2026-03-15
category: "日常"
description: "今年読んだ中で特に印象に残った3冊を紹介します。"
emoji: "📚"
---

## 今年印象に残った3冊

### 1. ゼロ秒思考

メモ書きの習慣で頭を整理する方法を学びました。

### 2. 深い仕事

集中力の重要性と、ディープワークを実践する方法が書かれています。

### 3. ハック思考

常識を疑い、問題を根本から解決するアプローチを学べます。

## まとめ

読書は最高のインプット手段だと再確認しました。
```

- [ ] **Step 3: `src/content/blog/color-theory.md` を作成する**

```markdown
---
title: "配色を学んでわかったこと"
pubDate: 2026-03-01
category: "デザイン"
description: "色の基礎から実践的な配色テクニックまで学んだメモ。"
emoji: "🎨"
---

## 配色の基本

デザインで最も難しいのは配色だと感じています。

### 色相・彩度・明度

色を理解するには3つの要素を知ることが重要です。

### グラデーションの使い方

単色よりグラデーションを使うと、モダンで豊かな印象になります。

## 実践での気づき

- 2〜3色に絞ると統一感が出る
- アクセントカラーは1色だけにする
- 背景は彩度を抑える

## まとめ

配色は理論を知ってから感覚を磨くのが近道です。
```

- [ ] **Step 4: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 5: コミット**

```bash
git add src/content/blog/
git commit -m "feat: サンプル記事3件を追加"
```

---

## Task 5: Headerコンポーネント

**Files:**
- Create: `src/components/Header.astro`

- [ ] **Step 1: `src/components/Header.astro` を作成する**

```astro
---
const base = import.meta.env.BASE_URL;

const navLinks = [
  { href: '/about',   label: 'About' },
  { href: '/blog',    label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];
---

<header class="site-header">
  <div class="container header-inner">
    <a href={base} class="site-title">Naoki</a>
    <nav class="site-nav">
      {navLinks.map(link => (
        <a href={`${base}${link.href}`} class="nav-link">{link.label}</a>
      ))}
    </nav>
  </div>
</header>

<style>
  .site-header {
    background: var(--bg-card);
    border-bottom: 1px solid var(--border-color);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 56px;
  }

  .site-title {
    font-size: 1.2rem;
    font-weight: 800;
    background: var(--gradient-hero);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .site-nav {
    display: flex;
    gap: 24px;
  }

  .nav-link {
    color: var(--text-secondary);
    font-size: 0.9rem;
    transition: color 0.2s;
  }

  .nav-link:hover {
    color: var(--text-primary);
  }
</style>
```

- [ ] **Step 2: コミット**

```bash
git add src/components/Header.astro
git commit -m "feat: Headerコンポーネントを追加"
```

---

## Task 6: Footerコンポーネント

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: `src/components/Footer.astro` を作成する**

```astro
---
const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="container footer-inner">
    <p class="footer-copy">© {year} Naoki. All rights reserved.</p>
    <div class="footer-links">
      <a href="https://github.com/" target="_blank" rel="noopener">GitHub</a>
      <a href="https://twitter.com/" target="_blank" rel="noopener">Twitter</a>
    </div>
  </div>
</footer>

<style>
  .site-footer {
    border-top: 1px solid var(--border-color);
    margin-top: 80px;
    padding: 32px 0;
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
  }

  .footer-copy {
    color: var(--text-muted);
    font-size: 0.85rem;
  }

  .footer-links {
    display: flex;
    gap: 20px;
  }

  .footer-links a {
    color: var(--text-muted);
    font-size: 0.85rem;
    transition: color 0.2s;
  }

  .footer-links a:hover {
    color: var(--text-primary);
  }
</style>
```

- [ ] **Step 2: コミット**

```bash
git add src/components/Footer.astro
git commit -m "feat: Footerコンポーネントを追加"
```

---

## Task 7: BaseLayoutコンポーネント

**Files:**
- Create: `src/layouts/BaseLayout.astro`

- [ ] **Step 1: `src/layouts/BaseLayout.astro` を作成する**

```astro
---
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';

interface Props {
  title: string;
  description?: string;
}

const { title, description = 'Naokiのブログ' } = Astro.props;
---

<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title} | Naoki's Blog</title>
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  </head>
  <body>
    <Header />
    <main class="site-main">
      <div class="container">
        <slot />
      </div>
    </main>
    <Footer />
  </body>
</html>

<style>
  .site-main {
    padding: 48px 0 80px;
    min-height: calc(100vh - 56px);
  }
</style>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/layouts/BaseLayout.astro
git commit -m "feat: BaseLayoutを追加"
```

---

## Task 8: PostCardコンポーネント

**Files:**
- Create: `src/components/PostCard.astro`

- [ ] **Step 1: `src/components/PostCard.astro` を作成する**

カテゴリ名からグラデーションとカラーを返す `categoryStyles` マップを内部に定義する。

```astro
---
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
}

const { post } = Astro.props;
const { title, pubDate, category, description, emoji } = post.data;
const base = import.meta.env.BASE_URL;

const categoryStyles: Record<string, { gradient: string; color: string }> = {
  '開発':    { gradient: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#667eea' },
  '日常':    { gradient: 'linear-gradient(135deg, #f093fb, #f5576c)', color: '#f093fb' },
  'デザイン': { gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)', color: '#4facfe' },
};

const style = categoryStyles[category] ?? {
  gradient: 'linear-gradient(135deg, #a8edea, #fed6e3)',
  color: '#a8edea',
};

const formattedDate = pubDate.toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
---

<a href={`${base}/blog/${post.slug}`} class="post-card">
  <div class="card-banner" style={`background: ${style.gradient}`}>
    <span class="card-emoji">{emoji}</span>
  </div>
  <div class="card-body">
    <span class="card-category" style={`color: ${style.color}; background: ${style.color}20`}>
      {category}
    </span>
    <h3 class="card-title">{title}</h3>
    <p class="card-description">{description}</p>
    <time class="card-date" datetime={pubDate.toISOString()}>{formattedDate}</time>
  </div>
</a>

<style>
  .post-card {
    display: flex;
    flex-direction: column;
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .post-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }

  .card-banner {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .card-emoji {
    font-size: 2rem;
  }

  .card-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }

  .card-category {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 2px 10px;
    border-radius: 20px;
    align-self: flex-start;
  }

  .card-title {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    line-height: 1.4;
  }

  .card-description {
    font-size: 0.85rem;
    color: var(--text-secondary);
    line-height: 1.6;
    flex: 1;
  }

  .card-date {
    font-size: 0.8rem;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/components/PostCard.astro
git commit -m "feat: PostCardコンポーネントを追加（カテゴリ別グラデーション）"
```

---

## Task 9: BlogLayoutコンポーネント

**Files:**
- Create: `src/layouts/BlogLayout.astro`

- [ ] **Step 1: `src/layouts/BlogLayout.astro` を作成する**

```astro
---
import BaseLayout from './BaseLayout.astro';
import type { CollectionEntry } from 'astro:content';

interface Props {
  post: CollectionEntry<'blog'>;
  prevPost?: CollectionEntry<'blog'> | null;
  nextPost?: CollectionEntry<'blog'> | null;
}

const { post, prevPost, nextPost } = Astro.props;
const { title, pubDate, category, description } = post.data;
const base = import.meta.env.BASE_URL;

const formattedDate = pubDate.toLocaleDateString('ja-JP', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
});
---

<BaseLayout title={title} description={description}>
  <article class="blog-post">
    <header class="post-header">
      <div class="post-meta">
        <span class="post-category">{category}</span>
        <time datetime={pubDate.toISOString()}>{formattedDate}</time>
      </div>
      <h1 class="post-title">{title}</h1>
    </header>
    <div class="post-content">
      <slot />
    </div>
  </article>

  <nav class="post-nav">
    {prevPost ? (
      <a href={`${base}/blog/${prevPost.slug}`} class="post-nav-link prev">
        <span class="post-nav-label">← 前の記事</span>
        <span class="post-nav-title">{prevPost.data.title}</span>
      </a>
    ) : <div />}
    {nextPost && (
      <a href={`${base}/blog/${nextPost.slug}`} class="post-nav-link next">
        <span class="post-nav-label">次の記事 →</span>
        <span class="post-nav-title">{nextPost.data.title}</span>
      </a>
    )}
  </nav>
</BaseLayout>

<style>
  .blog-post {
    max-width: 680px;
    margin: 0 auto;
  }

  .post-header {
    margin-bottom: 40px;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
    font-size: 0.85rem;
    color: var(--text-muted);
  }

  .post-category {
    background: var(--gradient-hero);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 700;
  }

  .post-title {
    font-size: 2rem;
    font-weight: 800;
    line-height: 1.3;
    color: var(--text-primary);
  }

  .post-content {
    font-size: 1rem;
    line-height: 1.9;
    color: var(--text-secondary);
  }

  .post-content h2 {
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 40px 0 16px;
  }

  .post-content h3 {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
    margin: 28px 0 12px;
  }

  .post-content p {
    margin-bottom: 20px;
  }

  .post-content ul,
  .post-content ol {
    margin: 0 0 20px 24px;
  }

  .post-content li {
    margin-bottom: 8px;
  }

  .post-content code {
    font-family: 'SFMono-Regular', Consolas, monospace;
    background: #f0f0f0;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.9em;
  }

  .post-content pre {
    background: #1a1a2e;
    color: #e0e0e0;
    padding: 20px;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 20px;
  }

  .post-content pre code {
    background: none;
    padding: 0;
    color: inherit;
  }

  .post-nav {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 64px;
    padding-top: 32px;
    border-top: 1px solid var(--border-color);
    max-width: 680px;
    margin-left: auto;
    margin-right: auto;
  }

  .post-nav-link {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    transition: transform 0.2s;
  }

  .post-nav-link:hover {
    transform: translateY(-2px);
  }

  .post-nav-link.next {
    text-align: right;
  }

  .post-nav-label {
    font-size: 0.8rem;
    color: var(--text-muted);
  }

  .post-nav-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--text-primary);
    line-height: 1.4;
  }
</style>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: エラーなし

- [ ] **Step 3: コミット**

```bash
git add src/layouts/BlogLayout.astro
git commit -m "feat: BlogLayoutを追加（前後記事ナビ付き）"
```

---

## Task 10: ホームページ

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: `src/pages/index.astro` を以下の内容に置き換える**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import PostCard from '../components/PostCard.astro';

const allPosts = await getCollection('blog');
const latestPosts = allPosts
  .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
  .slice(0, 4);

const base = import.meta.env.BASE_URL;
---

<BaseLayout title="ホーム">
  <section class="hero">
    <div class="hero-text">
      <p class="hero-label">BLOG & PORTFOLIO</p>
      <h1 class="hero-title">Naokiの<br />ブログへようこそ</h1>
      <p class="hero-description">開発・デザイン・日常について書いています。</p>
      <a href={`${base}/blog`} class="hero-cta">記事を読む →</a>
    </div>
    <div class="hero-icon">✍️</div>
  </section>

  <section class="recent-posts">
    <h2 class="section-title">最新記事</h2>
    <div class="posts-grid">
      {latestPosts.map(post => <PostCard post={post} />)}
    </div>
    <div class="more-link-wrapper">
      <a href={`${base}/blog`} class="more-link">すべての記事を見る →</a>
    </div>
  </section>
</BaseLayout>

<style>
  .hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
    background: linear-gradient(135deg, #667eea0d, #f093fb0d);
    border-radius: 16px;
    padding: 40px;
    margin-bottom: 56px;
  }

  .hero-text {
    flex: 1;
  }

  .hero-label {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 2px;
    color: #667eea;
    margin-bottom: 12px;
  }

  .hero-title {
    font-size: 2.2rem;
    font-weight: 800;
    line-height: 1.3;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .hero-description {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 24px;
  }

  .hero-cta {
    display: inline-block;
    background: var(--gradient-hero);
    color: white;
    padding: 10px 24px;
    border-radius: 24px;
    font-size: 0.9rem;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  .hero-cta:hover {
    opacity: 0.85;
  }

  .hero-icon {
    font-size: 4rem;
    flex-shrink: 0;
  }

  .section-title {
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 20px;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .more-link-wrapper {
    margin-top: 24px;
    text-align: center;
  }

  .more-link {
    color: #667eea;
    font-size: 0.9rem;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  .more-link:hover {
    opacity: 0.7;
  }

  @media (max-width: 640px) {
    .hero {
      flex-direction: column;
      padding: 28px;
    }

    .hero-title {
      font-size: 1.7rem;
    }

    .hero-icon {
      font-size: 3rem;
    }

    .posts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: devサーバーで確認する**

```bash
npm run dev
```

`http://localhost:4321/ai-company/` を開き、ヒーローセクション（左寄せ）と最新記事4件（2列グリッド）が表示されることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/pages/index.astro
git commit -m "feat: ホームページを実装"
```

---

## Task 11: ブログ一覧ページ

**Files:**
- Create: `src/pages/blog/index.astro`

- [ ] **Step 1: `src/pages/blog/index.astro` を作成する**

```astro
---
import { getCollection } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import PostCard from '../../components/PostCard.astro';

const allPosts = await getCollection('blog');
const posts = allPosts.sort(
  (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
);
---

<BaseLayout title="ブログ" description="Naokiのブログ記事一覧">
  <h1 class="page-title">Blog</h1>
  <p class="page-description">開発・デザイン・日常のことを書いています</p>

  <div class="posts-grid">
    {posts.map(post => <PostCard post={post} />)}
  </div>
</BaseLayout>

<style>
  .page-title {
    font-size: 2rem;
    font-weight: 800;
    background: var(--gradient-hero);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .page-description {
    color: var(--text-secondary);
    margin-bottom: 40px;
    font-size: 1rem;
  }

  .posts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 640px) {
    .posts-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

- [ ] **Step 2: devサーバーで確認する**

```bash
npm run dev
```

`http://localhost:4321/ai-company/blog` を開き、記事カードが2列グリッドで表示されることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/pages/blog/index.astro
git commit -m "feat: ブログ一覧ページを実装"
```

---

## Task 12: 記事詳細ページ

**Files:**
- Create: `src/pages/blog/[slug].astro`

- [ ] **Step 1: `src/pages/blog/[slug].astro` を作成する**

```astro
---
import { getCollection } from 'astro:content';
import BlogLayout from '../../layouts/BlogLayout.astro';

export async function getStaticPaths() {
  const posts = await getCollection('blog');
  const sorted = posts.sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  return sorted.map((post, index) => ({
    params: { slug: post.slug },
    props: {
      post,
      prevPost: sorted[index + 1] ?? null,  // 古い記事 = 前の記事
      nextPost: sorted[index - 1] ?? null,  // 新しい記事 = 次の記事
    },
  }));
}

const { post, prevPost, nextPost } = Astro.props;
const { Content } = await post.render();
---

<BlogLayout post={post} prevPost={prevPost} nextPost={nextPost}>
  <Content />
</BlogLayout>
```

- [ ] **Step 2: ビルドが通ることを確認する**

```bash
npm run build
```

Expected: `dist/ai-company/blog/hello-astro/index.html` などの記事HTMLが生成される

- [ ] **Step 3: devサーバーで記事ページを確認する**

```bash
npm run dev
```

`http://localhost:4321/ai-company/blog/hello-astro` を開き、記事本文が表示され、ページ下部に前後記事ナビが表示されることを確認。

- [ ] **Step 4: コミット**

```bash
git add src/pages/blog/
git commit -m "feat: 記事詳細ページを実装（前後記事ナビ付き）"
```

---

## Task 13: Aboutページ

**Files:**
- Create: `src/pages/about.astro`

- [ ] **Step 1: `src/pages/about.astro` を作成する**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout title="About" description="Naokiのプロフィールページ">
  <h1 class="page-title">About</h1>

  <section class="about-section">
    <div class="profile-header">
      <div class="avatar">N</div>
      <div>
        <h2 class="profile-name">Naoki</h2>
        <p class="profile-tagline">開発・デザイン・日常をつづるブログ</p>
      </div>
    </div>
    <p class="profile-bio">
      はじめまして。Naokiです。Web開発やデザインに興味があり、日常の気づきや学んだことをこのブログに書いています。
      新しいことを学ぶのが好きで、読書・コーディング・デザインが趣味です。
    </p>
  </section>

  <section class="about-section">
    <h2 class="section-heading">スキル</h2>
    <ul class="skill-list">
      <li class="skill-item">HTML / CSS</li>
      <li class="skill-item">JavaScript / TypeScript</li>
      <li class="skill-item">Astro / React</li>
      <li class="skill-item">デザイン（Figma）</li>
    </ul>
  </section>

  <section class="about-section">
    <h2 class="section-heading">リンク</h2>
    <div class="link-list">
      <a href="https://github.com/" target="_blank" rel="noopener" class="external-link">GitHub →</a>
      <a href="https://twitter.com/" target="_blank" rel="noopener" class="external-link">Twitter →</a>
    </div>
  </section>
</BaseLayout>

<style>
  .page-title {
    font-size: 2rem;
    font-weight: 800;
    background: var(--gradient-hero);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 40px;
  }

  .about-section {
    margin-bottom: 48px;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
  }

  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: var(--gradient-hero);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    font-weight: 800;
    flex-shrink: 0;
  }

  .profile-name {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .profile-tagline {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .profile-bio {
    color: var(--text-secondary);
    line-height: 1.9;
  }

  .section-heading {
    font-size: 1.15rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #667eea;
  }

  .skill-list {
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .skill-item {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 6px 16px;
    font-size: 0.9rem;
    color: var(--text-secondary);
    box-shadow: var(--shadow-card);
  }

  .link-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .external-link {
    color: #667eea;
    font-size: 0.95rem;
    font-weight: 600;
    transition: opacity 0.2s;
  }

  .external-link:hover {
    opacity: 0.7;
  }
</style>
```

- [ ] **Step 2: devサーバーで確認する**

```bash
npm run dev
```

`http://localhost:4321/ai-company/about` を開き、プロフィール・スキル・リンクが表示されることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/pages/about.astro
git commit -m "feat: Aboutページを実装"
```

---

## Task 14: Contactページ

**Files:**
- Create: `src/pages/contact.astro`

- [ ] **Step 1: `src/pages/contact.astro` を作成する**

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';

const contacts = [
  {
    label: 'GitHub',
    href: 'https://github.com/',
    emoji: '🐙',
    description: 'コードはこちら',
  },
  {
    label: 'Twitter / X',
    href: 'https://twitter.com/',
    emoji: '🐦',
    description: '日常のつぶやき',
  },
  {
    label: 'Email',
    href: 'mailto:your@email.com',
    emoji: '✉️',
    description: 'お仕事のご相談など',
  },
];
---

<BaseLayout title="Contact" description="Naokiへのお問い合わせ">
  <h1 class="page-title">Contact</h1>
  <p class="page-description">お気軽にご連絡ください。</p>

  <div class="contact-grid">
    {contacts.map(contact => (
      <a href={contact.href} target="_blank" rel="noopener" class="contact-card">
        <span class="contact-emoji">{contact.emoji}</span>
        <div>
          <h3 class="contact-label">{contact.label}</h3>
          <p class="contact-description">{contact.description}</p>
        </div>
      </a>
    ))}
  </div>
</BaseLayout>

<style>
  .page-title {
    font-size: 2rem;
    font-weight: 800;
    background: var(--gradient-hero);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin-bottom: 8px;
  }

  .page-description {
    color: var(--text-secondary);
    margin-bottom: 40px;
  }

  .contact-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 480px;
  }

  .contact-card {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 24px;
    background: var(--bg-card);
    border-radius: var(--radius-card);
    box-shadow: var(--shadow-card);
    transition: transform 0.2s;
  }

  .contact-card:hover {
    transform: translateX(6px);
  }

  .contact-emoji {
    font-size: 1.8rem;
    flex-shrink: 0;
  }

  .contact-label {
    font-size: 1rem;
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  .contact-description {
    font-size: 0.85rem;
    color: var(--text-muted);
  }
</style>
```

- [ ] **Step 2: devサーバーで確認する**

```bash
npm run dev
```

`http://localhost:4321/ai-company/contact` を開き、SNSリンク3件がカードで表示されることを確認。

- [ ] **Step 3: コミット**

```bash
git add src/pages/contact.astro
git commit -m "feat: Contactページを実装"
```

---

## Task 15: ファビコン追加

**Files:**
- Create: `public/favicon.svg`

- [ ] **Step 1: `public/favicon.svg` を作成する**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea"/>
      <stop offset="100%" style="stop-color:#f093fb"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="50" fill="url(#g)"/>
  <text x="50" y="68" text-anchor="middle" font-size="52"
        font-family="sans-serif" font-weight="bold" fill="white">N</text>
</svg>
```

- [ ] **Step 2: コミット**

```bash
git add public/favicon.svg
git commit -m "feat: SVGファビコンを追加"
```

---

## Task 16: GitHub Actionsデプロイ設定

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: `.github/workflows/` ディレクトリを作成して `deploy.yml` を追加する**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v4
        id: deployment
```

- [ ] **Step 2: `.gitignore` に `dist/` と `.superpowers/` が含まれていることを確認する**

```bash
cat .gitignore
```

含まれていなければ末尾に追記する：

```
dist/
.superpowers/
node_modules/
```

- [ ] **Step 3: 最終ビルドを確認する**

```bash
npm run build
```

Expected: `dist/` に全ページのHTMLが生成される（`dist/ai-company/index.html`, `dist/ai-company/blog/`, etc.）

- [ ] **Step 4: コミット**

```bash
git add .github/ .gitignore
git commit -m "feat: GitHub Actionsデプロイ設定を追加"
```

---

## Task 17: CLAUDE.md を更新

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: `CLAUDE.md` を以下の内容に置き換える**

```markdown
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
```

- [ ] **Step 2: コミット**

```bash
git add CLAUDE.md
git commit -m "docs: CLAUDE.mdにプロジェクト情報を追記"
```
