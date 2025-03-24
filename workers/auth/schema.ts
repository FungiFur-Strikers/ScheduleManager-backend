import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
    username: text("username").notNull().default(""),
    email: text("email").unique().notNull(),
    password: text("password").notNull(),
  },
  () => []
);
