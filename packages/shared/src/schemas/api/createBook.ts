import { z } from 'zod';
import { schemas } from '../index';

export const createBookRequestSchema = schemas.BookInput;

export type createBookRequest = z.infer<typeof createBookRequestSchema>;

export const createBookResponseSchema = schemas.Book;

export type createBookResponse = z.infer<typeof createBookResponseSchema>;

