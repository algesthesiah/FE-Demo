import { formatDayLabel, formatMonthDay, formatTemperature } from "../lib/format";
import type { DailyForecast as DailyForecastEntry } from "../lib/weather/domain";
import { useTemperatureUnit } from "./TemperatureUnitProvider";
import { WeatherIcon } from "./WeatherIcon";

export function DailyForecast({ days, todayIsoDate }: { days: DailyForecastEntry[]; todayIsoDate: string }) {
  const { unit } = useTemperatureUnit();

  if (days.length === 0) return null;

  // 温度条按整段预报的极值定位，这样条形的相对长度才有跨天可比性
  const lowest = Math.min(...days.map((day) => day.temperatureMin));
  const highest = Math.max(...days.map((day) => day.temperatureMax));
  const span = Math.max(highest - lowest, 1);

  return (
    <section className="panel">
      <h2 className="panel__title">7 天预报</h2>
      <ul className="daily">
        {days.map((day) => {
          const offset = ((day.temperatureMin - lowest) / span) * 100;
          const width = Math.max(((day.temperatureMax - day.temperatureMin) / span) * 100, 6);

          return (
            <li key={day.date} className="daily__row">
              <span className="daily__label">{formatDayLabel(day.date, todayIsoDate)}</span>
              <span className="daily__date">{formatMonthDay(day.date)}</span>
              <span className="daily__icon">
                <WeatherIcon code={day.code} size={22} />
              </span>
              <span className="daily__precipitation">
                {day.precipitationProbability === null ? "—" : `${day.precipitationProbability}%`}
              </span>
              <span className="daily__range">
                <span className="daily__low">{formatTemperature(day.temperatureMin, unit)}</span>
                <span className="daily__bar">
                  <span className="daily__bar-fill" style={{ left: `${offset}%`, width: `${width}%` }} />
                </span>
                <span className="daily__high">{formatTemperature(day.temperatureMax, unit)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
