import { z } from 'zod';
import { schemas } from '../index';

export const updateSubcategoryRequestSchema = schemas.SubcategoryInput;

export type updateSubcategoryRequest = z.infer<typeof updateSubcategoryRequestSchema>;

export const updateSubcategoryResponseSchema = schemas.Subcategory;

export type updateSubcategoryResponse = z.infer<typeof updateSubcategoryResponseSchema>;

