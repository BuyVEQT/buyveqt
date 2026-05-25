"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ArticleFrontmatter } from "@/lib/articles";
import ArchiveCard from "./ArchiveCard";

interface ArchiveProps {
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

const DIFFICULTY_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Any" },
  { key: "beginner", label: "Beginner" },
  { key: "intermediate", label: "Intermediate" },
  { key: "advanced", label: "Advanced" },
];

const TIME_FILTERS: { key: string; label: string }[] = [
  { key: "all", label: "Any" },
  { key: "quick", label: "Quick" },
  { key: "standard", label: "Standard" },
  { key: "long", label: "Long" },
];

function readingMinutes(s: string): number {
  const m = s.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function timeBucket(s: string): "quick" | "standard" | "long" {
  const min = readingMinutes(s);
  if (min < 8) return "quick";
  if (min < 12) return "standard";
  return "long";
}

/**
 * V2 Archive — section wrapper containing:
 *   1. Section head ("The archive" stamp + "All N dispatches." italic h2)
 *   2. Inline filter rail (categories + search + "More filters" toggle).
 *      Secondary filters (Level / Time / Our Take only / Clear) expand
 *      in a second row when toggled.
 *   3. Result count
 *   4. 2-col magazine grid of ArchiveCards. Editorial pieces
 *      (`isEditorial: true`) span both columns as feature rows.
 *
 * All filter state is in URL params (?cat&diff&time&take&q&tag) so
 * filtered views remain shareable. This component is the home of the
 * URL state lift — older FilterRail.tsx still ships but is unused on
 * the V2 page.
 */
export default function Archive({ articles }: ArchiveProps) {
  const router = useRouter();
  const params = useSearchParams();

  const cat = params.get("cat") ?? "all";
  const diff = params.get("diff") ?? "all";
  const time = params.get("time") ?? "all";
  const take = params.get("take") === "1";
  const search = params.get("q") ?? "";
  const tag = params.get("tag") ?? null;
  const moreOpen = params.get("more") === "1";

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
  }

  function toggleMore() {
    update({ more: moreOpen ? null : "1" });
  }

  const hasFilters =
    cat !== "all" ||
    diff !== "all" ||
    time !== "all" ||
    take ||
    !!search.trim() ||
    !!tag;

  const filtered = useMemo(() => {
    let pool = articles;
    if (cat !== "all") pool = pool.filter((a) => a.category === cat);
    if (diff !== "all") pool = pool.filter((a) => a.difficulty === diff);
    if (time !== "all") pool = pool.filter((a) => timeBucket(a.readingTime) === time);
    if (take) pool = pool.filter((a) => a.isEditorial);
    if (tag) pool = pool.filter((a) => a.tags?.includes(tag));
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      pool = pool.filter((a) => {
        const hay = [
          a.title,
          a.description,
          a.excerpt ?? "",
          (a.tags ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(q);
      });
    }
    return pool;
  }, [articles, cat, diff, time, take, search, tag]);

  const catCount = (key: string) =>
    key === "all"
      ? articles.length
      : articles.filter((a) => a.category === key).length;

  return (
    <section className="archive-v2" id="archive">
      <div className="archive-v2__head">
        <div>
          <div className="ed-stamp">The archive</div>
          <h2 className="ed-display archive-v2__h2">
            All{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>
              {articles.length}
            </em>{" "}
            dispatches.
          </h2>
        </div>
        <p className="ed-caption archive-v2__deck">
          The full library. Filter by topic, level, or reading time.
        </p>
      </div>

      <div className="rule-thick" />

      {/* Row 1 — category chips + search + "More filters" toggle */}
      <div className="archive-v2__filters">
        <nav className="archive-v2__cats" aria-label="Filter by category">
          {CATEGORY_FILTERS.map((c) => {
            const n = catCount(c.key);
            if (c.key !== "all" && n === 0) return null;
            const active = cat === c.key && !tag;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => update({ cat: c.key, tag: null })}
                aria-pressed={active}
                className={`archive-v2__cat ${active ? "is-active" : ""}`}
              >
                {c.label}
                <span className="archive-v2__cat-n">{n}</span>
              </button>
            );
          })}
          {tag && (
            <button
              type="button"
              onClick={() => update({ tag: null })}
              aria-pressed
              className="archive-v2__cat is-active"
              style={{ textTransform: "none", letterSpacing: 0 }}
            >
              #{tag} ×
            </button>
          )}
        </nav>
        <div className="archive-v2__filter-actions">
          <label className="archive-v2__search">
            <span aria-hidden>⌕</span>
            <input
              type="search"
              value={search}
              onChange={(e) => update({ q: e.target.value })}
              placeholder="Search dispatches…"
              aria-label="Search dispatches"
            />
          </label>
          <button
            type="button"
            onClick={toggleMore}
            aria-expanded={moreOpen}
            className="archive-v2__more"
            style={{
              color: moreOpen ? "var(--stamp)" : "var(--ink-soft)",
            }}
          >
            {moreOpen ? "Less filters" : "More filters"}
          </button>
        </div>
      </div>

      {/* Row 2 — secondary filters, expanded */}
      {moreOpen && (
        <div className="archive-v2__row2">
          <div className="archive-v2__group">
            <span className="archive-v2__group-label">Level:</span>
            {DIFFICULTY_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => update({ diff: f.key })}
                aria-pressed={diff === f.key}
                className={`archive-v2__opt ${diff === f.key ? "is-active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="archive-v2__divider">|</span>
          <div className="archive-v2__group">
            <span className="archive-v2__group-label">Time:</span>
            {TIME_FILTERS.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => update({ time: f.key })}
                aria-pressed={time === f.key}
                className={`archive-v2__opt ${time === f.key ? "is-active" : ""}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="archive-v2__divider">|</span>
          <button
            type="button"
            onClick={() => update({ take: take ? null : "1" })}
            aria-pressed={take}
            className={`archive-v2__opt archive-v2__opt--take ${take ? "is-active" : ""}`}
          >
            {take ? "☑" : "☐"} Our Take only
          </button>
          {hasFilters && (
            <>
              <span className="archive-v2__divider">|</span>
              <button
                type="button"
                onClick={clearAll}
                className="archive-v2__opt archive-v2__opt--clear"
              >
                Clear all
              </button>
            </>
          )}
        </div>
      )}

      {/* Result count */}
      <div className="archive-v2__count">
        <span className="ed-caption">
          {filtered.length} {filtered.length === 1 ? "dispatch" : "dispatches"}
          {hasFilters ? " matching" : ""}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="archive-v2__empty">
          No dispatches match that.{" "}
          <button type="button" onClick={clearAll}>
            Clear filters.
          </button>
        </p>
      ) : (
        <div className="archive-v2__grid">
          {filtered.map((a) => (
            <ArchiveCard
              key={a.slug}
              article={a}
              span={a.isEditorial ? "wide" : "narrow"}
            />
          ))}
        </div>
      )}

      <style jsx global>{`
        .archive-v2 {
          padding: 30px 0 18px;
        }
        .archive-v2__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .archive-v2__h2 {
          font-size: clamp(2rem, 3.4vw, 2.6rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 6px 0 0;
        }
        .archive-v2__deck {
          flex: 0 1 360px;
          max-width: 360px;
          font-size: 13px;
        }

        .archive-v2__filters {
          display: flex;
          gap: 14px;
          align-items: center;
          padding: 14px 0 8px;
          flex-wrap: wrap;
        }
        .archive-v2__cats {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 0;
        }
        .archive-v2__cat {
          appearance: none;
          background: transparent;
          border: 1px solid var(--rule-soft);
          padding: 7px 14px;
          border-radius: 999px;
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: var(--ink-soft);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .archive-v2__cat:hover {
          background: var(--paper-warm);
        }
        .archive-v2__cat.is-active {
          background: var(--ink);
          color: var(--paper-light);
          border-color: var(--ink);
        }
        .archive-v2__cat-n {
          font-size: 10px;
          opacity: 0.6;
          font-variant-numeric: tabular-nums;
        }

        .archive-v2__filter-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .archive-v2__search {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 999px;
          font-family: var(--font-sans);
        }
        .archive-v2__search input {
          appearance: none;
          border: 0;
          background: transparent;
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--ink);
          width: 180px;
          outline: none;
        }
        .archive-v2__more {
          appearance: none;
          background: transparent;
          border: 0;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          cursor: pointer;
        }

        .archive-v2__row2 {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
          padding: 14px 0 8px;
          border-top: 1px solid var(--rule-soft);
        }
        .archive-v2__group {
          display: inline-flex;
          gap: 6px;
          align-items: center;
        }
        .archive-v2__group-label {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }
        .archive-v2__opt {
          appearance: none;
          background: transparent;
          border: 0;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--ink-soft);
          padding: 4px 8px;
          border-radius: 4px;
          cursor: pointer;
          text-transform: capitalize;
        }
        .archive-v2__opt:hover {
          color: var(--ink);
        }
        .archive-v2__opt.is-active {
          color: var(--ink);
          background: var(--paper-warm);
        }
        .archive-v2__opt--take,
        .archive-v2__opt--clear {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-weight: 700;
          font-size: 11px;
        }
        .archive-v2__opt--clear {
          color: var(--ink-mute);
        }
        .archive-v2__divider {
          color: var(--rule);
          font-size: 12px;
        }

        .archive-v2__count {
          padding: 10px 0 14px;
          color: var(--ink-mute);
          font-size: 12px;
        }

        .archive-v2__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
        }
        @media (min-width: 760px) {
          .archive-v2__grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .archive-v2__grid .acard--wide {
            grid-column: 1 / -1;
          }
        }

        .archive-v2__empty {
          padding: 48px 0;
          text-align: center;
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--ink-mute);
        }
        .archive-v2__empty button {
          appearance: none;
          background: transparent;
          border: 0;
          color: var(--stamp);
          text-decoration: underline;
          cursor: pointer;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: inherit;
        }
      `}</style>
    </section>
  );
}
