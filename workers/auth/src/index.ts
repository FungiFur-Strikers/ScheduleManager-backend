import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { zValidator } from "@hono/zod-validator";
import {
  createRefreshToken,
  revokeRefreshToken,
  validateAndRefreshToken,
} from "./utils/refreshToken";
import { verifyPassword } from "./utils/password";
import { AuthBindings, authMiddleware } from "./utils/auth";
import { UserService } from "./utils/user";
import { AppContext } from "@worker/common";
import {refreshTokenRequestSchema, refreshTokenResponse} from "@project/shared/schemas/api/refreshToken"
import {signInRequestSchema, signInResponse} from "@project/shared/schemas/api/signIn"
import {signUpRequestSchema, signUpResponse} from "@project/shared/schemas/api/signUp"
import {userUpdateRequestSchema} from "@project/shared/schemas/api/userUpdate"

// 型定義を共通モジュールから使用
const app = new Hono<AppContext<AuthBindings>>();

// 認証関連のエンドポイント
const authApp = new Hono<AppContext<AuthBindings>>();

authApp.get("/", (c) => {
  return c.text("Hello Hono!");
});

// 認証が必要なエンドポイントにミドルウェアを適用
authApp.use("/signout", authMiddleware);
authApp.use("/refresh-token", authMiddleware);

authApp.post("/signin", zValidator("json", signInRequestSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const userService = new UserService(db);
  const body = c.req.valid("json");

  const user = await userService.findUserByEmail(body.email);
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }

  const isValidPassword = await verifyPassword(body.password, user.password);
  if (!isValidPassword) {
    return c.json({ error: "Invalid password" }, 401);
  }

  try {
    const result = await createRefreshToken(db, user.userId, c.env.JWT_SECRET);
    return c.json(result as signInResponse);
  } catch (error) {
    return c.json({ error: "Failed to create refresh token" }, 500);
  }
});

// サインアップは認証が不要なので、authMiddlewareを適用しない
authApp.post("/signup", zValidator("json", signUpRequestSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const userService = new UserService(db);
  const body = c.req.valid("json");

  const saltRounds = parseInt(c.env.SALT_ROUNDS, 10) || 10;

  try {
    const user = await userService.createUser({
      username: body.username,
      email: body.email,
      password: body.password,
      saltRounds,
    });

    const tokenResult = await createRefreshToken(
      db,
      user.userId,
      c.env.JWT_SECRET
    );
    return c.json(tokenResult as signUpResponse);
  } catch (error) {
    return c.json({ error: "Failed to create user or refresh token" }, 500);
  }
});

authApp.post("/signout", async (c) => {
  const db = drizzle(c.env.DB);
  const refreshToken = c.req.header("X-Refresh-Token");
  const jwtPayload = c.get("jwtPayload");

  try {
    await revokeRefreshToken(db, refreshToken || undefined, jwtPayload.userId);
  } catch (error) {
    // エラーは無視して204を返す
  }

  return new Response(null, { status: 204 });
});

authApp.post(
  "/refresh-token",
  zValidator("json", refreshTokenRequestSchema),
  async (c) => {
    const db = drizzle(c.env.DB);
    const body = c.req.valid("json");

    try {
      const result = await validateAndRefreshToken(
        db,
        body.refreshToken,
        c.env.JWT_SECRET
      );
      return c.json(result as refreshTokenResponse);
    } catch (error) {
      if (error instanceof Error) {
        return c.json({ error: error.message }, 401);
      }
      return c.json({ error: "Failed to refresh token" }, 500);
    }
  }
);

// ユーザー関連のエンドポイント
const usersApp = new Hono<AppContext<AuthBindings>>();

// 認証が必要なエンドポイントにミドルウェアを適用
usersApp.use("*", authMiddleware);

usersApp.get("/me", async (c) => {
  const db = drizzle(c.env.DB);
  const userService = new UserService(db);
  const jwtPayload = c.get("jwtPayload");

  const user = await userService.findUserById(jwtPayload.userId);
  if (!user) {
    return c.json({ error: "User not found" }, 404);
  }

  return c.json({
    userId: user.userId,
    username: user.username,
    email: user.email,
    createdAt: user.createTime,
    updatedAt: user.updateTime,
    delFlg: user.delFlg,
    updateCnt: user.updateCnt,
    updateUserId: user.updateUserId,
    createTime: user.createTime,
    createUserId: user.createUserId,
  });
});

usersApp.put("/me", zValidator("json", userUpdateRequestSchema), async (c) => {
  const db = drizzle(c.env.DB);
  const userService = new UserService(db);
  const jwtPayload = c.get("jwtPayload");
  const body = c.req.valid("json");

  const existingUser = await userService.findUserById(jwtPayload.userId);
  if (!existingUser) {
    return c.json({ error: "User not found" }, 404);
  }

  const saltRounds = parseInt(c.env.SALT_ROUNDS, 10) || 10;
  const updatedUser = await userService.updateUser(jwtPayload.userId, {
    username: body.username || existingUser.username,
    email: body.email || existingUser.email,
    password: body.password || existingUser.password,
    saltRounds: body.password ? saltRounds : undefined,
  });

  return c.json(updatedUser);
});

// ルートアプリケーションにサブアプリケーションをマウント
app.route("/auth", authApp);
app.route("/users", usersApp);

export default app;
