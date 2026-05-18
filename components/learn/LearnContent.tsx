"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ArticleFrontmatter } from "@/lib/articles";
import ArticleRow from "./ArticleRow";
import FilterRail from "./FilterRail";
import PathsGrid from "./PathsGrid";
import EditorsPicks from "./EditorsPicks";
import NewsletterCard from "./NewsletterCard";

interface LearnContentProps {
  articles: ArticleFrontmatter[];
}

type CategoryKey =
  | "beginner"
  | "comparison"
  | "tax-strategy"
  | "veqt-deep-dive"
  | "opinion";

const CATEGORY_HEADINGS: Record<
  CategoryKey,
  { title: string; italic?: string; blurb: string }
> = {
  beginner: {
    title: "The Basics",
    blurb: "Core concepts every VEQT investor should know.",
  },
  comparison: {
    title: "Head-to-Head",
    blurb: "Side-by-side breakdowns against the field.",
  },
  "tax-strategy": {
    title: "Tax & Accounts",
    blurb: "TFSAs, RRSPs, FHSAs, withdrawals — making the account work.",
  },
  "veqt-deep-dive": {
    title: "The Deep Dive",
    blurb: "Mechanics: distributions, currency risk, home bias, costs.",
  },
  opinion: {
    title: "Opinion",
    italic: "Opinion",
    blurb: "Our takes on covered calls, forex, and other distractions.",
  },
};

/** Order matters — these run top-down on the default index. */
const CATEGORY_ORDER: CategoryKey[] = [
  "beginner",
  "comparison",
  "tax-strategy",
  "veqt-deep-dive",
  "opinion",
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
 * Round 4 v2 Learn index content. Composes:
 *  - FilterRail (sticky, URL-driven)
 *  - EditorsPicks + PathsGrid (default state only)
 *  - Grouped sections by category (default) OR filtered list (filters on)
 *  - NewsletterCard at the bottom
 */
export default function LearnContent({ articles }: LearnContentProps) {
  const params = useSearchParams();

  const cat = params.get("cat") ?? null;
  const diff = params.get("diff") ?? null;
  const time = params.get("time") ?? null;
  const take = params.get("take") === "1";
  const search = params.get("q") ?? "";
  const tag = params.get("tag") ?? null;

  const isDefault =
    !cat && !diff && !time && !take && !search.trim() && !tag;

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

  return (
    <>
      <FilterRail articles={articles} />

      {isDefault && (
        <>
          <EditorsPicks articles={articles} />
          <PathsGrid />
        </>
      )}

      {isDefault ? (
        <div style={{ display: "flex", flexDirection: "column" }}>
          {CATEGORY_ORDER.map((catKey) => {
            const items = articles.filter((a) => a.category === catKey);
            if (items.length === 0) return null;
            const heading = CATEGORY_HEADINGS[catKey];
            return (
              <section key={catKey} className="learn-category-section">
                <div className="learn-category-section__head">
                  <h2 className={`learn-category-section__h2 ${catKey === "opinion" ? "learn-category-section__h2--italic" : ""}`}>
                    {heading.title}
                  </h2>
                  <span className="learn-category-section__count">
                    {items.length} dispatches
                  </span>
                </div>
                <p className="learn-category-section__blurb">{heading.blurb}</p>
                <ul className="learn-category-section__list">
                  {items.map((article) => (
                    <ArticleRow key={article.slug} article={article} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <div style={{ marginTop: 24 }}>
          {filtered.length === 0 ? (
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                padding: "48px 0",
                textAlign: "center",
                color: "var(--ink-mute)",
              }}
            >
              No dispatches match that.{" "}
              <Link
                href="/learn"
                style={{ color: "var(--stamp)", textDecoration: "underline" }}
              >
                Clear filters.
              </Link>
            </p>
          ) : (
            <ul
              style={{
                listStyle: "none",
                margin: 0,
                padding: 0,
              }}
            >
              {filtered.map((article) => (
                <ArticleRow key={article.slug} article={article} />
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{ marginTop: 48 }}>
        <NewsletterCard />
      </div>
    </>
  );
}
