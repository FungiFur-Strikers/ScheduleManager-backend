# ScheduleManager-backend

スケジュール管理アプリケーションのバックエンドAPIサーバー

## 技術スタック

- [Cloudflare Workers](https://workers.cloudflare.com/) - サーバーレスプラットフォーム
- [Hono](https://hono.dev/) - 軽量で高速なWebフレームワーク
- [Bun](https://bun.sh/) - JavaScriptランタイム
- [Biome](https://biomejs.dev/) - リンター/フォーマッター

## 開発環境のセットアップ

1. 依存関係のインストール:

```bash
bun install
```

2. 開発サーバーの起動:

```bash
bun run dev
```

3. デプロイ:

```bash
bun run deploy
```

## スクリプト

### ルートのpackage.json
- `bun run generate` - OpenAPI定義からTypeScriptの型定義を生成
- `bun run build` - 全ワークスペースのビルドを並列実行
- `bun run deploy` - ビルド後、Cloudflare Workersにデプロイ

### workersのスクリプト
- `bun run dev` - 開発サーバーの起動
- `bun run deploy` - Cloudflare Workersへのデプロイ
- `bun run lint` - コードのリント
- `bun run format` - コードのフォーマット
- `bun run test` - テストの実行
- `bun run test:watch` - テストの監視モード実行
- `bun run generate` - Drizzle ORMのスキーマ生成（auth worker）
- `bun run local:migration` - ローカル環境でのマイグレーション実行（auth worker）
- `bun run remote:migration` - リモート環境でのマイグレーション実行（auth worker）
