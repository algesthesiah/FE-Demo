import type { ReactNode } from "react";
import { iconForWeatherCode, type WeatherIconName } from "../lib/wmo";

/**
 * 图标直接用内联 SVG：
 * 天气图标数量有限（9 个），内联后没有额外网络请求、不依赖图标库，
 * 也天然跟随文字颜色（currentColor），不必为日间/夜间再准备两套色值。
 */
const ICONS: Record<WeatherIconName, ReactNode> = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M12 2.4v2.6" />
        <path d="M12 19v2.6" />
        <path d="M2.4 12H5" />
        <path d="M19 12h2.6" />
        <path d="M5.2 5.2l1.8 1.8" />
        <path d="M17 17l1.8 1.8" />
        <path d="M18.8 5.2L17 7" />
        <path d="M7 17l-1.8 1.8" />
      </g>
    </>
  ),
  moon: <path d="M20.5 15.2A8.6 8.6 0 0 1 8.8 3.5a7 7 0 1 0 11.7 11.7z" fill="currentColor" />,
  "cloud-sun": (
    <>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M7.4 5.2v1.9" />
        <path d="M3.9 8.6h1.9" />
        <path d="M4.9 5.9l1.3 1.3" />
        <path d="M10.2 5.9L8.9 7.2" />
      </g>
      <circle cx="7.4" cy="9.6" r="2.5" fill="currentColor" />
      <path d="M8.6 19.4h9.1a3.2 3.2 0 0 0 .3-6.4 4.7 4.7 0 0 0-8.9-1.1 3.3 3.3 0 0 0-.5 7.5z" fill="currentColor" />
    </>
  ),
  cloud: (
    <path d="M6.4 18.6h11.2a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2 3.6 3.6 0 0 0-1.9 8.2z" fill="currentColor" />
  ),
  fog: (
    <>
      <path d="M6.4 15.6h11.2a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2 3.6 3.6 0 0 0-1.9 8.2z" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
        <path d="M4 19h5.5" />
        <path d="M10.5 19h9" />
      </g>
    </>
  ),
  drizzle: (
    <>
      <path d="M6.4 15.4h11.2a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2 3.6 3.6 0 0 0-1.9 8.2z" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M9 18.4v1.6" />
        <path d="M13 18.4v2.4" />
        <path d="M17 18.4v1.6" />
      </g>
    </>
  ),
  rain: (
    <>
      <path d="M6.4 14.6h11.2a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2 3.6 3.6 0 0 0-1.9 8.2z" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8.6 17.4l-.8 3.4" />
        <path d="M12.6 17.4l-.8 3.4" />
        <path d="M16.6 17.4l-.8 3.4" />
      </g>
    </>
  ),
  snow: (
    <>
      <path d="M6.4 14.4h11.2a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2 3.6 3.6 0 0 0-1.9 8.2z" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <path d="M9 18v2.6M7.7 19.3h2.6" />
        <path d="M15 18v2.6M13.7 19.3h2.6" />
      </g>
    </>
  ),
  thunder: (
    <>
      <path d="M6.4 14.6h11.2a3.5 3.5 0 0 0 .4-7 5 5 0 0 0-9.7-1.2 3.6 3.6 0 0 0-1.9 8.2z" fill="currentColor" />
      <path d="M13.4 16.6l-3.2 4.2h2.6l-1 2.8 3.6-4.6h-2.4z" fill="currentColor" />
    </>
  ),
};

export function WeatherIcon({ code, isDay = true, size = 24 }: { code: number; isDay?: boolean; size?: number }) {
  const name = iconForWeatherCode(code, isDay);

  return (
    <svg
      className="weather-icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name]}
    </svg>
  );
}
