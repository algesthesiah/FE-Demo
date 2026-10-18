import type { HourlyForecastPoint } from "./domain";

/**
 * 从「当前时刻」开始截取未来 N 个小时。
 *
 * API 返回的是 7 天 × 24 小时 = 168 个点，而 UI 只需要 24 个。
 * 这个函数在服务端 +data 里被调用，因此传输到浏览器的只有真正要用的数据。
 *
 * 时间字符串形如 2026-10-18T10:45，是「同一时区的本地时间」，
 * 且格式定长，所以字典序比较等价于时间先后比较，无需构造 Date。
 */
export function selectUpcomingHours(hourly: HourlyForecastPoint[], fromIso: string, count: number): HourlyForecastPoint[] {
  const from = fromIso.slice(0, 13); // 截断到小时：2026-10-18T10
  const startIndex = hourly.findIndex((point) => point.time.slice(0, 13) >= from);
  const start = startIndex === -1 ? 0 : startIndex;
  return hourly.slice(start, start + count);
}
