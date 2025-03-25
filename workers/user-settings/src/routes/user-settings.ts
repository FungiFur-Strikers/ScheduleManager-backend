import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { updateUserSettingsRequestSchema } from "@project/shared/schemas/api/updateUserSettings";
import * as userSettingsController from "../controllers/user-settings";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// ユーザー設定取得
app.get("/", async (c) => {
  return await userSettingsController.getUserSettings(c);
});

// ユーザー設定作成
app.post("/", async (c) => {
  return await userSettingsController.createUserSettings(c);
});

// ユーザー設定更新
app.put("/", zValidator("json", updateUserSettingsRequestSchema), async (c) => {
  return await userSettingsController.updateUserSettings(c);
});

export default app;
