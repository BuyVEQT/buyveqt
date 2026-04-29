"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ArticleFrontmatter } from "@/lib/articles";
import ArticleRow from "./ArticleRow";
import FilterRail from "./FilterRail";
import PathsGrid from "./PathsGrid";
import EditorsPicks from "./EditorsPicks";

interface LearnContentProps {
  articles: ArticleFrontmatter[];
  /**
   * When the archive is rendered below the three-courses grid on
   * `/learn`, the category headings shrink and shift to ink-soft so
   * the courses dominate the page. Defaults to `false`.
   */
  demoted?: boolean;
}

type CategoryKey =
  | "beginner"
  | "comparison"
  | "tax-strategy"
  | "veqt-deep-dive"
  | "opinion";

const CATEGORY_HEADINGS: Partial<Record<CategoryKey, string>> = {
  beginner: "The Basics",
  comparison: "Head-to-Head",
  "tax-strategy": "Tax & Accounts",
  "veqt-deep-dive": "The Deep Dive",
  opinion: "Opinion",
};

const CATEGORY_BLURB: Partial<Record<CategoryKey, string>> = {
  beginner: "Core concepts every VEQT investor should know.",
  comparison: "Side-by-side breakdowns against the field.",
  "tax-strategy": "TFSAs, RRSPs, FHSAs, withdrawals — making the account work.",
  "veqt-deep-dive": "Mechanics: distributions, currency risk, home bias, costs.",
  opinion: "Our takes on covered calls, forex, and other distractions.",
};

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

export default function LearnContent({
  articles,
  demoted = false,
}: LearnContentProps) {
  const params = useSearchParams();

  const cat = params.get("cat") ?? null;
  const diff = params.get("diff") ?? null;
  const time = params.get("time") ?? null;
  const take = params.get("take") === "1";
  const search = params.get("q") ?? "";
  const tag = params.get("tag") ?? null;

  const isDefault = !cat && !diff && !time && !take && !search && !tag;

  const filtered = useMemo(() => {
    let pool = articles;
    if (cat) pool = pool.filter((a) => a.category === cat);
    if (diff) pool = pool.filter((a) => a.difficulty === diff);
    if (time) pool = pool.filter((a) => timeBucket(a.readingTime) === time);
    if (take) pool = pool.filter((a) => a.isEditorial);
    if (tag) pool = pool.filter((a) => a.tags?.includes(tag));
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
  }, [articles, cat, diff, time, take, search, tag]);

  // Grouped view: shown only in default state (no filters active)
  const grouped = useMemo(() => {
    const buckets: Record<string, ArticleFrontmatter[]> = {};
    for (const a of filtered) {
      const key = a.category ?? "beginner";
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(a);
    }
    return buckets;
  }, [filtered]);

  const showGrouped = isDefault;

  return (
    <>
      <FilterRail />

      {/* Editor's Picks — only in default state, and only when not
          demoted (the courses block above takes over the "what to read
          first" job). */}
      {isDefault && !demoted && <EditorsPicks articles={articles} />}

      {/* Paths grid — only in default state, hidden when demoted. */}
      {isDefault && !demoted && <PathsGrid articles={articles} />}

      {/* Main content */}
      {showGrouped ? (
        <div
          className={
            demoted
              ? "mt-2 space-y-8 sm:space-y-10"
              : "mt-4 space-y-12 sm:space-y-16"
          }
        >
          {(
            [
              "beginner",
              "comparison",
              "tax-strategy",
              "veqt-deep-dive",
            ] as CategoryKey[]
          ).map((catKey) => {
            const entries = grouped[catKey] ?? [];
            if (entries.length === 0) return null;
            return (
              <section key={catKey}>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h2
                    className={
                      demoted
                        ? "bs-display text-[1.125rem] sm:text-[1.25rem]"
                        : "bs-display text-[1.75rem] sm:text-[2rem]"
                    }
                    style={{
                      color: demoted ? "var(--ink-soft)" : "var(--ink)",
                    }}
                  >
                    {CATEGORY_HEADINGS[catKey]}
                  </h2>
                  <p
                    className="bs-label tabular-nums"
                    style={{ color: "var(--ink-mute)" }}
                  >
                    {entries.length} dispatches
                  </p>
                </div>
                {!demoted && (
                  <p
                    className="bs-caption italic mb-2"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {CATEGORY_BLURB[catKey]}
                  </p>
                )}
                <ul>
                  {entries.map((article) => (
                    <ArticleRow key={article.slug} article={article} />
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
              <Link href="/learn" className="bs-link underline">
                Clear filters.
              </Link>
            </p>
          ) : (
            <ul>
              {filtered.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
