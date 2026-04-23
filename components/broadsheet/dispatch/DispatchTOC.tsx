"use client";

import { useEffect, useMemo, useState } from "react";

interface TOCItem {
  id: string;
  label: string;
}

/**
 * Sticky table of contents extracted from the rendered article's h2 headings
 * at mount time. Highlights the active section as the reader scrolls.
 *
 * Desktop: fixed at the top-right of the article column via sticky positioning.
 * Mobile: hidden (the existing inline <TableOfContents> MDX component still
 * serves that audience; mobile TOC as a floating button is a v2 idea).
 */
export default function DispatchTOC() {
  const [items, setItems] = useState<TOCItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    // Pick up every h2 inside the article body (restricted to [data-dispatch-body]).
    const scope = document.querySelector<HTMLElement>("[data-dispatch-body]");
    if (!scope) return;

    const headings = Array.from(scope.querySelectorAll<HTMLHeadingElement>("h2"))
      .filter((h) => h.id && h.textContent)
      .map((h) => ({ id: h.id, label: h.textContent!.trim() }));

    setItems(headings);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      // A tall "read zone" near the top of the viewport so the active TOC item
      // tracks the section the reader is actually reading (not just visible).
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );
    scope.querySelectorAll<HTMLHeadingElement>("h2").forEach((h) => {
      if (h.id) observer.observe(h);
    });
    return () => observer.disconnect();
  }, []);

  const indices = useMemo(
    () => new Map(items.map((it, i) => [it.id, i + 1])),
    [items]
  );

  if (items.length < 2) return null;

  return (
    <aside className="hidden lg:block w-60 shrink-0">
      <div className="sticky top-6">
        <p className="bs-label mb-3">In this dispatch</p>
        <ol className="space-y-2">
          {items.map((item) => {
            const isActive = item.id === activeId;
            return (
              <li key={item.id} className="text-sm leading-snug">
                <a
                  href={`#${item.id}`}
                  className="flex items-baseline gap-3 group"
                  style={{
                    color: isActive ? "var(--ink)" : "var(--ink-soft)",
                  }}
                >
                  <span
                    className="bs-numerals text-[11px] tabular-nums shrink-0 pt-[1px]"
                    style={{
                      color: isActive ? "var(--stamp)" : "var(--ink-soft)",
                    }}
                  >
                    {String(indices.get(item.id)).padStart(2, "0")}
                  </span>
                  <span
                    className="transition-colors group-hover:text-[var(--stamp)]"
                    style={{
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    {item.label}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </aside>
  );
}
