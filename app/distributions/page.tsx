import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import DistributionChart from "@/components/distributions/DistributionChart";
import {
  VEQT_DISTRIBUTIONS,
  getTrailing12MonthDistributions,
  getDistributionYears,
} from "@/data/distributions";

export const metadata: Metadata = {
  title: "VEQT Distribution History — BuyVEQT",
  description:
    "Complete history of VEQT annual distributions — amounts per unit, ex-dividend dates, and payment dates. Track VEQT's distribution history over time.",
  openGraph: {
    title: "VEQT Distribution History — BuyVEQT",
    description: "Complete history of VEQT annual distributions.",
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function DistributionsPage() {
  const latestConfirmed = VEQT_DISTRIBUTIONS.distributions.find((d) => !d.estimated)!;
  const trailing12 = getTrailing12MonthDistributions();
  const years = getDistributionYears();
  const allDistributions = VEQT_DISTRIBUTIONS.distributions;

  return (
    <PageShell>
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            VEQT Distributions
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            VEQT pays one distribution per year, typically in late December. Here&apos;s the complete history.
          </p>
        </div>

        {/* Section 1: Latest Distribution */}
        <section className="mb-8">
          <div className="rounded-lg border-2 border-[var(--color-brand)] bg-white p-5 sm:p-6 inline-block w-full sm:w-auto sm:min-w-[360px]">
            <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wider mb-2">
              Latest Distribution
            </p>
            <p className="text-3xl font-bold tabular-nums text-[var(--color-text-primary)]">
              ${latestConfirmed.amount.toFixed(4)}
              <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1.5">
                per unit
              </span>
            </p>
            <div className="mt-3 space-y-1 text-sm">
              <div className="flex gap-6">
                <div>
                  <span className="text-[var(--color-text-muted)]">Ex-dividend: </span>
                  <span className="font-medium">{formatDate(latestConfirmed.exDate)}</span>
                </div>
                <div>
                  <span className="text-[var(--color-text-muted)]">Payment: </span>
                  <span className="font-medium">{formatDate(latestConfirmed.payDate)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Summary Stats */}
        <section className="mb-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Frequency
              </p>
              <p className="text-lg font-semibold mt-1">
                {VEQT_DISTRIBUTIONS.frequency}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Trailing 12-Month
              </p>
              <p className="text-lg font-semibold tabular-nums mt-1">
                ${trailing12.toFixed(4)}
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Est. Yield (T12M)
              </p>
              <p className="text-lg font-semibold tabular-nums mt-1">
                ~{((trailing12 / 42.5) * 100).toFixed(2)}%
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                Based on ~$42.50 price
              </p>
            </div>
            <div className="rounded-lg border border-[var(--color-border)] bg-white p-4">
              <p className="text-xs text-[var(--color-text-muted)] uppercase tracking-wider">
                Years of Distributions
              </p>
              <p className="text-lg font-semibold mt-1">{years}</p>
            </div>
          </div>
        </section>

        {/* Section 3: Distribution History Table */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Distribution History
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-white overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Ex-Dividend Date
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="text-right py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Amount Per Unit
                  </th>
                </tr>
              </thead>
              <tbody>
                {allDistributions.map((d, i) => (
                  <tr
                    key={d.exDate}
                    className={`border-b border-[var(--color-border)] ${
                      i % 2 === 1 ? "bg-[var(--color-base)]" : ""
                    }`}
                  >
                    <td className="py-2.5 px-4">
                      {formatDate(d.exDate)}
                      {d.estimated && (
                        <span className="ml-2 inline-block text-[10px] font-medium bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 align-middle">
                          Est.
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--color-text-muted)]">
                      {formatDate(d.payDate)}
                    </td>
                    <td className={`py-2.5 px-4 text-right tabular-nums font-medium ${d.estimated ? "text-[var(--color-text-muted)]" : ""}`}>
                      ${d.amount.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 4: Distribution Chart */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Distribution Amounts Over Time
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <DistributionChart />
            <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
              Each bar represents one annual distribution
            </p>
          </div>
        </section>

        {/* Section 5: Understanding Distributions */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Understanding Distributions
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-white p-5">
            <div className="text-sm text-[var(--color-text-muted)] leading-relaxed max-w-prose space-y-3">
              <p>
                A distribution is a payment from the fund to its unitholders,
                primarily made up of dividends earned by the approximately
                13,700 stocks VEQT holds through its underlying ETFs. When
                companies like Apple, Royal Bank, or Nestl&eacute; pay
                dividends, that income flows through to VEQT holders.
              </p>
              <p>
                It&apos;s important to understand that{" "}
                <strong className="text-[var(--color-text-secondary)]">
                  distribution yield is not the same as total return
                </strong>
                . Total return includes both price appreciation and
                distributions. A fund with a lower yield but higher price growth
                may deliver better overall returns.
              </p>
              <p>
                Many long-term VEQT holders reinvest their distributions through
                a DRIP (Dividend Reinvestment Plan) offered by their brokerage.
                This automatically uses distribution payments to buy more units,
                compounding returns over time without additional trading fees.
              </p>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mt-4 pt-3 border-t border-[var(--color-border)]">
              Source: Vanguard Canada &middot; Distribution data updated
              periodically
            </p>
          </div>
        </section>
      </main>
    </PageShell>
  );
}
