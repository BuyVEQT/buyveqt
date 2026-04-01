"use client";

import { useState } from "react";
import type { ArticleFrontmatter } from "@/lib/articles";
import ArticleCard from "./ArticleCard";

type FilterKey = "all" | "beginner" | "comparisons" | "strategy";

interface SectionData {
  id: string;
  heading: string;
  description: string;
  articles: ArticleFrontmatter[];
  truncateAt: number;
  showSteps?: boolean;
  filterKey: FilterKey;
}

interface LearnContentProps {
  startHere: ArticleFrontmatter | null;
  sections: {
    basics: ArticleFrontmatter[];
    comparisons: ArticleFrontmatter[];
    strategy: ArticleFrontmatter[];
    uncategorized: ArticleFrontmatter[];
  };
}

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "beginner", label: "Beginner" },
  { key: "comparisons", label: "Comparisons" },
  { key: "strategy", label: "Strategy" },
];

function ExpandableSection({
  section,
}: {
  section: SectionData;
}) {
  const [expanded, setExpanded] = useState(false);
  const { articles, truncateAt, showSteps } = section;
  const needsTruncation = articles.length > truncateAt;
  const visible = expanded || !needsTruncation ? articles : articles.slice(0, truncateAt);

  return (
    <section className="scroll-mt-24">
      <div className="mb-4 border-l-3 border-[var(--color-brand)] pl-4">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)]">
          {section.heading}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          {section.description}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((article, i) => (
          <ArticleCard
            key={article.slug}
            article={article}
            step={showSteps ? i + 1 : undefined}
          />
        ))}
      </div>

      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          {expanded
            ? "Show fewer"
            : `Show all ${articles.length} articles \u2192`}
        </button>
      )}
    </section>
  );
}

export default function LearnContent({
  startHere,
  sections,
}: LearnContentProps) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");

  const sectionList: SectionData[] = [
    {
      id: "basics",
      heading: "Understand the Basics",
      description: "Core concepts every VEQT investor should know.",
      articles: sections.basics,
      truncateAt: 3,
      showSteps: true,
      filterKey: "beginner",
    },
    {
      id: "comparisons",
      heading: "Compare Your Options",
      description: "Side-by-side breakdowns to help you decide.",
      articles: sections.comparisons,
      truncateAt: 3,
      filterKey: "comparisons",
    },
    {
      id: "strategy",
      heading: "Optimize Your Strategy",
      description: "Accounts, taxes, fees, and making VEQT work harder.",
      articles: sections.strategy,
      truncateAt: 3,
      filterKey: "strategy",
    },
  ];

  if (sections.uncategorized.length > 0) {
    sectionList.push({
      id: "more",
      heading: "More Reading",
      description: "Additional articles and resources.",
      articles: sections.uncategorized,
      truncateAt: 3,
      filterKey: "all",
    });
  }

  // Build filtered article list for non-"all" views
  const getFilteredArticles = (): ArticleFrontmatter[] => {
    const section = sectionList.find((s) => s.filterKey === activeFilter);
    if (!section) return [];

    const articles = [...section.articles];
    // Include start-here if it matches the filter
    if (startHere) {
      const matchesFilter =
        (activeFilter === "beginner" && startHere.category === "beginner") ||
        (activeFilter === "comparisons" &&
          startHere.category === "comparison") ||
        (activeFilter === "strategy" &&
          (startHere.category === "tax-strategy" ||
            startHere.category === "veqt-deep-dive"));
      if (matchesFilter) {
        articles.unshift(startHere);
      }
    }
    return articles;
  };

  const isAll = activeFilter === "all";
  const filteredArticles = !isAll ? getFilteredArticles() : [];

  return (
    <>
      {/* Filter pills — sticky */}
      <nav className="sticky top-0 z-30 -mx-4 px-4 py-3 bg-[var(--color-base)] border-b border-transparent mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 flex-nowrap">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-150 ${
                activeFilter === filter.key
                  ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)]"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Content area */}
      <div className="transition-opacity duration-200">
        {isAll ? (
          /* Sectioned "All" view */
          <div className="space-y-10">
            {/* Start Here hero card */}
            {startHere && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
                  New to VEQT? Start here
                </p>
                <ArticleCard article={startHere} featured />
              </div>
            )}

            {sectionList
              .filter((s) => s.articles.length > 0)
              .map((section) => (
                <ExpandableSection key={section.id} section={section} />
              ))}
          </div>
        ) : (
          /* Filtered flat grid */
          <div>
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-[var(--color-text-muted)]">
                  No articles in this category yet. Check back soon!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
