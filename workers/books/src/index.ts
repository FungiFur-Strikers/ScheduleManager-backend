import { Hono } from "hono";
import booksRoutes from "./routes/books";
import { errorHandler } from "@worker/common";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// エラーハンドラーミドルウェアを追加
app.onError(errorHandler);

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Books API is running" });
});

// スケジュール帳関連のルートをマウント
app.route("/books", booksRoutes);

export default app;
