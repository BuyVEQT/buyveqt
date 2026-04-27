import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import SectorBars from "@/components/inside-veqt/SectorBars";
import HeatBoard from "@/components/inside-veqt/HeatBoard";
import RegionDrilldown from "@/components/broadsheet/RegionDrilldown";
import { FUNDS, FUND_DATA_LAST_UPDATED } from "@/data/funds";
import { VEQT_TOP_HOLDINGS, TOP_HOLDINGS_TOTAL_WEIGHT } from "@/data/holdings";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const metadata: Metadata = {
  title: "Inside VEQT — Holdings, Sectors & Geographic Allocation",
  description:
    "What's inside VEQT? Explore the 4 underlying ETFs, top 15 holdings, sector breakdown, and geographic allocation of Vanguard's all-equity ETF.",
  alternates: { canonical: canonicalUrl("/inside-veqt") },
  openGraph: {
    title: "Inside VEQT — Holdings, Sectors & Allocation",
    description:
      "Full breakdown of what VEQT holds: underlying ETFs, top stocks, sectors, and country allocation.",
    url: canonicalUrl("/inside-veqt"),
  },
};

const veqt = FUNDS["VEQT.TO"];

const REGION_NOTES: Record<string, string> = {
  "United States": "≈ 4,000 stocks · all US market caps",
  Canada: "≈ 200 stocks · the Canadian market",
  "International Developed": "≈ 6,000 stocks · Europe, Asia-Pacific, ex-NA",
  "Emerging Markets": "≈ 5,000 stocks · China, India, Brazil, et al.",
};

const updatedDisplay = new Date(FUND_DATA_LAST_UPDATED + "T00:00:00").toLocaleDateString(
  "en-CA",
  { year: "numeric", month: "long", day: "numeric" }
);

export default function InsideVeqtPage() {
  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Inside VEQT", path: "/inside-veqt" },
        ])}
      />

      {/* ── Page head ──────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-6">
        <p className="bs-stamp mb-3">The Portfolio · Centerfold</p>
        <h1
          className="bs-display-italic text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          What you actually own.
        </h1>
        <p
          className="bs-body italic mt-4 max-w-[58ch]"
          style={{ color: "var(--ink-soft)" }}
        >
          One ticker. Four underlying ETFs. Roughly thirteen-thousand-seven-hundred
          companies in fifty-odd countries. A small map of capitalism, rebalanced
          for you while you sleep.
        </p>
        <p
          className="bs-label mt-5"
          style={{ color: "var(--ink-soft)" }}
        >
          Portfolio data verified {updatedDisplay} · Source: Vanguard Canada
        </p>
      </section>

      <div className="bs-rule-thick mb-10" />

      {/* ── HeatBoard: hero + summary stats + 90-day heatmap ─── */}
      <HeatBoard />

      {/* ── Region drilldown: four ETF cards with sector/country breakdown ── */}
      <section className="mb-14 sm:mb-16">
        <RegionDrilldown />
      </section>

      {/* ── Section 1: The Architecture ────────────────────────── */}
      <section className="mb-14 sm:mb-16">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h2
            className="bs-display text-[1.75rem] sm:text-[2rem]"
            style={{ color: "var(--ink)" }}
          >
            The Architecture
          </h2>
          <p className="bs-label tabular-nums" style={{ color: "var(--ink-soft)" }}>
            Four underlying funds
          </p>
        </div>
        <p
          className="bs-caption italic mb-6 max-w-[60ch]"
          style={{ color: "var(--ink-soft)" }}
        >
          VEQT is a fund of funds. It holds no individual stocks directly — it
          holds these four Vanguard index ETFs, each a region of the world, and
          rebalances back to its target weights periodically. You buy one ticker;
          the plumbing happens behind the curtain.
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-t border-[var(--ink)]">
          {veqt.underlyingETFs.map((etf, i) => (
            <li
              key={etf.ticker}
              className="px-4 py-5 border-b border-[var(--ink)] sm:border-r sm:[&:nth-child(2n)]:border-r-0 lg:[&:nth-child(2n)]:border-r lg:[&:nth-child(4n)]:border-r-0"
            >
              <div className="flex items-baseline justify-between mb-2">
                <span
                  className="bs-numerals text-[0.75rem]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="bs-numerals text-[1.25rem] sm:text-[1.5rem] font-medium"
                  style={{ color: "var(--ink)" }}
                >
                  {etf.weight}%
                </span>
              </div>
              <p
                className="bs-display text-[1.125rem] sm:text-[1.25rem]"
                style={{ color: "var(--ink)" }}
              >
                {etf.ticker}
              </p>
              <p
                className="bs-caption text-[0.75rem] mt-1.5 leading-snug"
                style={{ color: "var(--ink-soft)" }}
              >
                {etf.name}
              </p>
              <p
                className="bs-label mt-3"
                style={{ color: "var(--ink-soft)" }}
              >
                {etf.region}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Section 2: By Region ───────────────────────────────── */}
      <section className="mb-14 sm:mb-16">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h2
            className="bs-display text-[1.75rem] sm:text-[2rem]"
            style={{ color: "var(--ink)" }}
          >
            By Region
          </h2>
          <p className="bs-label tabular-nums" style={{ color: "var(--ink-soft)" }}>
            Geographic share
          </p>
        </div>
        <p
          className="bs-caption italic mb-6 max-w-[60ch]"
          style={{ color: "var(--ink-soft)" }}
        >
          A market-cap-weighted slice of the world. The US dominates because the
          world's stock market does. Canada gets the home-bias bump.
        </p>

        {/* Stacked bar — single ink rule with hatching to differentiate regions */}
        <div className="border border-[var(--ink)] p-4 sm:p-5">
          <div className="flex h-7 sm:h-8 mb-5 overflow-hidden border border-[var(--ink)]">
            {veqt.geographyAllocation.map((g, i) => {
              const fills = [
                "var(--ink)",
                "color-mix(in oklab, var(--ink) 70%, var(--paper))",
                "color-mix(in oklab, var(--ink) 45%, var(--paper))",
                "color-mix(in oklab, var(--ink) 22%, var(--paper))",
              ];
              const textColors = i < 2 ? "var(--paper)" : "var(--ink)";
              return (
                <div
                  key={g.region}
                  style={{
                    width: `${g.weight}%`,
                    backgroundColor: fills[i] ?? fills[fills.length - 1],
                    color: textColors,
                  }}
                  className="flex items-center justify-center"
                >
                  {g.weight >= 8 && (
                    <span
                      className="bs-numerals text-[0.75rem] sm:text-[0.8125rem] font-medium"
                    >
                      {g.weight}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {veqt.geographyAllocation.map((g, i) => {
              const fills = [
                "var(--ink)",
                "color-mix(in oklab, var(--ink) 70%, var(--paper))",
                "color-mix(in oklab, var(--ink) 45%, var(--paper))",
                "color-mix(in oklab, var(--ink) 22%, var(--paper))",
              ];
              return (
                <li key={g.region} className="flex items-start gap-3">
                  <span
                    className="w-3 h-3 mt-1.5 shrink-0 border border-[var(--ink)]"
                    style={{ backgroundColor: fills[i] ?? fills[fills.length - 1] }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p
                      className="flex items-baseline justify-between gap-3"
                      style={{ color: "var(--ink)" }}
                    >
                      <span
                        className="bs-display-italic text-[1rem] sm:text-[1.0625rem]"
                      >
                        {g.region}
                      </span>
                      <span className="bs-numerals text-[0.9375rem] tabular-nums">
                        {g.weight}%
                      </span>
                    </p>
                    <p
                      className="bs-caption text-[0.75rem] mt-0.5"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {REGION_NOTES[g.region] || ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ── Section 3: By Sector ───────────────────────────────── */}
      <section className="mb-14 sm:mb-16">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h2
            className="bs-display text-[1.75rem] sm:text-[2rem]"
            style={{ color: "var(--ink)" }}
          >
            By Sector
          </h2>
          <p className="bs-label tabular-nums" style={{ color: "var(--ink-soft)" }}>
            Eleven GICS sectors
          </p>
        </div>
        <p
          className="bs-caption italic mb-6 max-w-[60ch]"
          style={{ color: "var(--ink-soft)" }}
        >
          Technology and Financials carry the most weight. Energy, Materials,
          Utilities, Real Estate fill the long tail. No sector exceeds a quarter
          of the fund.
        </p>

        <div className="border border-[var(--ink)] p-4 sm:p-6">
          <SectorBars />
          <p
            className="bs-caption italic mt-5 pt-3 border-t border-[var(--color-border)]"
            style={{ color: "var(--ink-soft)" }}
          >
            Approximate sector weights, market-cap-weighted across the four
            underlying funds. Sorted by share. Last verified {updatedDisplay}.
          </p>
        </div>
      </section>

      {/* ── Section 4: By Holding ──────────────────────────────── */}
      <section className="mb-14 sm:mb-16">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <h2
            className="bs-display text-[1.75rem] sm:text-[2rem]"
            style={{ color: "var(--ink)" }}
          >
            By Holding
          </h2>
          <p className="bs-label tabular-nums" style={{ color: "var(--ink-soft)" }}>
            Top fifteen names
          </p>
        </div>
        <p
          className="bs-caption italic mb-6 max-w-[60ch]"
          style={{ color: "var(--ink-soft)" }}
        >
          You own ≈ 13,700 companies. These fifteen account for roughly{" "}
          {TOP_HOLDINGS_TOTAL_WEIGHT.toFixed(1)}% of the fund — visible at the
          top of the iceberg, the rest holding it up.
        </p>

        <div className="border-t-2 border-b border-[var(--ink)]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--ink)]">
                <th
                  className="bs-label text-left py-2.5 px-2 sm:px-3 w-9"
                  style={{ color: "var(--ink-soft)" }}
                >
                  №
                </th>
                <th
                  className="bs-label text-left py-2.5 px-2 sm:px-3"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Company
                </th>
                <th
                  className="bs-label text-left py-2.5 px-2 sm:px-3 hidden sm:table-cell"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Ticker
                </th>
                <th
                  className="bs-label text-left py-2.5 px-2 sm:px-3 hidden md:table-cell"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Country
                </th>
                <th
                  className="bs-label text-right py-2.5 px-2 sm:px-3"
                  style={{ color: "var(--ink-soft)" }}
                >
                  Weight
                </th>
              </tr>
            </thead>
            <tbody>
              {VEQT_TOP_HOLDINGS.map((h, i) => (
                <tr
                  key={h.ticker}
                  className="border-b last:border-b-0 border-[var(--color-border)]"
                >
                  <td
                    className="bs-numerals py-2.5 px-2 sm:px-3 text-[0.8125rem]"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td
                    className="py-2.5 px-2 sm:px-3"
                    style={{ color: "var(--ink)" }}
                  >
                    <span className="bs-display-italic text-[0.9375rem] sm:text-[1rem] leading-tight">
                      {h.name}
                    </span>
                    {/* Mobile: show ticker + country inline since columns are hidden */}
                    <span
                      className="bs-caption text-[0.6875rem] block sm:hidden mt-0.5"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {h.ticker} · {h.country}
                    </span>
                  </td>
                  <td
                    className="bs-numerals py-2.5 px-2 sm:px-3 text-[0.875rem] hidden sm:table-cell"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {h.ticker}
                  </td>
                  <td
                    className="bs-caption not-italic py-2.5 px-2 sm:px-3 text-[0.8125rem] hidden md:table-cell"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {h.country}
                  </td>
                  <td
                    className="bs-numerals py-2.5 px-2 sm:px-3 text-right text-[0.9375rem]"
                    style={{ color: "var(--ink)" }}
                  >
                    {h.weight}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          className="bs-caption italic mt-3"
          style={{ color: "var(--ink-soft)" }}
        >
          Top 15 weights aggregate ≈ {TOP_HOLDINGS_TOTAL_WEIGHT.toFixed(1)}% of
          the fund. The remaining {(100 - TOP_HOLDINGS_TOTAL_WEIGHT).toFixed(1)}%
          is spread across thousands of smaller positions.
        </p>
      </section>

      {/* ── Editor's Note ──────────────────────────────────────── */}
      <section className="mb-12">
        <div className="bs-rule-double mb-6" />
        <p className="bs-stamp mb-3">Editor&apos;s Note</p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[1.75rem] mb-3"
          style={{ color: "var(--ink)" }}
        >
          On how often this changes.
        </h2>
        <p
          className="bs-body max-w-[60ch]"
          style={{ color: "var(--ink)" }}
        >
          Vanguard rebalances VEQT&apos;s target allocation across its four
          underlying ETFs on a periodic basis. The underlying holdings themselves
          turn over as the constituent indices are reconstituted &mdash; typically
          quarterly. The numbers on this page are approximate and based on the
          most recent publicly available filings.
        </p>
        <p
          className="bs-body mt-3 max-w-[60ch]"
          style={{ color: "var(--ink)" }}
        >
          For the live version of record, see{" "}
          <a
            href="https://www.vanguard.ca/en/advisor/products/products-group/etfs/VEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="bs-link"
          >
            Vanguard&apos;s official VEQT page
          </a>
          .
        </p>
        <p
          className="bs-label mt-4"
          style={{ color: "var(--ink-soft)" }}
        >
          Last reviewed {updatedDisplay}
        </p>
      </section>
    </InteriorShell>
  );
}
