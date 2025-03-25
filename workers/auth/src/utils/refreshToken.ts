import { DrizzleD1Database } from "drizzle-orm/d1";
import { refreshTokens, users } from "../../schema";
import { and, eq, isNull } from "drizzle-orm";
import { generateRefreshToken, generateToken, getExpirationDate } from "./jwt";

export async function createRefreshToken(
  db: DrizzleD1Database,
  userId: number,
  jwtSecret: string
) {
  const now = new Date().toISOString();
  const refreshToken = generateRefreshToken();

  // 既存の有効なリフレッシュトークンを無効化
  await db
    .update(refreshTokens)
    .set({
      revokedAt: now,
      updateTime: now,
    })
    .where(
      and(
        eq(refreshTokens.userId, userId),
        eq(refreshTokens.delFlg, 0),
        isNull(refreshTokens.revokedAt)
      )
    );

  // リフレッシュトークンをDBに保存
  await db.insert(refreshTokens).values({
    userId,
    token: refreshToken,
    expiresAt: getExpirationDate(24 * 7), // 7日間有効
    issuedAt: now,
    updateTime: now,
    updateUserId: userId,
    createTime: now,
    createUserId: userId,
  });

  // アクセストークンの生成
  const [user] = await db.select().from(users).where(eq(users.userId, userId));

  if (!user) {
    throw new Error("User not found");
  }

  const token = await generateToken(
    {
      userId: user.userId,
      username: user.username,
    },
    "1h",
    jwtSecret
  );

  return {
    token,
    refreshToken,
    user: {
      id: user.userId,
      username: user.username,
      email: user.email,
    },
    expiresIn: 3600,
  };
}

export async function revokeRefreshToken(
  db: DrizzleD1Database,
  refreshToken: string | undefined,
  userId?: number
): Promise<void> {
  const now = new Date().toISOString();

  if (refreshToken) {
    // 特定のリフレッシュトークンのみを無効化
    await db
      .update(refreshTokens)
      .set({
        revokedAt: now,
        updateTime: now,
      })
      .where(eq(refreshTokens.token, refreshToken));
  } else if (userId) {
    // ユーザーの全ての有効なリフレッシュトークンを無効化
    await db
      .update(refreshTokens)
      .set({
        revokedAt: now,
        updateTime: now,
      })
      .where(
        and(
          eq(refreshTokens.userId, userId),
          eq(refreshTokens.delFlg, 0),
          isNull(refreshTokens.revokedAt)
        )
      );
  }
}

export async function validateAndRefreshToken(
  db: DrizzleD1Database,
  refreshToken: string,
  jwtSecret: string
) {
  // リフレッシュトークンの検証
  const [refreshTokenRecord] = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token, refreshToken),
        eq(refreshTokens.delFlg, 0),
        isNull(refreshTokens.revokedAt)
      )
    );

  if (!refreshTokenRecord) {
    throw new Error("Invalid refresh token");
  }

  // 有効期限のチェック
  if (new Date(refreshTokenRecord.expiresAt) < new Date()) {
    throw new Error("Refresh token expired");
  }

  // ユーザー情報の取得
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.userId, refreshTokenRecord.userId));

  if (!user) {
    throw new Error("User not found");
  }

  // 新しいアクセストークンの生成
  const token = await generateToken(
    {
      userId: user.userId,
      username: user.username,
    },
    "1h",
    jwtSecret
  );

  // 新しいリフレッシュトークンの生成
  const newRefreshToken = generateRefreshToken();
  const now = new Date().toISOString();

  // 古いリフレッシュトークンを無効化
  await db
    .update(refreshTokens)
    .set({
      revokedAt: now,
      updateTime: now,
    })
    .where(eq(refreshTokens.tokenId, refreshTokenRecord.tokenId));

  // 新しいリフレッシュトークンを保存
  await db.insert(refreshTokens).values({
    userId: user.userId,
    token: newRefreshToken,
    expiresAt: getExpirationDate(24 * 7), // 7日間有効
    issuedAt: now,
    updateTime: now,
    updateUserId: user.userId,
    createTime: now,
    createUserId: user.userId,
  });

  return {
    token,
    refreshToken: newRefreshToken,
    user: {
      id: user.userId,
      username: user.username,
      email: user.email,
    },
    expiresIn: 3600,
  };
}
