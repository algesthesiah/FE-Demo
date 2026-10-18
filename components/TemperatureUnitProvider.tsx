import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_TEMPERATURE_UNIT, isTemperatureUnit, type TemperatureUnit } from "../lib/units";

const STORAGE_KEY = "weather.temperature-unit";

type TemperatureUnitValue = {
  unit: TemperatureUnit;
  setUnit: (unit: TemperatureUnit) => void;
};

const TemperatureUnitContext = createContext<TemperatureUnitValue | null>(null);

/**
 * 全局 UI 偏好之一：温度单位。
 *
 * 用 Context 而不是 Redux/Zustand：这是「一个偏好值」，引入状态管理库的收益远小于成本。
 * 真正的业务数据（天气）不进任何全局 store，而是由 Vike 的 +data 提供，见 README。
 */
export function TemperatureUnitProvider({ children }: { children: ReactNode }) {
  const [unit, setUnitState] = useState<TemperatureUnit>(DEFAULT_TEMPERATURE_UNIT);

  useEffect(() => {
    // 首屏（SSR + hydration）一律按默认单位渲染，挂载后再套用本地偏好。
    // 若直接在渲染期读取 localStorage，服务端没有 localStorage、客户端有，就会 hydration mismatch。
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (isTemperatureUnit(stored)) setUnitState(stored);
  }, []);

  const setUnit = useCallback((next: TemperatureUnit) => {
    setUnitState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // 隐私模式下 localStorage 会抛错，偏好丢失可以接受，不该让应用崩掉
    }
  }, []);

  const value = useMemo(() => ({ unit, setUnit }), [unit, setUnit]);

  return <TemperatureUnitContext.Provider value={value}>{children}</TemperatureUnitContext.Provider>;
}

export function useTemperatureUnit(): TemperatureUnitValue {
  const value = useContext(TemperatureUnitContext);
  if (!value) throw new Error("useTemperatureUnit 必须在 <TemperatureUnitProvider> 内部使用");
  return value;
}
