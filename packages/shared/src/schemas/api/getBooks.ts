import { z } from "zod";
import { BookSchema, PaginationMetaSchema } from "../index";

export const getBooksResponseSchema = z.object({
  data: z.array(BookSchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getBooksResponse = z.infer<typeof getBooksResponseSchema>;

export const getBooksQueryParamsSchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type getBooksQueryParams = z.infer<typeof getBooksQueryParamsSchema>;
