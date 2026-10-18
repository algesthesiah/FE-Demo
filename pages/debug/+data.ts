import { render } from "vike/abort";
import type { PageContextServer } from "vike/types";
import { inspectPlaceSearch } from "../../lib/weather/api";
import { significance } from "../../lib/weather/rank";
import type { Place } from "../../lib/weather/domain";

/**
 * 联想搜索的调试页（`/debug?q=成都`）。
 *
 * 存在的理由：地名检索的正确性完全取决于上游数据状况（同名条目、中文别名繁简混用），
 * 而这些状况会随 GeoNames 的更新变化。有了这个页面，
 * 「词典要不要加一条」「阈值要不要调」都能当场用真实数据核对，而不是凭感觉改。
 *
 * 仅在开发环境可用：生产环境直接 404，避免对外暴露内部数据结构与上游调用细节。
 */

const SAMPLE_KEYWORDS = ["成都", "伦敦", "纽约", "东京", "长安", "Springfield"];

export type DebugRow = {
  place: Place;
  significance: number;
  /** 最终是否出现在联想列表里 */
  kept: boolean;
};

export type DebugQuery = {
  keyword: string;
  /** 实际用于请求的词（可能与输入不同，说明命中了改写词典） */
  upstreamTerm: string;
  upstreamLanguage: string;
  rows: DebugRow[];
};

export type Data = { keyword: string; queries: DebugQuery[] };

export async function data(pageContext: PageContextServer): Promise<Data> {
  if (import.meta.env.PROD) throw render(404);

  const keyword = new URL(pageContext.urlOriginal, "http://localhost").searchParams.get("q")?.trim() ?? "";
  const keywords = keyword ? [keyword] : SAMPLE_KEYWORDS;

  const queries = await Promise.all(
    keywords.map(async (term) => {
      const { query, raw, kept } = await inspectPlaceSearch(term);
      const keptIds = new Set(kept.map((place) => place.id));

      return {
        keyword: term,
        upstreamTerm: query.term,
        upstreamLanguage: query.language,
        rows: raw.map((place) => ({
          place,
          significance: significance(place),
          kept: keptIds.has(place.id),
        })),
      };
    }),
  );

  return { keyword, queries };
}
