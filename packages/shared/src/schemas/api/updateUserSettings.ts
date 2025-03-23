import { z } from 'zod';
import { schemas } from '../index';

export const updateUserSettingsRequestSchema = schemas.UserSettingInput;

export type updateUserSettingsRequest = z.infer<typeof updateUserSettingsRequestSchema>;

export const updateUserSettingsResponseSchema = schemas.UserSetting;

export type updateUserSettingsResponse = z.infer<typeof updateUserSettingsResponseSchema>;

