import { formatClock, formatTemperature } from "../lib/format";
import type { HourlyForecastPoint } from "../lib/weather/domain";
import { useTemperatureUnit } from "./TemperatureUnitProvider";
import { WeatherIcon } from "./WeatherIcon";

export function HourlyForecast({ points }: { points: HourlyForecastPoint[] }) {
  const { unit } = useTemperatureUnit();

  if (points.length === 0) return null;

  return (
    <section className="panel">
      <h2 className="panel__title">未来 24 小时</h2>
      <ul className="hourly">
        {points.map((point, index) => (
          <li key={point.time} className="hourly__item">
            <span className="hourly__time">{index === 0 ? "现在" : formatClock(point.time)}</span>
            <WeatherIcon code={point.code} isDay={point.isDay} size={22} />
            <span className="hourly__temperature">{formatTemperature(point.temperature, unit)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
