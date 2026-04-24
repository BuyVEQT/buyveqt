import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import CompareContent from "@/components/compare/CompareContent";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { COMPARE_FAQ } from "@/data/faq";

export const metadata: Metadata = {
  title: "The Bouts — VEQT vs the field",
  description:
    "Side-by-side bouts: VEQT against XEQT, ZEQT, VGRO, XGRO, VFV, and VUN. Performance spreads, the editor's verdict, and the data behind it.",
  alternates: { canonical: canonicalUrl("/compare") },
  openGraph: {
    title: "The Bouts — VEQT vs the field",
    description:
      "Head-to-head matchups across Canada's all-in-one ETF lineup. Performance spreads, fees, geography, and our take.",
    url: canonicalUrl("/compare"),
  },
};

export default function ComparePage() {
  return (
    <InteriorShell>
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

      {/* ── Page head ──────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-6 bs-enter">
        <p className="bs-stamp mb-3">The Bouts</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          VEQT against
          <br />
          <em className="bs-display-italic">the field.</em>
        </h1>
        <p
          className="bs-body mt-5 max-w-[58ch]"
          style={{ color: "var(--ink)" }}
        >
          We picked Vanguard&apos;s all-equity workhorse. Reasonable people
          pick differently. Each bout below puts VEQT next to a credible
          alternative — XEQT, ZEQT, VGRO, XGRO, VFV — with the data, the
          spread, and our take. Bring your own conclusion.
        </p>
        <p
          className="bs-caption italic mt-4 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px]"
          style={{ color: "var(--ink-soft)" }}
        >
          <span>
            <span className="bs-numerals not-italic text-[var(--ink)]">7</span>{" "}
            funds in the lineup
          </span>
          <span className="opacity-50">·</span>
          <span>Live market data</span>
          <span className="opacity-50">·</span>
          <span className="text-[10.5px]" style={{ letterSpacing: "0.06em" }}>
            dispatch every 5m
          </span>
        </p>
      </section>

      <section className="bs-enter pb-12">
        <CompareContent />
      </section>
    </InteriorShell>
  );
}
