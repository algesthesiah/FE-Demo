/**
 * 应用层统一错误模型。
 *
 * 目标：把「网络断了 / 请求超时 / 上游 4xx/5xx / 地址不存在」等五花八门的失败，
 * 归一成 UI 可以直接消费的 { kind, message, isRetryable }，
 * 从而让「错误状态」成为一等公民，而不是 render 里的 if (error) 散弹枪。
 */

export type AppErrorKind =
  | "network" // 网络不可达
  | "timeout" // 超过约定响应时间
  | "upstream" // 上游返回了非 2xx，或返回体无法解析
  | "not-found" // 资源（地点）不存在
  | "invalid" // 输入/URL 不合法
  | "aborted" // 被主动取消（不是错误，调用方应忽略）
  | "unknown";

export class AppError extends Error {
  readonly kind: AppErrorKind;
  readonly status: number | undefined;

  constructor(kind: AppErrorKind, message: string, options: { status?: number; cause?: unknown } = {}) {
    super(message, { cause: options.cause });
    this.name = "AppError";
    this.kind = kind;
    this.status = options.status;
  }

  /** 该失败是否有可能通过「重试」自愈 */
  get isRetryable(): boolean {
    return this.kind !== "not-found" && this.kind !== "invalid" && this.kind !== "aborted";
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/**
 * 把任意 throw 出来的东西转成 AppError。
 * 视图层只认识 AppError，因此这是进入 UI 前的唯一收口。
 */
export function toAppError(error: unknown): AppError {
  if (isAppError(error)) return error;

  const name = error instanceof Error ? error.name : undefined;
  if (name === "TimeoutError") return new AppError("timeout", "请求超时，请稍后再试", { cause: error });
  if (name === "AbortError") return new AppError("aborted", "请求已取消", { cause: error });
  if (error instanceof SyntaxError) return new AppError("upstream", "上游返回了无法解析的数据", { cause: error });
  if (error instanceof TypeError) return new AppError("network", "网络连接失败，请检查网络后重试", { cause: error });

  return new AppError("unknown", error instanceof Error ? error.message : "发生未知错误", { cause: error });
}

/** 传给浏览器的数据：只暴露必要信息，避免把上游细节/堆栈泄漏到客户端 */
export type PublicError = {
  kind: AppErrorKind;
  message: string;
  isRetryable: boolean;
};

export function toPublicError(error: unknown): PublicError {
  const appError = toAppError(error);
  return {
    kind: appError.kind,
    message: appError.message,
    isRetryable: appError.isRetryable,
  };
}
