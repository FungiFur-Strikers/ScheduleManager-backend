import { Context } from "hono";
import { verify } from "hono/jwt";

export type JwtPayload = {
  userId: number;
  username: string;
  exp: number;
  iat: number;
};

export type AppContext = {
  Bindings: {
    DB: D1Database;
    JWT_SECRET: string;
    SALT_ROUNDS: string;
  };
  Variables: { jwtPayload: JwtPayload };
};

export async function verifyJwtToken(
  token: string,
  jwtSecret: string
): Promise<JwtPayload> {
  // JWTを検証
  const payload = (await verify(token, jwtSecret)) as JwtPayload;

  // トークンの有効期限をチェック
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token has expired");
  }

  return payload;
}

export async function authMiddleware(
  c: Context<AppContext>,
  next: () => Promise<void>
): Promise<Response | void> {
  try {
    // Authorizationヘッダーからトークンを取得
    const authorization = c.req.header("Authorization");

    if (!authorization) {
      return c.json({ message: "認証トークンが必要です" }, { status: 401 });
    }

    // Bearer スキームを処理
    const parts = authorization.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return c.json(
        { message: "不正な認証形式です。Bearer トークンを使用してください" },
        { status: 401 }
      );
    }

    const token = parts[1];

    try {
      // トークンを検証し、ペイロードを取得
      const payload = await verifyJwtToken(token, c.env.JWT_SECRET);

      // 検証されたペイロードをコンテキストに追加
      c.set("jwtPayload", payload);

      // 次のミドルウェアに進む
      return await next();
    } catch (error) {
      if (error instanceof Error && error.message === "Token has expired") {
        return c.json(
          { message: "トークンの有効期限が切れています" },
          { status: 401 }
        );
      }
      throw error;
    }
  } catch (err) {
    return c.json(
      {
        message: "無効なトークンです",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 401 }
    );
  }
}
