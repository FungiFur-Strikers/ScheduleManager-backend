import { z } from "zod";
import { PaginationMetaSchema, SubcategorySchema } from "../index";

export const getSubcategoriesResponseSchema = z.object({
  data: z.array(SubcategorySchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getSubcategoriesResponse = z.infer<
  typeof getSubcategoriesResponseSchema
>;

export const getSubcategoriesQueryParamsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type getSubcategoriesQueryParams = z.infer<
  typeof getSubcategoriesQueryParamsSchema
>;
