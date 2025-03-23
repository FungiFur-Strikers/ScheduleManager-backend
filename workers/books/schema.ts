import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  bookId: integer("book_id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});

export const categories = sqliteTable("categories", {
  categoryId: integer("category_id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.bookId),
  categoryName: text("category_name").notNull(),
  incomeFlg: integer("income_flg").notNull().default(0),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});

export const subcategories = sqliteTable("subcategories", {
  subcategoryId: integer("subcategory_id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.categoryId),
  subcategoryName: text("subcategory_name").notNull(),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});

export const schedules = sqliteTable("schedules", {
  scheduleId: integer("schedule_id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.bookId),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categories.categoryId),
  subcategoryId: integer("subcategory_id").references(
    () => subcategories.subcategoryId
  ),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  title: text("title").notNull(),
  remarks: text("remarks"),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});

export const works = sqliteTable("works", {
  workId: integer("work_id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.bookId),
  workName: text("work_name").notNull(),
  hourlyPay: real("hourly_pay"),
  unitPrice: real("unit_price"),
  company: text("company"),
  agent: text("agent"),
  remarks: text("remarks"),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});

export const notices = sqliteTable("notices", {
  noticeId: integer("notice_id").primaryKey({ autoIncrement: true }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.bookId),
  disUserId: integer("dis_user_id"),
  disRole: text("dis_role"),
  date: text("date").notNull(),
  delDate: text("del_date"),
  remarks: text("remarks"),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});

export const noticeReads = sqliteTable("notice_reads", {
  noticeReadId: integer("notice_read_id").primaryKey({ autoIncrement: true }),
  noticeId: integer("notice_id")
    .notNull()
    .references(() => notices.noticeId),
  userId: integer("user_id").notNull(),
  readTime: text("read_time").notNull(),
  delFlg: integer("del_flg").notNull().default(0),
  updateCnt: integer("update_cnt").notNull().default(0),
  updateTime: text("update_time").notNull(),
  updateUserId: integer("update_user_id").notNull(),
  createTime: text("create_time").notNull(),
  createUserId: integer("create_user_id").notNull(),
});
