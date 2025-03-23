import { z } from 'zod';
import { schemas } from '../index';

export const updateNoticeRequestSchema = schemas.NoticeInput;

export type updateNoticeRequest = z.infer<typeof updateNoticeRequestSchema>;

export const updateNoticeResponseSchema = schemas.Notice;

export type updateNoticeResponse = z.infer<typeof updateNoticeResponseSchema>;

