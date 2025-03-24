import { z } from 'zod';
import { schemas } from '../index';

export const createNoticeRequestSchema = schemas.NoticeInput;

export type createNoticeRequest = z.infer<typeof createNoticeRequestSchema>;

export const createNoticeResponseSchema = schemas.Notice;

export type createNoticeResponse = z.infer<typeof createNoticeResponseSchema>;

