import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CompareContent from "@/components/compare/CompareContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { COMPARE_FAQ } from "@/data/faq";

export const metadata: Metadata = {
  title: "Compare VEQT vs Other Canadian ETFs",
  description:
    "Compare VEQT against XEQT, ZEQT, VGRO, VFV, and VUN. Side-by-side performance, MER, geographic allocation, and which fund suits your portfolio.",
  alternates: { canonical: canonicalUrl("/compare") },
  openGraph: {
    title: "Compare VEQT vs Other Canadian ETFs",
    description:
      "Side-by-side comparison of Canada's top all-in-one ETFs. Performance, fees, and allocation breakdowns.",
    url: canonicalUrl("/compare"),
  },
};

export default function ComparePage() {
  return (
    <PageShell>
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
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            Compare VEQT to Other All-in-One ETFs
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            See how VEQT stacks up against XEQT, ZEQT, VGRO, and VFV — side by
            side.
          </p>
        </div>

        <CompareContent />
      </main>
    </PageShell>
  );
}
