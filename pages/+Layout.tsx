import type { ReactNode } from "react";
import { Link } from "../components/Link";
import { TemperatureUnitProvider } from "../components/TemperatureUnitProvider";
import { UnitToggle } from "../components/UnitToggle";
import "./app.css";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <TemperatureUnitProvider>
      {/* 页面切换进度条由 +onPageTransitionStart/End 通过 body 上的 class 驱动 */}
      <div className="route-progress" aria-hidden="true" />

      <div className="app">
        <header className="app__header">
          <div className="app__header-inner">
            <Link className="brand" href="/">
              <svg className="brand__mark" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
                <circle cx="12" cy="12" r="4" fill="currentColor" />
                <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M12 3v2.4" />
                  <path d="M12 18.6V21" />
                  <path d="M3 12h2.4" />
                  <path d="M18.6 12H21" />
                  <path d="M5.6 5.6l1.7 1.7" />
                  <path d="M16.7 16.7l1.7 1.7" />
                  <path d="M18.4 5.6l-1.7 1.7" />
                  <path d="M7.3 16.7l-1.7 1.7" />
                </g>
              </svg>
              <span className="brand__name">天气</span>
            </Link>

            <div className="app__header-actions">
              <UnitToggle />
            </div>
          </div>
        </header>

        <main className="app__main">{children}</main>

        <footer className="app__footer">
          <span>
            数据来源{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo
            </a>
            （公开 API，无需 Key）
          </span>
          <span>Vike + React · SSR</span>
        </footer>
      </div>
    </TemperatureUnitProvider>
  );
}
