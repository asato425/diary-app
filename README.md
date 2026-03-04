# Daily Log

日々の記録・タスク管理・振り返りのためのWebアプリ。

## 機能

- **今日の記録** - 前日に設定したタスクをチェックリスト形式で記録。達成度・作業時間・学んだことを入力して保存。
- **予定管理** - タスクに対して期間を指定して予定を登録。指定日になると今日の記録に自動反映される。
- **タスク管理** - カテゴリとタスクを事前登録。カテゴリにはプリセットカラーを設定可能。
- **履歴** - 週・月単位で過去の記録を振り返る。
- **分析** - カテゴリ別の合計時間・タスク別の達成度をグラフで可視化。

## 技術スタック

- **フロントエンド**: Next.js / React / TypeScript / Tailwind CSS
- **データベース**: Supabase (PostgreSQL)
- **デプロイ**: Vercel

## セットアップ

### 1. リポジトリをクローン
```bash
git clone https://github.com/asato425/diary-app.git
cd diary-app
```

### 2. 依存パッケージをインストール
```bash
npm install
```

### 3. 環境変数を設定

`.env.local`を作成して以下を記述：
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabaseでテーブルを作成

Supabase の SQL Editor で以下を実行：
```sql
create table categories (
  id text primary key,
  name text not null,
  color text not null
);

create table tasks (
  id text primary key,
  name text not null,
  category_id text references categories(id) on delete cascade
);

create table daily_entries (
  id text primary key,
  date text not null unique,
  learned text default '',
  memo text default ''
);

create table task_logs (
  id text primary key,
  entry_id text references daily_entries(id) on delete cascade,
  task_id text references tasks(id) on delete cascade,
  plan text default '',
  content text default '',
  achievement text default 'not_done',
  minutes integer default 0
);

create table tomorrow_tasks (
  id text primary key,
  entry_id text references daily_entries(id) on delete cascade,
  task_id text references tasks(id) on delete cascade,
  plan text default ''
);

create table scheduled_tasks (
  id text primary key,
  task_id text references tasks(id) on delete cascade,
  start_date text not null,
  end_date text not null default ''
  plan text default ''
);
```

### 5. 開発サーバーを起動
```bash
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開く。

### ToDo
- タスク・カテゴリの名称変更
- ログイン機能
- 