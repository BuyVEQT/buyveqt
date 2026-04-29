import type { Metadata } from "next";
import Link from "next/link";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import HistoryHero from "@/components/history/HistoryHero";
import HistoryStaticFallback from "@/components/history/HistoryStaticFallback";
import HistoryAnchorCard from "@/components/history/HistoryAnchorCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";
import { HISTORY } from "@/lib/veqt-history";

export const metadata: Metadata = {
  title: "History — Seven years of VEQT",
  description:
    "VEQT, January 2019 to today. The covid crash, the rate-hike trough, the yen carry wobble, and the seven years of paychecks in between.",
  alternates: { canonical: canonicalUrl("/history") },
  openGraph: {
    title: "History — Seven years of VEQT",
    description:
      "Seven years of one ticker. Two crashes, two corrections, and what $10K became.",
    url: canonicalUrl("/history"),
  },
};

const LONGFORM: Record<string, string> = {
  launch:
    "Vanguard's all-equity ETF opens for trading on the TSX at $25.00. The pitch is uncomplicated: one ticker, four sleeves, the equity portion of every reasonable portfolio. The first year is uneventful — global equities drift up; the fund mostly sits behind the scenes in TFSAs.",
  covid:
    "The drawdown is fast. Thirty-two trading days from peak to trough; the fund loses a third of its value on the way. The Canadian sleeve takes the worst of it — energy and the banks. By late summer the price is back to where it started; by year-end, well above. The first real test of the hold-forever pitch.",
  "rate-hikes":
    "Twelve months of central-bank hikes carve a slow 21% off the price. There is no single bad day; the trough is a low note in a long song. Fixed-income holders have the worst year on record; equity holders have a bad year. The recovery takes eighteen months.",
  yen: "Three sessions in early August. The yen carry trade unwinds; Japanese equities crater; everything correlates briefly. VEQT loses 7.4%. Fourteen days later the price is back. A useful reminder that drawdowns can be over before the news cycle catches up.",
  today:
    "Seven years and change. From $25.00 to $42.61. $10,000 invested at launch is now $17,044 — and that is before reinvested distributions. Two crashes, two corrections, several silly summers. The hardest thing was not selling.",
};

export default function HistoryPage() {
  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "History", path: "/history" },
        ])}
      />

      {/* Desktop sticky hero (≥1024px) */}
      <HistoryHero />

      {/* Mobile / narrow fallback (<1024px) */}
      <HistoryStaticFallback />

      {/* ── Below-the-sticky longform ───────────────────────────── */}
      <section className="pt-12 sm:pt-16 pb-12">
        <p className="bs-stamp mb-3" style={{ color: "var(--ink-soft)" }}>
          The chronology
        </p>
        <h2
          className="bs-display text-[2rem] sm:text-[2.75rem] leading-[1.05] mb-2 max-w-[24ch]"
          style={{ color: "var(--ink)" }}
        >
          Five moments. <em className="bs-display-italic">One ticker.</em>
        </h2>
        <p
          className="bs-body italic max-w-[60ch] mb-8"
          style={{ color: "var(--ink-soft)" }}
        >
          The takedown after the show: each anchor expanded into the
          paragraph it deserves.
        </p>

        <div>
          {HISTORY.anchors.map((anchor) => (
            <HistoryAnchorCard
              key={anchor.id}
              anchor={anchor}
              longform={LONGFORM[anchor.id]}
            />
          ))}
        </div>
      </section>

      {/* ── Closing reflection + CTA ────────────────────────────── */}
      <section className="py-16 sm:py-20 text-center border-t-2 border-[var(--ink)]">
        <p
          className="bs-display-italic text-[1.625rem] sm:text-[2.125rem] lg:text-[2.5rem] leading-[1.2] max-w-[36ch] mx-auto"
          style={{ color: "var(--ink)" }}
        >
          Seven years. Two crashes. Forty-two thousand dollars per ten
          thousand invested. The hardest thing was not selling.
        </p>
        <p className="mt-10">
          <Link
            href="/inside-veqt#heatmap"
            className="bs-link bs-label"
            style={{ color: "var(--ink)" }}
          >
            See today's volatility →
          </Link>
        </p>
      </section>
    </InteriorShell>
  );
}
