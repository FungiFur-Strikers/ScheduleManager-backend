import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { updateUserSettingsRequestSchema } from "@project/shared/schemas/api/updateUserSettings";
import * as userSettingsController from "../controllers/user-settings";
import { createHeaderAuthMiddleware, AppContext } from "@worker/common";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string; // AppContextに必要
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: AppContext<Bindings>["Variables"];
}>();

// ヘッダー認証ミドルウェアを適用
app.use("*", createHeaderAuthMiddleware());

// ユーザー設定取得
app.get("/", async (c) => {
  return await userSettingsController.getUserSettings(c);
});

// ユーザー設定作成
app.post(
  "/",
  zValidator("json", updateUserSettingsRequestSchema),
  async (c) => {
    return await userSettingsController.createUserSettings(c);
  }
);

// ユーザー設定更新
app.put("/", zValidator("json", updateUserSettingsRequestSchema), async (c) => {
  return await userSettingsController.updateUserSettings(c);
});

export default app;
