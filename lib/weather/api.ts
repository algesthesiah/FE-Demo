import { fetchJson, type FetchJsonOptions } from "../http";
import { AppError, isAppError } from "../errors";
import type { ForecastResponseDto, GeocodingGetResponseDto, GeocodingSearchResponseDto } from "./dto";
import type { Place, WeatherReport } from "./domain";
import { mapPlace, mapWeatherReport } from "./map";
import { keepMostRelevantPlaces } from "./rank";
import { rewriteQuery } from "./queryRewrites";

const GEOCODING_API = "https://geocoding-api.open-meteo.com/v1";
const FORECAST_API = "https://api.open-meteo.com/v1";

/** 界面语言，用于展示地名 */
const DISPLAY_LANGUAGE = "zh";
/** 原文语言：GeoNames 的主名称，拉丁文字输入时用它查询 */
const ORIGINAL_LANGUAGE = "en";

const SEARCH_RESULT_LIMIT = 6;
// 多取几个：同名地点被收敛后可能少于 6 条，宁可多传几条再裁，也别让结果区显得空荡荡
const SEARCH_FETCH_LIMIT = 8;

/**
 * 按关键字联想地点。
 *
 * 这是「用户敲键盘 → 立刻要结果」的后续数据，跑在浏览器里（CORS 由 Open-Meteo 放开）。
 * 返回结果经过 keepMostRelevantPlaces 收敛，见 lib/weather/rank.ts。
 */
export async function searchPlaces(keyword: string, options: FetchJsonOptions = {}): Promise<Place[]> {
  const { places } = await fetchCandidatePlaces(keyword, options);
  return keepMostRelevantPlaces(places).slice(0, SEARCH_RESULT_LIMIT);
}

/**
 * 仅供 `/debug` 页使用：把检索管线的中间结果一并暴露出来
 * （改写词、上游原始结果、收敛后的结果），用于核对词典与显著性策略。
 * 线上请求路径走 `searchPlaces`，不经过这里。
 */
export async function inspectPlaceSearch(keyword: string, options: FetchJsonOptions = {}) {
  const { query, places } = await fetchCandidatePlaces(keyword, options);
  return { query, raw: places, kept: keepMostRelevantPlaces(places).slice(0, SEARCH_RESULT_LIMIT) };
}

async function fetchCandidatePlaces(keyword: string, options: FetchJsonOptions) {
  const query = toUpstreamQuery(keyword);

  const url = buildUrl(`${GEOCODING_API}/search`, {
    name: query.term,
    count: SEARCH_FETCH_LIMIT,
    language: query.language,
    format: "json",
  });

  const response = await fetchJson<GeocodingSearchResponseDto>(url, options);
  return { query, places: (response.results ?? []).map(mapPlace) };
}

/**
 * 决定「用哪种语言、哪个词」去问上游。
 *
 * 数据源的中文别名质量差（繁简混用 + 缺别名），英文原名才是它的主名称，
 * 因此按输入文字的类型选语言：
 * - 中文输入 → 用中文查，但先经 rewriteQuery 改写成数据源认识的写法（如「纽约」→「紐約市」）；
 * - 拉丁文字输入（英文原名、拼音）→ 直接用英文查，此时结果也以英文展示（数据限制，见 README）。
 */
function toUpstreamQuery(keyword: string): { language: string; term: string } {
  const term = keyword.trim();

  if (!/[\u4e00-\u9fff]/.test(term)) {
    return { language: ORIGINAL_LANGUAGE, term };
  }

  return { language: DISPLAY_LANGUAGE, term: rewriteQuery(term) ?? term };
}

/** 按 id 精确反查地点（供 SSR 页在只有 URL 的情况下还原经纬度） */
export async function getPlace(id: number, options: FetchJsonOptions = {}): Promise<Place> {
  const url = buildUrl(`${GEOCODING_API}/get`, { id, language: DISPLAY_LANGUAGE });

  try {
    const response = await fetchJson<GeocodingGetResponseDto>(url, options);
    return mapPlace(response);
  } catch (error) {
    // Open-Meteo 用 400 + { reason: 'Location ID not found.' } 表达「id 不存在」，
    // 这里把它翻译成语义化的 not-found，避免上层把用户的拼写错误当成服务故障。
    if (isAppError(error) && error.status === 400) {
      throw new AppError("not-found", `未找到 ID 为 ${id} 的地点`, { cause: error });
    }
    throw error;
  }
}

/** 取当前实况 + 7 天预报 */
export async function getWeather(place: Place, options: FetchJsonOptions = {}): Promise<WeatherReport> {
  const url = buildUrl(`${FORECAST_API}/forecast`, {
    latitude: place.latitude,
    longitude: place.longitude,
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    // is_day 让逐时图标能正确区分白天/夜晚
    hourly: ["temperature_2m", "weather_code", "is_day"].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "wind_speed_10m_max",
      "uv_index_max",
      "sunrise",
      "sunset",
    ].join(","),
    // 单位显式写死，避免上游默认值变更悄悄改变领域模型的单位约定
    temperature_unit: "celsius",
    wind_speed_unit: "kmh",
    precipitation_unit: "mm",
    timezone: "auto",
    forecast_days: 7,
  });

  const response = await fetchJson<ForecastResponseDto>(url, options);
  return mapWeatherReport(response, place);
}

function buildUrl(endpoint: string, params: Record<string, string | number>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }
  return `${endpoint}?${search.toString()}`;
}
