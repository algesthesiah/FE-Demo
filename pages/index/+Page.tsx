import { Link } from "../../components/Link";
import { LocationSearch } from "../../components/LocationSearch";
import { HOT_CITIES, hotCityPath } from "../../lib/places";

export default function Page() {
  return (
    <div className="landing">
      <section className="hero">
        <h1 className="hero__title">查一查，现在那里天气如何</h1>
        <p className="hero__subtitle">实时天气与未来 7 天预报，覆盖全球城市，无需注册、无需 API Key。</p>

        <LocationSearch variant="hero" autoFocus />

        <div className="hero__hot-cities">
          <span className="hero__hot-cities-label">热门城市</span>
          {HOT_CITIES.map((city) => (
            <Link key={city.id} className="chip" href={hotCityPath(city)}>
              {city.label}
            </Link>
          ))}
        </div>
      </section>

      <section className="highlights">
        <article className="highlight">
          <h2 className="highlight__title">实时实况</h2>
          <p className="highlight__text">温度、体感、湿度、风向风速与降水量，一眼看全。</p>
        </article>
        <article className="highlight">
          <h2 className="highlight__title">逐时与 7 天</h2>
          <p className="highlight__text">未来 24 小时逐时变化，以及 7 天的最高/最低温与降水概率。</p>
        </article>
        <article className="highlight">
          <h2 className="highlight__title">可分享的链接</h2>
          <p className="highlight__text">每个地点都有独立 URL，服务端直出内容，刷新与分享都不会空白。</p>
        </article>
      </section>
    </div>
  );
}
