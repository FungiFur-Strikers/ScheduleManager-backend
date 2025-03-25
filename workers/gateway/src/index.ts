import { Hono } from "hono";
import { verify } from "hono/jwt";
import { cors } from "hono/cors";
import { Context, Next } from "hono";

type Bindings = {
  JWT_SECRET: string;
  AUTH_SERVICE: Service;
  BOOKS_SERVICE: Service;
  USER_SETTINGS_SERVICE: Service;
};

type JwtPayload = {
  userId: number;
  username: string;
  exp: number;
  iat: number;
};

type AppContext = {
  Bindings: Bindings;
  Variables: { jwtPayload: JwtPayload };
};

const app = new Hono<AppContext>();

// CORSを有効化
app.use("*", cors());

// JWTトークンの検証
const verifyJwtToken = async (
  token: string,
  jwtSecret: string
): Promise<JwtPayload> => {
  // JWTを検証
  const payload = (await verify(token, jwtSecret)) as JwtPayload;

  // トークンの有効期限をチェック
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) {
    throw new Error("Token has expired");
  }

  return payload;
};

// マイクロサービスへのリクエスト転送
const forwardRequestToService = async (
  c: Context<AppContext>,
  service: Service
): Promise<Response> => {
  // ヘッダーを取得
  const headers = new Headers();
  c.req.raw.headers.forEach((value, key) => {
    headers.set(key, value);
  });

  // クローンして新しいリクエストを作成
  const newRequest = new Request(c.req.url, {
    method: c.req.method,
    headers: headers,
    body: c.req.raw.body,
  });

  // JWTペイロードからユーザー情報をヘッダーに追加
  const jwtPayload = c.get("jwtPayload");
  newRequest.headers.set("X-User-ID", jwtPayload.userId.toString());
  newRequest.headers.set("X-Username", jwtPayload.username);

  // サービスにリクエスト転送
  return await service.fetch(newRequest);
};

// 認証ミドルウェア
const authMiddleware = async (c: Context<AppContext>, next: Next) => {
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
      await next();
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
};

// 認証が必要なパスに認証ミドルウェアを適用
app.use("/", authMiddleware);
app.use("/users/*", authMiddleware);
app.use("/user-settings/*", authMiddleware);
app.use("/books/*", authMiddleware);

// ヘルスチェックエンドポイント（ルートパス）
app.get("/", async (c) => {
  // 認証されたユーザーの情報を取得
  const jwtPayload = c.get("jwtPayload");

  return c.json({
    status: "ok",
    message: "Gateway API is running",
    user: {
      userId: jwtPayload.userId,
      username: jwtPayload.username,
    },
  });
});

// 認証サービスへの転送
app.all("/auth/*", async (c) => {
  const res = await c.env.AUTH_SERVICE.fetch(c.req.raw);
  const text = await res.text();
  return c.text(text);
});

app.all("/auth", async (c) => {
  const res = await c.env.AUTH_SERVICE.fetch(c.req.raw);
  const text = await res.text();
  return c.text(text);
});

// usersサービスへのルーティング
app.all("/users/*", async (c) => {
  return await forwardRequestToService(c, c.env.AUTH_SERVICE);
});

app.all("/users", async (c) => {
  return await forwardRequestToService(c, c.env.AUTH_SERVICE);
});

// user-settingsサービスへのルーティング
app.all("/user-settings/*", async (c) => {
  return await forwardRequestToService(c, c.env.USER_SETTINGS_SERVICE);
});

app.all("/user-settings", async (c) => {
  return await forwardRequestToService(c, c.env.USER_SETTINGS_SERVICE);
});

// booksサービスへのルーティング
app.all("/books/*", async (c) => {
  return await forwardRequestToService(c, c.env.BOOKS_SERVICE);
});

export default app;
