"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";

type FilterKey =
  | "all"
  | "beginner"
  | "comparison"
  | "tax-strategy"
  | "veqt-deep-dive"
  | "opinion";

interface LearnContentProps {
  startHere: ArticleFrontmatter | null;
  articles: ArticleFrontmatter[];
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Basics" },
  { key: "comparison", label: "Comparisons" },
  { key: "tax-strategy", label: "Tax & Accounts" },
  { key: "veqt-deep-dive", label: "Deep Dive" },
  { key: "opinion", label: "Opinion" },
];

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const CATEGORY_HEADINGS: Partial<Record<FilterKey, string>> = {
  beginner: "The Basics",
  comparison: "Head-to-Head",
  "tax-strategy": "Tax & Accounts",
  "veqt-deep-dive": "The Deep Dive",
  opinion: "Opinion",
};

const CATEGORY_BLURB: Partial<Record<FilterKey, string>> = {
  beginner: "Core concepts every VEQT investor should know.",
  comparison: "Side-by-side breakdowns against the field.",
  "tax-strategy": "TFSAs, RRSPs, FHSAs, withdrawals — making the account work.",
  "veqt-deep-dive": "Mechanics: distributions, currency risk, home bias, costs.",
  opinion: "Our takes on covered calls, forex, and other distractions.",
};

function ArticleRow({
  article,
  ordinal,
}: {
  article: ArticleFrontmatter;
  ordinal: number;
}) {
  return (
    <li>
      <Link
        href={`/learn/${article.slug}`}
        className="group block py-4 sm:py-5 grid grid-cols-[auto_1fr] gap-4 sm:gap-6 border-t border-[var(--color-border)] first:border-t-0"
      >
        <span
          className="bs-display bs-numerals text-xl sm:text-2xl tabular-nums pt-0.5 shrink-0"
          style={{ color: "var(--ink-soft)" }}
        >
          {String(ordinal).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3
            className="bs-display-italic text-[1.125rem] sm:text-[1.375rem] leading-[1.2] group-hover:text-[var(--stamp)] transition-colors"
            style={{ color: "var(--ink)" }}
          >
            {article.title}
          </h3>
          <p
            className="bs-caption mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1"
            style={{ color: "var(--ink-soft)" }}
          >
            <span>{article.readingTime}</span>
            {article.difficulty && article.difficulty !== "beginner" && (
              <>
                <span className="opacity-40">·</span>
                <span>{DIFFICULTY_LABEL[article.difficulty]}</span>
              </>
            )}
            {article.isEditorial && (
              <>
                <span className="opacity-40">·</span>
                <span
                  className="bs-stamp"
                  style={{ fontSize: "10px", color: "var(--stamp)" }}
                >
                  Our Take
                </span>
              </>
            )}
          </p>
          {(article.excerpt || article.description) && (
            <p
              className="bs-body text-[0.95rem] mt-2 leading-[1.45] max-w-[60ch]"
              style={{ color: "var(--ink)" }}
            >
              {article.excerpt || article.description}
            </p>
          )}
        </div>
      </Link>
    </li>
  );
}

export default function LearnContent({
  startHere,
  articles,
}: LearnContentProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let pool = articles;
    if (filter !== "all") {
      pool = pool.filter((a) => a.category === filter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      pool = pool.filter((a) => {
        const haystack = [
          a.title,
          a.description,
          a.excerpt ?? "",
          (a.tags ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }
    return pool;
  }, [articles, filter, search]);

  // Group into department buckets in curated order for the "All" view.
  const grouped = useMemo(() => {
    const buckets: Record<string, ArticleFrontmatter[]> = {};
    for (const a of filtered) {
      const key = a.category ?? "beginner";
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(a);
    }
    return buckets;
  }, [filtered]);

  const showGrouped = filter === "all" && !search.trim();

  const ordinalMap = useMemo(() => {
    const m = new Map<string, number>();
    articles.forEach((a, i) => m.set(a.slug, i + 1));
    return m;
  }, [articles]);

  return (
    <>
      {/* ── Filter + search rail ────────────────────────────────── */}
      <div className="sticky top-0 z-20 -mx-5 sm:-mx-8 lg:-mx-12 px-5 sm:px-8 lg:px-12 py-3 bg-[var(--paper)]/95 backdrop-blur-[6px] border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3 sm:gap-5">
          <nav
            className="flex-1 flex items-center gap-4 sm:gap-6 overflow-x-auto hide-scrollbar bs-label"
            aria-label="Filter by category"
          >
            {FILTERS.map((f) => {
              const active = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className="shrink-0 whitespace-nowrap transition-colors"
                  style={{
                    color: active ? "var(--stamp)" : "var(--ink-soft)",
                    textDecoration: active ? "underline" : "none",
                    textUnderlineOffset: "4px",
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </nav>
          <label className="shrink-0 w-32 sm:w-48">
            <span className="sr-only">Search</span>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="w-full bg-transparent border-b border-[var(--ink)]/40 focus:border-[var(--stamp)] outline-none text-sm py-1"
              style={{ color: "var(--ink)", fontFamily: "var(--font-serif)" }}
            />
          </label>
        </div>
      </div>

      {/* ── Featured "Start Here" — only on "all" view with no search ── */}
      {showGrouped && startHere && (
        <Link
          href={`/learn/${startHere.slug}`}
          className="group block mt-8 sm:mt-10 p-5 sm:p-6 border-t-2 border-b-2 border-[var(--ink)]"
        >
          <p className="bs-stamp mb-3">New to VEQT · Start here</p>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 md:gap-8 items-end">
            <div>
              <h2
                className="bs-display-italic text-[1.875rem] sm:text-[2.5rem] lg:text-[3rem] leading-[1.02] group-hover:text-[var(--stamp)] transition-colors"
                style={{ color: "var(--ink)" }}
              >
                {startHere.title}
              </h2>
              <p
                className="bs-body text-[1rem] sm:text-[1.0625rem] mt-3 leading-[1.5] max-w-[60ch]"
                style={{ color: "var(--ink)" }}
              >
                {startHere.excerpt || startHere.description}
              </p>
            </div>
            <p
              className="bs-label shrink-0"
              style={{ color: "var(--ink-soft)" }}
            >
              {startHere.readingTime} &nbsp;&rarr;
            </p>
          </div>
        </Link>
      )}

      {/* ── Main content: grouped by department OR flat filtered list ── */}
      {showGrouped ? (
        <div className="mt-10 sm:mt-14 space-y-12 sm:space-y-16">
          {(
            [
              "beginner",
              "comparison",
              "tax-strategy",
              "veqt-deep-dive",
              "opinion",
            ] as FilterKey[]
          ).map((cat) => {
            const entries =
              (grouped[cat] ?? []).filter((a) => a.slug !== startHere?.slug);
            if (entries.length === 0) return null;
            return (
              <section key={cat}>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h2
                    className="bs-display text-[1.75rem] sm:text-[2rem]"
                    style={{ color: "var(--ink)" }}
                  >
                    {CATEGORY_HEADINGS[cat]}
                  </h2>
                  <p
                    className="bs-label tabular-nums"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {entries.length} dispatches
                  </p>
                </div>
                <p
                  className="bs-caption italic mb-2"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {CATEGORY_BLURB[cat]}
                </p>
                <ul>
                  {entries.map((article) => (
                    <ArticleRow
                      key={article.slug}
                      article={article}
                      ordinal={ordinalMap.get(article.slug) ?? 0}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div className="mt-8 sm:mt-10">
          {filtered.length === 0 ? (
            <p
              className="bs-body italic py-12 text-center"
              style={{ color: "var(--ink-soft)" }}
            >
              No dispatches match that.{" "}
              <button
                type="button"
                className="bs-link underline"
                onClick={() => {
                  setFilter("all");
                  setSearch("");
                }}
              >
                Clear filters.
              </button>
            </p>
          ) : (
            <ul>
              {filtered.map((article) => (
                <ArticleRow
                  key={article.slug}
                  article={article}
                  ordinal={ordinalMap.get(article.slug) ?? 0}
                />
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
