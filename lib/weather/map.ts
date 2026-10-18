import type { ForecastResponseDto, GeoPlaceDto } from "./dto";
import type { CurrentWeather, DailyForecast, HourlyForecastPoint, Place, WeatherReport } from "./domain";

/**
 * DTO → 领域模型的唯一翻译层。
 * 好处：上游改字段名/改结构时，只需要改这一个文件，组件不受影响。
 */

export function mapPlace(dto: GeoPlaceDto): Place {
  return {
    id: dto.id,
    name: dto.name,
    latitude: dto.latitude,
    longitude: dto.longitude,
    admin1: dto.admin1 ?? null,
    admin2: dto.admin2 ?? null,
    country: dto.country ?? null,
    timezone: dto.timezone ?? null,
    population: dto.population ?? null,
    featureCode: dto.feature_code ?? null,
  };
}

export function mapWeatherReport(dto: ForecastResponseDto, place: Place): WeatherReport {
  const { current, hourly, daily } = dto;

  const currentWeather: CurrentWeather = {
    observedAt: current.time,
    temperature: current.temperature_2m ?? 0,
    apparentTemperature: current.apparent_temperature ?? 0,
    humidity: current.relative_humidity_2m ?? 0,
    precipitation: current.precipitation ?? 0,
    windSpeed: current.wind_speed_10m ?? 0,
    windDirection: current.wind_direction_10m ?? 0,
    isDay: current.is_day !== 0,
    code: current.weather_code ?? 0,
  };

  return {
    place,
    timezone: dto.timezone,
    elevation: dto.elevation ?? null,
    current: currentWeather,
    hourly: zipHourly(hourly),
    daily: zipDaily(daily),
  };
}

function zipHourly(hourly: ForecastResponseDto["hourly"]): HourlyForecastPoint[] {
  // 序列化数组时丢弃缺测的整点，避免把 null 泄漏到 UI
  return hourly.time
    .map((time, index) => ({
      time,
      temperature: hourly.temperature_2m[index],
      code: hourly.weather_code[index],
      isDay: hourly.is_day[index] === null ? null : hourly.is_day[index] !== 0,
    }))
    .filter(
      (point): point is HourlyForecastPoint => point.temperature !== null && point.code !== null && point.isDay !== null,
    );
}

function zipDaily(daily: ForecastResponseDto["daily"]): DailyForecast[] {
  return daily.time
    .map((date, index) => ({
      date,
      code: daily.weather_code[index],
      temperatureMax: daily.temperature_2m_max[index],
      temperatureMin: daily.temperature_2m_min[index],
      precipitationProbability: daily.precipitation_probability_max[index] ?? null,
      windSpeedMax: daily.wind_speed_10m_max[index] ?? null,
      uvIndexMax: daily.uv_index_max[index] ?? null,
      sunrise: daily.sunrise[index] ?? null,
      sunset: daily.sunset[index] ?? null,
    }))
    // 最高/最低温是预报展示的地基，缺了就没有可渲染的内容，直接丢掉这一天
    .filter((day): day is DailyForecast => day.temperatureMax !== null && day.temperatureMin !== null);
}
