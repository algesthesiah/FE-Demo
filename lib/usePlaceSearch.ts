import { useCallback, useEffect, useState } from "react";
import { toAppError, toPublicError, type PublicError } from "./errors";
import { useDebouncedValue } from "./useDebouncedValue";
import { searchPlaces } from "./weather/api";
import type { Place } from "./weather/domain";

export type PlaceSearchState = {
  status: "idle" | "loading" | "success" | "error";
  places: Place[];
  error: PublicError | null;
};

const DEBOUNCE_MS = 300;

/**
 * 地点联想的状态机。
 *
 * 刻意做成一个「显式状态机」而不是散落的 isLoading/isError 布尔值：
 * 布尔值组合会产出无意义的中间态（既 loading 又 error），
 * 而状态机让 UI 对每种组合都有唯一确定的渲染分支。
 */
export function usePlaceSearch(keyword: string): PlaceSearchState & { retry: () => void } {
  const debouncedKeyword = useDebouncedValue(keyword.trim(), DEBOUNCE_MS);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<PlaceSearchState>({ status: "idle", places: [], error: null });

  useEffect(() => {
    const needle = debouncedKeyword.trim();
    if (needle.length === 0) {
      setState({ status: "idle", places: [], error: null });
      return;
    }

    const controller = new AbortController();
    let isActive = true;
    // 保留上一次的结果，避免连续输入时列表闪烁
    setState((previous) => ({ ...previous, status: "loading", error: null }));

    searchPlaces(needle, { signal: controller.signal })
      .then((places) => {
        if (!isActive) return;
        setState({ status: "success", places, error: null });
      })
      .catch((error: unknown) => {
        if (!isActive) return;
        const appError = toAppError(error);
        // 用户继续输入导致的取消是正常流程，不该变成错误提示
        if (appError.kind === "aborted") return;
        setState({ status: "error", places: [], error: toPublicError(appError) });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [debouncedKeyword, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  return { ...state, retry };
}
