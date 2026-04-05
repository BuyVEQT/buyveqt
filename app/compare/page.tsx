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
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-10">
        {/* Editorial hero */}
        <div className="mb-10">
          <p className="section-label mb-3">Side-by-Side Analysis</p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-[var(--color-text-primary)] leading-[1.1] max-w-2xl">
            Compare VEQT to Other All-in-One ETFs
          </h1>
          <p className="mt-4 text-[var(--color-text-secondary)] max-w-xl leading-relaxed">
            See how VEQT stacks up against XEQT, ZEQT, VGRO, XGRO, and VFV — side by
            side. We think VEQT is the better choice for most investors — but we
            believe in showing you the data and letting you see for yourself.
          </p>
          {/* Stats bar */}
          <div className="mt-5 flex items-center gap-5 text-xs text-[var(--color-text-muted)]">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" className="text-[var(--color-accent)]">
                <path d="M4 2a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H4zm1 3a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1zm0 3a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1zm1 2a1 1 0 100 2h2a1 1 0 100-2H6z" />
              </svg>
              7 funds compared
            </span>
            <span className="text-[var(--color-border)]">&middot;</span>
            <span>Live market data</span>
            <span className="text-[var(--color-border)]">&middot;</span>
            <span>Updated every 5 min</span>
          </div>
        </div>

        <CompareContent />

        {/* Beyond the Numbers CTA */}
        <div className="mt-10 card-editorial overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Left accent */}
            <div className="hidden md:block w-1.5 bg-gradient-to-b from-[var(--color-brand)] via-[var(--color-accent)] to-[var(--color-chart-line)] shrink-0" />
            <div className="p-6 sm:p-8 flex-1">
              <p className="section-label mb-2">Beyond the Numbers</p>
              <h2 className="font-serif text-xl sm:text-2xl font-medium text-[var(--color-text-primary)] mb-2">
                The spreadsheet says they&apos;re the same. The ownership structure says otherwise.
              </h2>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mb-5 max-w-prose">
                Vanguard is owned by its investors. BlackRock is owned by Wall Street.
                When two funds perform identically, the tiebreaker is trust &mdash; and
                trust favours the company that was built to serve you.
              </p>
              <Link
                href="/learn/veqt-vs-xeqt"
                className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-all hover:shadow-lg hover:shadow-[var(--color-brand)]/10"
              >
                Read: VEQT vs XEQT &rarr;
              </Link>
            </div>
          </div>
        </div>

        <EditorialCTA />
      </main>
    </PageShell>
  );
}
