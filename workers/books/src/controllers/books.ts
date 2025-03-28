import { Context } from "hono";
import { eq, and } from "drizzle-orm";
import { books } from "../../schema";
import {
  getDb,
  getCurrentTimestamp,
  getUserIdFromRequest,
  getUsernameFromRequest,
} from "../utils/db";
import {
  AppError,
  NotFoundError,
  AuthorizationError,
  ValidationError,
} from "@worker/common";
import { createBookResponse } from "@project/shared/schemas/api/createBook";
import { getBooksResponse } from "@project/shared/schemas/api/getBooks";
import { getBookByIdResponse } from "@project/shared/schemas/api/getBookById";
import { updateBookResponse } from "@project/shared/schemas/api/updateBook";
import { count } from "drizzle-orm";

// スケジュール帳作成
export const createBook = async (c: Context) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();

  const userId = getUserIdFromRequest(c.req.raw);
  const username = getUsernameFromRequest(c.req.raw);

  const now = getCurrentTimestamp();

  try {
    const result = await db.insert(books).values({
      userId,
      name: body.name,
      updateTime: now,
      updateUserId: userId,
      createTime: now,
      createUserId: userId,
    });

    const [createdBook] = await db
      .select()
      .from(books)
      .where(eq(books.bookId, result.meta.last_row_id));

    return c.json(
      {
        id: createdBook.bookId,
        userId: createdBook.userId,
        name: createdBook.name,
        delFlg: createdBook.delFlg === 1,
        updateCnt: createdBook.updateCnt,
        updateTime: createdBook.updateTime,
        updateUserId: createdBook.updateUserId,
        createTime: createdBook.createTime,
        createUserId: createdBook.createUserId,
      } as createBookResponse,
      201
    );
  } catch (error) {
    console.error("Error creating book:", error);
    throw new AppError("スケジュール帳の作成に失敗しました", 500);
  }
};

// スケジュール帳更新
export const updateBook = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));
  const body = await c.req.json();

  if (isNaN(bookId)) {
    throw new ValidationError("無効なスケジュール帳IDです");
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // 対象のスケジュール帳を取得
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.bookId, bookId));

    if (!book) {
      throw new NotFoundError("スケジュール帳が見つかりません");
    }

    // ユーザーIDの確認
    if (book.userId !== userId) {
      throw new AuthorizationError(
        "このスケジュール帳へのアクセス権限がありません"
      );
    }

    const now = getCurrentTimestamp();

    // 更新処理
    await db
      .update(books)
      .set({
        name: body.name,
        updateCnt: book.updateCnt + 1,
        updateTime: now,
        updateUserId: userId,
      })
      .where(eq(books.bookId, bookId));

    // 更新後のデータを取得
    const [updatedBook] = await db
      .select()
      .from(books)
      .where(eq(books.bookId, bookId));

    return c.json({
      id: updatedBook.bookId,
      userId: updatedBook.userId,
      name: updatedBook.name,
      delFlg: updatedBook.delFlg === 1,
      updateCnt: updatedBook.updateCnt,
      updateTime: updatedBook.updateTime,
      updateUserId: updatedBook.updateUserId,
      createTime: updatedBook.createTime,
      createUserId: updatedBook.createUserId,
    } as updateBookResponse);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error updating book:", error);
    throw new AppError("スケジュール帳の更新に失敗しました", 500);
  }
};

// スケジュール帳削除
export const deleteBook = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(bookId)) {
    throw new ValidationError("無効なスケジュール帳IDです");
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // 対象のスケジュール帳を取得
    const [book] = await db
      .select()
      .from(books)
      .where(eq(books.bookId, bookId));

    if (!book) {
      throw new NotFoundError("スケジュール帳が見つかりません");
    }

    // ユーザーIDの確認
    if (book.userId !== userId) {
      throw new AuthorizationError(
        "このスケジュール帳へのアクセス権限がありません"
      );
    }

    const now = getCurrentTimestamp();

    // 論理削除（delFlgを1に設定）
    await db
      .update(books)
      .set({
        delFlg: 1,
        updateCnt: book.updateCnt + 1,
        updateTime: now,
        updateUserId: userId,
      })
      .where(eq(books.bookId, bookId));

    // 204 No Content を返す
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    console.error("Error deleting book:", error);
    throw new AppError("スケジュール帳の削除に失敗しました", 500);
  }
};

// スケジュール帳一覧取得
export const getBooks = async (c: Context) => {
  const db = getDb(c.env.DB);

  // クエリパラメータの取得
  const page = Number(c.req.query("page")) || 1;
  const limit = Number(c.req.query("limit")) || 10;
  const offset = (page - 1) * limit;

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    // 総件数の取得
    const [result] = await db
      .select({ value: count() })
      .from(books)
      .where(and(eq(books.userId, userId), eq(books.delFlg, 0)));

    const totalCount = result?.value || 0;

    // データの取得
    const booksList = await db
      .select()
      .from(books)
      .where(and(eq(books.userId, userId), eq(books.delFlg, 0)))
      .limit(limit)
      .offset(offset);

    // レスポンスの整形
    const formattedBooks = booksList.map((book) => ({
      id: book.bookId,
      userId: book.userId,
      name: book.name,
      delFlg: book.delFlg === 1,
      updateCnt: book.updateCnt,
      updateTime: book.updateTime,
      updateUserId: book.updateUserId,
      createTime: book.createTime,
      createUserId: book.createUserId,
    }));

    return c.json({
      data: formattedBooks,
      meta: {
        totalItems: totalCount,
        itemsPerPage: limit,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
      },
    } as getBooksResponse);
  } catch (error) {
    console.error("Error fetching books:", error);
    return c.json({ error: "Failed to fetch books" }, 500);
  }
};

// スケジュール帳詳細取得
export const getBookById = async (c: Context) => {
  const db = getDb(c.env.DB);
  const bookId = Number(c.req.param("bookId"));

  if (isNaN(bookId)) {
    return c.json({ error: "Invalid book ID" }, 400);
  }

  const userId = getUserIdFromRequest(c.req.raw);

  try {
    const [book] = await db
      .select()
      .from(books)
      .where(and(eq(books.bookId, bookId), eq(books.delFlg, 0)));

    if (!book) {
      return c.json({ error: "Book not found" }, 404);
    }

    // ユーザーIDの確認
    if (book.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    return c.json({
      id: book.bookId,
      userId: book.userId,
      name: book.name,
      delFlg: book.delFlg === 1,
      updateCnt: book.updateCnt,
      updateTime: book.updateTime,
      updateUserId: book.updateUserId,
      createTime: book.createTime,
      createUserId: book.createUserId,
    } as getBookByIdResponse);
  } catch (error) {
    console.error("Error fetching book:", error);
    return c.json({ error: "Failed to fetch book" }, 500);
  }
};
