import { z } from 'zod';
import { schemas } from '../index';

export const signUpRequestSchema = schemas.UserSignup;

export type signUpRequest = z.infer<typeof signUpRequestSchema>;

export const signUpResponseSchema = schemas.AuthResponse;

export type signUpResponse = z.infer<typeof signUpResponseSchema>;

