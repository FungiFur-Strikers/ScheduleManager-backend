import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createSubcategoryRequestSchema } from "@project/shared/schemas/api/createSubcategory";
import { getSubcategoriesQueryParamsSchema } from "@project/shared/schemas/api/getSubcategories";
import { updateSubcategoryRequestSchema } from "@project/shared/schemas/api/updateSubcategory";
import * as subcategoriesController from "../controllers/subcategories";

// Bindingsの型を定義
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// サブカテゴリ一覧取得
app.get(
  "/",
  zValidator("query", getSubcategoriesQueryParamsSchema),
  async (c) => {
    return await subcategoriesController.getSubcategories(c);
  }
);

// サブカテゴリ作成
app.post("/", zValidator("json", createSubcategoryRequestSchema), async (c) => {
  return await subcategoriesController.createSubcategory(c);
});

// サブカテゴリ詳細取得
app.get("/:subcategoryId", async (c) => {
  return await subcategoriesController.getSubcategoryById(c);
});

// サブカテゴリ更新
app.put(
  "/:subcategoryId",
  zValidator("json", updateSubcategoryRequestSchema),
  async (c) => {
    return await subcategoriesController.updateSubcategory(c);
  }
);

// サブカテゴリ削除
app.delete("/:subcategoryId", async (c) => {
  return await subcategoriesController.deleteSubcategory(c);
});

export default app;
