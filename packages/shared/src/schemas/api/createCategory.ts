import { z } from 'zod';
import { schemas } from '../index';

export const createCategoryRequestSchema = schemas.CategoryInput;

export type createCategoryRequest = z.infer<typeof createCategoryRequestSchema>;

export const createCategoryResponseSchema = schemas.Category;

export type createCategoryResponse = z.infer<typeof createCategoryResponseSchema>;

