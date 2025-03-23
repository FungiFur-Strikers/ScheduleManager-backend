import { z } from 'zod';
import { schemas } from '../index';

export const getBookByIdResponseSchema = schemas.Book;

export type getBookByIdResponse = z.infer<typeof getBookByIdResponseSchema>;

