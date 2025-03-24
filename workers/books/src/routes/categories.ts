import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createCategoryRequestSchema } from "@project/shared/schemas/api/createCategory";
import { getCategoriesQueryParamsSchema } from "@project/shared/schemas/api/getCategories";
import { updateCategoryRequestSchema } from "@project/shared/schemas/api/updateCategory";
import * as categoriesController from "../controllers/categories";
import subcategoriesRoutes from "./subcategories";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// カテゴリ一覧取得
app.get("/", zValidator("query", getCategoriesQueryParamsSchema), async (c) => {
  return await categoriesController.getCategories(c);
});

// カテゴリ作成
app.post("/", zValidator("json", createCategoryRequestSchema), async (c) => {
  return await categoriesController.createCategory(c);
});

// カテゴリ詳細取得
app.get("/:categoryId", async (c) => {
  return await categoriesController.getCategoryById(c);
});

// カテゴリ更新
app.put(
  "/:categoryId",
  zValidator("json", updateCategoryRequestSchema),
  async (c) => {
    return await categoriesController.updateCategory(c);
  }
);

// カテゴリ削除
app.delete("/:categoryId", async (c) => {
  return await categoriesController.deleteCategory(c);
});

// サブカテゴリ関連のルートをマウント
app.route("/:categoryId/subcategories", subcategoriesRoutes);

export default app;
