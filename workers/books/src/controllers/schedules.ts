import { Context } from "hono";
import { eq, and, gte, lte, like } from "drizzle-orm";
import { schedules } from "../../schema";
import {
  getDb,
  getCurrentTimestamp,
  getUserIdFromRequest,
  getUsernameFromRequest,
} from "../utils/db";
import { createScheduleResponse } from "@project/shared/schemas/api/createSchedule";
import { getSchedulesResponse } from "@project/shared/schemas/api/getSchedules";
import { getScheduleByIdResponse } from "@project/shared/schemas/api/getScheduleById";
import { updateScheduleResponse } from "@project/shared/schemas/api/updateSchedule";
import { count } from "drizzle-orm";

// スケジュール作成
export const createSchedule = async (c: Context) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(bookId)) {
    return c.json({ error: "無効なスケジュール帳IDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);
  const username = getUsernameFromRequest(c.req.raw);

  const now = getCurrentTimestamp();

  try {
    const result = await db.insert(schedules).values({
      bookId,
      categoryId: body.categoryId,
      subcategoryId: body.subcategoryId || null,
      startTime: body.startTime,
      endTime: body.endTime,
      title: body.title,
      remarks: body.remarks || null,
      updateTime: now,
      updateUserId: userId,
      createTime: now,
      createUserId: userId,
    });

    const [createdSchedule] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.scheduleId, result.meta.last_row_id));

    return c.json(
      {
        id: createdSchedule.scheduleId,
        bookId: createdSchedule.bookId,
        categoryId: createdSchedule.categoryId,
        subcategoryId: createdSchedule.subcategoryId,
        startTime: createdSchedule.startTime,
        endTime: createdSchedule.endTime,
        title: createdSchedule.title,
        remarks: createdSchedule.remarks,
        delFlg: createdSchedule.delFlg === 1,
        updateCnt: createdSchedule.updateCnt,
        updateTime: createdSchedule.updateTime,
        updateUserId: createdSchedule.updateUserId,
        createTime: createdSchedule.createTime,
        createUserId: createdSchedule.createUserId,
      } as createScheduleResponse,
      201
    );
  } catch (error) {
    console.error("Error creating schedule:", error);
    return c.json({ error: "スケジュールの作成に失敗しました" }, 500);
  }
};

// スケジュール更新
export const updateSchedule = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const scheduleId = Number(c.req.param("scheduleId"));
  const body = await c.req.json();

  if (isNaN(bookId) || isNaN(scheduleId)) {
    return c.json({ error: "無効なIDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // 対象のスケジュールを取得
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(
        and(eq(schedules.scheduleId, scheduleId), eq(schedules.bookId, bookId))
      );

    if (!schedule) {
      return c.json({ error: "スケジュールが見つかりません" }, 404);
    }

    const now = getCurrentTimestamp();

    // 更新処理
    await db
      .update(schedules)
      .set({
        categoryId: body.categoryId,
        subcategoryId: body.subcategoryId || null,
        startTime: body.startTime,
        endTime: body.endTime,
        title: body.title,
        remarks: body.remarks || null,
        updateCnt: schedule.updateCnt + 1,
        updateTime: now,
        updateUserId: userId,
      })
      .where(eq(schedules.scheduleId, scheduleId));

    // 更新後のデータを取得
    const [updatedSchedule] = await db
      .select()
      .from(schedules)
      .where(eq(schedules.scheduleId, scheduleId));

    return c.json({
      id: updatedSchedule.scheduleId,
      bookId: updatedSchedule.bookId,
      categoryId: updatedSchedule.categoryId,
      subcategoryId: updatedSchedule.subcategoryId,
      startTime: updatedSchedule.startTime,
      endTime: updatedSchedule.endTime,
      title: updatedSchedule.title,
      remarks: updatedSchedule.remarks,
      delFlg: updatedSchedule.delFlg === 1,
      updateCnt: updatedSchedule.updateCnt,
      updateTime: updatedSchedule.updateTime,
      updateUserId: updatedSchedule.updateUserId,
      createTime: updatedSchedule.createTime,
      createUserId: updatedSchedule.createUserId,
    } as updateScheduleResponse);
  } catch (error) {
    console.error("Error updating schedule:", error);
    return c.json({ error: "スケジュールの更新に失敗しました" }, 500);
  }
};

// スケジュール削除
export const deleteSchedule = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const scheduleId = Number(c.req.param("scheduleId"));

  if (isNaN(bookId) || isNaN(scheduleId)) {
    return c.json({ error: "無効なIDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // 対象のスケジュールを取得
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(
        and(eq(schedules.scheduleId, scheduleId), eq(schedules.bookId, bookId))
      );

    if (!schedule) {
      return c.json({ error: "スケジュールが見つかりません" }, 404);
    }

    const now = getCurrentTimestamp();

    // 論理削除（delFlgを1に設定）
    await db
      .update(schedules)
      .set({
        delFlg: 1,
        updateCnt: schedule.updateCnt + 1,
        updateTime: now,
        updateUserId: userId,
      })
      .where(eq(schedules.scheduleId, scheduleId));

    // 204 No Content を返す
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    return c.json({ error: "スケジュールの削除に失敗しました" }, 500);
  }
};

// スケジュール一覧取得
export const getSchedules = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(bookId)) {
    return c.json({ error: "無効なスケジュール帳IDです" }, 400);
  }

  // クエリパラメータの取得
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const offset = (page - 1) * limit;
  const categoryId = c.req.query("categoryId")
    ? Number(c.req.query("categoryId"))
    : undefined;
  const subcategoryId = c.req.query("subcategoryId")
    ? Number(c.req.query("subcategoryId"))
    : undefined;
  const startFrom = c.req.query("startFrom");
  const startTo = c.req.query("startTo");
  const endFrom = c.req.query("endFrom");
  const endTo = c.req.query("endTo");
  const title = c.req.query("title");

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // 基本的なWhere条件
    let conditions = [eq(schedules.bookId, bookId), eq(schedules.delFlg, 0)];

    // 各フィルターを条件に追加
    if (categoryId) {
      conditions.push(eq(schedules.categoryId, categoryId));
    }
    if (subcategoryId) {
      conditions.push(eq(schedules.subcategoryId, subcategoryId));
    }
    if (startFrom) {
      conditions.push(gte(schedules.startTime, startFrom));
    }
    if (startTo) {
      conditions.push(lte(schedules.startTime, startTo));
    }
    if (endFrom) {
      conditions.push(gte(schedules.endTime, endFrom));
    }
    if (endTo) {
      conditions.push(lte(schedules.endTime, endTo));
    }
    if (title) {
      conditions.push(like(schedules.title, `%${title}%`));
    }

    // 総件数の取得
    const [countResult] = await db
      .select({ value: count() })
      .from(schedules)
      .where(and(...conditions));

    const totalCount = countResult?.value || 0;

    // データの取得（ソート、ページング適用）
    const schedulesList = await db
      .select()
      .from(schedules)
      .where(and(...conditions))
      .orderBy(schedules.startTime)
      .limit(limit)
      .offset(offset);

    // レスポンスの整形
    const formattedSchedules = schedulesList.map((schedule) => ({
      id: schedule.scheduleId,
      bookId: schedule.bookId,
      categoryId: schedule.categoryId,
      subcategoryId: schedule.subcategoryId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      title: schedule.title,
      remarks: schedule.remarks,
      delFlg: schedule.delFlg === 1,
      updateCnt: schedule.updateCnt,
      updateTime: schedule.updateTime,
      updateUserId: schedule.updateUserId,
      createTime: schedule.createTime,
      createUserId: schedule.createUserId,
    }));

    return c.json({
      data: formattedSchedules,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    } as getSchedulesResponse);
  } catch (error) {
    console.error("Error fetching schedules:", error);
    return c.json({ error: "スケジュールの取得に失敗しました" }, 500);
  }
};

// スケジュール詳細取得
export const getScheduleById = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const scheduleId = Number(c.req.param("scheduleId"));

  if (isNaN(bookId) || isNaN(scheduleId)) {
    return c.json({ error: "無効なIDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    const [schedule] = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.scheduleId, scheduleId),
          eq(schedules.bookId, bookId),
          eq(schedules.delFlg, 0)
        )
      );

    if (!schedule) {
      return c.json({ error: "スケジュールが見つかりません" }, 404);
    }

    return c.json({
      id: schedule.scheduleId,
      bookId: schedule.bookId,
      categoryId: schedule.categoryId,
      subcategoryId: schedule.subcategoryId,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      title: schedule.title,
      remarks: schedule.remarks,
      delFlg: schedule.delFlg === 1,
      updateCnt: schedule.updateCnt,
      updateTime: schedule.updateTime,
      updateUserId: schedule.updateUserId,
      createTime: schedule.createTime,
      createUserId: schedule.createUserId,
    } as getScheduleByIdResponse);
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return c.json({ error: "スケジュールの取得に失敗しました" }, 500);
  }
};
