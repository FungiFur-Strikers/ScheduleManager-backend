import { Hono } from "hono";
import booksRoutes from "./routes/books";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// Health check
app.get("/", (c) => {
  return c.json({ status: "ok", message: "Books API is running" });
});

// スケジュール帳関連のルートをマウント
app.route("/books", booksRoutes);

export default app;
