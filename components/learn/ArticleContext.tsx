"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Static per-article facts the reader chrome needs. Set once by the page
 * (a server component) and read by any client component under the tree —
 * including the ones MDX renders, since they're nested inside this
 * provider's `children`.
 */
export interface ArticleMetaValue {
  slug: string;
  /** Pre-uppercased category label, e.g. "HEAD-TO-HEAD". */
  category: string;
  /** 1-indexed position in the curated registry order. */
  ordinal: number | null;
  /** Count of all dispatches. */
  total: number;
  /** Whole minutes parsed from frontmatter.readingTime — 0 when unknown. */
  minutes: number;
}

const MetaContext = createContext<ArticleMetaValue | null>(null);
const ProgressContext = createContext<number>(0);

/**
 * Owns the single scroll listener for the article reader. Progress lives in
 * its own context so the tape and the meta line both animate off one rAF
 * loop; `children` is a stable prop, so the MDX body never re-renders when
 * progress ticks — only the two consumers do.
 */
export function ArticleProvider({
  meta,
  children,
}: {
  meta: ArticleMetaValue;
  children: ReactNode;
}) {
  const [pct, setPct] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    function measure() {
      frame.current = null;
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      if (total <= 0) {
        setPct(0);
        return;
      }
      const next = (window.scrollY / total) * 100;
      setPct(Math.min(100, Math.max(0, next)));
    }
    function schedule() {
      if (frame.current !== null) return;
      frame.current = window.requestAnimationFrame(measure);
    }

    measure();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    };
  }, []);

  // `meta` arrives from the server render and never changes identity between
  // the provider's own state updates, so it needs no memo of its own.
  return (
    <MetaContext.Provider value={meta}>
      <ProgressContext.Provider value={pct}>{children}</ProgressContext.Provider>
    </MetaContext.Provider>
  );
}

/** Scroll progress through the document, 0–100. */
export function useArticleProgress(): number {
  return useContext(ProgressContext);
}

/** Static article facts, or null outside an article page. */
export function useArticleMeta(): ArticleMetaValue | null {
  return useContext(MetaContext);
}
