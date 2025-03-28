import { Context, Next } from "hono";
import { verify } from "hono/jwt";
import { AppContext, JwtPayload } from "./types";

/**
 * JWTトークンを検証する関数
 * @param token 検証するJWTトークン
 * @param jwtSecret JWT署名に使用する秘密鍵
 * @returns 検証済みのJWTペイロード
 * @throws Error トークンが無効または期限切れの場合
 */
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

/**
 * 認証ミドルウェア
 * AuthorizationヘッダーからBearerトークンを取得し、検証してコンテキストにペイロードを設定します。
 * @param c Honoコンテキスト
 * @param next 次のミドルウェアまたはハンドラ
 * @returns Response | void
 */
export function createAuthMiddleware<
  Bindings extends { JWT_SECRET: string } = { JWT_SECRET: string }
>() {
  return async function authMiddleware(
    c: Context<AppContext<Bindings>>,
    next: Next
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
        // その他の検証エラー
        return c.json(
          {
            message: "無効なトークンです",
            error: error instanceof Error ? error.message : "Unknown error",
          },
          { status: 401 }
        );
      }
    } catch (err) {
      // 予期せぬエラー
      return c.json(
        {
          message: "認証処理中にエラーが発生しました",
          error: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  };
}

/**
 * ヘッダーベースの認証ミドルウェア
 * X-User-IDとX-Usernameヘッダーを使用してユーザー情報を取得し、コンテキストに設定します。
 * ゲートウェイを経由するマイクロサービス間の通信で使用します。
 */
export function createHeaderAuthMiddleware() {
  return async function headerAuthMiddleware<
    Bindings = Record<string, unknown>
  >(c: Context<AppContext<Bindings>>, next: Next): Promise<Response | void> {
    try {
      const userId = c.req.header("X-User-ID");
      const username = c.req.header("X-Username");

      if (!userId || !username) {
        return c.json(
          { message: "認証ヘッダーが必要です (X-User-ID, X-Username)" },
          { status: 401 }
        );
      }

      // ユーザー情報をコンテキストに設定
      c.set("userId", parseInt(userId, 10));
      c.set("username", username);

      return await next();
    } catch (err) {
      return c.json(
        {
          message: "認証処理中にエラーが発生しました",
          error: err instanceof Error ? err.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  };
}

/**
 * リクエストからユーザーIDを取得する
 * ゲートウェイから転送されたX-User-IDヘッダーを使用
 */
export const getUserIdFromRequest = (request: Request): number => {
  const userId = request.headers.get("X-User-ID");

  if (!userId) {
    throw new Error("User ID not found in request headers");
  }

  return parseInt(userId, 10);
};

/**
 * リクエストからユーザー名を取得する
 */
export const getUsernameFromRequest = (request: Request): string => {
  const username = request.headers.get("X-Username");

  if (!username) {
    throw new Error("Username not found in request headers");
  }

  return username;
};
