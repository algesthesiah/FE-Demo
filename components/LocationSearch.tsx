import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { navigate } from "vike/client/router";
import { usePlaceSearch } from "../lib/usePlaceSearch";
import { formatPlaceRegion, placePath } from "../lib/places";
import type { Place } from "../lib/weather/domain";
import { Spinner } from "./FeedbackStates";

type Props = {
  variant?: "hero" | "compact";
  autoFocus?: boolean;
};

export function LocationSearch({ variant = "compact", autoFocus = false }: Props) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [keyword, setKeyword] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const { status, places, error, retry } = usePlaceSearch(keyword);

  const trimmedKeyword = keyword.trim();
  const isPanelOpen = isOpen && trimmedKeyword.length > 0;

  /**
   * 同名地点（例如瑞典与挪威都有叫 Oslo 的小镇、美国有好几个 Springfield）：
   * 显著性差距悬殊的已被数据层过滤掉，仍留下的都是「数据也无法判断用户想要哪个」的结果。
   * 这时把二级行政区也展示出来，让用户自己分辨，而不是替用户随便选一个。
   */
  const homonymNames = useMemo(() => {
    const counts = new Map<string, number>();
    for (const place of places) counts.set(place.name, (counts.get(place.name) ?? 0) + 1);
    return new Set([...counts].filter(([, count]) => count > 1).map(([name]) => name));
  }, [places]);

  // 结果变了，之前高亮的项可能已经不存在，重置高亮
  useEffect(() => setActiveIndex(-1), [places]);

  useEffect(() => {
    if (!isPanelOpen) return;
    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isPanelOpen]);

  function select(place: Place) {
    setIsOpen(false);
    setKeyword("");
    navigate(placePath(place));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
      setActiveIndex((index) => (places.length === 0 ? -1 : (index + 1) % places.length));
      return;
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (places.length === 0 ? -1 : index <= 0 ? places.length - 1 : index - 1));
      return;
    }
    if (event.key === "Enter") {
      const place = places[activeIndex];
      if (place) {
        event.preventDefault();
        select(place);
      }
    }
  }

  return (
    <div className={`search search--${variant}`} ref={containerRef}>
      <div className="search__field">
        <svg className="search__magnifier" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M15.2 15.2L20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>

        <input
          className="search__input"
          type="text"
          value={keyword}
          placeholder="搜索城市，例如「北京」「Tokyo」"
          autoComplete="off"
          spellCheck={false}
          autoFocus={autoFocus}
          role="combobox"
          aria-expanded={isPanelOpen}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined}
          onChange={(event) => {
            setKeyword(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />

        {status === "loading" && <Spinner className="search__spinner" />}

        {trimmedKeyword.length > 0 && (
          <button
            type="button"
            className="search__clear"
            aria-label="清空搜索"
            onClick={() => {
              setKeyword("");
              setIsOpen(false);
            }}
          >
            ×
          </button>
        )}
      </div>

      {isPanelOpen && (
        <div className="search__panel">
          {status === "loading" && places.length === 0 && <p className="search__hint">搜索中…</p>}

          {status === "error" && (
            <div className="search__feedback">
              <p>{error?.message ?? "搜索失败"}</p>
              {error?.isRetryable && (
                <button type="button" className="button button--small" onClick={retry}>
                  重试
                </button>
              )}
            </div>
          )}

          {status === "success" && places.length === 0 && (
            // 数据源的中文别名不完整，英文原名才是它召回最全的入口，所以直接把这个出口告诉用户
            <p className="search__hint">没有找到「{trimmedKeyword}」，试试它的英文原名（如 Tokyo、New York）</p>
          )}

          {places.length > 0 && (
            <ul className="search__options" id={listId} role="listbox" aria-label="地点搜索结果">
              {places.map((place, index) => (
                <li
                  key={place.id}
                  id={`${listId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={`search__option${index === activeIndex ? " search__option--active" : ""}`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => select(place)}
                >
                  <span className="search__option-name">{place.name}</span>
                  <span className="search__option-region">
                    {formatPlaceRegion(place, { detailed: homonymNames.has(place.name) })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
