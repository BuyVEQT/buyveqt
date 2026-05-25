import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllArticles } from "@/lib/articles";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
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
 * /learn index — V2 composition.
 *
 * LearnContent owns the whole page body:
 *   LearnHero → FlagshipPromo → PathsGrid → EditorsPicks → Archive → NewsletterCard
 *
 * Wrapped in Suspense because Archive reads URL params via useSearchParams.
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
        <Suspense fallback={null}>
          <LearnContent articles={articles} />
        </Suspense>
      </div>

      <style>{`
        .learn-stack {
          display: flex;
          flex-direction: column;
          max-width: 1280px;
          margin: 0 auto;
          padding: 8px 16px 40px;
        }
        @media (min-width: 1024px) {
          .learn-stack {
            padding: 8px 40px 60px;
          }
        }
      `}</style>
    </main>
  );
}
