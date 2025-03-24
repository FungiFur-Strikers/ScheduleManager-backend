import { z } from 'zod';
import { schemas } from '../index';

export const updateMyUserInfoRequestSchema = schemas.UserUpdateInput;

export type updateMyUserInfoRequest = z.infer<typeof updateMyUserInfoRequestSchema>;

export const updateMyUserInfoResponseSchema = schemas.User;

export type updateMyUserInfoResponse = z.infer<typeof updateMyUserInfoResponseSchema>;

