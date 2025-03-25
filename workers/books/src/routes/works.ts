import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createWorkRequestSchema } from "@project/shared/schemas/api/createWork";
import { getWorksQueryParamsSchema } from "@project/shared/schemas/api/getWorks";
import { updateWorkRequestSchema } from "@project/shared/schemas/api/updateWork";
import * as worksController from "../controllers/works";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// 案件一覧取得
app.get("/", zValidator("query", getWorksQueryParamsSchema), async (c) => {
  return await worksController.getWorks(c);
});

// 案件作成
app.post("/", zValidator("json", createWorkRequestSchema), async (c) => {
  return await worksController.createWork(c);
});

// 案件詳細取得
app.get("/:workId", async (c) => {
  return await worksController.getWorkById(c);
});

// 案件更新
app.put("/:workId", zValidator("json", updateWorkRequestSchema), async (c) => {
  return await worksController.updateWork(c);
});

// 案件削除
app.delete("/:workId", async (c) => {
  return await worksController.deleteWork(c);
});

export default app;
