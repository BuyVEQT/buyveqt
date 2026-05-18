"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ArticleFrontmatter } from "@/lib/articles";

interface FilterRailProps {
  /** Articles list — used to compute the count next to each category chip. */
  articles: ArticleFrontmatter[];
}

const CATEGORY_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Basics" },
  { key: "comparison", label: "Comparisons" },
  { key: "tax-strategy", label: "Tax & Accounts" },
  { key: "veqt-deep-dive", label: "Deep Dive" },
  { key: "opinion", label: "Opinion" },
];

const DIFFICULTY_FILTERS = [
  { key: "all", label: "Any" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];

const TIME_FILTERS = [
  { key: "all", label: "Any" },
  { key: "quick", label: "Quick <8m" },
  { key: "standard", label: "Standard 8–11m" },
  { key: "long", label: "Long 12m+" },
];

/**
 * Round 4 v2 filter rail. Sticky under the global nav. Two rows on
 * desktop, one row + "Filters" toggle on mobile.
 *
 *   Row 1: category chips (with counts), search input on the right.
 *   Row 2: Level · Time · Our Take · Clear.
 *
 * All state is in the URL (?cat=&diff=&time=&take=1&q=&tag=) so
 * filtered views are shareable.
 */
export default function FilterRail({ articles }: FilterRailProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const cat = params.get("cat") ?? "all";
  const diff = params.get("diff") ?? "all";
  const time = params.get("time") ?? "all";
  const take = params.get("take") === "1";
  const search = params.get("q") ?? "";
  const tag = params.get("tag") ?? null;

  function update(changes: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(changes)) {
      if (v === null || v === "all" || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    router.replace(qs ? `/learn?${qs}` : "/learn", { scroll: false });
  }

  function clearAll() {
    router.replace("/learn", { scroll: false });
    setMoreOpen(false);
  }

  const hasFilters =
    cat !== "all" || diff !== "all" || time !== "all" || take || !!search || !!tag;

  const catCount = (key: string) =>
    key === "all" ? articles.length : articles.filter((a) => a.category === key).length;

  return (
    <div className="learn-filter-rail" role="region" aria-label="Filter dispatches">
      {/* Row 1: category chips + search */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <nav
          className="learn-filter-rail__cats"
          aria-label="Filter by category"
          style={{ flex: 1, minWidth: 0 }}
        >
          {CATEGORY_FILTERS.map((c) => {
            const n = catCount(c.key);
            // Hide chips for empty categories (except "all").
            if (c.key !== "all" && n === 0) return null;
            const active = cat === c.key && !tag;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => update({ cat: c.key, tag: null })}
                className="learn-filter-rail__cat"
                data-active={active ? "true" : "false"}
              >
                {c.label}
                <span className="learn-filter-rail__cat-n">{n}</span>
              </button>
            );
          })}
          {tag && (
            <button
              type="button"
              onClick={() => update({ tag: null })}
              className="learn-filter-rail__cat"
              data-active="true"
              style={{ textTransform: "none", letterSpacing: 0 }}
            >
              #{tag} ×
            </button>
          )}
        </nav>

        {/* Mobile: Filters toggle. Desktop: search is in row 2 already. */}
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          className="learn-filter-rail__opt"
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: moreOpen ? "var(--stamp)" : "var(--ink-soft)",
          }}
        >
          {moreOpen ? "Less" : "Filters"}
        </button>
      </div>

      {/* Row 2: difficulty + time + take + search */}
      <div
        className="learn-filter-rail__row2"
        style={{ display: moreOpen ? "flex" : undefined }}
        data-open={moreOpen ? "true" : "false"}
      >
        <div className="learn-filter-rail__group">
          <span className="learn-filter-rail__group-label">Level:</span>
          {DIFFICULTY_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => update({ diff: f.key })}
              className="learn-filter-rail__opt"
              data-active={diff === f.key ? "true" : "false"}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="learn-filter-rail__divider">|</span>
        <div className="learn-filter-rail__group">
          <span className="learn-filter-rail__group-label">Time:</span>
          {TIME_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => update({ time: f.key })}
              className="learn-filter-rail__opt"
              data-active={time === f.key ? "true" : "false"}
            >
              {f.label}
            </button>
          ))}
        </div>
        <span className="learn-filter-rail__divider">|</span>
        <button
          type="button"
          onClick={() => update({ take: take ? null : "1" })}
          className="learn-filter-rail__opt"
          data-active={take ? "true" : "false"}
          style={{
            color: take ? "var(--stamp)" : "var(--ink-mute)",
            textTransform: "uppercase",
            letterSpacing: "0.16em",
            fontSize: 11,
            fontWeight: 700,
          }}
        >
          {take ? "☑ Our Take only" : "☐ Our Take only"}
        </button>

        {hasFilters && (
          <>
            <span className="learn-filter-rail__divider">|</span>
            <button
              type="button"
              onClick={clearAll}
              className="learn-filter-rail__opt"
              style={{
                color: "var(--ink-mute)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              Clear all
            </button>
          </>
        )}

        <label className="learn-filter-rail__search">
          <span className="learn-filter-rail__search-icon" aria-hidden>
            ⌕
          </span>
          <input
            type="search"
            value={search}
            onChange={(e) => update({ q: e.target.value })}
            placeholder={`Search ${articles.length} dispatches…`}
            aria-label="Search dispatches"
          />
        </label>
      </div>

      <style jsx>{`
        @media (max-width: 1023px) {
          [data-open="false"] {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
