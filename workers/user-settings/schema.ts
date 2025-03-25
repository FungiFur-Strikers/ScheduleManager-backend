import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// ユーザー設定テーブル
export const userSettings = sqliteTable("user_settings", {
  settingId: integer("setting_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  theme: text("theme").default("light"),
  notificationEnabled: integer("notification_enabled").default(1),
  language: text("language").default("ja"),
  delFlg: integer("del_flg").default(0),
  updateCnt: integer("update_cnt").default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});
