import { z } from 'zod';
import { schemas } from '../index';

export const updateBookRequestSchema = schemas.BookInput;

export type updateBookRequest = z.infer<typeof updateBookRequestSchema>;

export const updateBookResponseSchema = schemas.Book;

export type updateBookResponse = z.infer<typeof updateBookResponseSchema>;

