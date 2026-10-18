import {
  formatClock,
  formatHumidity,
  formatPrecipitation,
  formatTemperature,
  formatUvIndex,
  formatWindDirection,
  formatWindSpeed,
} from "../lib/format";
import { formatPlaceRegion } from "../lib/places";
import { describeWeatherCode } from "../lib/wmo";
import type { CurrentWeather, DailyForecast, Place } from "../lib/weather/domain";
import { useTemperatureUnit } from "./TemperatureUnitProvider";
import { WeatherIcon } from "./WeatherIcon";

type Props = {
  place: Place;
  current: CurrentWeather;
  /** 今日的日报条目，用于补充日出/日落等信息；缺失时只展示实况指标 */
  today?: DailyForecast;
};

export function CurrentWeatherCard({ place, current, today }: Props) {
  const { unit } = useTemperatureUnit();
  const description = describeWeatherCode(current.code);

  return (
    <section className={`current current--${current.isDay ? "day" : "night"}`}>
      <header className="current__header">
        <div className="current__location">
          <h1 className="current__place">{place.name}</h1>
          <p className="current__region">{formatPlaceRegion(place)}</p>
        </div>
        <p className="current__timestamp">观测于 {formatClock(current.observedAt)}（当地时间）</p>
      </header>

      <div className="current__body">
        <WeatherIcon code={current.code} isDay={current.isDay} size={72} />
        <p className="current__temperature">{formatTemperature(current.temperature, unit)}</p>
        <div className="current__summary">
          <span className="current__condition">{description}</span>
          <span className="current__feels-like">体感 {formatTemperature(current.apparentTemperature, unit)}</span>
        </div>
      </div>

      <dl className="metrics">
        <Metric label="湿度" value={formatHumidity(current.humidity)} />
        <Metric label="降水" value={formatPrecipitation(current.precipitation)} />
        <Metric label="风" value={`${formatWindDirection(current.windDirection)} ${formatWindSpeed(current.windSpeed)}`} />
        {today?.sunrise && <Metric label="日出" value={formatClock(today.sunrise)} />}
        {today?.sunset && <Metric label="日落" value={formatClock(today.sunset)} />}
        {today && today.uvIndexMax !== null && <Metric label="紫外线" value={formatUvIndex(today.uvIndexMax)} />}
      </dl>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metrics__item">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
