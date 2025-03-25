import { Context } from "hono";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { notices, noticeReads } from "../../schema";
import { Notice } from "@project/shared/schemas";
import { validateBookAccess } from "../utils/validation";
import { getCurrentTimestamp, getUserIdFromRequest } from "../utils/db";
import { drizzle } from "drizzle-orm/d1";

// お知らせ一覧取得
export const getNotices = async (c: Context) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);

    // スケジュール帳へのアクセス権を検証
    const hasAccess = await validateBookAccess(c.env.DB, userId, bookId);
    if (!hasAccess) {
      return c.json({ error: "アクセス権限がありません" }, 403);
    }

    // クエリパラメータを取得
    const query = c.req.query();
    const page = parseInt(query.page || "1", 10);
    const limit = parseInt(query.limit || "20", 10);
    const fromDate = query.fromDate;
    const toDate = query.toDate;
    const unreadOnly = query.unreadOnly === "true";

    const offset = (page - 1) * limit;

    // クエリ条件を構築
    const conditions = [eq(notices.bookId, bookId), eq(notices.delFlg, 0)];

    if (fromDate) {
      conditions.push(gte(notices.date, fromDate));
    }

    if (toDate) {
      conditions.push(lte(notices.date, toDate));
    }

    // お知らせ一覧を取得
    const db = c.env.DB;
    const drizzleDb = drizzle(db);
    const noticesList = await drizzleDb
      .select()
      .from(notices)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset)
      .all();

    // 未読のみフィルタリングが指定されている場合
    let filteredNotices = noticesList;
    if (unreadOnly) {
      // 既読状態を確認
      const noticeIds = noticesList.map((notice: any) => notice.noticeId);

      if (noticeIds.length > 0) {
        const readStatuses = await drizzleDb
          .select()
          .from(noticeReads)
          .where(and(eq(noticeReads.userId, userId), eq(noticeReads.delFlg, 0)))
          .all();

        const readNoticeIds = new Set(
          readStatuses.map((status: any) => status.noticeId)
        );

        // 未読のお知らせのみをフィルタリング
        filteredNotices = noticesList.filter(
          (notice: any) => !readNoticeIds.has(notice.noticeId)
        );
      }
    }

    // 総件数を取得
    const countResult = await drizzleDb
      .select({ count: sql`count(*)` })
      .from(notices)
      .where(and(...conditions))
      .get();

    const totalItems = Number(countResult?.count || 0);
    const totalPages = Math.ceil(totalItems / limit);

    // レスポンスデータの整形
    const noticesData = filteredNotices.map((notice: any) => ({
      id: notice.noticeId,
      bookId: notice.bookId,
      disUserId: notice.disUserId,
      disRole: notice.disRole,
      date: notice.date,
      delDate: notice.delDate,
      remarks: notice.remarks,
      delFlg: notice.delFlg === 1,
      updateCnt: notice.updateCnt,
      updateTime: notice.updateTime,
      updateUserId: notice.updateUserId,
      createTime: notice.createTime,
      createUserId: notice.createUserId,
    }));

    return c.json({
      data: noticesData,
      meta: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("お知らせ一覧取得エラー:", error);
    return c.json({ error: "お知らせ一覧の取得に失敗しました" }, 500);
  }
};

// お知らせ作成
export const createNotice = async (c: Context) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);

    // スケジュール帳へのアクセス権を検証
    const hasAccess = await validateBookAccess(c.env.DB, userId, bookId);
    if (!hasAccess) {
      return c.json({ error: "アクセス権限がありません" }, 403);
    }

    // リクエストボディを取得
    const body = await c.req.json();
    const { date, disUserId, disRole, remarks } = body;

    const currentTime = getCurrentTimestamp();

    // お知らせを作成
    const db = c.env.DB;
    const drizzleDb = drizzle(db);
    const result = await drizzleDb
      .insert(notices)
      .values({
        bookId,
        date,
        disUserId,
        disRole,
        remarks,
        delFlg: 0,
        updateCnt: 0,
        updateTime: currentTime,
        updateUserId: userId,
        createTime: currentTime,
        createUserId: userId,
      })
      .returning()
      .get();

    // レスポンスデータの整形
    const noticeData: Notice = {
      id: result.noticeId,
      bookId: result.bookId,
      disUserId: result.disUserId ?? undefined,
      disRole: result.disRole ?? undefined,
      date: result.date,
      delDate: result.delDate ?? undefined,
      remarks: result.remarks ?? undefined,
      delFlg: result.delFlg === 1,
      updateCnt: result.updateCnt,
      updateTime: result.updateTime,
      updateUserId: result.updateUserId,
      createTime: result.createTime,
      createUserId: result.createUserId,
    };

    return c.json(noticeData, 201);
  } catch (error) {
    console.error("お知らせ作成エラー:", error);
    return c.json({ error: "お知らせの作成に失敗しました" }, 500);
  }
};

// お知らせ詳細取得
export const getNoticeById = async (c: Context) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const noticeId = parseInt(c.req.param("noticeId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);

    // スケジュール帳へのアクセス権を検証
    const hasAccess = await validateBookAccess(c.env.DB, userId, bookId);
    if (!hasAccess) {
      return c.json({ error: "アクセス権限がありません" }, 403);
    }

    // お知らせを取得
    const db = c.env.DB;
    const drizzleDb = drizzle(db);
    const notice = await drizzleDb
      .select()
      .from(notices)
      .where(
        and(
          eq(notices.noticeId, noticeId),
          eq(notices.bookId, bookId),
          eq(notices.delFlg, 0)
        )
      )
      .get();

    if (!notice) {
      return c.json({ error: "お知らせが見つかりません" }, 404);
    }

    // レスポンスデータの整形
    const noticeData: Notice = {
      id: notice.noticeId,
      bookId: notice.bookId,
      disUserId: notice.disUserId ?? undefined,
      disRole: notice.disRole ?? undefined,
      date: notice.date,
      delDate: notice.delDate ?? undefined,
      remarks: notice.remarks ?? undefined,
      delFlg: notice.delFlg === 1,
      updateCnt: notice.updateCnt,
      updateTime: notice.updateTime,
      updateUserId: notice.updateUserId,
      createTime: notice.createTime,
      createUserId: notice.createUserId,
    };

    return c.json(noticeData);
  } catch (error) {
    console.error("お知らせ詳細取得エラー:", error);
    return c.json({ error: "お知らせの取得に失敗しました" }, 500);
  }
};

// お知らせ更新
export const updateNotice = async (c: Context) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const noticeId = parseInt(c.req.param("noticeId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);

    // スケジュール帳へのアクセス権を検証
    const hasAccess = await validateBookAccess(c.env.DB, userId, bookId);
    if (!hasAccess) {
      return c.json({ error: "アクセス権限がありません" }, 403);
    }

    // お知らせの存在確認
    const db = c.env.DB;
    const drizzleDb = drizzle(db);
    const existingNotice = await drizzleDb
      .select()
      .from(notices)
      .where(
        and(
          eq(notices.noticeId, noticeId),
          eq(notices.bookId, bookId),
          eq(notices.delFlg, 0)
        )
      )
      .get();

    if (!existingNotice) {
      return c.json({ error: "お知らせが見つかりません" }, 404);
    }

    // リクエストボディを取得
    const body = await c.req.json();
    const { date, disUserId, disRole, remarks } = body;

    const currentTime = getCurrentTimestamp();

    // お知らせを更新
    const result = await drizzleDb
      .update(notices)
      .set({
        date,
        disUserId,
        disRole,
        remarks,
        updateCnt: existingNotice.updateCnt + 1,
        updateTime: currentTime,
        updateUserId: userId,
      })
      .where(eq(notices.noticeId, noticeId))
      .returning()
      .get();

    // レスポンスデータの整形
    const noticeData: Notice = {
      id: result.noticeId,
      bookId: result.bookId,
      disUserId: result.disUserId ?? undefined,
      disRole: result.disRole ?? undefined,
      date: result.date,
      delDate: result.delDate ?? undefined,
      remarks: result.remarks ?? undefined,
      delFlg: result.delFlg === 1,
      updateCnt: result.updateCnt,
      updateTime: result.updateTime,
      updateUserId: result.updateUserId,
      createTime: result.createTime,
      createUserId: result.createUserId,
    };

    return c.json(noticeData);
  } catch (error) {
    console.error("お知らせ更新エラー:", error);
    return c.json({ error: "お知らせの更新に失敗しました" }, 500);
  }
};

// お知らせ削除
export const deleteNotice = async (c: Context) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const noticeId = parseInt(c.req.param("noticeId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);

    // スケジュール帳へのアクセス権を検証
    const hasAccess = await validateBookAccess(c.env.DB, userId, bookId);
    if (!hasAccess) {
      return c.json({ error: "アクセス権限がありません" }, 403);
    }

    // お知らせの存在確認
    const db = c.env.DB;
    const drizzleDb = drizzle(db);
    const existingNotice = await drizzleDb
      .select()
      .from(notices)
      .where(
        and(
          eq(notices.noticeId, noticeId),
          eq(notices.bookId, bookId),
          eq(notices.delFlg, 0)
        )
      )
      .get();

    if (!existingNotice) {
      return c.json({ error: "お知らせが見つかりません" }, 404);
    }

    const currentTime = getCurrentTimestamp();

    // お知らせを論理削除
    await drizzleDb
      .update(notices)
      .set({
        delFlg: 1,
        updateCnt: existingNotice.updateCnt + 1,
        updateTime: currentTime,
        updateUserId: userId,
      })
      .where(eq(notices.noticeId, noticeId))
      .run();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("お知らせ削除エラー:", error);
    return c.json({ error: "お知らせの削除に失敗しました" }, 500);
  }
};

// お知らせを既読にする
export const markNoticeAsRead = async (c: Context) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const noticeId = parseInt(c.req.param("noticeId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);

    // スケジュール帳へのアクセス権を検証
    const hasAccess = await validateBookAccess(c.env.DB, userId, bookId);
    if (!hasAccess) {
      return c.json({ error: "アクセス権限がありません" }, 403);
    }

    // お知らせの存在確認
    const db = c.env.DB;
    const drizzleDb = drizzle(db);
    const existingNotice = await drizzleDb
      .select()
      .from(notices)
      .where(
        and(
          eq(notices.noticeId, noticeId),
          eq(notices.bookId, bookId),
          eq(notices.delFlg, 0)
        )
      )
      .get();

    if (!existingNotice) {
      return c.json({ error: "お知らせが見つかりません" }, 404);
    }

    // 既読状態の確認
    const existingRead = await drizzleDb
      .select()
      .from(noticeReads)
      .where(
        and(
          eq(noticeReads.noticeId, noticeId),
          eq(noticeReads.userId, userId),
          eq(noticeReads.delFlg, 0)
        )
      )
      .get();

    // 既に既読の場合は204を返す
    if (existingRead) {
      return new Response(null, { status: 204 });
    }

    const currentTime = getCurrentTimestamp();

    // 既読レコードを作成
    await drizzleDb
      .insert(noticeReads)
      .values({
        noticeId,
        userId,
        readTime: currentTime,
        delFlg: 0,
        updateCnt: 0,
        updateTime: currentTime,
        updateUserId: userId,
        createTime: currentTime,
        createUserId: userId,
      })
      .run();

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("お知らせ既読エラー:", error);
    return c.json({ error: "お知らせの既読処理に失敗しました" }, 500);
  }
};
