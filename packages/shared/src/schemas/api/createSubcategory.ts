import { z } from 'zod';
import { schemas } from '../index';

export const createSubcategoryRequestSchema = schemas.SubcategoryInput;

export type createSubcategoryRequest = z.infer<typeof createSubcategoryRequestSchema>;

export const createSubcategoryResponseSchema = schemas.Subcategory;

export type createSubcategoryResponse = z.infer<typeof createSubcategoryResponseSchema>;

