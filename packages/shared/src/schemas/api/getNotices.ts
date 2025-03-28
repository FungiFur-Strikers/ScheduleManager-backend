import { z } from "zod";
import { NoticeSchema, PaginationMetaSchema } from "../index";

export const getNoticesResponseSchema = z.object({
  data: z.array(NoticeSchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getNoticesResponse = z.infer<typeof getNoticesResponseSchema>;

export const getNoticesQueryParamsSchema = z.object({
  fromDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  toDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  unreadOnly: z.boolean().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type getNoticesQueryParams = z.infer<typeof getNoticesQueryParamsSchema>;
