import { z } from 'zod';
import { schemas } from '../index';

export const getCategoryByIdResponseSchema = schemas.Category;

export type getCategoryByIdResponse = z.infer<typeof getCategoryByIdResponseSchema>;

