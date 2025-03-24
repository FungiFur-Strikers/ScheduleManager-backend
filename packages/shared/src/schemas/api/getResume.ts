import { z } from 'zod';
import { schemas } from '../index';

export const getResumeResponseSchema = schemas.ResumeResponse;

export type getResumeResponse = z.infer<typeof getResumeResponseSchema>;

