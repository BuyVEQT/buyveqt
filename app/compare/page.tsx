import type { Metadata } from "next";
import Link from "next/link";
import PageShell from "@/components/layout/PageShell";
import CompareContent from "@/components/compare/CompareContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { COMPARE_FAQ } from "@/data/faq";
import EditorialCTA from "@/components/compare/EditorialCTA";

export const metadata: Metadata = {
  title: "Compare VEQT vs Other Canadian ETFs",
  description:
    "Compare VEQT against XEQT, ZEQT, VGRO, XGRO, VFV, and VUN. Side-by-side performance, MER, geographic allocation, and which fund suits your portfolio.",
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
            See how VEQT stacks up against XEQT, ZEQT, VGRO, XGRO, and VFV — side by
            side. We built this tool because the &ldquo;VEQT vs XEQT&rdquo;
            question comes up more than any other in the Canadian ETF community.
            Our position is clear — we think VEQT is the better choice for most
            investors — but we believe in showing you the data and letting you
            see for yourself.
          </p>
        </div>

        <CompareContent />

        <div className="mt-8 rounded-lg border border-[var(--color-brand)]/30 bg-[var(--color-brand)]/[0.04] p-5 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-brand)] mb-2">
            Beyond the Numbers
          </p>
          <p className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] mb-2">
            The spreadsheet says they&apos;re the same. The ownership structure says otherwise.
          </p>
          <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-4 max-w-prose">
            Vanguard is owned by its investors. BlackRock is owned by Wall Street.
            When two funds perform identically, the tiebreaker is trust &mdash; and
            trust favours the company that was built to serve you.
          </p>
          <Link
            href="/learn/why-we-choose-veqt-over-xeqt"
            className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-colors"
          >
            Read: Why We Choose VEQT Over XEQT &rarr;
          </Link>
        </div>

        <EditorialCTA />
      </main>
    </PageShell>
  );
}
