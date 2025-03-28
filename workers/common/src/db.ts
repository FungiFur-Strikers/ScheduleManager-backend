import { drizzle } from "drizzle-orm/d1";
import type { D1Database } from "@cloudflare/workers-types";

/**
 * D1データベース接続を取得する
 * @param db D1Database
 * @returns Drizzle ORM インスタンス
 */
export const getDb = (db: D1Database) => {
  return drizzle(db);
};

/**
 * 現在のタイムスタンプを取得
 * @returns ISO 8601形式の現在時刻
 */
export const getCurrentTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * ユーザーアクセス権チェックの汎用関数
 * エンティティの所有者IDとリクエストユーザーIDを比較します
 * @param ownerId エンティティの所有者ID
 * @param requestUserId リクエストユーザーID
 * @returns 所有者IDとリクエストユーザーIDが一致すればtrue
 */
export const checkUserAccess = (
  ownerId: number,
  requestUserId: number
): boolean => {
  return ownerId === requestUserId;
};
