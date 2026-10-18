import { reload } from "vike/client/router";
import { useData } from "vike-react/useData";
import { CurrentWeatherCard } from "../../../components/CurrentWeatherCard";
import { DailyForecast } from "../../../components/DailyForecast";
import { ErrorState } from "../../../components/FeedbackStates";
import { HourlyForecast } from "../../../components/HourlyForecast";
import { LocationSearch } from "../../../components/LocationSearch";
import type { WeatherPageData } from "./+data";

export default function Page() {
  const data = useData<WeatherPageData>();

  if (data.kind === "failed") {
    return (
      <div className="weather-page">
        <div className="weather-page__search">
          <LocationSearch variant="compact" />
        </div>
        <ErrorState error={data.error} onRetry={() => reload()} title="暂时拿不到天气数据" />
      </div>
    );
  }

  const { report } = data;

  return (
    <div className="weather-page">
      <div className="weather-page__search">
        <LocationSearch variant="compact" />
      </div>

      <CurrentWeatherCard place={report.place} current={report.current} today={report.daily[0]} />

      <HourlyForecast points={report.hourly} />

      <DailyForecast days={report.daily} todayIsoDate={report.current.observedAt} />

      <p className="weather-page__footer">
        <span>数据来自 Open-Meteo，约每 15 分钟更新</span>
        {/* 走 Vike 的客户端路由重载：重新执行 +data 拿最新数据，而不是整页刷新 */}
        <button type="button" className="button button--ghost" onClick={() => reload()}>
          刷新
        </button>
      </p>
    </div>
  );
}
