import { z } from 'zod';
import { schemas } from '../index';

export const getBooksResponseSchema = z.object({
  data: z.array(BookSchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getBooksResponse = z.infer<typeof getBooksResponseSchema>;

export const getBooksQueryParamsSchema = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
});

export type getBooksQueryParams = z.infer<typeof getBooksQueryParamsSchema>;

