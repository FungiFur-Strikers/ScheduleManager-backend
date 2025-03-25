import { z } from 'zod';
import { schemas } from '../index';

export const updateWorkRequestSchema = schemas.WorkInput;

export type updateWorkRequest = z.infer<typeof updateWorkRequestSchema>;

export const updateWorkResponseSchema = schemas.Work;

export type updateWorkResponse = z.infer<typeof updateWorkResponseSchema>;

