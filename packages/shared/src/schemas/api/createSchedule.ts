import { z } from 'zod';
import { schemas } from '../index';

export const createScheduleRequestSchema = schemas.ScheduleInput;

export type createScheduleRequest = z.infer<typeof createScheduleRequestSchema>;

export const createScheduleResponseSchema = schemas.Schedule;

export type createScheduleResponse = z.infer<typeof createScheduleResponseSchema>;

