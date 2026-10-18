// https://vike.dev/data

import { render } from "vike/abort";
import { useConfig } from "vike-react/useConfig";
import type { PageContextServer } from "vike/types";
import { toAppError, toPublicError, type PublicError } from "../../../lib/errors";
import { parsePlaceId } from "../../../lib/places";
import { getPlace, getWeather } from "../../../lib/weather/api";
import type { WeatherReport } from "../../../lib/weather/domain";
import { selectUpcomingHours } from "../../../lib/weather/select";
import { describeWeatherCode } from "../../../lib/wmo";

const UPCOMING_HOURS = 24;

/**
 * 结果用一个可辨识联合（discriminated union）而不是 `{ report, error }` 两个可空字段：
 * 类型系统直接保证页面渲染时必须先判断 ok/failed，不可能拿到「既不成功也没失败」的中间态，
 * 也不会出现 report 为空却去读 report.current 的运行时崩溃。
 */
export type WeatherPageData =
  | { kind: "ok"; report: WeatherReport }
  | { kind: "failed"; error: PublicError };

export async function data(pageContext: PageContextServer): Promise<WeatherPageData> {
  // useConfig() 依赖「同步执行期」的 pageContext，必须在第一个 await 之前拿到；
  // 之后再用返回的 config() 写 <head> 是安全的（它持有 pageContext 引用）。
  const config = useConfig();
  const placeId = parsePlaceId(pageContext.routeParams.place);

  // URL 里的 id 不是数字，说明链接本身有问题 —— 这是一个 404，而不是服务故障
  if (placeId === null) {
    throw render(404, "地点链接不合法");
  }

  let report: WeatherReport;
  try {
    const place = await getPlace(placeId);
    report = await getWeather(place);
  } catch (error) {
    const appError = toAppError(error);
    // 不存在的地点 → 语义化 404（对爬虫和用户都正确）
    if (appError.kind === "not-found") {
      throw render(404, "没有找到这个地点");
    }
    // 上游抖动/超时 → 交给页面渲染内联错误，让用户就地重试，而不是整页崩掉
    return { kind: "failed", error: toPublicError(appError) };
  }

  config({
    title: `${report.place.name}天气 · 实时天气与 7 天预报`,
    description: `${report.place.name}当前气温 ${Math.round(report.current.temperature)}°C，${
      describeWeatherCode(report.current.code)
    }。查看逐时与未来 7 天天气预报。`,
  });

  return {
    kind: "ok",
    // 逐时数据在服务端就裁剪到 24 条：序列化到浏览器的越少，首屏越快
    report: { ...report, hourly: selectUpcomingHours(report.hourly, report.current.observedAt, UPCOMING_HOURS) },
  };
}
