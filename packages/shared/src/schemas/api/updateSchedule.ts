import { z } from 'zod';
import { schemas } from '../index';

export const updateScheduleRequestSchema = schemas.ScheduleInput;

export type updateScheduleRequest = z.infer<typeof updateScheduleRequestSchema>;

export const updateScheduleResponseSchema = schemas.Schedule;

export type updateScheduleResponse = z.infer<typeof updateScheduleResponseSchema>;

