import { z } from 'zod';
import { schemas } from '../index';

export const createWorkRequestSchema = schemas.WorkInput;

export type createWorkRequest = z.infer<typeof createWorkRequestSchema>;

export const createWorkResponseSchema = schemas.Work;

export type createWorkResponse = z.infer<typeof createWorkResponseSchema>;

