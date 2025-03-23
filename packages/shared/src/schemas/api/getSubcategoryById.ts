import { z } from 'zod';
import { schemas } from '../index';

export const getSubcategoryByIdResponseSchema = schemas.Subcategory;

export type getSubcategoryByIdResponse = z.infer<typeof getSubcategoryByIdResponseSchema>;

