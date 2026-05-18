import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import LearnHero from "@/components/learn/LearnHero";
import LearnContent from "@/components/learn/LearnContent";

export function generateMetadata(): Metadata {
  const count = getAllArticles().length;
  const description = `${count} dispatches on VEQT, Canadian ETFs, tax-advantaged accounts, and building a passive portfolio. Written in plain English for real investors.`;
  return {
    title: "Learn — VEQT & Canadian Passive Investing",
    description,
    alternates: { canonical: canonicalUrl("/learn") },
    openGraph: {
      title: "Learn — VEQT & Canadian Passive Investing",
      description:
        "Plain-English guides on VEQT, all-in-one ETFs, tax-advantaged accounts, and passive investing in Canada.",
      url: canonicalUrl("/learn"),
    },
  };
}

/**
 * Round 4 v2 — /learn index. Composition lives in <LearnContent>:
 * sticky filter rail, Editor's Picks, 6 reading paths, then grouped
 * category sections (or filtered list when filters are active),
 * with the newsletter card at the bottom.
 */
export default function LearnPage() {
  const articles = getAllArticles();

  return (
    <main
      style={{
        background: "var(--paper)",
        color: "var(--ink)",
        minHeight: "100dvh",
      }}
    >
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />

      <div className="learn-stack">
        <LearnHero articleCount={articles.length} />

        {/* LearnContent reads URL params via useSearchParams; needs Suspense. */}
        <Suspense fallback={null}>
          <LearnContent articles={articles} />
        </Suspense>
      </div>

      <style>{`
        .learn-stack {
          display: flex;
          flex-direction: column;
          gap: 32px;
          max-width: 1280px;
          margin: 0 auto;
          padding: 20px 16px 16px;
        }
        @media (min-width: 1024px) {
          .learn-stack {
            gap: 40px;
            padding: 40px 40px 16px;
          }
        }
      `}</style>
    </main>
  );
}
