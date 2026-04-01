import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import { getAllArticles, type ArticleFrontmatter } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import LearnContent from "@/components/learn/LearnContent";

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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Learn
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)] max-w-2xl">
            Whether you&apos;re buying your first ETF or optimizing a six-figure
            portfolio, start with the guide that fits where you are.
          </p>
        </div>

        <LearnContent
          startHere={startHere}
          sections={{ basics, comparisons, strategy, uncategorized }}
        />

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
