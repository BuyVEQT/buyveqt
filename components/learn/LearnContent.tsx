"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ArticleFrontmatter } from "@/lib/articles";
import ArticleRow from "./ArticleRow";
import FilterRail from "./FilterRail";
import PathsGrid from "./PathsGrid";

interface LearnContentProps {
  startHere: ArticleFrontmatter | null;
  articles: ArticleFrontmatter[];
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
  startHere,
  articles,
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

      {/* Paths grid — only in default state */}
      {isDefault && <PathsGrid articles={articles} />}

      {/* Featured "Start Here" — only in default state */}
      {isDefault && startHere && (
        <Link
          href={`/learn/${startHere.slug}`}
          className="group block mt-2 mb-8 sm:mb-10 p-5 sm:p-6 border-t-2 border-b-2 border-[var(--ink)]"
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

      {/* Main content */}
      {showGrouped ? (
        <div className="mt-4 space-y-12 sm:space-y-16">
          {(
            [
              "beginner",
              "comparison",
              "tax-strategy",
              "veqt-deep-dive",
            ] as CategoryKey[]
          ).map((catKey) => {
            const entries = (grouped[catKey] ?? []).filter(
              (a) => a.slug !== startHere?.slug
            );
            if (entries.length === 0) return null;
            return (
              <section key={catKey}>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h2
                    className="bs-display text-[1.75rem] sm:text-[2rem]"
                    style={{ color: "var(--ink)" }}
                  >
                    {CATEGORY_HEADINGS[catKey]}
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
                  {CATEGORY_BLURB[catKey]}
                </p>
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
