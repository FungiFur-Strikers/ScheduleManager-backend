import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { eq, and, count } from "drizzle-orm";
import { subcategories, categories } from "../../schema";
import { getDb, getCurrentTimestamp, getUserIdFromRequest } from "../utils/db";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

/**
 * サブカテゴリ一覧を取得する
 */
export const getSubcategories = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);

    // クエリパラメータから取得
    const queryParams = c.req.query();
    const page = Number(queryParams.page || "1");
    const limit = Number(queryParams.limit || "20");
    const offset = (page - 1) * limit;

    const db = getDb(c.env.DB);

    // カテゴリの存在確認
    const categoryExists = await db
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

    if (!categoryExists || categoryExists.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    // 指定されたカテゴリのサブカテゴリを取得
    const results = await db
      .select()
      .from(subcategories)
      .where(
        and(
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.delFlg, 0)
        )
      )
      .limit(limit)
      .offset(offset);

    // 総件数を取得
    const [totalCountResult] = await db
      .select({ value: count() })
      .from(subcategories)
      .where(
        and(
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.delFlg, 0)
        )
      );

    const totalItems = totalCountResult?.value || 0;
    const totalPages = Math.ceil(totalItems / limit);

    // レスポンス形式に変換
    const subcategoriesList = results.map((subcategory) => ({
      id: subcategory.subcategoryId,
      categoryId: subcategory.categoryId,
      subcategoryName: subcategory.subcategoryName,
      delFlg: Boolean(subcategory.delFlg),
      updateCnt: subcategory.updateCnt,
      updateTime: subcategory.updateTime,
      updateUserId: subcategory.updateUserId,
      createTime: subcategory.createTime,
      createUserId: subcategory.createUserId,
    }));

    return c.json({
      data: subcategoriesList,
      meta: {
        totalItems,
        itemsPerPage: limit,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * サブカテゴリを作成する
 */
export const createSubcategory = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);
    const subcategoryData = await c.req.json();
    const userId = getUserIdFromRequest(c.req.raw);
    const currentTimestamp = getCurrentTimestamp();

    const db = getDb(c.env.DB);

    // カテゴリの存在確認
    const categoryExists = await db
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

    if (!categoryExists || categoryExists.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    // サブカテゴリを作成
    const result = await db
      .insert(subcategories)
      .values({
        categoryId,
        subcategoryName: subcategoryData.subcategoryName,
        delFlg: 0,
        updateCnt: 0,
        updateTime: currentTimestamp,
        updateUserId: userId,
        createTime: currentTimestamp,
        createUserId: userId,
      })
      .returning();

    if (!result || result.length === 0) {
      throw new HTTPException(500, {
        message: "サブカテゴリの作成に失敗しました",
      });
    }

    const newSubcategory = result[0];

    // レスポンス形式に変換
    const subcategory = {
      id: newSubcategory.subcategoryId,
      categoryId: newSubcategory.categoryId,
      subcategoryName: newSubcategory.subcategoryName,
      delFlg: Boolean(newSubcategory.delFlg),
      updateCnt: newSubcategory.updateCnt,
      updateTime: newSubcategory.updateTime,
      updateUserId: newSubcategory.updateUserId,
      createTime: newSubcategory.createTime,
      createUserId: newSubcategory.createUserId,
    };

    return c.json(subcategory, 201);
  } catch (error) {
    console.error("Error creating subcategory:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * サブカテゴリ詳細を取得する
 */
export const getSubcategoryById = async (
  c: Context<{ Bindings: Bindings }>
) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);
    const subcategoryId = parseInt(c.req.param("subcategoryId"), 10);

    const db = getDb(c.env.DB);

    // カテゴリの存在確認
    const categoryExists = await db
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

    if (!categoryExists || categoryExists.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    // 指定されたサブカテゴリを取得
    const result = await db
      .select()
      .from(subcategories)
      .where(
        and(
          eq(subcategories.subcategoryId, subcategoryId),
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.delFlg, 0)
        )
      )
      .limit(1);

    if (!result || result.length === 0) {
      throw new HTTPException(404, { message: "サブカテゴリが見つかりません" });
    }

    const subcategory = result[0];

    // レスポンス形式に変換
    return c.json({
      id: subcategory.subcategoryId,
      categoryId: subcategory.categoryId,
      subcategoryName: subcategory.subcategoryName,
      delFlg: Boolean(subcategory.delFlg),
      updateCnt: subcategory.updateCnt,
      updateTime: subcategory.updateTime,
      updateUserId: subcategory.updateUserId,
      createTime: subcategory.createTime,
      createUserId: subcategory.createUserId,
    });
  } catch (error) {
    console.error("Error fetching subcategory:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * サブカテゴリを更新する
 */
export const updateSubcategory = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);
    const subcategoryId = parseInt(c.req.param("subcategoryId"), 10);
    const subcategoryData = await c.req.json();
    const userId = getUserIdFromRequest(c.req.raw);
    const currentTimestamp = getCurrentTimestamp();

    const db = getDb(c.env.DB);

    // カテゴリの存在確認
    const categoryExists = await db
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

    if (!categoryExists || categoryExists.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    // 更新対象のサブカテゴリが存在するか確認
    const existingSubcategory = await db
      .select()
      .from(subcategories)
      .where(
        and(
          eq(subcategories.subcategoryId, subcategoryId),
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.delFlg, 0)
        )
      )
      .limit(1);

    if (!existingSubcategory || existingSubcategory.length === 0) {
      throw new HTTPException(404, { message: "サブカテゴリが見つかりません" });
    }

    // サブカテゴリを更新
    const result = await db
      .update(subcategories)
      .set({
        subcategoryName: subcategoryData.subcategoryName,
        updateCnt: existingSubcategory[0].updateCnt + 1,
        updateTime: currentTimestamp,
        updateUserId: userId,
      })
      .where(
        and(
          eq(subcategories.subcategoryId, subcategoryId),
          eq(subcategories.categoryId, categoryId)
        )
      )
      .returning();

    if (!result || result.length === 0) {
      throw new HTTPException(500, {
        message: "サブカテゴリの更新に失敗しました",
      });
    }

    const updatedSubcategory = result[0];

    // レスポンス形式に変換
    return c.json({
      id: updatedSubcategory.subcategoryId,
      categoryId: updatedSubcategory.categoryId,
      subcategoryName: updatedSubcategory.subcategoryName,
      delFlg: Boolean(updatedSubcategory.delFlg),
      updateCnt: updatedSubcategory.updateCnt,
      updateTime: updatedSubcategory.updateTime,
      updateUserId: updatedSubcategory.updateUserId,
      createTime: updatedSubcategory.createTime,
      createUserId: updatedSubcategory.createUserId,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};

/**
 * サブカテゴリを削除する
 */
export const deleteSubcategory = async (c: Context<{ Bindings: Bindings }>) => {
  try {
    const bookId = parseInt(c.req.param("bookId"), 10);
    const categoryId = parseInt(c.req.param("categoryId"), 10);
    const subcategoryId = parseInt(c.req.param("subcategoryId"), 10);
    const userId = getUserIdFromRequest(c.req.raw);
    const currentTimestamp = getCurrentTimestamp();

    const db = getDb(c.env.DB);

    // カテゴリの存在確認
    const categoryExists = await db
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

    if (!categoryExists || categoryExists.length === 0) {
      throw new HTTPException(404, { message: "カテゴリが見つかりません" });
    }

    // 削除対象のサブカテゴリが存在するか確認
    const existingSubcategory = await db
      .select()
      .from(subcategories)
      .where(
        and(
          eq(subcategories.subcategoryId, subcategoryId),
          eq(subcategories.categoryId, categoryId),
          eq(subcategories.delFlg, 0)
        )
      )
      .limit(1);

    if (!existingSubcategory || existingSubcategory.length === 0) {
      throw new HTTPException(404, { message: "サブカテゴリが見つかりません" });
    }

    // サブカテゴリを論理削除
    const result = await db
      .update(subcategories)
      .set({
        delFlg: 1,
        updateCnt: existingSubcategory[0].updateCnt + 1,
        updateTime: currentTimestamp,
        updateUserId: userId,
      })
      .where(
        and(
          eq(subcategories.subcategoryId, subcategoryId),
          eq(subcategories.categoryId, categoryId)
        )
      )
      .returning();

    if (!result || result.length === 0) {
      throw new HTTPException(500, {
        message: "サブカテゴリの削除に失敗しました",
      });
    }

    // 204 No Content
    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting subcategory:", error);

    if (error instanceof HTTPException) {
      throw error;
    }

    throw new HTTPException(500, { message: "サーバーエラーが発生しました" });
  }
};
