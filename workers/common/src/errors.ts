import { Context } from "hono";

/**
 * アプリケーション全体で使用するエラークラス
 */
export class AppError extends Error {
  public status: number;
  public details?: Record<string, unknown>;

  constructor(
    message: string,
    status: number = 500,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.details = details;
  }
}

/**
 * リソースが見つからない場合のエラー
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = "指定されたリソースが見つかりません",
    details?: Record<string, unknown>
  ) {
    super(message, 404, details);
    this.name = "NotFoundError";
  }
}

/**
 * 認証エラー
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = "認証に失敗しました",
    details?: Record<string, unknown>
  ) {
    super(message, 401, details);
    this.name = "AuthenticationError";
  }
}

/**
 * 認可エラー（権限不足）
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = "操作を実行する権限がありません",
    details?: Record<string, unknown>
  ) {
    super(message, 403, details);
    this.name = "AuthorizationError";
  }
}

/**
 * バリデーションエラー
 */
export class ValidationError extends AppError {
  constructor(
    message: string = "入力データが無効です",
    details?: Record<string, unknown>
  ) {
    super(message, 400, details);
    this.name = "ValidationError";
  }
}

/**
 * エラーハンドラー関数
 * Honoアプリケーション内でエラーを適切に処理します
 */
export const errorHandler = (err: Error, c: Context): Response => {
  console.error("Error:", err);

  if (err instanceof AppError) {
    return c.json(
      {
        error: {
          message: err.message,
          type: err.name,
          details: err.details,
        },
      },
      err.status as any
    );
  }

  // 予期せぬエラー
  return c.json(
    {
      error: {
        message: "サーバー内部エラーが発生しました",
        type: "InternalServerError",
      },
    },
    500
  );
};
