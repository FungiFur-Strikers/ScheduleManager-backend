import { z } from 'zod';
import { schemas } from '../index';

export const getWorkByIdResponseSchema = schemas.Work;

export type getWorkByIdResponse = z.infer<typeof getWorkByIdResponseSchema>;

