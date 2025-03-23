import { drizzle } from "drizzle-orm/d1";
import { books } from "../../schema";

export const getDb = (db: D1Database) => {
  return drizzle(db);
};

export const getCurrentTimestamp = () => {
  return new Date().toISOString();
};

// ユーザーIDを取得するユーティリティ（実際の実装ではJWTから取得）
export const getUserIdFromRequest = (
  authHeader: string | undefined
): number => {
  // TODO: JWTの検証とユーザーIDの取得
  // 仮のユーザーID
  return 1;
};
