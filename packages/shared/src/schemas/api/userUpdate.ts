import { z } from "zod";

export const userUpdateRequestSchema = z.object({
  username: z.string().min(1).max(50),
  email: z.string().email(),
  password: z.string().min(8).optional(),
});

export type UserUpdateRequest = z.infer<typeof userUpdateRequestSchema>;
