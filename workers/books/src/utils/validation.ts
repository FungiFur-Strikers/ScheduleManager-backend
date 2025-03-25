import { eq } from "drizzle-orm";
import { books } from "../../schema";
import { drizzle } from "drizzle-orm/d1";

// スケジュール帳へのアクセス権を検証する関数
export const validateBookAccess = async (
  db: D1Database,
  userId: number,
  bookId: number
): Promise<boolean> => {
  try {
    const drizzleDb = drizzle(db);
    const book = await drizzleDb
      .select()
      .from(books)
      .where(eq(books.bookId, bookId))
      .get();

    if (!book) {
      return false;
    }

    // 所有者チェック (ユーザーIDが一致するかつ削除されていないスケジュール帳)
    return book.userId === userId && book.delFlg === 0;
  } catch (error) {
    console.error("スケジュール帳のアクセス権検証エラー:", error);
    return false;
  }
};
