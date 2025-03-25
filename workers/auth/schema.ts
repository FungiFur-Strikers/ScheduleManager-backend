import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  userId: integer("user_id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});

export const refreshTokens = sqliteTable("refresh_tokens", {
  tokenId: integer("token_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id")
    .notNull()
    .references(() => users.userId),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  issuedAt: text("issued_at").notNull(),
  revokedAt: text("revoked_at"),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});
