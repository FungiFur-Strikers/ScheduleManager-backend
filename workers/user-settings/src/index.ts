import { Hono } from "hono";
import userSettingsRoutes from "./routes/user-settings";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/user-settings");

// ユーザー設定関連のルートをマウント
app.route("/", userSettingsRoutes);

export default app;
