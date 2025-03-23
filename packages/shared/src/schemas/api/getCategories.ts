import { z } from 'zod';
import { schemas } from '../index';

export const getCategoriesResponseSchema = z.object({
  data: z.array(CategorySchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;

export const getCategoriesQueryParamsSchema = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
});

export type getCategoriesQueryParams = z.infer<typeof getCategoriesQueryParamsSchema>;

