import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../schema";
import { zValidator } from "@hono/zod-validator";
import {
  signUpRequestSchema,
  signUpResponse,
} from "@project/shared/schemas/api/signUp";
import {
  signInRequestSchema,
  signInResponse,
} from "@project/shared/schemas/api/signIn";
import {
  refreshTokenRequestSchema,
  refreshTokenResponse,
} from "@project/shared/schemas/api/refreshToken";
import { and, eq } from "drizzle-orm";
import { generateRefreshToken, generateToken } from "./utils/jwt";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

const app = new Hono<{ Bindings: Bindings }>().basePath("/auth");

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.post("/signin", zValidator("json", signInRequestSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = c.req.valid("json");

  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, body.email)));

  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

  // パスワードの検証
  // TODO: パスワードのハッシュ化
  if (user.password !== body.password) {
    return c.json({ error: "Invalid password" }, 401);
  }

  // JWTトークンの生成
  const token = await generateToken(
    {
      userId: user.id,
      username: user.username,
    },
    "1h",
    c.env.JWT_SECRET
  );

  const refreshToken = generateRefreshToken(); // TODO: リフレッシュトークンの保存

  return c.json({
    token,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
    },
    expiresIn: 3600,
  } as signInResponse);
});

app.post("/signup", zValidator("json", signUpRequestSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const body = c.req.valid("json");

  const result = await db.insert(users).values({
    username: body.username,
    email: body.email,
    password: body.password, // TODO: パスワードのハッシュ化
  });

  const token = await generateToken(
    {
      userId: result.meta.last_row_id,
      username: body.username,
    },
    "1h",
    c.env.JWT_SECRET
  );

  const refreshToken = generateRefreshToken(); // TODO: リフレッシュトークンの保存
  return c.json({
    token,
    refreshToken,
    user: {
      id: result.meta.last_row_id,
      username: body.username,
      email: body.email,
    },
    expiresIn: 3600,
  } as signUpResponse);
});

app.post("/signout", async (c) => {
  // TODO: リフレッシュトークンをDBから削除
  return new Response(null, { status: 204 });
});

app.post(
  "/refresh-token",
  zValidator("json", refreshTokenRequestSchema),
  async (c) => {
    const db = drizzle(c.env.DB);

    // TODO: リフレッシュトークンの検証やDBとの照合を行う
    const [user] = await db.select().from(users).where(eq(users.id, 1)); // TODO:リフレッシュトークンに紐づくユーザーを取得

    if (!user) {
      return c.json({ error: "Invalid refresh token" }, 401);
    }

    const token = await generateToken(
      {
        userId: user.id,
        username: user.username,
      },
      "1h",
      c.env.JWT_SECRET
    );

    const refreshToken = generateRefreshToken(); // TODO: リフレッシュトークンの保存

    return c.json({
      token,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
      expiresIn: 3600,
    } as refreshTokenResponse);
  }
);

export default app;
