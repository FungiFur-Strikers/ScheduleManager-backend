# Auth Worker

認証サービスを提供するワーカー

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

### 開発サーバーの起動

```bash
bun run dev
```

### Cloudflare Workersへのデプロイ

```bash
bun run deploy
```

### Drizzle ORMのスキーマ生成

```bash
bun run generate
```

### ローカル環境でのマイグレーション実行

```bash
bun run local:migration
```

### リモート環境でのマイグレーション実行

```bash
bun run remote:migration
```

### テストの実行

```bash
bun run test
```
