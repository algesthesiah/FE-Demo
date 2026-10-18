/**
 * 领域模型：UI 直接消费的形状，与上游 API 解耦。
 *
 * 约定：领域模型一律使用公制单位（°C / km/h / mm / %），
 * 单位换算与格式化只发生在视图层（lib/format.ts），
 * 这样数据层不需要知道用户当前偏好的是摄氏度还是华氏度。
 */

export type Place = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  /** 一级行政区（省/州） */
  admin1: string | null;
  /** 二级行政区（市/县），仅用于区分同名地点 */
  admin2: string | null;
  country: string | null;
  timezone: string | null;
  /** 人口，缺失为 null（GeoNames 里的小地名普遍缺失） */
  population: number | null;
  /** GeoNames 要素代码，缺失为 null */
  featureCode: string | null;
};

/** 地点显著性评分：人口与行政级别的加权和，用于同名地点取舍，见 lib/weather/rank.ts */
export type PlaceSignificance = number;

/** WMO 天气代码，展示时由 lib/wmo.ts 翻译成文案与图标 */
export type WeatherCode = number;

export type CurrentWeather = {
  /** 观测时间，ISO 8601 且已按当地时区表达，例如 2026-10-18T10:45 */
  observedAt: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  isDay: boolean;
  code: WeatherCode;
};

export type HourlyForecastPoint = {
  time: string;
  temperature: number;
  code: WeatherCode;
  isDay: boolean;
};

export type DailyForecast = {
  date: string;
  code: WeatherCode;
  temperatureMax: number;
  temperatureMin: number;
  precipitationProbability: number | null;
  windSpeedMax: number | null;
  uvIndexMax: number | null;
  sunrise: string | null;
  sunset: string | null;
};

export type WeatherReport = {
  place: Place;
  timezone: string;
  elevation: number | null;
  current: CurrentWeather;
  hourly: HourlyForecastPoint[];
  daily: DailyForecast[];
};
