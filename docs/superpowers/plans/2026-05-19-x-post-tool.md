# X アフィリエイト投稿ツール 実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** ブログ記事URLまたはキーワードからX投稿文をAI生成し、アフィリエイトリンクを管理・予約投稿できる個人用管理ツールを構築する

**Architecture:** Next.js App Router (edge runtime) + Cloudflare Workers でAPI/UIをホスト。Cloudflare D1 でデータ永続化。Cloudflare Access で認証（自分のメールのみ許可）。Claude Opus でX投稿文生成。フェーズ1はコピペ投稿、フェーズ2でX API自動投稿に拡張可能な設計。

**Tech Stack:** Next.js 14, TypeScript, Cloudflare Workers (via `@cloudflare/next-on-pages`), Cloudflare D1, Cloudflare Access, Anthropic SDK (claude-opus-4-5), Tailwind CSS, Vitest

**作業ディレクトリ:** `C:\Users\naoki\Documents\x-post-tool\`（ai-companyとは別の新規プロジェクト）

**事前確認が必要なもの:**
- Anthropic API キー（https://console.anthropic.com）
- Cloudflare アカウント（既存のものを使用）

---

## ファイル構成

```
x-post-tool/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # ルートレイアウト（ナビ付き）
│   │   ├── page.tsx                 # / → /posts にリダイレクト
│   │   ├── globals.css
│   │   ├── generate/page.tsx        # 投稿生成ページ
│   │   ├── posts/page.tsx           # 投稿一覧・管理ページ
│   │   ├── affiliates/page.tsx      # アフィリエイトリンク管理ページ
│   │   ├── settings/page.tsx        # 設定ページ
│   │   └── api/
│   │       ├── generate/route.ts    # POST /api/generate
│   │       ├── posts/route.ts       # GET, POST /api/posts
│   │       ├── posts/[id]/route.ts  # PUT, DELETE /api/posts/:id
│   │       ├── affiliates/route.ts  # GET, POST /api/affiliates
│   │       ├── affiliates/[id]/route.ts  # PUT, DELETE /api/affiliates/:id
│   │       └── settings/route.ts    # GET, PUT /api/settings
│   └── lib/
│       ├── types.ts                 # 全TypeScript型定義
│       ├── db.ts                    # D1 DBヘルパー関数
│       ├── claude.ts                # Claude Opus API ヘルパー
│       └── scraper.ts               # URLスクレイピングヘルパー
├── migrations/
│   └── 0001_initial.sql             # 全テーブル作成SQL
├── env.d.ts                         # Cloudflare環境型定義
├── wrangler.jsonc
├── next.config.mjs
├── .dev.vars                        # ローカル用シークレット（gitignore対象）
├── .gitignore
├── package.json
└── tsconfig.json
```

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `C:\Users\naoki\Documents\x-post-tool\` （全ファイル）

- [ ] **Step 1: Next.js + Cloudflare プロジェクトを作成**

PowerShell で実行:
```powershell
cd C:\Users\naoki\Documents
npm create cloudflare@latest -- x-post-tool --framework=next --deploy=false
```
プロンプトが出たら:
- `Do you want to use TypeScript?` → **Yes**
- `Do you want to use Tailwind CSS?` → **Yes**
- `Do you want to use ESLint?` → **Yes**
- `Would you like to use App Router?` → **Yes**
- `Would you like to customize the default import alias?` → **No**

- [ ] **Step 2: 依存パッケージ追加**

```powershell
cd x-post-tool
npm install @anthropic-ai/sdk
npm install -D @cloudflare/vitest-pool-workers vitest
```

- [ ] **Step 3: `wrangler.jsonc` を上書き**

`C:\Users\naoki\Documents\x-post-tool\wrangler.jsonc` を以下で上書き:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "x-post-tool",
  "compatibility_date": "2024-09-23",
  "compatibility_flags": ["nodejs_compat"],
  "pages_build_output_dir": ".vercel/output/static",
  "preview_urls": false,
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "x-post-tool-db",
      "database_id": "REPLACE_AFTER_STEP_4"
    }
  ]
}
```

- [ ] **Step 4: Cloudflare D1 データベースを作成**

```powershell
npx wrangler d1 create x-post-tool-db
```

出力例:
```
✅ Successfully created DB 'x-post-tool-db'
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

表示された `database_id` を `wrangler.jsonc` の `REPLACE_AFTER_STEP_4` に貼り付ける。

- [ ] **Step 5: `next.config.mjs` を上書き**

```javascript
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev';

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform();
}

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 6: `env.d.ts` を作成**

`C:\Users\naoki\Documents\x-post-tool\env.d.ts`:
```typescript
interface CloudflareEnv {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
}
```

- [ ] **Step 7: `.dev.vars` を作成（gitignore対象）**

`C:\Users\naoki\Documents\x-post-tool\.dev.vars`:
```
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
```
※ 実際のAnthropicのAPIキーを入力すること

- [ ] **Step 8: `.gitignore` に `.dev.vars` が含まれていることを確認**

`.gitignore` に以下が含まれているか確認。なければ追記:
```
.dev.vars
```

- [ ] **Step 9: Gitリポジトリを初期化してコミット**

```powershell
git init
git add -A
git commit -m "chore: initial Next.js + Cloudflare Workers setup"
```

---

## Task 2: D1 マイグレーション

**Files:**
- Create: `migrations/0001_initial.sql`

- [ ] **Step 1: マイグレーションファイルを作成**

`C:\Users\naoki\Documents\x-post-tool\migrations\0001_initial.sql`:
```sql
CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER  PRIMARY KEY AUTOINCREMENT,
  content      TEXT     NOT NULL,
  source_url   TEXT,
  keyword      TEXT,
  status       TEXT     NOT NULL DEFAULT 'draft',
  scheduled_at DATETIME,
  posted_at    DATETIME,
  x_post_id    TEXT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS affiliate_links (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  name       TEXT     NOT NULL,
  url        TEXT     NOT NULL,
  category   TEXT     NOT NULL,
  tags       TEXT     NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS schedule_rules (
  id            INTEGER  PRIMARY KEY AUTOINCREMENT,
  cron_expr     TEXT     NOT NULL,
  posts_per_run INTEGER  NOT NULL DEFAULT 1,
  enabled       INTEGER  NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS post_logs (
  id         INTEGER  PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER  NOT NULL,
  action     TEXT     NOT NULL,
  message    TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id)
);

-- サンプルのアフィリエイトリンク（動作確認用）
INSERT INTO affiliate_links (name, url, category, tags) VALUES
  ('楽天モバイル', 'https://example.com/rakuten-mobile', '格安SIM', '格安SIM,スマホ,節約'),
  ('SBI証券 NISA', 'https://example.com/sbi-nisa', 'NISA', 'NISA,投資,証券');
```

- [ ] **Step 2: ローカルD1にマイグレーションを適用**

```powershell
npx wrangler d1 migrations apply x-post-tool-db --local
```

期待される出力:
```
✅ Applied 1 migration(s)
```

- [ ] **Step 3: リモートD1にもマイグレーションを適用**

```powershell
npx wrangler d1 migrations apply x-post-tool-db --remote
```

- [ ] **Step 4: コミット**

```powershell
git add migrations/
git commit -m "feat: add D1 database migrations"
```

---

## Task 3: 型定義・DBヘルパー

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/db.ts`

- [ ] **Step 1: 型定義を作成**

`src/lib/types.ts`:
```typescript
export type PostStatus = 'draft' | 'scheduled' | 'posted';

export interface Post {
  id: number;
  content: string;
  source_url: string | null;
  keyword: string | null;
  status: PostStatus;
  scheduled_at: string | null;
  posted_at: string | null;
  x_post_id: string | null;
  created_at: string;
}

export interface AffiliateLink {
  id: number;
  name: string;
  url: string;
  category: string;
  tags: string;
  created_at: string;
}

export interface ScheduleRule {
  id: number;
  cron_expr: string;
  posts_per_run: number;
  enabled: number;
  created_at: string;
}

export interface PostLog {
  id: number;
  post_id: number;
  action: string;
  message: string | null;
  created_at: string;
}
```

- [ ] **Step 2: DBヘルパー関数を作成**

`src/lib/db.ts`:
```typescript
import type { Post, AffiliateLink, PostStatus } from './types';

// ---- Posts ----

export async function getPosts(db: D1Database, status?: PostStatus): Promise<Post[]> {
  if (status) {
    const { results } = await db
      .prepare('SELECT * FROM posts WHERE status = ? ORDER BY created_at DESC')
      .bind(status)
      .all<Post>();
    return results;
  }
  const { results } = await db
    .prepare('SELECT * FROM posts ORDER BY created_at DESC')
    .all<Post>();
  return results;
}

export async function createPost(
  db: D1Database,
  data: Pick<Post, 'content' | 'source_url' | 'keyword'>
): Promise<Post> {
  const { results } = await db
    .prepare(
      'INSERT INTO posts (content, source_url, keyword) VALUES (?, ?, ?) RETURNING *'
    )
    .bind(data.content, data.source_url ?? null, data.keyword ?? null)
    .all<Post>();
  return results[0];
}

export async function updatePost(
  db: D1Database,
  id: number,
  data: Partial<Pick<Post, 'content' | 'status' | 'scheduled_at'>>
): Promise<Post> {
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(data), id];
  const { results } = await db
    .prepare(`UPDATE posts SET ${fields} WHERE id = ? RETURNING *`)
    .bind(...values)
    .all<Post>();
  return results[0];
}

export async function deletePost(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
}

// ---- Affiliate Links ----

export async function getAffiliateLinks(db: D1Database): Promise<AffiliateLink[]> {
  const { results } = await db
    .prepare('SELECT * FROM affiliate_links ORDER BY category, name')
    .all<AffiliateLink>();
  return results;
}

export async function getAffiliateLinkByCategory(
  db: D1Database,
  category: string
): Promise<AffiliateLink | null> {
  const result = await db
    .prepare('SELECT * FROM affiliate_links WHERE category = ? LIMIT 1')
    .bind(category)
    .first<AffiliateLink>();
  return result ?? null;
}

export async function createAffiliateLink(
  db: D1Database,
  data: Omit<AffiliateLink, 'id' | 'created_at'>
): Promise<AffiliateLink> {
  const { results } = await db
    .prepare(
      'INSERT INTO affiliate_links (name, url, category, tags) VALUES (?, ?, ?, ?) RETURNING *'
    )
    .bind(data.name, data.url, data.category, data.tags)
    .all<AffiliateLink>();
  return results[0];
}

export async function updateAffiliateLink(
  db: D1Database,
  id: number,
  data: Partial<Omit<AffiliateLink, 'id' | 'created_at'>>
): Promise<AffiliateLink> {
  const fields = Object.keys(data)
    .map((k) => `${k} = ?`)
    .join(', ');
  const values = [...Object.values(data), id];
  const { results } = await db
    .prepare(`UPDATE affiliate_links SET ${fields} WHERE id = ? RETURNING *`)
    .bind(...values)
    .all<AffiliateLink>();
  return results[0];
}

export async function deleteAffiliateLink(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM affiliate_links WHERE id = ?').bind(id).run();
}
```

- [ ] **Step 3: コミット**

```powershell
git add src/lib/
git commit -m "feat: add TypeScript types and D1 database helpers"
```

---

## Task 4: Claude Opus ヘルパー・スクレイパー

**Files:**
- Create: `src/lib/claude.ts`
- Create: `src/lib/scraper.ts`

- [ ] **Step 1: スクレイパーを作成**

`src/lib/scraper.ts`:
```typescript
/**
 * URLからページ本文テキストを取得する
 */
export async function scrapeUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; XPostTool/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();

  // HTMLタグを除去してテキストだけ取得
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 最初の3000文字に制限（Claude APIのトークン節約）
  return text.slice(0, 3000);
}
```

- [ ] **Step 2: Claude ヘルパーを作成**

`src/lib/claude.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';

export interface GeneratedPost {
  pattern: number;
  content: string;
}

/**
 * コンテンツ（記事本文またはキーワード）からX投稿文を3パターン生成する
 */
export async function generateXPosts(
  apiKey: string,
  sourceContent: string,
  affiliateUrl?: string
): Promise<GeneratedPost[]> {
  const client = new Anthropic({ apiKey });

  const affiliateInstruction = affiliateUrl
    ? `\n- 各パターンの末尾に次のアフィリエイトURLを自然な形で追加してください: ${affiliateUrl}`
    : '';

  const prompt = `あなたはX（Twitter）の投稿文を作成するアシスタントです。
以下のコンテンツをもとに、アフィリエイトマーケティング向けのX投稿文を3パターン作成してください。

制約：
- 各パターン100字以内（アフィリエイトURLを除く）
- 読者が思わずクリックしたくなる文体
- ハッシュタグを1〜2個含める
- 押しつけがましくなく、自然な体験談・情報提供スタイル${affiliateInstruction}

コンテンツ：
${sourceContent}

以下のJSON形式のみで返してください（説明文不要）:
[
  { "pattern": 1, "content": "投稿文1" },
  { "pattern": 2, "content": "投稿文2" },
  { "pattern": 3, "content": "投稿文3" }
]`;

  const message = await client.messages.create({
    model: 'claude-opus-4-5',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  // JSONを抽出してパース
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    throw new Error('Claude returned unexpected format');
  }

  return JSON.parse(jsonMatch[0]) as GeneratedPost[];
}
```

- [ ] **Step 3: コミット**

```powershell
git add src/lib/claude.ts src/lib/scraper.ts
git commit -m "feat: add Claude Opus and URL scraper helpers"
```

---

## Task 5: 共通レイアウト・ナビゲーション

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: グローバルCSSを更新**

`src/app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-gray-50 text-gray-900;
}
```

- [ ] **Step 2: ルートレイアウトを更新**

`src/app/layout.tsx`:
```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'X投稿ツール',
  description: 'Xアフィリエイト投稿管理ツール',
};

const navLinks = [
  { href: '/generate', label: '投稿生成' },
  { href: '/posts', label: '投稿一覧' },
  { href: '/affiliates', label: 'アフィリエイト' },
  { href: '/settings', label: '設定' },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <nav className="bg-white border-b border-gray-200 px-6 py-3 flex gap-6 items-center shadow-sm">
          <span className="font-bold text-blue-600 text-lg">📣 X投稿ツール</span>
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <main className="max-w-4xl mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
```

- [ ] **Step 3: トップページをリダイレクト**

`src/app/page.tsx`:
```tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/posts');
}
```

- [ ] **Step 4: 開発サーバーで動作確認**

```powershell
npm run dev
```

ブラウザで `http://localhost:3000` を開き、ナビゲーションが表示されること、`/posts` にリダイレクトされることを確認。

- [ ] **Step 5: コミット**

```powershell
git add src/app/layout.tsx src/app/globals.css src/app/page.tsx
git commit -m "feat: add root layout with navigation"
```

---

## Task 6: アフィリエイトリンク管理 API

**Files:**
- Create: `src/app/api/affiliates/route.ts`
- Create: `src/app/api/affiliates/[id]/route.ts`

- [ ] **Step 1: 一覧・作成APIを作成**

`src/app/api/affiliates/route.ts`:
```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getAffiliateLinks, createAffiliateLink } from '@/lib/db';

export const runtime = 'edge';

export async function GET() {
  const { env } = getRequestContext<CloudflareEnv>();
  const links = await getAffiliateLinks(env.DB);
  return Response.json(links);
}

export async function POST(request: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const body = await request.json() as { name: string; url: string; category: string; tags: string };

  if (!body.name || !body.url || !body.category) {
    return Response.json({ error: 'name, url, category は必須です' }, { status: 400 });
  }

  const link = await createAffiliateLink(env.DB, {
    name: body.name,
    url: body.url,
    category: body.category,
    tags: body.tags ?? '',
  });
  return Response.json(link, { status: 201 });
}
```

- [ ] **Step 2: 更新・削除APIを作成**

`src/app/api/affiliates/[id]/route.ts`:
```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updateAffiliateLink, deleteAffiliateLink } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const id = parseInt(params.id, 10);
  const body = await request.json() as Partial<{ name: string; url: string; category: string; tags: string }>;

  const link = await updateAffiliateLink(env.DB, id, body);
  return Response.json(link);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const id = parseInt(params.id, 10);
  await deleteAffiliateLink(env.DB, id);
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 3: 動作確認**

開発サーバーが起動中の状態で PowerShell から確認:
```powershell
# 一覧取得
Invoke-RestMethod -Uri "http://localhost:3000/api/affiliates" -Method GET | ConvertTo-Json

# 新規作成
$body = '{"name":"テスト保険","url":"https://example.com/test","category":"保険","tags":"保険,生命保険"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/affiliates" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json
```

期待される結果: サンプルデータ2件が返り、新規作成が成功すること

- [ ] **Step 4: コミット**

```powershell
git add src/app/api/affiliates/
git commit -m "feat: add affiliate links CRUD API"
```

---

## Task 7: アフィリエイトリンク管理 UI

**Files:**
- Create: `src/app/affiliates/page.tsx`

- [ ] **Step 1: アフィリエイト管理ページを作成**

`src/app/affiliates/page.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import type { AffiliateLink } from '@/lib/types';

export default function AffiliatesPage() {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [form, setForm] = useState({ name: '', url: '', category: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const fetchLinks = async () => {
    const res = await fetch('/api/affiliates');
    const data = await res.json();
    setLinks(data);
  };

  useEffect(() => { fetchLinks(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/affiliates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setForm({ name: '', url: '', category: '', tags: '' });
      setMessage('登録しました');
      await fetchLinks();
    } else {
      setMessage('エラーが発生しました');
    }
    setLoading(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    await fetch(`/api/affiliates/${id}`, { method: 'DELETE' });
    await fetchLinks();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">アフィリエイトリンク管理</h1>

      {/* 新規登録フォーム */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">新規登録</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">名称 *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="例: 楽天モバイル"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">カテゴリ *</label>
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="例: 格安SIM"
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">アフィリエイトURL *</label>
            <input
              type="url"
              value={form.url}
              onChange={(e) => setForm({ ...form, url: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="https://px.a8.net/..."
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">タグ（カンマ区切り）</label>
            <input
              type="text"
              value={form.tags}
              onChange={(e) => setForm({ ...form, tags: e.target.value })}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              placeholder="例: スマホ,節約,格安SIM"
            />
          </div>
          <div className="col-span-2 flex items-center gap-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '登録中...' : '登録'}
            </button>
            {message && <span className="text-sm text-green-600">{message}</span>}
          </div>
        </form>
      </div>

      {/* 一覧 */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium">名称</th>
              <th className="text-left px-4 py-3 font-medium">カテゴリ</th>
              <th className="text-left px-4 py-3 font-medium">タグ</th>
              <th className="text-left px-4 py-3 font-medium">URL</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {links.map((link) => (
              <tr key={link.id} className="border-t border-gray-100">
                <td className="px-4 py-3 font-medium">{link.name}</td>
                <td className="px-4 py-3">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">
                    {link.category}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{link.tags}</td>
                <td className="px-4 py-3">
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    className="text-blue-500 hover:underline truncate block max-w-xs">
                    {link.url}
                  </a>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(link.id)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    削除
                  </button>
                </td>
              </tr>
            ))}
            {links.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  リンクが登録されていません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 動作確認**

`http://localhost:3000/affiliates` を開き、サンプルリンクが表示されること、新規登録・削除が動作することを確認。

- [ ] **Step 3: コミット**

```powershell
git add src/app/affiliates/
git commit -m "feat: add affiliate links management UI"
```

---

## Task 8: 投稿生成 API

**Files:**
- Create: `src/app/api/generate/route.ts`

- [ ] **Step 1: 投稿生成APIを作成**

`src/app/api/generate/route.ts`:
```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';
import { generateXPosts } from '@/lib/claude';
import { scrapeUrl } from '@/lib/scraper';
import { getAffiliateLinkByCategory } from '@/lib/db';

export const runtime = 'edge';

export async function POST(request: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const body = await request.json() as {
    mode: 'url' | 'keyword';
    input: string;
    affiliateCategory?: string;
    affiliateUrl?: string;
  };

  if (!body.mode || !body.input) {
    return Response.json({ error: 'mode と input は必須です' }, { status: 400 });
  }

  let sourceContent: string;

  if (body.mode === 'url') {
    try {
      sourceContent = await scrapeUrl(body.input);
    } catch (e) {
      return Response.json({ error: `URLの取得に失敗しました: ${(e as Error).message}` }, { status: 400 });
    }
  } else {
    sourceContent = body.input;
  }

  // アフィリエイトURLを決定（手動指定 > カテゴリ自動選択）
  let affiliateUrl = body.affiliateUrl;
  if (!affiliateUrl && body.affiliateCategory) {
    const link = await getAffiliateLinkByCategory(env.DB, body.affiliateCategory);
    affiliateUrl = link?.url;
  }

  const posts = await generateXPosts(env.ANTHROPIC_API_KEY, sourceContent, affiliateUrl);
  return Response.json({ posts });
}
```

- [ ] **Step 2: 動作確認**

```powershell
$body = '{"mode":"keyword","input":"格安SIMに乗り換えると年間6万円節約できる","affiliateCategory":"格安SIM"}'
Invoke-RestMethod -Uri "http://localhost:3000/api/generate" -Method POST -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 5
```

期待される結果: 3パターンの投稿文が返ること

- [ ] **Step 3: コミット**

```powershell
git add src/app/api/generate/
git commit -m "feat: add post generation API with Claude Opus"
```

---

## Task 9: 投稿生成 UI

**Files:**
- Create: `src/app/generate/page.tsx`

- [ ] **Step 1: 投稿生成ページを作成**

`src/app/generate/page.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import type { AffiliateLink } from '@/lib/types';

interface GeneratedPost {
  pattern: number;
  content: string;
}

export default function GeneratePage() {
  const [mode, setMode] = useState<'url' | 'keyword'>('url');
  const [input, setInput] = useState('');
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [selectedAffiliate, setSelectedAffiliate] = useState('');
  const [useAutoAffiliate, setUseAutoAffiliate] = useState(true);
  const [affiliateCategory, setAffiliateCategory] = useState('');
  const [posts, setPosts] = useState<GeneratedPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState<number | null>(null);

  useEffect(() => {
    fetch('/api/affiliates').then(r => r.json()).then(setAffiliateLinks);
  }, []);

  const categories = [...new Set(affiliateLinks.map(l => l.category))];

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setPosts([]);
    setSavedId(null);

    const body: Record<string, string> = { mode, input };
    if (useAutoAffiliate && affiliateCategory) {
      body.affiliateCategory = affiliateCategory;
    } else if (!useAutoAffiliate && selectedAffiliate) {
      body.affiliateUrl = selectedAffiliate;
    }

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      setPosts(data.posts);
    } else {
      const data = await res.json();
      setError(data.error ?? '生成に失敗しました');
    }
    setLoading(false);
  };

  const handleSave = async (content: string) => {
    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        source_url: mode === 'url' ? input : null,
        keyword: mode === 'keyword' ? input : null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setSavedId(data.id);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">投稿生成</h1>

      {/* モード選択 */}
      <div className="flex gap-2 mb-6">
        {(['url', 'keyword'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-4 py-2 rounded text-sm font-medium ${
              mode === m
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {m === 'url' ? '🔗 URLから生成' : '💡 キーワードから生成'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
        {/* 入力 */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {mode === 'url' ? 'ブログ記事URL' : 'テーマ・キーワード'}
          </label>
          <input
            type={mode === 'url' ? 'url' : 'text'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            placeholder={
              mode === 'url'
                ? 'https://naoki-blog.com/blog/...'
                : '例: 格安SIMに乗り換えると年間6万円節約できる'
            }
          />
        </div>

        {/* アフィリエイトリンク選択 */}
        <div>
          <label className="block text-sm font-medium mb-2">アフィリエイトリンク</label>
          <div className="flex gap-4 mb-2">
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={useAutoAffiliate} onChange={() => setUseAutoAffiliate(true)} />
              カテゴリから自動選択
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" checked={!useAutoAffiliate} onChange={() => setUseAutoAffiliate(false)} />
              手動で選択
            </label>
          </div>
          {useAutoAffiliate ? (
            <select
              value={affiliateCategory}
              onChange={(e) => setAffiliateCategory(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-64"
            >
              <option value="">カテゴリを選択（任意）</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          ) : (
            <select
              value={selectedAffiliate}
              onChange={(e) => setSelectedAffiliate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-64"
            >
              <option value="">リンクを選択（任意）</option>
              {affiliateLinks.map(l => (
                <option key={l.id} value={l.url}>{l.name}（{l.category}）</option>
              ))}
            </select>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading || !input.trim()}
          className="bg-blue-600 text-white px-8 py-2 rounded font-medium text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '⏳ 生成中...' : '✨ 生成する'}
        </button>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      {/* 生成結果 */}
      {posts.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">生成結果</h2>
          {posts.map((post) => (
            <div key={post.pattern} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-gray-500">パターン {post.pattern}</span>
                <span className="text-xs text-gray-400">{post.content.length}字</span>
              </div>
              <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(post.content)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded font-medium"
                >
                  📋 コピー
                </button>
                <button
                  onClick={() => handleSave(post.content)}
                  className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded font-medium"
                >
                  💾 下書き保存
                </button>
              </div>
              {savedId && <p className="text-xs text-green-600 mt-1">✅ 保存しました（ID: {savedId}）</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 動作確認**

`http://localhost:3000/generate` を開き:
1. キーワードモードで「格安SIM 節約」と入力して生成ボタンを押す
2. 3パターン表示されることを確認
3. コピーボタンでクリップボードにコピーされることを確認

- [ ] **Step 3: コミット**

```powershell
git add src/app/generate/
git commit -m "feat: add post generation UI"
```

---

## Task 10: 投稿管理 API + UI

**Files:**
- Create: `src/app/api/posts/route.ts`
- Create: `src/app/api/posts/[id]/route.ts`
- Create: `src/app/posts/page.tsx`

- [ ] **Step 1: 投稿API（一覧・作成）を作成**

`src/app/api/posts/route.ts`:
```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';
import { getPosts, createPost } from '@/lib/db';
import type { PostStatus } from '@/lib/types';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') as PostStatus | null;
  const posts = await getPosts(env.DB, status ?? undefined);
  return Response.json(posts);
}

export async function POST(request: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const body = await request.json() as { content: string; source_url?: string; keyword?: string };

  if (!body.content) {
    return Response.json({ error: 'content は必須です' }, { status: 400 });
  }

  const post = await createPost(env.DB, {
    content: body.content,
    source_url: body.source_url ?? null,
    keyword: body.keyword ?? null,
  });
  return Response.json(post, { status: 201 });
}
```

- [ ] **Step 2: 投稿API（更新・削除）を作成**

`src/app/api/posts/[id]/route.ts`:
```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';
import { updatePost, deletePost } from '@/lib/db';

export const runtime = 'edge';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const id = parseInt(params.id, 10);
  const body = await request.json() as Partial<{ content: string; status: string; scheduled_at: string }>;

  const post = await updatePost(env.DB, id, body);
  return Response.json(post);
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const { env } = getRequestContext<CloudflareEnv>();
  const id = parseInt(params.id, 10);
  await deletePost(env.DB, id);
  return new Response(null, { status: 204 });
}
```

- [ ] **Step 3: 投稿一覧UIを作成**

`src/app/posts/page.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';
import type { Post, PostStatus } from '@/lib/types';

const STATUS_LABELS: Record<PostStatus, string> = {
  draft: '下書き',
  scheduled: '予約済み',
  posted: '投稿済み',
};

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: 'bg-gray-100 text-gray-600',
  scheduled: 'bg-yellow-100 text-yellow-700',
  posted: 'bg-green-100 text-green-700',
};

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filterStatus, setFilterStatus] = useState<PostStatus | ''>('');
  const [copied, setCopied] = useState<number | null>(null);
  const [scheduling, setScheduling] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState('');

  const fetchPosts = async () => {
    const query = filterStatus ? `?status=${filterStatus}` : '';
    const res = await fetch(`/api/posts${query}`);
    const data = await res.json();
    setPosts(data);
  };

  useEffect(() => { fetchPosts(); }, [filterStatus]);

  const handleCopy = (post: Post) => {
    navigator.clipboard.writeText(post.content);
    setCopied(post.id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSchedule = async (post: Post) => {
    if (!scheduleDate) return;
    await fetch(`/api/posts/${post.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'scheduled', scheduled_at: new Date(scheduleDate).toISOString() }),
    });
    setScheduling(null);
    setScheduleDate('');
    await fetchPosts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('削除しますか？')) return;
    await fetch(`/api/posts/${id}`, { method: 'DELETE' });
    await fetchPosts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">投稿一覧</h1>
        <a href="/generate"
          className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700">
          ✨ 新規生成
        </a>
      </div>

      {/* フィルター */}
      <div className="flex gap-2 mb-6">
        {(['', 'draft', 'scheduled', 'posted'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-1.5 rounded text-sm font-medium ${
              filterStatus === s
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {s === '' ? 'すべて' : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      {/* 投稿リスト */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[post.status]}`}>
                {STATUS_LABELS[post.status]}
              </span>
              <span className="text-xs text-gray-400">
                {new Date(post.created_at).toLocaleDateString('ja-JP')}
              </span>
            </div>

            <p className="text-sm whitespace-pre-wrap mb-3">{post.content}</p>

            {post.scheduled_at && (
              <p className="text-xs text-yellow-600 mb-2">
                📅 予約: {new Date(post.scheduled_at).toLocaleString('ja-JP')}
              </p>
            )}

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => handleCopy(post)}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded font-medium"
              >
                {copied === post.id ? '✅ コピー済み' : '📋 コピー'}
              </button>

              {post.status !== 'posted' && (
                <button
                  onClick={() => setScheduling(scheduling === post.id ? null : post.id)}
                  className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-1.5 rounded font-medium"
                >
                  📅 予約設定
                </button>
              )}

              <button
                onClick={() => handleDelete(post.id)}
                className="text-xs bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded font-medium"
              >
                🗑️ 削除
              </button>
            </div>

            {/* 予約日時入力 */}
            {scheduling === post.id && (
              <div className="mt-3 flex gap-2 items-center">
                <input
                  type="datetime-local"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-1.5 text-sm"
                />
                <button
                  onClick={() => handleSchedule(post)}
                  className="bg-yellow-500 text-white px-4 py-1.5 rounded text-sm font-medium hover:bg-yellow-600"
                >
                  設定
                </button>
              </div>
            )}
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p>投稿がありません</p>
            <a href="/generate" className="text-blue-500 text-sm hover:underline">
              投稿を生成する →
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 動作確認**

`http://localhost:3000/posts` を開き:
1. 投稿生成ページで保存した投稿が表示されること
2. コピーボタンが動作すること
3. 予約設定できること
4. フィルターが動作すること

- [ ] **Step 5: コミット**

```powershell
git add src/app/api/posts/ src/app/posts/
git commit -m "feat: add posts management API and UI"
```

---

## Task 11: 設定ページ

**Files:**
- Create: `src/app/api/settings/route.ts`
- Create: `src/app/settings/page.tsx`

- [ ] **Step 1: 設定APIを作成**

`src/app/api/settings/route.ts`:
```typescript
import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge';

export async function GET() {
  const { env } = getRequestContext<CloudflareEnv>();
  const { results } = await env.DB
    .prepare('SELECT * FROM schedule_rules ORDER BY id')
    .all<{ id: number; cron_expr: string; posts_per_run: number; enabled: number }>();

  return Response.json({ scheduleRules: results });
}

export async function POST(request: Request) {
  const { env } = getRequestContext<CloudflareEnv>();
  const body = await request.json() as { cron_expr: string; posts_per_run: number };

  const { results } = await env.DB
    .prepare('INSERT INTO schedule_rules (cron_expr, posts_per_run) VALUES (?, ?) RETURNING *')
    .bind(body.cron_expr, body.posts_per_run)
    .all();

  return Response.json(results[0], { status: 201 });
}
```

- [ ] **Step 2: 設定ページを作成**

`src/app/settings/page.tsx`:
```tsx
'use client';

import { useState, useEffect } from 'react';

interface ScheduleRule {
  id: number;
  cron_expr: string;
  posts_per_run: number;
  enabled: number;
}

export default function SettingsPage() {
  const [rules, setRules] = useState<ScheduleRule[]>([]);
  const [newCron, setNewCron] = useState('0 9 * * *');
  const [postsPerRun, setPostsPerRun] = useState(1);

  const fetchSettings = async () => {
    const res = await fetch('/api/settings');
    const data = await res.json();
    setRules(data.scheduleRules ?? []);
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleAddRule = async () => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cron_expr: newCron, posts_per_run: postsPerRun }),
    });
    await fetchSettings();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">設定</h1>

      {/* 自動投稿ルール */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-2">自動投稿ルール</h2>
        <p className="text-sm text-gray-500 mb-4">
          ⚠️ フェーズ2（X API連携後）に有効になります。今は設定のみ可能です。
        </p>

        <div className="flex gap-4 items-end mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cron式</label>
            <input
              type="text"
              value={newCron}
              onChange={(e) => setNewCron(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-40"
              placeholder="0 9 * * *"
            />
            <p className="text-xs text-gray-400 mt-1">例: 毎日9時 → 0 9 * * *</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">1回の投稿数</label>
            <input
              type="number"
              value={postsPerRun}
              onChange={(e) => setPostsPerRun(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-2 text-sm w-20"
              min={1}
              max={5}
            />
          </div>
          <button
            onClick={handleAddRule}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700"
          >
            追加
          </button>
        </div>

        {rules.length > 0 && (
          <ul className="space-y-2">
            {rules.map((r) => (
              <li key={r.id} className="text-sm bg-gray-50 rounded px-4 py-2 flex justify-between">
                <span>Cron: <code>{r.cron_expr}</code> / {r.posts_per_run}件</span>
                <span className={r.enabled ? 'text-green-600' : 'text-gray-400'}>
                  {r.enabled ? '✅ 有効' : '⏸️ 無効（フェーズ2で有効化）'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* X API設定（フェーズ2用メモ） */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-2">🔑 X API設定（フェーズ2）</h2>
        <p className="text-sm text-gray-600 mb-3">
          X APIキーを取得後、Cloudflare Workers の Secrets に以下を登録することで自動投稿が有効になります。
        </p>
        <ul className="text-sm space-y-1 text-gray-600 list-disc list-inside">
          <li>X_API_KEY（Consumer Key）</li>
          <li>X_API_SECRET（Consumer Secret）</li>
          <li>X_ACCESS_TOKEN</li>
          <li>X_ACCESS_SECRET</li>
        </ul>
        <p className="text-xs text-gray-400 mt-3">
          登録コマンド: <code>npx wrangler secret put X_API_KEY</code>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: コミット**

```powershell
git add src/app/api/settings/ src/app/settings/
git commit -m "feat: add settings page with schedule rule management"
```

---

## Task 12: Cloudflare Pages デプロイ

**Files:**
- Modify: `wrangler.jsonc`（Secrets 設定確認）

- [ ] **Step 1: ANTHROPIC_API_KEY を Cloudflare Secrets に登録**

```powershell
npx wrangler secret put ANTHROPIC_API_KEY
```

プロンプトに実際のAPIキーを入力してEnter。

- [ ] **Step 2: Next.js アプリをビルド**

```powershell
npm run build
```

エラーがなく `.vercel/output/` が生成されることを確認。

- [ ] **Step 3: Cloudflare Pages にデプロイ**

```powershell
npx wrangler pages deploy .vercel/output/static --project-name x-post-tool
```

初回は「プロジェクトが存在しない」と言われたら `y` で作成。デプロイ後にURLが表示される。

- [ ] **Step 4: D1 バインディングを本番に設定**

Cloudflare ダッシュボード（https://dash.cloudflare.com）を開き:
1. Workers & Pages → x-post-tool → Settings → Functions
2. D1 database bindings → Add → Variable name: `DB`、Database: `x-post-tool-db`
3. Save

- [ ] **Step 5: Cloudflare Access を設定（認証）**

Cloudflare ダッシュボードで:
1. Zero Trust → Access → Applications → Add an application
2. Self-hosted を選択
3. Application name: `X Post Tool`
4. Application domain: デプロイされたURL（例: `x-post-tool.pages.dev`）
5. Policy: Include → Emails → `tom.b770103@gmail.com`
6. Save

- [ ] **Step 6: 動作確認**

デプロイURLにアクセスし、Cloudflare Access のログイン画面が出ること、メールで認証後にツールが使えることを確認。

- [ ] **Step 7: 最終コミット・GitHubリポジトリ作成**

```powershell
git add -A
git commit -m "feat: complete Phase 1 - AI post generation tool"
```

GitHubにプライベートリポジトリを作成（名前: `x-post-tool`）して push:
```powershell
git remote add origin git@github.com:wai46704/x-post-tool.git
git push -u origin main
```

---

## 完成後の使い方（フェーズ1）

1. `/affiliates` でA8.netなどのリンクを登録
2. `/generate` でブログ記事URLまたはキーワードを入力して投稿文を生成
3. 気に入ったパターンを「下書き保存」
4. `/posts` で保存済み投稿を確認・コピー
5. X公式アプリに貼り付けて投稿

## フェーズ2 移行チェックリスト

- [ ] X Developer Portal でAPIキー取得（Basic: $100/月 or Free）
- [ ] `npx wrangler secret put X_API_KEY` 等でSecrets登録
- [ ] `src/app/api/posts/[id]/route.ts` にX投稿処理を追加
- [ ] `schedule_rules` の `enabled` を `1` に更新
- [ ] Cloudflare Cron Trigger を追加（`wrangler.jsonc` の `triggers`）
