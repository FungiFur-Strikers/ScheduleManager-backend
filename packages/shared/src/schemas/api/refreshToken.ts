import { z } from 'zod';
import { schemas } from '../index';

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string(),
});

export type refreshTokenRequest = z.infer<typeof refreshTokenRequestSchema>;

export const refreshTokenResponseSchema = schemas.AuthResponse;

export type refreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;

