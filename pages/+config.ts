import type { Config } from "vike/types";
import vikeReact from "vike-react/config";

// 默认配置，页面可以按需覆盖
// https://vike.dev/config

const config: Config = {
  // https://vike.dev/head-tags
  title: "天气 · 实时天气与 7 天预报",
  description: "按地点搜索并查看当前天气实况与未来 7 天天气预报。",

  extends: [vikeReact],
};

export default config;
