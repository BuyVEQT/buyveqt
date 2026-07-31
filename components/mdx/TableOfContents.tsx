"use client";

import { useEffect, useRef, useState } from "react";
import { useArticleMeta } from "@/components/learn/ArticleContext";

interface TableOfContentsProps {
  /** Pipe-delimited section labels, straight from the MDX call site. */
  items: string;
}

interface Chip {
  /** Display label — rendered uppercase by CSS. */
  label: string;
  /** Best-guess anchor id; re-resolved against the real headings on mount. */
  id: string;
}

const css = `
.schip {
  margin: 26px 0 30px;
  font-family: var(--ins-font);
}
.schip__rail {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.schip__link {
  display: inline-flex;
  align-items: center;
  min-height: 30px;
  padding: 5px 11px;
  border: 1px solid var(--ins-hair);
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ins-ink);
  text-decoration: none;
  white-space: nowrap;
  background: var(--ins-paper);
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.schip__link:hover {
  border-color: var(--ins-ink);
}
.schip__link[aria-current="true"] {
  background: var(--ins-ink);
  border-color: var(--ins-ink);
  color: var(--ins-paper);
}
.schip__link:focus-visible {
  outline: 2px solid var(--ins-signal);
  outline-offset: 2px;
}

/* ── Mobile · 390 — one scrolling row, 44px tap targets ────────── */
@media (max-width: 640px) {
  .schip {
    margin: 18px 0 22px;
    /* Break the prose measure so the rail can run to the page edge. */
    margin-right: -20px;
  }
  .schip__rail {
    flex-wrap: nowrap;
    gap: 6px;
    overflow-x: auto;
    overflow-y: hidden;
    padding-right: 20px;
    scrollbar-width: none;
    -webkit-overflow-scrolling: touch;
  }
  .schip__rail::-webkit-scrollbar {
    display: none;
  }
  .schip__link {
    min-height: 44px;
    padding: 5px 13px;
    font-size: 8.5px;
    letter-spacing: 0.08em;
  }
}

@media (prefers-reduced-motion: reduce) {
  .schip__link {
    transition: none;
  }
}
`;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * The flagship's curated chips. The MDX's `items` list is written for a
 * prose TOC and is longer than the scoreboard rail wants, so /learn/veqt-vs-xeqt
 * gets the artboard's six waypoints instead — each pointed at the real h2 id
 * that ArticleBody generates from the heading text.
 */
const MARQUEE_CHIPS: Record<string, Chip[]> = {
  "veqt-vs-xeqt": [
    { label: "The basics", id: "the-basics" },
    { label: "The ownership loop", id: "the-companies-behind-the-ticker" },
    { label: "Two ways to slice", id: "two-ways-to-slice-the-world" },
    { label: "A wider net", id: "a-wider-net" },
    { label: "The Vanguard effect", id: "the-pattern-repeats" },
    { label: "Verdict", id: "the-bottom-line" },
  ],
};

/**
 * Section chips — the article's one and only table of contents.
 *
 * Previously the reader shipped two: this component plus a second, scraped
 * copy in the desktop sidecar. The sidecar's is gone; this renders once and
 * repositions with the grid.
 *
 * The `items` strings are abbreviations of the headings they point at
 * ("The Canadian home bias" for "The Canadian home bias — a feature, not a
 * bug"), so a naive slugify misses. On mount every chip is re-resolved
 * against the real h2 ids — exact, then prefix, then text-contains — which
 * repairs anchors that never landed before. Chips with no matching heading
 * are dropped rather than left as dead links.
 */
export function TableOfContents({ items: itemsStr }: TableOfContentsProps) {
  const meta = useArticleMeta();
  const curated = meta ? MARQUEE_CHIPS[meta.slug] : undefined;

  const initial: Chip[] =
    curated ??
    itemsStr
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((label) => ({ label, id: slugify(label) }));

  const [chips, setChips] = useState<Chip[]>(initial);
  const [activeId, setActiveId] = useState<string | null>(null);
  const railRef = useRef<HTMLUListElement>(null);

  // Resolve each chip against the headings the body actually rendered.
  useEffect(() => {
    const body = document.querySelector("[data-article-body]");
    if (!body) return;
    const headings = Array.from(body.querySelectorAll("h2")).filter((h) => h.id);
    if (headings.length === 0) return;

    const resolved: Chip[] = [];
    for (const chip of initial) {
      const exact = headings.find((h) => h.id === chip.id);
      const prefix = exact ?? headings.find((h) => h.id.startsWith(chip.id));
      const needle = chip.label.toLowerCase();
      const contains =
        prefix ??
        headings.find((h) => (h.textContent ?? "").toLowerCase().includes(needle));
      if (contains) resolved.push({ label: chip.label, id: contains.id });
    }
    if (resolved.length > 0) setChips(resolved);
    // `initial` is derived from props that never change for a given page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemsStr, curated]);

  // Scroll-spy: the topmost heading inside the reading band wins.
  useEffect(() => {
    if (chips.length === 0) return;
    const nodes = chips
      .map((c) => document.getElementById(c.id))
      .filter((n): n is HTMLElement => !!n);
    if (nodes.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const hits = entries.filter((e) => e.isIntersecting);
        if (hits.length === 0) return;
        hits.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(hits[0].target.id);
      },
      { rootMargin: "-18% 0px -68% 0px", threshold: 0 }
    );
    nodes.forEach((n) => observer.observe(n));
    return () => observer.disconnect();
  }, [chips]);

  // Keep the active chip visible in the mobile scroller.
  useEffect(() => {
    if (!activeId || !railRef.current) return;
    const chip = railRef.current.querySelector<HTMLElement>(
      `[data-chip="${activeId}"]`
    );
    if (!chip) return;
    const rail = railRef.current;
    if (rail.scrollWidth <= rail.clientWidth) return;
    const left = chip.offsetLeft - 20;
    rail.scrollTo({
      left: Math.max(0, left),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  }, [activeId]);

  if (chips.length === 0) return null;

  return (
    <nav className="schip" aria-label="Sections in this article">
      <ul className="schip__rail" ref={railRef}>
        {chips.map((chip) => (
          <li key={chip.id + chip.label}>
            <a
              className="schip__link"
              data-chip={chip.id}
              href={`#${chip.id}`}
              aria-current={chip.id === activeId ? "true" : undefined}
            >
              {chip.label}
            </a>
          </li>
        ))}
      </ul>
      <style dangerouslySetInnerHTML={{ __html: css }} />
    </nav>
  );
}
