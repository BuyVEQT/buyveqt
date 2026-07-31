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
 * /learn index — the Instrument (artboard 6c).
 *
 * LearnContent owns the whole page body:
 *   LearnHero → MarqueeBout → CourseOne → CourseTwo → FullIndex →
 *   SyllabusRail → LearnCloser
 *
 * The page shell mirrors the home page's `.ins-page` grammar (1400 max,
 * 40px gutters, 30px module gap) so the two Instrument routes sit on the
 * same measure. `.ins-root` opts the subtree into the reduced-motion
 * blanket in globals.css §14.
 *
 * Wrapped in Suspense because FullIndex reads `?cat` via useSearchParams.
 */
export default function LearnPage() {
  const articles = getAllArticles();

  return (
    <main className="ins-root lrn-main">
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Learn", path: "/learn" },
        ])}
      />

      <div className="lrn-page">
        <Suspense fallback={null}>
          <LearnContent articles={articles} />
        </Suspense>
      </div>

      <style>{`
        .lrn-main {
          background: var(--ins-paper);
          color: var(--ins-ink);
          font-family: var(--ins-font);
          min-height: 100dvh;
        }
        .lrn-page {
          display: flex;
          flex-direction: column;
          gap: 30px;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 40px 40px;
        }
        @media (max-width: 640px) {
          .lrn-page {
            gap: 22px;
            padding: 0 20px 28px;
          }
        }
      `}</style>
    </main>
  );
}
