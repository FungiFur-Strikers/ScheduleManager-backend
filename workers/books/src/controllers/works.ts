import { Context } from "hono";
import { eq, and, like, gte, lte, sql } from "drizzle-orm";
import { works, books } from "../../schema";
import {
  getDb,
  getCurrentTimestamp,
  getUserIdFromRequest,
  getUsernameFromRequest,
} from "../utils/db";
import { createWorkResponse } from "@project/shared/schemas/api/createWork";
import { getWorksResponse } from "@project/shared/schemas/api/getWorks";
import { getWorkByIdResponse } from "@project/shared/schemas/api/getWorkById";
import { updateWorkResponse } from "@project/shared/schemas/api/updateWork";
import { count } from "drizzle-orm";

// 案件作成
export const createWork = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const body = await c.req.json();

  if (isNaN(bookId)) {
    return c.json({ error: "無効なスケジュール帳IDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // スケジュール帳の存在確認
    const [book] = await db
      .select()
      .from(books)
      .where(and(eq(books.bookId, bookId), eq(books.delFlg, 0)));

    if (!book) {
      return c.json({ error: "スケジュール帳が見つかりません" }, 404);
    }

    // ユーザーIDの確認
    if (book.userId !== userId) {
      return c.json({ error: "権限がありません" }, 403);
    }

    const now = getCurrentTimestamp();

    // 案件の作成
    const result = await db.insert(works).values({
      bookId,
      workName: body.workName,
      hourlyPay: body.hourlyPay,
      unitPrice: body.unitPrice,
      company: body.company,
      agent: body.agent,
      remarks: body.remarks,
      updateTime: now,
      updateUserId: userId,
      createTime: now,
      createUserId: userId,
    });

    // 作成した案件の取得
    const [createdWork] = await db
      .select()
      .from(works)
      .where(eq(works.workId, result.meta.last_row_id));

    return c.json(
      {
        id: createdWork.workId,
        bookId: createdWork.bookId,
        workName: createdWork.workName,
        hourlyPay: createdWork.hourlyPay,
        unitPrice: createdWork.unitPrice,
        company: createdWork.company,
        agent: createdWork.agent,
        remarks: createdWork.remarks,
        delFlg: createdWork.delFlg === 1,
        updateCnt: createdWork.updateCnt,
        updateTime: createdWork.updateTime,
        updateUserId: createdWork.updateUserId,
        createTime: createdWork.createTime,
        createUserId: createdWork.createUserId,
      } as createWorkResponse,
      201
    );
  } catch (error) {
    console.error("Error creating work:", error);
    return c.json({ error: "案件の作成に失敗しました" }, 500);
  }
};

// 案件更新
export const updateWork = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const workId = Number(c.req.param("workId"));
  const body = await c.req.json();

  if (isNaN(bookId) || isNaN(workId)) {
    return c.json({ error: "無効なIDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // スケジュール帳の存在確認とアクセス権確認
    const [book] = await db
      .select()
      .from(books)
      .where(and(eq(books.bookId, bookId), eq(books.delFlg, 0)));

    if (!book) {
      return c.json({ error: "スケジュール帳が見つかりません" }, 404);
    }

    if (book.userId !== userId) {
      return c.json({ error: "権限がありません" }, 403);
    }

    // 対象の案件を取得
    const [work] = await db
      .select()
      .from(works)
      .where(
        and(
          eq(works.workId, workId),
          eq(works.bookId, bookId),
          eq(works.delFlg, 0)
        )
      );

    if (!work) {
      return c.json({ error: "案件が見つかりません" }, 404);
    }

    const now = getCurrentTimestamp();

    // 更新処理
    await db
      .update(works)
      .set({
        workName: body.workName,
        hourlyPay: body.hourlyPay,
        unitPrice: body.unitPrice,
        company: body.company,
        agent: body.agent,
        remarks: body.remarks,
        updateCnt: work.updateCnt + 1,
        updateTime: now,
        updateUserId: userId,
      })
      .where(eq(works.workId, workId));

    // 更新後のデータを取得
    const [updatedWork] = await db
      .select()
      .from(works)
      .where(eq(works.workId, workId));

    return c.json({
      id: updatedWork.workId,
      bookId: updatedWork.bookId,
      workName: updatedWork.workName,
      hourlyPay: updatedWork.hourlyPay,
      unitPrice: updatedWork.unitPrice,
      company: updatedWork.company,
      agent: updatedWork.agent,
      remarks: updatedWork.remarks,
      delFlg: updatedWork.delFlg === 1,
      updateCnt: updatedWork.updateCnt,
      updateTime: updatedWork.updateTime,
      updateUserId: updatedWork.updateUserId,
      createTime: updatedWork.createTime,
      createUserId: updatedWork.createUserId,
    } as updateWorkResponse);
  } catch (error) {
    console.error("Error updating work:", error);
    return c.json({ error: "案件の更新に失敗しました" }, 500);
  }
};

// 案件削除
export const deleteWork = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const workId = Number(c.req.param("workId"));

  if (isNaN(bookId) || isNaN(workId)) {
    return c.json({ error: "無効なIDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // スケジュール帳の存在確認とアクセス権確認
    const [book] = await db
      .select()
      .from(books)
      .where(and(eq(books.bookId, bookId), eq(books.delFlg, 0)));

    if (!book) {
      return c.json({ error: "スケジュール帳が見つかりません" }, 404);
    }

    if (book.userId !== userId) {
      return c.json({ error: "権限がありません" }, 403);
    }

    // 対象の案件を取得
    const [work] = await db
      .select()
      .from(works)
      .where(
        and(
          eq(works.workId, workId),
          eq(works.bookId, bookId),
          eq(works.delFlg, 0)
        )
      );

    if (!work) {
      return c.json({ error: "案件が見つかりません" }, 404);
    }

    const now = getCurrentTimestamp();

    // 論理削除（delFlgを1に設定）
    await db
      .update(works)
      .set({
        delFlg: 1,
        updateCnt: work.updateCnt + 1,
        updateTime: now,
        updateUserId: userId,
      })
      .where(eq(works.workId, workId));

    // 204 No Content を返す
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting work:", error);
    return c.json({ error: "案件の削除に失敗しました" }, 500);
  }
};

// 案件一覧取得
export const getWorks = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(bookId)) {
    return c.json({ error: "無効なスケジュール帳IDです" }, 400);
  }

  // クエリパラメータの取得
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 20;
  const offset = (page - 1) * limit;

  // 検索条件
  const company = c.req.query("company");
  const agent = c.req.query("agent");
  const workName = c.req.query("workName");
  const minHourlyPay = Number(c.req.query("minHourlyPay")) || undefined;
  const maxHourlyPay = Number(c.req.query("maxHourlyPay")) || undefined;
  const minUnitPrice = Number(c.req.query("minUnitPrice")) || undefined;
  const maxUnitPrice = Number(c.req.query("maxUnitPrice")) || undefined;

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // スケジュール帳の存在確認とアクセス権確認
    const [book] = await db
      .select()
      .from(books)
      .where(and(eq(books.bookId, bookId), eq(books.delFlg, 0)));

    if (!book) {
      return c.json({ error: "スケジュール帳が見つかりません" }, 404);
    }

    if (book.userId !== userId) {
      return c.json({ error: "権限がありません" }, 403);
    }

    // クエリを構築する条件配列
    const conditions = [eq(works.bookId, bookId), eq(works.delFlg, 0)];

    // 検索条件がある場合は追加
    if (company) {
      conditions.push(sql`${works.company} LIKE ${"%" + company + "%"}`);
    }
    if (agent) {
      conditions.push(sql`${works.agent} LIKE ${"%" + agent + "%"}`);
    }
    if (workName) {
      conditions.push(sql`${works.workName} LIKE ${"%" + workName + "%"}`);
    }
    if (minHourlyPay !== undefined) {
      conditions.push(gte(works.hourlyPay, minHourlyPay));
    }
    if (maxHourlyPay !== undefined) {
      conditions.push(lte(works.hourlyPay, maxHourlyPay));
    }
    if (minUnitPrice !== undefined) {
      conditions.push(gte(works.unitPrice, minUnitPrice));
    }
    if (maxUnitPrice !== undefined) {
      conditions.push(lte(works.unitPrice, maxUnitPrice));
    }

    // 総件数の取得
    const [result] = await db
      .select({ value: count() })
      .from(works)
      .where(and(...conditions));

    const totalCount = result?.value || 0;

    // データの取得
    const worksList = await db
      .select()
      .from(works)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    // レスポンスの整形
    const formattedWorks = worksList.map((work) => ({
      id: work.workId,
      bookId: work.bookId,
      workName: work.workName,
      hourlyPay: work.hourlyPay,
      unitPrice: work.unitPrice,
      company: work.company,
      agent: work.agent,
      remarks: work.remarks,
      delFlg: work.delFlg === 1,
      updateCnt: work.updateCnt,
      updateTime: work.updateTime,
      updateUserId: work.updateUserId,
      createTime: work.createTime,
      createUserId: work.createUserId,
    }));

    return c.json({
      data: formattedWorks,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    } as getWorksResponse);
  } catch (error) {
    console.error("Error fetching works:", error);
    return c.json({ error: "案件一覧の取得に失敗しました" }, 500);
  }
};

// 案件詳細取得
export const getWorkById = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const workId = Number(c.req.param("workId"));

  if (isNaN(bookId) || isNaN(workId)) {
    return c.json({ error: "無効なIDです" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // スケジュール帳の存在確認とアクセス権確認
    const [book] = await db
      .select()
      .from(books)
      .where(and(eq(books.bookId, bookId), eq(books.delFlg, 0)));

    if (!book) {
      return c.json({ error: "スケジュール帳が見つかりません" }, 404);
    }

    if (book.userId !== userId) {
      return c.json({ error: "権限がありません" }, 403);
    }

    // 対象の案件を取得
    const [work] = await db
      .select()
      .from(works)
      .where(
        and(
          eq(works.workId, workId),
          eq(works.bookId, bookId),
          eq(works.delFlg, 0)
        )
      );

    if (!work) {
      return c.json({ error: "案件が見つかりません" }, 404);
    }

    return c.json({
      id: work.workId,
      bookId: work.bookId,
      workName: work.workName,
      hourlyPay: work.hourlyPay,
      unitPrice: work.unitPrice,
      company: work.company,
      agent: work.agent,
      remarks: work.remarks,
      delFlg: work.delFlg === 1,
      updateCnt: work.updateCnt,
      updateTime: work.updateTime,
      updateUserId: work.updateUserId,
      createTime: work.createTime,
      createUserId: work.createUserId,
    } as getWorkByIdResponse);
  } catch (error) {
    console.error("Error fetching work:", error);
    return c.json({ error: "案件の取得に失敗しました" }, 500);
  }
};
