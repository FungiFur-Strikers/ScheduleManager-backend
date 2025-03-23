import { z } from "zod";
import { PaginationMetaSchema, ScheduleSchema } from "../index";

export const getSchedulesResponseSchema = z.object({
  data: z.array(ScheduleSchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getSchedulesResponse = z.infer<typeof getSchedulesResponseSchema>;

export const getSchedulesQueryParamsSchema = z.object({
  categoryId: z.number().int().optional(),
  subcategoryId: z.number().int().optional(),
  startFrom: z.string().datetime().optional(),
  startTo: z.string().datetime().optional(),
  endFrom: z.string().datetime().optional(),
  endTo: z.string().datetime().optional(),
  title: z.string().optional(),
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
});

export type getSchedulesQueryParams = z.infer<
  typeof getSchedulesQueryParamsSchema
>;
