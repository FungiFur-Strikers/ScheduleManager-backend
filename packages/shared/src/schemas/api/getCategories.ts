import { z } from "zod";
import { CategorySchema, PaginationMetaSchema } from "../index";

export const getCategoriesResponseSchema = z.object({
  data: z.array(CategorySchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;

export const getCategoriesQueryParamsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type getCategoriesQueryParams = z.infer<
  typeof getCategoriesQueryParamsSchema
>;
