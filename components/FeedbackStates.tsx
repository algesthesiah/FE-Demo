import type { PublicError } from "../lib/errors";

export function Spinner({ className = "" }: { className?: string }) {
  return <span className={`spinner ${className}`.trim()} aria-hidden="true" />;
}

export function LoadingState({ label = "加载中…" }: { label?: string }) {
  return (
    <div className="state state--loading" role="status">
      <Spinner />
      <p>{label}</p>
    </div>
  );
}

/**
 * 错误状态：把「能否重试」作为数据的一部分（PublicError.isRetryable），
 * 只有在重试有意义时才给出重试按钮，避免让用户对着 404 疯狂点击。
 */
export function ErrorState({
  error,
  onRetry,
  title = "出了点问题",
}: {
  error: PublicError;
  onRetry?: () => void;
  title?: string;
}) {
  return (
    <div className="state state--error" role="alert">
      <p className="state__title">{title}</p>
      <p className="state__message">{error.message}</p>
      {onRetry && error.isRetryable && (
        <button type="button" className="button" onClick={onRetry}>
          重试
        </button>
      )}
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="state state--empty">
      <p className="state__message">{message}</p>
    </div>
  );
}
