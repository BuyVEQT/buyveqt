import type { Metadata } from "next";
import CompareContent from "@/components/compare/CompareContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { COMPARE_FAQ } from "@/data/faq";

export const metadata: Metadata = {
  title: "Compare — VEQT vs the field",
  description:
    "Side-by-side bouts: VEQT against XEQT, ZEQT, CAGE, VGRO, VFV, and VUN. Performance spreads, the editor's verdict, and the data behind it.",
  alternates: { canonical: canonicalUrl("/compare") },
  openGraph: {
    title: "Compare — VEQT vs the field",
    description:
      "Head-to-head matchups across Canada's all-in-one ETF lineup. Performance spreads, fees, geography, and our take.",
    url: canonicalUrl("/compare"),
  },
};

/**
 * Round 4 Compare page. Layout chrome (global DesktopNav/TopBar + the
 * page hero) lives inside <CompareContent>. The page wrapper only
 * provides JSON-LD for SEO.
 */
export default function ComparePage() {
  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Compare", path: "/compare" },
        ])}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: COMPARE_FAQ.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: item.answer,
            },
          })),
        }}
      />
      <CompareContent />
    </>
  );
}
