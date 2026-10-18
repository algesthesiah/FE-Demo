import { useData } from "vike-react/useData";
import type { Data } from "./+data";

/**
 * `/debug`：把联想搜索的检索管线摊开看。
 * 每行是上游返回的一条原始结果，能直接看到哪些被收敛掉、以及各自的显著性分数。
 */
export default function Page() {
  const { keyword, queries } = useData<Data>();

  return (
    <section className="debug">
      <h1 className="debug__title">联想搜索调试</h1>

      {/* 用原生 GET 表单：没有 JS 也能用，也不必为调试页引入客户端状态 */}
      <form className="debug__form" method="get">
        <input
          className="debug__input"
          type="search"
          name="q"
          defaultValue={keyword}
          placeholder="输入地点，回车查看"
          aria-label="地点关键字"
        />
        <button className="debug__button" type="submit">
          查询
        </button>
      </form>

      <p className="debug__hint">
        留空则展示默认样本：{["成都", "伦敦", "纽约", "东京", "长安", "Springfield"].join("、")}
        。生产环境本页返回 404。
      </p>

      {queries.map((query) => (
        <article className="debug__block" key={query.keyword}>
          <h2 className="debug__keyword">
            「{query.keyword}」
            {query.upstreamTerm !== query.keyword && (
              <span className="debug__rewritten">
                {" "}
                → 改写为「{query.upstreamTerm}」（{query.upstreamLanguage}）
              </span>
            )}
          </h2>

          {query.rows.length === 0 ? (
            <p className="debug__empty">上游没有返回任何结果</p>
          ) : (
            <table className="debug__table">
              <thead>
                <tr>
                  <th>保留</th>
                  <th>id</th>
                  <th>名称</th>
                  <th>一级行政区</th>
                  <th>二级行政区</th>
                  <th>国家</th>
                  <th>人口</th>
                  <th>要素代码</th>
                  <th>显著性</th>
                </tr>
              </thead>
              <tbody>
                {query.rows.map((row) => (
                  <tr key={row.place.id} className={row.kept ? undefined : "debug__row--dropped"}>
                    <td>{row.kept ? "✓" : "—"}</td>
                    <td>{row.place.id}</td>
                    <td>{row.place.name}</td>
                    <td>{row.place.admin1 ?? "—"}</td>
                    <td>{row.place.admin2 ?? "—"}</td>
                    <td>{row.place.country ?? "—"}</td>
                    <td>{row.place.population?.toLocaleString("zh-CN") ?? "—"}</td>
                    <td>{row.place.featureCode ?? "—"}</td>
                    <td>{row.significance.toLocaleString("zh-CN")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </article>
      ))}
    </section>
  );
}
