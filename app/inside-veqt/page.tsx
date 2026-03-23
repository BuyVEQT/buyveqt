import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import SectorChart from "@/components/inside/SectorChart";
import { FUNDS } from "@/data/funds";
import { VEQT_TOP_HOLDINGS, TOP_HOLDINGS_TOTAL_WEIGHT } from "@/data/holdings";

export const metadata: Metadata = {
  title: "What's Inside VEQT? — BuyVEQT",
  description:
    "A complete breakdown of VEQT's structure — geographic allocation, underlying ETFs, sector exposure, and top holdings. Understand what you actually own.",
  openGraph: {
    title: "What's Inside VEQT? — BuyVEQT",
    description:
      "A complete breakdown of VEQT's structure, holdings, and allocation.",
  },
};

const veqt = FUNDS["VEQT.TO"];

const REGION_NOTES: Record<string, string> = {
  "United States": "~4,000 stocks across all US market caps",
  Canada: "~200 stocks covering the Canadian market",
  "International Developed": "~6,000 stocks across Europe, Asia-Pacific, and more",
  "Emerging Markets": "~5,000 stocks across China, India, Brazil, and more",
};

export default function InsideVeqtPage() {
  return (
    <PageShell>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            What&apos;s Inside VEQT?
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose leading-relaxed">
            VEQT is a fund of funds — one ETF that holds four underlying
            Vanguard ETFs, giving you instant exposure to thousands of stocks
            worldwide.
          </p>
        </div>

        {/* Section 1: Fund-of-Funds Structure */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            The Fund-of-Funds Structure
          </h2>
          <div className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-prose space-y-3 mb-6">
            <p>
              VEQT doesn&apos;t hold individual stocks directly. Instead, it
              invests in four underlying Vanguard index ETFs, each covering a
              different region of the global stock market. This structure lets
              Vanguard manage rebalancing automatically — you buy one ticker and
              get diversified global equity exposure.
            </p>
            <p>
              When markets shift and one region outperforms others, Vanguard
              periodically rebalances VEQT back to its target weights. You
              don&apos;t need to do anything — the fund handles it for you.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {veqt.underlyingETFs.map((etf) => (
              <div
                key={etf.ticker}
                className="rounded-lg border border-[var(--color-border)] bg-white p-4"
              >
                <p className="text-base font-semibold" style={{ color: "#111827" }}>
                  {etf.ticker}
                </p>
                <p className="text-xs mt-0.5 leading-snug" style={{ color: "#6b7280" }}>
                  {etf.name}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--color-border)]">
                  <span className="text-xs" style={{ color: "#6b7280" }}>
                    {etf.region}
                  </span>
                  <span className="text-sm font-semibold tabular-nums" style={{ color: "#111827" }}>
                    {etf.weight}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Geography Breakdown */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Geography Breakdown
          </h2>

          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <div className="flex rounded-full overflow-hidden h-6 mb-5">
              {veqt.geographyAllocation.map((g) => (
                <div
                  key={g.region}
                  style={{ width: `${g.weight}%`, backgroundColor: g.color }}
                  className="flex items-center justify-center first:rounded-l-full last:rounded-r-full"
                >
                  {g.weight >= 10 && (
                    <span className="text-[10px] font-semibold text-white">
                      {g.weight}%
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {veqt.geographyAllocation.map((g) => (
                <div key={g.region} className="flex items-start gap-2.5">
                  <span
                    className="w-3 h-3 rounded-full mt-0.5 shrink-0"
                    style={{ backgroundColor: g.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-[var(--color-text-primary)]">
                      {g.region} — {g.weight}%
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                      {REGION_NOTES[g.region] || ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Sector Allocation */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Sector Allocation
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <SectorChart />
            <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
              Approximate sector weights based on most recent available data
            </p>
          </div>
        </section>

        {/* Section 4: Top Holdings */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Top 15 Holdings
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Company
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Ticker
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Country
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Weight
                  </th>
                </tr>
              </thead>
              <tbody>
                {VEQT_TOP_HOLDINGS.map((h, i) => (
                  <tr
                    key={h.ticker}
                    className={`border-b last:border-b-0 border-[var(--color-border)] ${
                      i % 2 === 0 ? "" : "bg-[var(--color-base)]"
                    }`}
                  >
                    <td className="py-2.5 px-4 text-[var(--color-text-muted)]">
                      {i + 1}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-[var(--color-text-primary)]">
                      {h.name}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--color-text-muted)]">
                      {h.ticker}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--color-text-muted)]">
                      {h.country}
                    </td>
                    <td className="py-2.5 px-4 text-right tabular-nums font-medium">
                      {h.weight}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[11px] text-[var(--color-text-muted)] px-4 py-3 border-t border-[var(--color-border)]">
              VEQT holds approximately 13,700 stocks. These top 15 represent
              roughly {TOP_HOLDINGS_TOTAL_WEIGHT.toFixed(1)}% of the total fund.
            </p>
          </div>
        </section>

        {/* Section 5: How Often This Changes */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            How Often This Changes
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-prose">
              Vanguard periodically rebalances VEQT&apos;s target allocation
              across its four underlying ETFs. The underlying holdings themselves
              change as the constituent indices are reconstituted — typically
              quarterly. The data on this page is approximate and based on the
              most recent publicly available information. For the most current
              data, see{" "}
              <a
                href="https://www.vanguard.ca/en/advisor/products/products-group/etfs/VEQT"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-brand)] hover:underline"
              >
                Vanguard&apos;s official VEQT page
              </a>
              .
            </p>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-3">
              Last reviewed: March 2025
            </p>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
