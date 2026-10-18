import { usePageContext } from "vike-react/usePageContext";
import { Link } from "../../components/Link";
import { LocationSearch } from "../../components/LocationSearch";

export default function Page() {
  const { is404 } = usePageContext();

  if (is404) {
    return (
      <div className="error-page">
        <h1 className="error-page__title">没有找到这个地方</h1>
        <p className="error-page__text">链接可能拼写有误，或者该地点已被移除。换个名字再搜一次：</p>
        <LocationSearch variant="hero" autoFocus />
        <Link className="button button--ghost" href="/">
          回到首页
        </Link>
      </div>
    );
  }

  return (
    <div className="error-page">
      <h1 className="error-page__title">服务暂时不可用</h1>
      <p className="error-page__text">天气服务在处理请求时出错了，稍后重试通常就能恢复。</p>
      <Link className="button" href="/">
        回到首页
      </Link>
    </div>
  );
}
