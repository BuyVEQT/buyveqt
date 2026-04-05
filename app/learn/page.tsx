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

  const startHere =
    allArticles.find((a) => a.slug === "getting-started-with-veqt") ||
    allArticles
      .filter((a) => a.category === "beginner")
      .sort((a, b) => (a.order ?? 99) - (b.order ?? 99))[0] ||
    null;

  const pool = allArticles.filter((a) => a.slug !== startHere?.slug);

  const basics = extract(pool, (a) => a.category === "beginner");
  const comparisons = extract(pool, (a) => a.category === "comparison");
  const strategy = extract(
    pool,
    (a) => a.category === "tax-strategy" || a.category === "veqt-deep-dive"
  );
  const uncategorized = pool;

  const articleCount = allArticles.length;

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10">
        {/* Editorial hero header */}
        <div className="mb-10">
          <p className="section-label mb-3">Research &amp; Education</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--color-text-primary)] leading-[1.1] max-w-2xl">
            Learn
          </h1>
          <p className="mt-4 text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
            Whether you&apos;re buying your first ETF or optimizing a six-figure
            portfolio, start with the guide that fits where you are.
          </p>
          {/* Stats bar */}
          <div className="mt-5 flex items-center gap-5 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="text-[var(--color-accent)]">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2-.5a.5.5 0 00-.5.5v8a.5.5 0 00.5.5h8a.5.5 0 00.5-.5V4a.5.5 0 00-.5-.5H4z" />
              </svg>
              {articleCount} articles
            </span>
            <span className="text-[var(--color-border)]">&middot;</span>
            <span>Plain English, no jargon</span>
            <span className="text-[var(--color-border)]">&middot;</span>
            <span>Updated regularly</span>
          </div>
        </div>

        <LearnContent
          startHere={startHere}
          sections={{ basics, comparisons, strategy, uncategorized }}
        />

        {/* Disclaimer */}
        <div className="mt-12 card-editorial p-4">
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
