import { z } from 'zod';
import { schemas } from '../index';

export const signInRequestSchema = schemas.UserCredentials;

export type signInRequest = z.infer<typeof signInRequestSchema>;

export const signInResponseSchema = schemas.AuthResponse;

export type signInResponse = z.infer<typeof signInResponseSchema>;

