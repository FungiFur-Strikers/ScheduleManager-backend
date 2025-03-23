import { Hono } from "hono";
import { verify } from "hono/jwt";
import { cors } from "hono/cors";

type Bindings = {
  JWT_SECRET: string;
  AUTH_SERVICE: Service;
  BOOKS_SERVICE: Service;
};

type JwtPayload = {
  sub: string;
  role: string;
  exp: number;
  iat: number;
};

const app = new Hono<{
  Bindings: Bindings;
  Variables: { jwtPayload: JwtPayload };
}>();

// CORSを有効化
app.use("*", cors());

app.use("/users/*", async (c, next) => {
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

    // JWTを検証
    const payload = await verify(token, c.env.JWT_SECRET);

    // トークンの有効期限をチェック
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return c.json(
        { message: "トークンの有効期限が切れています" },
        { status: 401 }
      );
    }

    // 検証されたペイロードをコンテキストに追加
    c.set("jwtPayload", payload);

    // 次のミドルウェアに進む
    await next();
  } catch (err) {
    return c.json(
      {
        message: "無効なトークンです",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 401 }
    );
  }
});

app.get("/auth", async (c) => {
  const res = await c.env.AUTH_SERVICE.fetch(c.req.raw);
  const text = await res.text();
  return c.text(text);
});

// books サービスへのルーティング
app.all("/books/*", async (c) => {
  const res = await c.env.BOOKS_SERVICE.fetch(c.req.raw);
  return res;
});

app.all("/books", async (c) => {
  const res = await c.env.BOOKS_SERVICE.fetch(c.req.raw);
  return res;
});

export default app;
