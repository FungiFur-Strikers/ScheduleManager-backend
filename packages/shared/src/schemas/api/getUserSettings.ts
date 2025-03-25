import { z } from 'zod';
import { schemas } from '../index';

export const getUserSettingsResponseSchema = schemas.UserSetting;

export type getUserSettingsResponse = z.infer<typeof getUserSettingsResponseSchema>;

