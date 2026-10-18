import type { Place, PlaceSignificance } from "./domain";

/**
 * 同名地点的取舍策略。
 *
 * 背景：Open-Meteo 的地理编码数据来自 GeoNames，其中存在大量同名条目。
 * 搜「成都」会同时返回四川的成都市（人口 2093 万）和江西一个人口未知的同名小地名；
 * 搜「伦敦」会返回英国伦敦与美国/加拿大的若干个 London。
 * 把它们原样列出来，用户会怀疑自己搜错了地方。
 *
 * 策略要点：
 * 1. **不改动上游的排序**。相关性排序（哪个更可能是用户想找的）由上游负责，
 *    它离数据更近；我们只在「同名」这一个子集里做取舍，职责边界清晰。
 * 2. **显著性 = 人口 + 行政级别加成**。人口缺失时用要素代码兜底，
 *    因为 GeoNames 里缺人口的多半就是那些不重要的小地名。
 * 3. **只在差距悬殊时隐藏**。如果同名候选的显著性接近（差距小于 10 倍），
 *    说明连数据都无法判断用户要哪个，这时全部保留，
 *    由 UI 展示二级行政区信息把选择权交回给用户（见 LocationSearch）。
 */

/**
 * GeoNames 要素代码 → 显著性加成的对照表（未知代码记 0，避免过度拟合）。
 * 加成的量级刻意小于大城市的人口：人口是主信号，行政级别只是缺人口时的兜底。
 */
const FEATURE_CODE_BONUS: Record<string, PlaceSignificance> = {
  PPLC: 2_000_000, // 首都
  PPLA: 1_000_000, // 一级行政区行政中心
  PPLA2: 150_000, // 二级行政区行政中心（一个县城级别，不该被加成到 30 万人口的水平）
  PPLA3: 50_000, // 三级行政区行政中心
  PPL: 20_000, // 普通居民点
  PPLS: 10_000, // 居民点（小）
  ADM1: 10_000, // 一级行政区本身（通常不应该是搜索结果，但保底给个分数）
};

/** 差距超过这个倍数，就认为同名的小地名不是用户想找的 */
const HOMONYM_SIGNIFICANCE_RATIO = 10;

export function significance(place: Place): PlaceSignificance {
  const population = place.population ?? 0;
  const featureBonus = FEATURE_CODE_BONUS[place.featureCode ?? ""] ?? 0;
  return population + featureBonus;
}

/**
 * 联想结果的最终策略：先合并「连展示文字都完全一样」的重复项，再收敛同名项。
 */
export function keepMostRelevantPlaces(places: Place[]): Place[] {
  return dropLessSignificantHomonyms(dropIndistinguishableDuplicates(places));
}

/**
 * 去掉展示上无法区分的重复项（名字 + 行政区 + 国家全都相同）。
 * 例如广东江门市下有两个都叫「长安」的镇，用户看到的是两行一模一样的文字，
 * 无从选择，只保留上游排序更靠前的那条。
 */
function dropIndistinguishableDuplicates(places: Place[]): Place[] {
  const seen = new Set<string>();

  return places.filter((place) => {
    const identity = [place.name, place.admin1, place.admin2, place.country].join("|");
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function dropLessSignificantHomonyms(places: Place[]): Place[] {
  const groupsByName = new Map<string, Place[]>();
  for (const place of places) {
    const group = groupsByName.get(place.name);
    if (group) group.push(place);
    else groupsByName.set(place.name, [place]);
  }

  const kept = new Set<Place>();
  for (const group of groupsByName.values()) {
    const mostSignificant = group.reduce((best, place) => (significance(place) > significance(best) ? place : best));
    for (const place of group) {
      const isAsSignificantAsBest = significance(mostSignificant) <= significance(place) * HOMONYM_SIGNIFICANCE_RATIO;
      if (isAsSignificantAsBest) kept.add(place);
    }
  }

  // 按原始顺序返回：排序仍由上游决定，去重不该顺手改变顺序
  return places.filter((place) => kept.has(place));
}
