import { AppError, toAppError } from "./errors";

export type FetchJsonOptions = {
  /** 调用方持有的信号，用于取消过期请求（例如搜索联想） */
  signal?: AbortSignal;
  timeoutMs?: number;
};

const DEFAULT_TIMEOUT_MS = 8_000;

/**
 * fetch + JSON 解析的最小封装，补上原生 fetch 缺的三件事：
 * 1. 超时（原生 fetch 会一直挂着，直到浏览器自己放弃）
 * 2. 非 2xx 不抛错（最容易踩的坑）
 * 3. 错误归一为 AppError
 */
export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
  const { signal, timeoutMs = DEFAULT_TIMEOUT_MS } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new DOMException(`Request timed out after ${timeoutMs}ms`, "TimeoutError"));
  }, timeoutMs);

  const abortFromCaller = () => controller.abort(signal?.reason);
  if (signal) {
    if (signal.aborted) abortFromCaller();
    else signal.addEventListener("abort", abortFromCaller);
  }

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { accept: "application/json" },
    });

    if (!response.ok) {
      const reason = await readErrorReason(response);
      throw new AppError(response.status === 404 ? "not-found" : "upstream", reason ?? `上游服务返回 ${response.status}`, {
        status: response.status,
      });
    }

    return (await response.json()) as T;
  } catch (error) {
    throw toAppError(error);
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

async function readErrorReason(response: Response): Promise<string | null> {
  try {
    const body = (await response.json()) as { reason?: string };
    return typeof body?.reason === "string" ? body.reason : null;
  } catch {
    return null;
  }
}
