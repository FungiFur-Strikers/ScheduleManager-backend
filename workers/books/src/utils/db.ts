import { drizzle } from "drizzle-orm/d1";
import { books } from "../../schema";

export const getDb = (db: D1Database) => {
  return drizzle(db);
};

export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

/**
 * リクエストからユーザーIDを取得する
 * ゲートウェイから転送されたX-User-IDヘッダーを使用
 */
export const getUserIdFromRequest = (request: Request): number => {
  const userId = request.headers.get("X-User-ID");

  if (!userId) {
    throw new Error("User ID not found in request headers");
  }

  return parseInt(userId, 10);
};

/**
 * リクエストからユーザー名を取得する
 */
export const getUsernameFromRequest = (request: Request): string => {
  const username = request.headers.get("X-Username");

  if (!username) {
    throw new Error("Username not found in request headers");
  }

  return username;
};
