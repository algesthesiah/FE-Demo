/**
 * Open-Meteo 原始响应类型（DTO）。
 *
 * 只声明「我们真正用到的字段」——上游字段很多，全量声明会让人误以为都用上了，
 * 也让后续 API 升级时的 diff 噪声变大。
 */

export type GeoPlaceDto = {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  elevation?: number;
  /** 人口。 GeoNames 中大量小地名没有这个字段 —— 它同时也是判断「这个地名是否重要」的关键信号 */
  population?: number;
  /** GeoNames 要素代码：PPLC 首都 / PPLA 一级行政中心 / PPL 普通居民点 … */
  feature_code?: string;
};

export type GeocodingSearchResponseDto = {
  results?: GeoPlaceDto[];
};

export type GeocodingGetResponseDto = GeoPlaceDto;

export type ForecastResponseDto = {
  timezone: string;
  elevation?: number;
  current: {
    time: string;
    temperature_2m: number | null;
    relative_humidity_2m: number | null;
    apparent_temperature: number | null;
    is_day: number | null;
    precipitation: number | null;
    weather_code: number | null;
    wind_speed_10m: number | null;
    wind_direction_10m: number | null;
  };
  hourly: {
    time: string[];
    temperature_2m: (number | null)[];
    weather_code: (number | null)[];
    is_day: (number | null)[];
  };
  daily: {
    time: string[];
    weather_code: (number | null)[];
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    precipitation_probability_max: (number | null)[];
    wind_speed_10m_max: (number | null)[];
    uv_index_max: (number | null)[];
    sunrise: (string | null)[];
    sunset: (string | null)[];
  };
};
