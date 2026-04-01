import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import DistributionChart from "@/components/distributions/DistributionChart";
import IncomeEstimator from "@/components/distributions/IncomeEstimator";
import DataFreshness from "@/components/ui/DataFreshness";
import {
  VEQT_DISTRIBUTIONS,
  getTrailing12MonthDistributions,
  getDistributionYears,
} from "@/data/distributions";
import { getNextDistributionEstimate } from "@/lib/distributions-calendar";
import { getQuote } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "VEQT Distributions — Schedule, History & Income Estimator",
  description:
    "VEQT distribution schedule, next payout estimate, historical distribution data, and income calculator. Track annual dividends for Vanguard All-Equity ETF.",
  alternates: { canonical: canonicalUrl("/distributions") },
  openGraph: {
    title: "VEQT Distributions — Schedule & History",
    description:
      "Every VEQT distribution since 2019. Annual payouts, yield trends, and income estimator.",
    url: canonicalUrl("/distributions"),
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function DistributionsPage() {
  const latestConfirmed = VEQT_DISTRIBUTIONS.distributions.find(
    (d) => !d.estimated
  )!;
  const trailing12 = getTrailing12MonthDistributions();
  const years = getDistributionYears();
  const allDistributions = VEQT_DISTRIBUTIONS.distributions;

  // Fetch live price for yield calculation
  let quote = null;
  try {
    quote = await getQuote("VEQT");
  } catch {
    // Price unavailable — yield calc will use fallback
  }

  const currentPrice = quote?.price ?? 0;
  const estimate = getNextDistributionEstimate(
    currentPrice > 0 ? currentPrice : undefined
  );

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Distributions", path: "/distributions" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            VEQT Distributions
          </h1>
          <p className="mt-2 text-[var(--color-text-muted)] max-w-prose">
            VEQT pays one distribution per year, typically in late December.
            Track history, estimate income, and plan ahead.
          </p>
        </div>

        {/* Section 1: Next Distribution Estimate */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Next payout card */}
            <div className="rounded-lg border-2 border-[var(--color-brand)] bg-[var(--color-card)] p-5">
              <p className="text-xs font-medium text-[var(--color-brand)] uppercase tracking-wider mb-2">
                Next Expected Distribution
              </p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">
                {estimate.estimatedWindow}
              </p>
              <p className="text-sm text-[var(--color-text-muted)] mt-2">
                Avg. recent payout: ${estimate.averageAmount.toFixed(4)} per unit
              </p>
              {estimate.growthTrend !== null && (
                <p className="text-sm text-[var(--color-text-muted)]">
                  YoY growth: {estimate.growthTrend >= 0 ? "+" : ""}
                  {estimate.growthTrend.toFixed(1)}%
                </p>
              )}
              <p className="text-[10px] text-[var(--color-text-muted)] mt-3">
                Estimated based on historical annual pattern. Actual dates
                announced by Vanguard.
              </p>
            </div>

            {/* Latest confirmed + yield */}
            <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
              <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-2">
                Latest Confirmed
              </p>
              <p className="text-2xl font-bold tabular-nums text-[var(--color-text-primary)]">
                ${latestConfirmed.amount.toFixed(4)}
                <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1.5">
                  per unit
                </span>
              </p>
              <div className="mt-2 text-sm text-[var(--color-text-muted)]">
                <p>Ex-dividend: {formatDate(latestConfirmed.exDate)}</p>
                <p>Payment: {formatDate(latestConfirmed.payDate)}</p>
              </div>
              {estimate.trailingAnnualYield !== null && (
                <p className="text-sm font-medium text-[var(--color-text-primary)] mt-2">
                  Trailing yield: ~{estimate.trailingAnnualYield.toFixed(2)}%
                </p>
              )}
              {quote && (
                <div className="mt-2">
                  <DataFreshness
                    source={quote.source}
                    fetchedAt={quote.fetchedAt}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section 2: Distribution History Table */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Annual Distribution History
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">
                    Year
                  </th>
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
                    <td className="py-2.5 px-4 font-medium">
                      {new Date(d.exDate).getFullYear()}
                      {d.estimated && (
                        <span className="ml-2 inline-block text-[10px] font-medium bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 align-middle">
                          Est.
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--color-text-muted)]">
                      {formatDate(d.exDate)}
                    </td>
                    <td className="py-2.5 px-4 text-[var(--color-text-muted)]">
                      {formatDate(d.payDate)}
                    </td>
                    <td
                      className={`py-2.5 px-4 text-right tabular-nums font-medium ${
                        d.estimated ? "text-[var(--color-text-muted)]" : ""
                      }`}
                    >
                      ${d.amount.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 3: Distribution Chart */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Distribution Amounts Over Time
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
            <DistributionChart />
            <p className="text-[11px] text-[var(--color-text-muted)] mt-2">
              Each bar represents one annual distribution
            </p>
          </div>
        </section>

        {/* Section 4: Income Estimator */}
        {currentPrice > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
              Estimate Your Income
            </h2>
            <IncomeEstimator
              annualDistPerUnit={estimate.trailingAnnualAmount}
              currentPrice={currentPrice}
            />
          </section>
        )}

        {/* Section 5: Understanding Distributions */}
        <section className="mb-6">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">
            Understanding Distributions
          </h2>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5">
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
