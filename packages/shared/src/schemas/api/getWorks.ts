import { z } from 'zod';
import { schemas } from '../index';

export const getWorksResponseSchema = z.object({
  data: z.array(WorkSchema).optional(),
  meta: PaginationMetaSchema.optional(),
});

export type getWorksResponse = z.infer<typeof getWorksResponseSchema>;

export const getWorksQueryParamsSchema = z.object({
  company: z.string().optional(),
  agent: z.string().optional(),
  workName: z.string().optional(),
  minHourlyPay: z.number().optional(),
  maxHourlyPay: z.number().optional(),
  minUnitPrice: z.number().optional(),
  maxUnitPrice: z.number().optional(),
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
});

export type getWorksQueryParams = z.infer<typeof getWorksQueryParamsSchema>;

