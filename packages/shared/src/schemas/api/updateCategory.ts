import { z } from 'zod';
import { schemas } from '../index';

export const updateCategoryRequestSchema = schemas.CategoryInput;

export type updateCategoryRequest = z.infer<typeof updateCategoryRequestSchema>;

export const updateCategoryResponseSchema = schemas.Category;

export type updateCategoryResponse = z.infer<typeof updateCategoryResponseSchema>;

