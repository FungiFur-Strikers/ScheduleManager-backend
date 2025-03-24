import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { eq, and, count } from "drizzle-orm";
import { categories } from "../../schema";
import { getDb, getCurrentTimestamp, getUserIdFromRequest } from "../utils/db";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

/**
 * カテゴリ一覧を取得する
 */
export const getCategories = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);

    // クエリパラメータから取得
    const queryParams = c.req.query();
    const page = Number(queryParams.page || "1");
    const limit = Number(queryParams.limit || "20");
    const offset = (page - 1) * limit;

    const db = getDb(c.env.DB);

    // 指定されたスケジュール帳のカテゴリを取得
    const results = await db
      .select()
      .from(categories)
      .where(and(eq(categories.bookId, bookId), eq(categories.delFlg, 0)))
      .limit(limit)
      .offset(offset);

    // 総件数を取得
    const [totalCountResult] = await db
      .select({ value: count() })
      .from(categories)
      .where(and(eq(categories.bookId, bookId), eq(categories.delFlg, 0)));

    const totalItems = totalCountResult?.value || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // レスポンス形式に変換
    const categoriesList = results.map((category) => ({
      id: category.categoryId,
      bookId: category.bookId,
      categoryName: category.categoryName,
      incomeFlg: Boolean(category.incomeFlg),
      delFlg: Boolean(category.delFlg),
      updateCnt: category.updateCnt,
      updateTime: category.updateTime,
      updateUserId: category.updateUserId,
      createTime: category.createTime,
      createUserId: category.createUserId,
    }));

    return c.json({
      data: categoriesList,
      meta: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * カテゴリを作成する
 */
export const createCategory = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryData = await c.req.json();
    const userId = getUserIdFromRequest(c.req.raw);
    const currentTimestamp = getCurrentTimestamp();

    const db = getDb(c.env.DB);

    // カテゴリを作成
    const result = await db
      .insert(categories)
      .values({
        bookId,
        categoryName: categoryData.categoryName,
        incomeFlg: categoryData.incomeFlg ? 1 : 0,
        delFlg: 0,
        updateCnt: 0,
        updateTime: currentTimestamp,
        updateUserId: userId,
        createTime: currentTimestamp,
        createUserId: userId,
      })
      .returning();

    if (!result || result.length === 0) {
      throw new HTTPException(500, { message: "カテゴリの作成に失敗しました" });
    }

    const newCategory = result[0];

    // レスポンス形式に変換
    const category = {
      id: newCategory.categoryId,
      bookId: newCategory.bookId,
      categoryName: newCategory.categoryName,
      incomeFlg: Boolean(newCategory.incomeFlg),
      delFlg: Boolean(newCategory.delFlg),
      updateCnt: newCategory.updateCnt,
      updateTime: newCategory.updateTime,
      updateUserId: newCategory.updateUserId,
      createTime: newCategory.createTime,
      createUserId: newCategory.createUserId,
    };

    return c.json(category, 201);
  } catch (error) {
    console.error("Error creating category:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * カテゴリ詳細を取得する
 */
export const getCategoryById = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);

    const db = getDb(c.env.DB);

    // 指定されたカテゴリを取得
    const result = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.categoryId, categoryId),
          eq(categories.bookId, bookId),
          eq(categories.delFlg, 0)
        )
      )
      .limit(1);

    if (!result || result.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    const category = result[0];

    // レスポンス形式に変換
    return c.json({
      id: category.categoryId,
      bookId: category.bookId,
      categoryName: category.categoryName,
      incomeFlg: Boolean(category.incomeFlg),
      delFlg: Boolean(category.delFlg),
      updateCnt: category.updateCnt,
      updateTime: category.updateTime,
      updateUserId: category.updateUserId,
      createTime: category.createTime,
      createUserId: category.createUserId,
    });
  } catch (error) {
    console.error("Error fetching category:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * カテゴリを更新する
 */
export const updateCategory = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);
    const categoryData = await c.req.json();
    const userId = getUserIdFromRequest(c.req.raw);
    const currentTimestamp = getCurrentTimestamp();

    const db = getDb(c.env.DB);

    // 更新対象のカテゴリが存在するか確認
    const existingCategory = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.categoryId, categoryId),
          eq(categories.bookId, bookId),
          eq(categories.delFlg, 0)
        )
      )
      .limit(1);

    if (!existingCategory || existingCategory.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    // カテゴリを更新
    const result = await db
      .update(categories)
      .set({
        categoryName: categoryData.categoryName,
        incomeFlg: categoryData.incomeFlg ? 1 : 0,
        updateCnt: existingCategory[0].updateCnt + 1,
        updateTime: currentTimestamp,
        updateUserId: userId,
      })
      .where(
        and(
          eq(categories.categoryId, categoryId),
          eq(categories.bookId, bookId)
        )
      )
      .returning();

    if (!result || result.length === 0) {
      throw new HTTPException(500, { message: "カテゴリの更新に失敗しました" });
    }

    const updatedCategory = result[0];

    // レスポンス形式に変換
    return c.json({
      id: updatedCategory.categoryId,
      bookId: updatedCategory.bookId,
      categoryName: updatedCategory.categoryName,
      incomeFlg: Boolean(updatedCategory.incomeFlg),
      delFlg: Boolean(updatedCategory.delFlg),
      updateCnt: updatedCategory.updateCnt,
      updateTime: updatedCategory.updateTime,
      updateUserId: updatedCategory.updateUserId,
      createTime: updatedCategory.createTime,
      createUserId: updatedCategory.createUserId,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * カテゴリを削除する（論理削除）
 */
export const deleteCategory = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);
    const currentTimestamp = getCurrentTimestamp();

    const db = getDb(c.env.DB);

    // 削除対象のカテゴリが存在するか確認
    const existingCategory = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.categoryId, categoryId),
          eq(categories.bookId, bookId),
          eq(categories.delFlg, 0)
        )
      )
      .limit(1);

    if (!existingCategory || existingCategory.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    // カテゴリを論理削除
    await db
      .update(categories)
      .set({
        delFlg: 1,
        updateCnt: existingCategory[0].updateCnt + 1,
        updateTime: currentTimestamp,
        updateUserId: userId,
      })
      .where(
        and(
          eq(categories.categoryId, categoryId),
          eq(categories.bookId, bookId)
        )
      );

    // 204 No Content を返す
    return c.body(null, 204);
  } catch (error) {
    console.error("Error deleting category:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};
