// packages/workers/auth/src/utils/jwt.ts
import { SignJWT, jwtVerify } from "jose";

// 環境変数または Workers Secrets からの秘密鍵（32バイト以上推奨）
const getJwtSecret = (secret: string) => {
  // 実際のプロジェクトでは環境変数から取得
  return new TextEncoder().encode(secret);
};

// JWTトークンの発行
export async function generateToken(
  payload: any,
  expiresIn: string = "1h",
  secret: string
) {
  const jwt = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret(secret));

  return jwt;
}

// JWTトークンの検証
export async function verifyToken(token: string, secret: string) {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(secret));
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error };
  }
}

// リフレッシュトークンの生成
export function generateRefreshToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// トークン有効期限の計算
export function getExpirationDate(hours: number = 24 * 7) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}
