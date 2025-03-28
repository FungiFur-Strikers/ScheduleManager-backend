import { Context } from "hono";

/**
 * JWTペイロードの型定義
 */
export type JwtPayload = {
  userId: number;
  username: string;
  exp: number;
  iat: number;
};

/**
 * Honoアプリケーションの共通コンテキスト型
 * Bindings は各ワーカーで固有のものを指定できるようにジェネリクスを使用
 */
export type AppContext<Bindings = Record<string, unknown>> = {
  Bindings: Bindings & {
    JWT_SECRET: string; // JWT検証に必要な秘密鍵
  };
  Variables: {
    jwtPayload: JwtPayload;
    userId?: number; // X-User-IDヘッダーから取得したユーザーID
    username?: string; // X-Usernameヘッダーから取得したユーザー名
  };
};

/**
 * 共通コンテキスト型 (型推論用)
 */
export type CommonContext<Bindings = Record<string, unknown>> = Context<
  AppContext<Bindings>
>;
