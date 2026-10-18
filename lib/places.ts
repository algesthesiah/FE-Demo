import type { Place } from "./weather/domain";

/**
 * 地点与 URL 的映射。
 *
 * 选择 「/天气/{id}-{name}」 而不是 「/天气/{name}」 或 「?lat=&lon=」：
 * - id 保证唯一（叫「北京」的地方不止一个）；
 * - name 让 URL 可读，对人和搜索引擎都友好，且解析时只取前缀，name 写错也不影响；
 * - 只依赖 id 就能在服务端还原经纬度，因此链接可分享、可 SSR、可直接刷新。
 */
export type HotCity = {
  id: number;
  label: string;
};

/** 快捷入口城市：id 取自 Open-Meteo 地理编码库，写死是为了省掉一次首屏的联想请求 */
export const HOT_CITIES: HotCity[] = [
  { id: 1816670, label: "北京" },
  { id: 1796236, label: "上海" },
  { id: 1809858, label: "广州" },
  { id: 1795565, label: "深圳" },
  { id: 1808926, label: "杭州" },
  { id: 1815286, label: "成都" },
  { id: 1850147, label: "东京" },
  { id: 5128581, label: "纽约" },
  { id: 2643743, label: "伦敦" },
  { id: 2988507, label: "巴黎" },
];

/**
 * 「四川 · 中国」这类地点副标题。
 *
 * 中文数据里 admin1 与 country 经常与 name 重复（如 admin1=北京市、name=北京市），
 * 去重后再展示，避免出现「北京 · 北京市 · 北京市」。
 *
 * `detailed: true` 会额外带上二级行政区，用于同名地点之间的区分
 * （「四川 · 成都市 · 中国」vs「江西 · 吉安市 · 中国」）。
 */
export function formatPlaceRegion(place: Place, options: { detailed?: boolean } = {}): string {
  const candidates = options.detailed
    ? [place.admin1, place.admin2, place.country]
    : [place.admin1, place.country];

  const parts = candidates.filter((part): part is string => Boolean(part));
  const uniqueParts = parts.filter((part, index) => parts.indexOf(part) === index);
  const withoutName = uniqueParts.filter((part) => part !== place.name);

  return withoutName.join(" · ") || "—";
}

export function toPlaceSlug(place: Place): string {
  return `${place.id}-${slugify(place.name)}`;
}

export function placePath(place: Place): string {
  return `/weather/${toPlaceSlug(place)}`;
}

export function hotCityPath(city: HotCity): string {
  return `/weather/${city.id}-${slugify(city.label)}`;
}

/** 返回 null 表示 slug 非法，由调用方决定降级策略（这里是 404） */
export function parsePlaceId(slug: string | undefined): number | null {
  if (!slug) return null;
  const [rawId] = slug.split("-");
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[\s_]+/g, "-")
      // 保留中文/字母/数字/连字符，其余（如 / ? #）会破坏路径，一律丢弃
      .replace(/[^一-龥a-z0-9-]/g, "")
  );
}
