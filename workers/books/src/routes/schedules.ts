import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createScheduleRequestSchema } from "@project/shared/schemas/api/createSchedule";
import { getSchedulesQueryParamsSchema } from "@project/shared/schemas/api/getSchedules";
import { updateScheduleRequestSchema } from "@project/shared/schemas/api/updateSchedule";
import * as schedulesController from "../controllers/schedules";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// スケジュール一覧取得
app.get("/", zValidator("query", getSchedulesQueryParamsSchema), async (c) => {
  return await schedulesController.getSchedules(c);
});

// スケジュール作成
app.post("/", zValidator("json", createScheduleRequestSchema), async (c) => {
  return await schedulesController.createSchedule(c);
});

// スケジュール詳細取得
app.get("/:scheduleId", async (c) => {
  return await schedulesController.getScheduleById(c);
});

// スケジュール更新
app.put(
  "/:scheduleId",
  zValidator("json", updateScheduleRequestSchema),
  async (c) => {
    return await schedulesController.updateSchedule(c);
  }
);

// スケジュール削除
app.delete("/:scheduleId", async (c) => {
  return await schedulesController.deleteSchedule(c);
});

export default app;
