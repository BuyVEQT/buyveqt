import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import { getAllArticles } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

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

export default function LearnPage() {
  const articles = getAllArticles();

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
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Learn
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)] max-w-2xl">
            Plain-English guides to help you understand VEQT, all-in-one ETFs,
            and how they fit into your investment plan.
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/learn/${article.slug}`}
              className="group block rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-all hover:border-[var(--color-brand)] hover:shadow-md"
            >
              <h2 className="text-lg font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug">
                {article.title}
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-secondary)] leading-relaxed line-clamp-2">
                {article.description}
              </p>
              <p className="mt-3 text-xs text-[var(--color-text-muted)]">
                {article.readingTime}
              </p>
            </Link>
          ))}
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
