# X アフィリエイト投稿自動ツール 設計仕様書

**作成日:** 2026-05-19  
**ステータス:** 承認済み

---

## 概要

X（旧Twitter）向けアフィリエイト投稿を効率化する個人用管理ツール。  
フェーズ1ではAIによる投稿文生成とコピペ投稿、フェーズ2でX API連携による完全自動投稿に拡張する。

---

## インフラ構成

| 項目 | 技術 |
|------|------|
| フレームワーク | Next.js |
| ホスティング | Cloudflare Workers |
| データベース | Cloudflare D1 |
| 認証 | Cloudflare Access（自分のメールアドレスのみ許可） |
| AI | Claude Opus API |
| 自動投稿 | Cloudflare Cron Triggers（フェーズ2） |

---

## フェーズ定義

### フェーズ1（初期リリース）
- AI による投稿文生成
- アフィリエイトリンク管理
- 投稿一覧・スケジュール管理
- コピーボタンでX公式アプリへ手動投稿

### フェーズ2（X API連携後）
- 設定画面でX APIキーを登録
- Cloudflare Cron Triggers による自動投稿
- フェーズ1のデータをそのまま活用

---

## 画面構成

### 1. 投稿生成ページ（`/generate`）

**URLモード**
1. ブログ記事URLを入力
2. Workers がページ本文をスクレイピング
3. Claude Opus が140字以内のX投稿文を3パターン生成
4. アフィリエイトリンクを自動選択（カテゴリ一致）または手動選択
5. 気に入ったパターンを選択して保存

**キーワードモード**
1. テーマ・キーワードを入力
2. Claude Opus が3パターン生成
3. アフィリエイトリンクを選択して保存

### 2. 投稿一覧ページ（`/posts`）

- ステータスフィルター：`下書き` / `予約済み` / `投稿済み`
- 各投稿に対して：編集・削除・コピー（フェーズ1）・予約日時設定
- 自動投稿ルール設定（例：毎日9時・21時に1件ずつ）

### 3. アフィリエイト管理ページ（`/affiliates`）

- リンクのCRUD（登録・編集・削除）
- カテゴリ管理（例：NISA・格安SIM・保険・クレジットカード）
- AI自動選択用のキーワードタグ設定

### 4. 設定ページ（`/settings`）

- 自動投稿ルール管理（フェーズ1でも設定可能、フェーズ2で有効化）
- X APIキー登録（フェーズ2）：Consumer Key / Secret / Access Token / Secret

---

## データベース設計（Cloudflare D1）

### `posts` テーブル
```sql
CREATE TABLE posts (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  content     TEXT    NOT NULL,          -- 投稿本文（アフィリエイトリンク含む）
  source_url  TEXT,                      -- 元ブログ記事URL（任意）
  keyword     TEXT,                      -- 元キーワード（任意）
  status      TEXT    DEFAULT 'draft',   -- draft / scheduled / posted
  scheduled_at DATETIME,                 -- 予約投稿日時
  posted_at   DATETIME,                  -- 実際に投稿された日時
  x_post_id   TEXT,                      -- X側のpost ID（フェーズ2）
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `affiliate_links` テーブル
```sql
CREATE TABLE affiliate_links (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT    NOT NULL,          -- 名称（例：楽天モバイル）
  url         TEXT    NOT NULL,          -- アフィリエイトURL
  category    TEXT    NOT NULL,          -- カテゴリ（格安SIM / NISA / 保険など）
  tags        TEXT,                      -- AI自動選択用タグ（カンマ区切り）
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `schedule_rules` テーブル
```sql
CREATE TABLE schedule_rules (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  cron_expr   TEXT    NOT NULL,          -- Cron式（例：0 9 * * *）
  posts_per_run INTEGER DEFAULT 1,       -- 1回に投稿する件数
  enabled     INTEGER DEFAULT 0,         -- 0=無効（フェーズ1）/ 1=有効（フェーズ2）
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `post_logs` テーブル
```sql
CREATE TABLE post_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id     INTEGER NOT NULL,
  action      TEXT    NOT NULL,          -- copied / posted / failed
  message     TEXT,                      -- エラー内容など
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## API設計（Cloudflare Workers）

| メソッド | パス | 機能 |
|---------|------|------|
| POST | `/api/generate` | 投稿文生成（Claude Opus呼び出し） |
| GET | `/api/posts` | 投稿一覧取得 |
| POST | `/api/posts` | 投稿保存 |
| PUT | `/api/posts/:id` | 投稿更新・予約設定 |
| DELETE | `/api/posts/:id` | 投稿削除 |
| GET | `/api/affiliates` | アフィリエイトリンク一覧 |
| POST | `/api/affiliates` | リンク登録 |
| PUT | `/api/affiliates/:id` | リンク更新 |
| DELETE | `/api/affiliates/:id` | リンク削除 |
| GET | `/api/settings` | 設定取得 |
| PUT | `/api/settings` | 設定更新（X APIキーなど） |
| POST | `/api/cron/post` | Cron実行エンドポイント（フェーズ2） |

---

## AI プロンプト設計

### 投稿文生成プロンプト（概要）

```
あなたはX（Twitter）の投稿文を作成するアシスタントです。
以下のコンテンツをもとに、アフィリエイトマーケティング向けのX投稿文を
3パターン作成してください。

制約：
- 各パターン100字以内（アフィリエイトリンクを除く）
- 読者が思わずクリックしたくなる文体
- ハッシュタグを1〜2個含める
- 押しつけがましくなく、自然な体験談・情報提供スタイル

コンテンツ：{url_content または keyword}
カテゴリ：{category}
```

---

## セキュリティ

- Cloudflare Access により `tom.b770103@gmail.com` のみアクセス可
- X APIキーは Cloudflare Secrets に保存（コードに直書きしない）
- `preview_urls: false` で Access 認証をバイパスされないよう設定
- スクレイピングは自サイト（naoki-blog.com）のURLのみに限定しない（任意のURL対応）

---

## フェーズ2への拡張方法

設定画面でX APIキーを登録するだけで以下が有効化される：
1. 投稿一覧の「コピー」ボタンが「投稿する」ボタンに変わる
2. schedule_rules の `enabled=1` のルールが Cron で実行される
3. post_logs に投稿結果が記録される

既存データの移行は不要。

---

## 開発ディレクトリ

```
x-post-tool/          ← ai-company とは別の新規プロジェクト
├── src/
│   ├── app/          ← Next.js App Router
│   │   ├── generate/
│   │   ├── posts/
│   │   ├── affiliates/
│   │   └── settings/
│   └── worker/       ← Cloudflare Workers API
├── migrations/       ← D1 マイグレーション SQL
├── wrangler.jsonc
└── package.json
```
