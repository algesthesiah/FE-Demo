import type { TemperatureUnit } from "./units";

/**
 * 格式化工具。
 *
 * 重要约定：这里所有时间格式化都基于字符串切片或 UTC 基准的 Date，
 * 绝不使用 new Date(localString).toLocale*()。
 * 因为 API 返回的时间本身就是「目的地的本地时间」，
 * 若在服务端按服务器时区、在浏览器按用户时区格式化，就会出现 hydration mismatch。
 */

const WEEKDAYS = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"] as const;

export function convertTemperature(celsius: number, unit: TemperatureUnit): number {
  return unit === "fahrenheit" ? celsius * (9 / 5) + 32 : celsius;
}

export function formatTemperature(celsius: number, unit: TemperatureUnit, withUnit = true): string {
  const value = Math.round(convertTemperature(celsius, unit));
  return withUnit ? `${value}°` : `${value}`;
}

export function temperatureUnitLabel(unit: TemperatureUnit): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

/** 2026-10-18T10:45 → 10:45 */
export function formatClock(isoDateTime: string): string {
  return isoDateTime.slice(11, 16);
}

/** 2026-10-18 → 10/18 */
export function formatMonthDay(isoDate: string): string {
  const [, month, day] = isoDate.split("-");
  return `${Number(month)}/${Number(day)}`;
}

/** 2026-10-18 → 周六（用 UTC 基准计算，保证服务端与浏览器结果一致） */
export function formatWeekday(isoDate: string): string {
  const weekday = new Date(`${isoDate.slice(0, 10)}T00:00:00Z`).getUTCDay();
  return WEEKDAYS[weekday] ?? "";
}

/** 当天显示「今天」，其余显示星期 */
export function formatDayLabel(isoDate: string, todayIsoDate: string): string {
  if (isoDate.slice(0, 10) === todayIsoDate.slice(0, 10)) return "今天";
  return formatWeekday(isoDate);
}

export function formatHumidity(percent: number): string {
  return `${Math.round(percent)}%`;
}

export function formatPrecipitation(mm: number): string {
  return `${mm.toFixed(1)} mm`;
}

export function formatWindSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`;
}

const WIND_DIRECTIONS = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"] as const;

/** 气象风向角度 → 十六方位中的八方位（角度表示风的来向） */
export function formatWindDirection(degrees: number): string {
  const index = Math.round((((degrees % 360) + 360) % 360) / 45) % 8;
  return `${WIND_DIRECTIONS[index]}风`;
}

export function formatUvIndex(uvIndex: number): string {
  if (uvIndex < 3) return `${Math.round(uvIndex)}（低）`;
  if (uvIndex < 6) return `${Math.round(uvIndex)}（中等）`;
  if (uvIndex < 8) return `${Math.round(uvIndex)}（高）`;
  return `${Math.round(uvIndex)}（很高）`;
}
