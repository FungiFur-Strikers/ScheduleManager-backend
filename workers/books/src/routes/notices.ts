import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createNoticeRequestSchema } from "@project/shared/schemas/api/createNotice";
import { getNoticesQueryParamsSchema } from "@project/shared/schemas/api/getNotices";
import { updateNoticeRequestSchema } from "@project/shared/schemas/api/updateNotice";
import * as noticesController from "../controllers/notices";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// お知らせ一覧取得
app.get("/", zValidator("query", getNoticesQueryParamsSchema), async (c) => {
  return await noticesController.getNotices(c);
});

// お知らせ作成
app.post("/", zValidator("json", createNoticeRequestSchema), async (c) => {
  return await noticesController.createNotice(c);
});

// お知らせ詳細取得
app.get("/:noticeId", async (c) => {
  return await noticesController.getNoticeById(c);
});

// お知らせ更新
app.put(
  "/:noticeId",
  zValidator("json", updateNoticeRequestSchema),
  async (c) => {
    return await noticesController.updateNotice(c);
  }
);

// お知らせ削除
app.delete("/:noticeId", async (c) => {
  return await noticesController.deleteNotice(c);
});

// お知らせを既読にする
app.post("/:noticeId/read", async (c) => {
  return await noticesController.markNoticeAsRead(c);
});

export default app;
