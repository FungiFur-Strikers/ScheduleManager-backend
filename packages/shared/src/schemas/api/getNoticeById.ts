import { z } from 'zod';
import { schemas } from '../index';

export const getNoticeByIdResponseSchema = schemas.Notice;

export type getNoticeByIdResponse = z.infer<typeof getNoticeByIdResponseSchema>;

