import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import { getAllArticles, type ArticleFrontmatter } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import ArticleCard from "@/components/learn/ArticleCard";
import ArticleSection from "@/components/learn/ArticleSection";

export const metadata: Metadata = {
  title: "Learn About VEQT & Canadian Passive Investing",
  description:
    "Educational articles on VEQT, Canadian ETF investing, TFSAs, RRSPs, and building a passive portfolio. Written in plain English for real investors.",
  alternates: { canonical: canonicalUrl("/learn") },
  openGraph: {
    title: "Learn — VEQT & Canadian Passive Investing",
    description:
      "Plain-English guides on VEQT, all-in-one ETFs, tax-advantaged accounts, and passive investing in Canada.",
    url: canonicalUrl("/learn"),
  },
};

/**
 * Extract articles matching a predicate from the pool (mutates pool).
 * Prevents articles from appearing in multiple sections.
 */
function extract(
  pool: ArticleFrontmatter[],
  predicate: (a: ArticleFrontmatter) => boolean
): ArticleFrontmatter[] {
  const matched = pool.filter(predicate);
  for (const a of matched) {
    const idx = pool.indexOf(a);
    if (idx !== -1) pool.splice(idx, 1);
  }
  return sortByOrder(matched);
}

function sortByOrder(articles: ArticleFrontmatter[]): ArticleFrontmatter[] {
  return articles.sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}

const FILTER_PILLS = [
  { label: "All", href: "#articles" },
  { label: "Beginner", href: "#basics" },
  { label: "Comparisons", href: "#comparisons" },
  { label: "Strategy", href: "#strategy" },
  { label: "Our Takes", href: "#our-takes" },
];

export default function LearnPage() {
  const allArticles = getAllArticles();

  // Find the Start Here article
  const startHere =
    allArticles.find((a) => a.slug === "getting-started-with-veqt") ||
    allArticles
      .filter((a) => a.category === "beginner")
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))[0] ||
    null;

  // Build pool of remaining articles (excluding Start Here)
  const pool = allArticles.filter((a) => a.slug !== startHere?.slug);

  // Extract groups in priority order (each article appears in only one group)
  const basics = extract(pool, (a) => a.category === "beginner");
  const comparisons = extract(pool, (a) => a.category === "comparison");
  const strategy = extract(
    pool,
    (a) => a.category === "tax-strategy" || a.category === "veqt-deep-dive"
  );
  const editorial = extract(
    pool,
    (a) => a.isEditorial === true || a.category === "opinion"
  );
  const uncategorized = pool; // whatever's left

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Section 1: Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Learn
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)] max-w-2xl">
            Whether you&apos;re buying your first ETF or optimizing a six-figure
            portfolio, start with the guide that fits where you are.
          </p>
        </div>

        {/* Section 2: Category Filter Pills */}
        <nav className="mb-8 -mx-4 px-4 overflow-x-auto">
          <div className="flex gap-2 flex-nowrap">
            {FILTER_PILLS.map((pill) => (
              <a
                key={pill.href}
                href={pill.href}
                className="shrink-0 px-4 py-2 text-sm font-medium rounded-full border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-muted)] transition-colors"
              >
                {pill.label}
              </a>
            ))}
          </div>
        </nav>

        <div id="articles" className="space-y-10 scroll-mt-24">
          {/* Section 3: Start Here Hero Card */}
          {startHere && (
            <div className="mb-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
                New to VEQT? Start here
              </p>
              <ArticleCard article={startHere} featured />
            </div>
          )}

          {/* Section 4: Categorized Article Sections */}
          <ArticleSection
            id="basics"
            heading="Understand the Basics"
            description="Core concepts every VEQT investor should know."
            articles={basics}
          />

          <ArticleSection
            id="comparisons"
            heading="Compare Your Options"
            description="Side-by-side breakdowns to help you decide."
            articles={comparisons}
          />

          <ArticleSection
            id="strategy"
            heading="Optimize Your Strategy"
            description="Accounts, taxes, fees, and making VEQT work harder."
            articles={strategy}
          />

          <ArticleSection
            id="our-takes"
            heading="Our Takes"
            description="Opinionated but informed. Our honest views on VEQT and the market."
            articles={editorial}
          />

          {uncategorized.length > 0 && (
            <ArticleSection
              id="more"
              heading="More Reading"
              description="Additional articles and resources."
              articles={uncategorized}
            />
          )}
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-lg bg-[var(--color-base)] border border-[var(--color-border)] p-4">
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            All content is educational and informational only — not financial
            advice. Consider your personal situation and consult a qualified
            advisor before making investment decisions.
          </p>
        </div>
      </main>
    </PageShell>
  );
}
