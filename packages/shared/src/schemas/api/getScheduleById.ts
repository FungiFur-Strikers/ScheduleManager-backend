import { z } from 'zod';
import { schemas } from '../index';

export const getScheduleByIdResponseSchema = schemas.Schedule;

export type getScheduleByIdResponse = z.infer<typeof getScheduleByIdResponseSchema>;

