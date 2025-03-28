import {
  createAuthMiddleware,
  verifyJwtToken,
} from "@worker/common";

export type AuthBindings = {
  DB: D1Database;
  JWT_SECRET: string;
  SALT_ROUNDS: string;
};

const authMiddlewareInstance = createAuthMiddleware<AuthBindings>();

export { verifyJwtToken };
export { authMiddlewareInstance as authMiddleware };
