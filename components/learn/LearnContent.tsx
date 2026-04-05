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
  accentColor: string;
  icon: React.ReactNode;
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

/* Section icons as inline SVGs */
const IconBook = (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.999 8.999 0 00-4.25 1.065v12.755zM9.25 4.065A8.999 8.999 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
  </svg>
);

const IconScale = (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path fillRule="evenodd" d="M10 2a.75.75 0 01.67.416l6.75 13.5a.75.75 0 01-.67 1.084H3.25a.75.75 0 01-.67-1.084l6.75-13.5A.75.75 0 0110 2zm0 3.223L5.884 14.5h8.232L10 5.223z" clipRule="evenodd" />
  </svg>
);

const IconCog = (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path fillRule="evenodd" d="M7.84 1.804A1 1 0 018.82 1h2.36a1 1 0 01.98.804l.331 1.652a6.993 6.993 0 011.929 1.115l1.598-.54a1 1 0 011.186.447l1.18 2.044a1 1 0 01-.205 1.251l-1.267 1.113a7.047 7.047 0 010 2.228l1.267 1.113a1 1 0 01.206 1.25l-1.18 2.045a1 1 0 01-1.187.447l-1.598-.54a6.993 6.993 0 01-1.929 1.115l-.33 1.652a1 1 0 01-.98.804H8.82a1 1 0 01-.98-.804l-.331-1.652a6.993 6.993 0 01-1.929-1.115l-1.598.54a1 1 0 01-1.186-.447l-1.18-2.044a1 1 0 01.205-1.251l1.267-1.114a7.05 7.05 0 010-2.227L1.821 7.773a1 1 0 01-.206-1.25l1.18-2.045a1 1 0 011.187-.447l1.598.54A6.992 6.992 0 017.51 3.456l.33-1.652zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
  </svg>
);

const IconDots = (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
    <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
  </svg>
);

function ExpandableSection({ section }: { section: SectionData }) {
  const [expanded, setExpanded] = useState(false);
  const { articles, truncateAt, showSteps } = section;
  const needsTruncation = articles.length > truncateAt;
  const visible =
    expanded || !needsTruncation ? articles : articles.slice(0, truncateAt);

  return (
    <section className="scroll-mt-24">
      {/* Section header with accent identity */}
      <div className="flex items-start gap-3 mb-5">
        <div
          className="shrink-0 mt-1 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: `color-mix(in srgb, ${section.accentColor} 10%, transparent)`,
            color: section.accentColor,
          }}
        >
          {section.icon}
        </div>
        <div>
          <h2 className="font-serif text-xl font-medium text-[var(--color-text-primary)]">
            {section.heading}
          </h2>
          <p className="mt-0.5 text-sm text-[var(--color-text-muted)]">
            {section.description}
          </p>
        </div>
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
          className="mt-4 text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors cursor-pointer"
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
      accentColor: "var(--color-positive)",
      icon: IconBook,
    },
    {
      id: "comparisons",
      heading: "Compare Your Options",
      description: "Side-by-side breakdowns to help you decide.",
      articles: sections.comparisons,
      truncateAt: 3,
      filterKey: "comparisons",
      accentColor: "var(--color-chart-line)",
      icon: IconScale,
    },
    {
      id: "strategy",
      heading: "Optimize Your Strategy",
      description: "Accounts, taxes, fees, and making VEQT work harder.",
      articles: sections.strategy,
      truncateAt: 3,
      filterKey: "strategy",
      accentColor: "var(--color-accent)",
      icon: IconCog,
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
      accentColor: "var(--color-text-muted)",
      icon: IconDots,
    });
  }

  const getFilteredArticles = (): ArticleFrontmatter[] => {
    const section = sectionList.find((s) => s.filterKey === activeFilter);
    if (!section) return [];

    const articles = [...section.articles];
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
      {/* Filter pills — sticky with backdrop */}
      <nav className="sticky top-14 z-30 -mx-4 px-4 py-3 bg-[var(--color-base)]/90 backdrop-blur-md border-b border-[var(--color-border)]/50 mb-8 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 flex-nowrap">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-150 cursor-pointer ${
                activeFilter === filter.key
                  ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white shadow-sm"
                  : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-border-light)]"
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
          <div className="space-y-14">
            {/* Featured Start Here card */}
            {startHere && (
              <div>
                <p className="section-label mb-3">
                  New to VEQT? Start here
                </p>
                <ArticleCard article={startHere} featured />
              </div>
            )}

            {/* Editorial divider after hero */}
            <div className="editorial-rule" />

            {sectionList
              .filter((s) => s.articles.length > 0)
              .map((section) => (
                <ExpandableSection key={section.id} section={section} />
              ))}
          </div>
        ) : (
          <div>
            {filteredArticles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredArticles.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-[var(--color-text-muted)] font-serif text-lg">
                  No articles in this category yet.
                </p>
                <p className="text-sm text-[var(--color-text-muted)] mt-1">
                  Check back soon!
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
