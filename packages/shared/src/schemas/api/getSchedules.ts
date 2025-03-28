import { z } from "zod";
import { PaginationMetaSchema, ScheduleSchema } from "../index";

export const getSchedulesResponseSchema = z.object({
  data: z.array(ScheduleSchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getSchedulesResponse = z.infer<typeof getSchedulesResponseSchema>;

export const getSchedulesQueryParamsSchema = z.object({
  categoryId: z.string().optional(),
  subcategoryId: z.string().optional(),
  startFrom: z.string().datetime().optional(),
  startTo: z.string().datetime().optional(),
  endFrom: z.string().datetime().optional(),
  endTo: z.string().datetime().optional(),
  title: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export type getSchedulesQueryParams = z.infer<
  typeof getSchedulesQueryParamsSchema
>;
