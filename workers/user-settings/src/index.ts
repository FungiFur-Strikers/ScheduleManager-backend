import { Hono } from "hono";
import userSettingsRoutes from "./routes/user-settings";
import { errorHandler } from "@worker/common";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/user-settings");

// エラーハンドラーミドルウェアを追加
app.onError(errorHandler);

// ユーザー設定関連のルートをマウント
app.route("/", userSettingsRoutes);

export default app;
