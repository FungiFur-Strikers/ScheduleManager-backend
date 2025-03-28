# Workers 共通パッケージ

このパッケージは、Cloudflare Workersで構築されたマイクロサービス間で共有されるコード、ユーティリティ、型定義などを提供します。

## 機能

- **型定義**: 共通の型定義（JWT、コンテキスト型など）
- **認証ミドルウェア**: JWT認証およびヘッダーベース認証
- **データベースユーティリティ**: Drizzle ORMを使用したD1データベース操作のヘルパー
- **エラー処理**: 標準化されたエラークラスとエラーハンドラー

## 使用方法

各ワーカープロジェクトの `tsconfig.json` にパスエイリアスが設定されているため、以下のように簡単にインポートできます:

```typescript
// 全ての機能をインポート
import * as common from "@worker/common";

// または特定の機能のみをインポート
import { createAuthMiddleware, AppContext } from "@worker/common";
import { getDb, getCurrentTimestamp } from "@worker/common";
import { AppError, NotFoundError, errorHandler } from "@worker/common";
```

## JWT認証ミドルウェアの使用例

```typescript
import { Hono } from "hono";
import { AppContext, createAuthMiddleware } from "@worker/common";

// ワーカー固有のBindingsを定義
type MyBindings = {
  DB: D1Database;
  JWT_SECRET: string;
  // その他のBindings...
};

type MyAppContext = AppContext<MyBindings>;

const app = new Hono<MyAppContext>();

// 認証ミドルウェアのインスタンスを作成
const authMiddleware = createAuthMiddleware<MyBindings>();

// 認証が必要なエンドポイントにミドルウェアを適用
app.use("/protected/*", authMiddleware);

app.get("/protected/resource", (c) => {
  const jwtPayload = c.get("jwtPayload");
  return c.json({ message: `Hello ${jwtPayload.username}!` });
});

export default app;
```

## ヘッダーベース認証ミドルウェアの使用例 (ゲートウェイ経由の内部通信向け)

```typescript
import { Hono } from "hono";
import { AppContext, createHeaderAuthMiddleware } from "@worker/common";

// ワーカー固有のBindingsを定義
type MyBindings = {
  DB: D1Database;
  // その他のBindings...
};

type MyAppContext = AppContext<MyBindings>;

const app = new Hono<MyAppContext>();

// ヘッダーベース認証ミドルウェアのインスタンスを作成
const headerAuthMiddleware = createHeaderAuthMiddleware();

// 全てのエンドポイントにミドルウェアを適用
app.use("*", headerAuthMiddleware);

app.get("/api/resource", (c) => {
  const userId = c.get("userId");
  const username = c.get("username");
  return c.json({ message: `Hello ${username} (ID: ${userId})!` });
});

export default app;
```

## エラー処理の使用例

```typescript
import { Hono } from "hono";
import { 
  AppContext, 
  NotFoundError, 
  AuthorizationError, 
  errorHandler 
} from "@worker/common";

const app = new Hono<AppContext>();

// グローバルエラーハンドラーとして設定
app.onError(errorHandler);

app.get("/api/resource/:id", (c) => {
  const id = c.req.param("id");
  
  // リソースが存在しない場合
  if (!resourceExists(id)) {
    throw new NotFoundError(`ID ${id} のリソースが見つかりません`);
  }
  
  // アクセス権がない場合
  if (!hasAccess(id, c.get("userId"))) {
    throw new AuthorizationError("このリソースへのアクセス権がありません");
  }
  
  // 正常処理
  return c.json(getResource(id));
});

export default app;
``` 