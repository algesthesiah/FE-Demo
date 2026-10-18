import type { ReactNode } from "react";
import { usePageContext } from "vike-react/usePageContext";

export function Link({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  const { urlPathname } = usePageContext();
  // 高亮判断基于 pageContext 而不是 window.location，服务端渲染时同样成立
  const isActive = href === "/" ? urlPathname === href : urlPathname.startsWith(href);
  const classes = [className, isActive ? "is-active" : null].filter(Boolean).join(" ");

  return (
    <a href={href} className={classes}>
      {children}
    </a>
  );
}
