/**
 * WMO 天气代码 → 中文文案 + 图标。
 * 参考 https://open-meteo.com/en/docs 的 weather_code 定义。
 */

export type WeatherIconName = "sun" | "moon" | "cloud-sun" | "cloud" | "fog" | "drizzle" | "rain" | "snow" | "thunder";

const LABELS: Record<number, string> = {
  0: "晴",
  1: "大部晴朗",
  2: "局部多云",
  3: "阴",
  45: "雾",
  48: "雾凇",
  51: "小毛毛雨",
  53: "毛毛雨",
  55: "大毛毛雨",
  56: "冻毛毛雨",
  57: "强冻毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  66: "冻雨",
  67: "强冻雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  77: "米雪",
  80: "阵雨",
  81: "强阵雨",
  82: "暴雨",
  85: "阵雪",
  86: "强阵雪",
  95: "雷阵雨",
  96: "雷阵雨伴冰雹",
  99: "强雷阵雨伴冰雹",
};

/** 图标只按「现象大类」分，不追求 1:1 还原 30 种代码，避免图标集无限膨胀 */
const ICONS: Record<number, WeatherIconName> = {
  0: "sun",
  1: "sun",
  2: "cloud-sun",
  3: "cloud",
  45: "fog",
  48: "fog",
  51: "drizzle",
  53: "drizzle",
  55: "drizzle",
  56: "drizzle",
  57: "drizzle",
  61: "rain",
  63: "rain",
  65: "rain",
  66: "rain",
  67: "rain",
  71: "snow",
  73: "snow",
  75: "snow",
  77: "snow",
  80: "rain",
  81: "rain",
  82: "rain",
  85: "snow",
  86: "snow",
  95: "thunder",
  96: "thunder",
  99: "thunder",
};

export function describeWeatherCode(code: number): string {
  return LABELS[code] ?? "未知天气";
}

export function iconForWeatherCode(code: number, isDay = true): WeatherIconName {
  const icon = ICONS[code] ?? "cloud";
  if (icon === "sun") return isDay ? "sun" : "moon";
  if (icon === "cloud-sun") return isDay ? "cloud-sun" : "cloud";
  return icon;
}
