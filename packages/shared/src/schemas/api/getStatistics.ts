import { z } from 'zod';
import { schemas } from '../index';

export const getStatisticsResponseSchema = schemas.StatisticsResponse;

export type getStatisticsResponse = z.infer<typeof getStatisticsResponseSchema>;

export const getStatisticsQueryParamsSchema = z.object({
  fromDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  toDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export type getStatisticsQueryParams = z.infer<typeof getStatisticsQueryParamsSchema>;

