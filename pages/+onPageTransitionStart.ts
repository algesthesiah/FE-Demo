// https://vike.dev/onPageTransitionStart

import type { PageContextClient } from "vike/types";

export async function onPageTransitionStart(_pageContext: Partial<PageContextClient>) {
  // 客户端导航开始：给 body 打标记，由 CSS 驱动顶部进度条
  document.body.classList.add("page-transition");
}
