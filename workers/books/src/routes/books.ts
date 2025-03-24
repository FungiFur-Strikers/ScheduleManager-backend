import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createBookRequestSchema } from "@project/shared/schemas/api/createBook";
import { getBooksQueryParamsSchema } from "@project/shared/schemas/api/getBooks";
import { updateBookRequestSchema } from "@project/shared/schemas/api/updateBook";
import * as booksController from "../controllers/books";
import categoriesRoutes from "./categories";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// スケジュール帳一覧取得
app.get("/", zValidator("query", getBooksQueryParamsSchema), async (c) => {
  return await booksController.getBooks(c);
});

// スケジュール帳作成
app.post("/", zValidator("json", createBookRequestSchema), async (c) => {
  return await booksController.createBook(c);
});

// スケジュール帳詳細取得
app.get("/:bookId", async (c) => {
  return await booksController.getBookById(c);
});

// スケジュール帳更新
app.put("/:bookId", zValidator("json", updateBookRequestSchema), async (c) => {
  return await booksController.updateBook(c);
});

// スケジュール帳削除
app.delete("/:bookId", async (c) => {
  return await booksController.deleteBook(c);
});

// カテゴリ関連のルートをマウント
app.route("/:bookId/categories", categoriesRoutes);

export default app;
