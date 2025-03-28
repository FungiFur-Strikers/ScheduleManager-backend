import { Context } from "hono";
import { eq } from "drizzle-orm";
import { userSettings } from "../../schema";
import { getDb, getCurrentTimestamp } from "@worker/common";
import { getUserSettingsResponse } from "@project/shared/schemas/api/getUserSettings";
import { updateUserSettingsResponse } from "@project/shared/schemas/api/updateUserSettings";

// ユーザー設定取得
export const getUserSettings = async (c: Context) => {
  const db = getDb(c.env.DB);
  const userId = c.get("userId");

  if (!userId) {
    return c.json({ error: "ユーザーIDが見つかりません" }, 401);
  }

  try {
    // ユーザー設定の取得
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (!settings) {
      return c.json({ error: "User settings not found" }, 404);
    }

    return c.json({
      id: settings.settingId,
      userId: settings.userId,
      theme: settings.theme,
      notificationEnabled: settings.notificationEnabled === 1,
      language: settings.language,
      delFlg: settings.delFlg === 1,
      updateCnt: settings.updateCnt,
      updateTime: settings.updateTime,
      updateUserId: settings.updateUserId,
      createTime: settings.createTime,
      createUserId: settings.createUserId,
    } as getUserSettingsResponse);
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return c.json({ error: "ユーザー設定の取得に失敗しました" }, 500);
  }
};

// ユーザー設定更新
export const updateUserSettings = async (c: Context) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();
  const userId = c.get("userId");

  if (!userId) {
    return c.json({ error: "ユーザーIDが見つかりません" }, 401);
  }

  try {
    // 既存の設定を取得
    const [settings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (!settings) {
      return c.json({ error: "User settings not found" }, 404);
    }

    const now = getCurrentTimestamp();

    // 更新データの準備
    const updateData: Record<string, unknown> = {
      updateCnt: (settings.updateCnt ?? 0) + 1,
      updateTime: now,
      updateUserId: userId,
    };

    // 各フィールドが存在する場合のみ更新対象に追加
    if (body.theme !== undefined) {
      updateData.theme = body.theme;
    }

    if (body.notificationEnabled !== undefined) {
      updateData.notificationEnabled = body.notificationEnabled ? 1 : 0;
    }

    if (body.language !== undefined) {
      updateData.language = body.language;
    }

    // 更新処理
    await db
      .update(userSettings)
      .set(updateData)
      .where(eq(userSettings.userId, userId));

    // 更新後のデータを取得
    const [updatedSettings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    return c.json({
      id: updatedSettings.settingId,
      userId: updatedSettings.userId,
      theme: updatedSettings.theme,
      notificationEnabled: updatedSettings.notificationEnabled === 1,
      language: updatedSettings.language,
      delFlg: updatedSettings.delFlg === 1,
      updateCnt: updatedSettings.updateCnt,
      updateTime: updatedSettings.updateTime,
      updateUserId: updatedSettings.updateUserId,
      createTime: updatedSettings.createTime,
      createUserId: updatedSettings.createUserId,
    } as updateUserSettingsResponse);
  } catch (error) {
    console.error("Error updating user settings:", error);
    return c.json({ error: "ユーザー設定の更新に失敗しました" }, 500);
  }
};

// ユーザー設定作成
export const createUserSettings = async (c: Context) => {
  const db = getDb(c.env.DB);
  const body = await c.req.json();
  const userId = c.get("userId");

  if (!userId) {
    return c.json({ error: "ユーザーIDが見つかりません" }, 401);
  }

  try {
    // すでに設定が存在するか確認
    const [existingSettings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    if (existingSettings) {
      return c.json({ error: "ユーザー設定はすでに存在します" }, 409);
    }

    const now = getCurrentTimestamp();

    // 新しい設定の作成
    await db.insert(userSettings).values({
      userId,
      theme: body.theme || "light",
      notificationEnabled: body.notificationEnabled ? 1 : 0,
      language: body.language || "ja",
      updateTime: now,
      updateUserId: userId,
      createTime: now,
      createUserId: userId,
    });

    // 作成した設定を取得
    const [createdSettings] = await db
      .select()
      .from(userSettings)
      .where(eq(userSettings.userId, userId));

    return c.json(
      {
        id: createdSettings.settingId,
        userId: createdSettings.userId,
        theme: createdSettings.theme,
        notificationEnabled: createdSettings.notificationEnabled === 1,
        language: createdSettings.language,
        delFlg: createdSettings.delFlg === 1,
        updateCnt: createdSettings.updateCnt,
        updateTime: createdSettings.updateTime,
        updateUserId: createdSettings.updateUserId,
        createTime: createdSettings.createTime,
        createUserId: createdSettings.createUserId,
      },
      201
    );
  } catch (error) {
    console.error("Error creating user settings:", error);
    return c.json({ error: "ユーザー設定の作成に失敗しました" }, 500);
  }
};
