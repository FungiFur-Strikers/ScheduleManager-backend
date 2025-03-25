import { z } from 'zod';
import { schemas } from '../index';

export const getMyUserInfoResponseSchema = schemas.User;

export type getMyUserInfoResponse = z.infer<typeof getMyUserInfoResponseSchema>;

