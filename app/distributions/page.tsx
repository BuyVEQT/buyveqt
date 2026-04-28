import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import DistributionChart from "@/components/distributions/DistributionChart";
import IncomeEstimator from "@/components/distributions/IncomeEstimator";
import DistributionStats from "@/components/distributions/DistributionStats";
import StakeDefault from "@/components/distributions/StakeDefault";
import {
  VEQT_DISTRIBUTIONS,
  getCumulativeSinceInception,
  getDistributionCAGR,
  getTotalDistributionGrowthPct,
  getInceptionDistributionYear,
} from "@/data/distributions";
import { getNextDistributionEstimate } from "@/lib/distributions-calendar";
import { getQuote } from "@/lib/data";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "The Annual — VEQT Distribution History & Income",
  description:
    "VEQT pays one distribution a year, every late December — and it's grown every year since 2019. The full ledger, the next payout window, and what your stake pays.",
  alternates: { canonical: canonicalUrl("/distributions") },
  openGraph: {
    title: "The Annual — VEQT Distribution History",
    description:
      "Every VEQT distribution since 2019 — what it paid, how it's grown, and what your stake earns.",
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
  const allDistributions = VEQT_DISTRIBUTIONS.distributions;
  const confirmed = allDistributions.filter((d) => !d.estimated);
  const latestConfirmed = confirmed[0];
  const cumulativePaid = getCumulativeSinceInception();
  const cagr = getDistributionCAGR();
  const totalGrowthPct = getTotalDistributionGrowthPct();
  const inceptionYear = getInceptionDistributionYear();
  const yearsPaid = confirmed.length;

  // Live price — needed for yield, default-stake card, estimator
  let quote = null;
  try {
    quote = await getQuote("VEQT");
  } catch {
    /* yield + stake card will fall back gracefully */
  }
  const currentPrice = quote?.price ?? 0;

  const estimate = getNextDistributionEstimate(
    currentPrice > 0 ? currentPrice : undefined
  );

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Distributions", path: "/distributions" },
        ])}
      />

      {/* SECTION: Page head ─────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-2 bs-enter">
        <p className="bs-stamp mb-3">The Annual</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          One envelope,
          <br />
          <em className="bs-display-italic">every December.</em>
        </h1>
        <p
          className="bs-body italic mt-5 max-w-[58ch] text-[1.0625rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          VEQT pays once a year, in late December. It&apos;s grown every
          year since inception. Here&apos;s the rhythm — and what your
          stake pays.
        </p>
      </section>

      {/* SECTION: Hero ledger stats ─────────────────────────────── */}
      <DistributionStats
        cumulativePaid={cumulativePaid}
        cagr={cagr}
        totalGrowthPct={totalGrowthPct}
        inceptionYear={inceptionYear}
        yearsPaid={yearsPaid}
      />

      {/* SECTION: Window — next + latest ────────────────────────── */}
      <section
        className="mt-10 sm:mt-14 pt-6 border-t-2 border-[var(--ink)]"
        aria-labelledby="window-heading"
      >
        <p id="window-heading" className="bs-stamp mb-3">
          The Window
        </p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[2rem] mb-5"
          style={{ color: "var(--ink)" }}
        >
          <em>What&apos;s next</em> and what just landed
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Next expected */}
          <div className="border-l-2 border-[var(--stamp)] pl-5">
            <p className="bs-label mb-2" style={{ color: "var(--stamp)" }}>
              Next expected
            </p>
            <p
              className="bs-display text-[1.625rem] sm:text-[1.875rem] leading-[1.1]"
              style={{ color: "var(--ink)" }}
            >
              {estimate.estimatedWindow}
            </p>
            <p
              className="bs-caption italic mt-3"
              style={{ color: "var(--ink-soft)" }}
            >
              Avg. of last three: ${estimate.averageAmount.toFixed(4)} per
              unit
              {estimate.growthTrend !== null && (
                <>
                  {" · "}
                  YoY {estimate.growthTrend >= 0 ? "+" : ""}
                  {estimate.growthTrend.toFixed(1)}%
                </>
              )}
            </p>
            <p
              className="bs-caption italic mt-2 text-[11px]"
              style={{ color: "var(--ink-soft)" }}
            >
              Estimated from the historical pattern. Vanguard announces
              actual dates in early November.
            </p>
          </div>

          {/* Latest confirmed */}
          <div className="border-l-2 border-[var(--ink)] pl-5">
            <p
              className="bs-label mb-2"
              style={{ color: "var(--ink-soft)" }}
            >
              Latest confirmed
            </p>
            <p
              className="bs-numerals tabular-nums text-[1.875rem] sm:text-[2.25rem] leading-none"
              style={{ color: "var(--ink)" }}
            >
              ${latestConfirmed.amount.toFixed(4)}
              <span
                className="bs-caption italic ml-2 text-[14px]"
                style={{ color: "var(--ink-soft)" }}
              >
                per unit
              </span>
            </p>
            <p
              className="bs-caption mt-3"
              style={{ color: "var(--ink-soft)" }}
            >
              Ex-dividend {formatDate(latestConfirmed.exDate)} · Paid{" "}
              {formatDate(latestConfirmed.payDate)}
            </p>
            {estimate.trailingAnnualYield !== null && (
              <p
                className="bs-caption italic mt-2"
                style={{ color: "var(--ink)" }}
              >
                Trailing yield ~{estimate.trailingAnnualYield.toFixed(2)}%
                at today&apos;s price
              </p>
            )}
          </div>
        </div>
      </section>

      {/* SECTION: Chronicle — the chart ──────────────────────────── */}
      <section
        className="mt-10 sm:mt-14 pt-6 border-t-2 border-[var(--ink)]"
        aria-labelledby="chronicle-heading"
      >
        <p id="chronicle-heading" className="bs-stamp mb-3">
          The Chronicle
        </p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[2rem] mb-2"
          style={{ color: "var(--ink)" }}
        >
          <em>The check,</em> year by year
        </h2>
        <p
          className="bs-caption italic mb-5"
          style={{ color: "var(--ink-soft)" }}
        >
          Each bar is one annual payment. Light blue is next December&apos;s
          estimate.
        </p>
        <div
          className="border border-[var(--color-border)] rounded-md p-4 sm:p-5"
          style={{ backgroundColor: "var(--paper)" }}
        >
          <DistributionChart />
        </div>
      </section>

      {/* SECTION: Books — the history table ─────────────────────── */}
      <section
        className="mt-10 sm:mt-14 pt-6 border-t-2 border-[var(--ink)]"
        aria-labelledby="books-heading"
      >
        <p id="books-heading" className="bs-stamp mb-3">
          The Books
        </p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[2rem] mb-5"
          style={{ color: "var(--ink)" }}
        >
          <em>Every payment</em> on record
        </h2>
        <div className="overflow-x-auto -mx-2 sm:mx-0">
          <table className="w-full text-sm border-collapse min-w-[460px]">
            <thead>
              <tr>
                <th
                  className="bs-label text-left py-3 px-3 sm:px-4 text-[10.5px]"
                  style={{
                    color: "var(--ink-soft)",
                    borderBottom: "2px solid var(--ink)",
                    letterSpacing: "0.14em",
                  }}
                >
                  Year
                </th>
                <th
                  className="bs-label text-left py-3 px-3 sm:px-4 text-[10.5px]"
                  style={{
                    color: "var(--ink-soft)",
                    borderBottom: "2px solid var(--ink)",
                    letterSpacing: "0.14em",
                  }}
                >
                  Ex-dividend
                </th>
                <th
                  className="bs-label text-left py-3 px-3 sm:px-4 text-[10.5px]"
                  style={{
                    color: "var(--ink-soft)",
                    borderBottom: "2px solid var(--ink)",
                    letterSpacing: "0.14em",
                  }}
                >
                  Payment
                </th>
                <th
                  className="bs-label text-right py-3 px-3 sm:px-4 text-[10.5px]"
                  style={{
                    color: "var(--ink-soft)",
                    borderBottom: "2px solid var(--ink)",
                    letterSpacing: "0.14em",
                  }}
                >
                  Per unit
                </th>
              </tr>
            </thead>
            <tbody>
              {allDistributions.map((d) => {
                const year = new Date(d.exDate).getFullYear();
                return (
                  <tr
                    key={d.exDate}
                    style={{
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <td
                      className="bs-numerals py-3 px-3 sm:px-4 tabular-nums text-[14px]"
                      style={{ color: "var(--ink)" }}
                    >
                      {year}
                      {d.estimated && (
                        <span
                          className="bs-stamp ml-2 align-middle"
                          style={{
                            fontSize: "9.5px",
                            color: "var(--stamp)",
                          }}
                        >
                          Est.
                        </span>
                      )}
                    </td>
                    <td
                      className="bs-caption italic py-3 px-3 sm:px-4 text-[12.5px]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {formatDate(d.exDate)}
                    </td>
                    <td
                      className="bs-caption italic py-3 px-3 sm:px-4 text-[12.5px]"
                      style={{ color: "var(--ink-soft)" }}
                    >
                      {formatDate(d.payDate)}
                    </td>
                    <td
                      className="bs-numerals py-3 px-3 sm:px-4 text-right tabular-nums text-[14px]"
                      style={{
                        color: d.estimated
                          ? "var(--ink-soft)"
                          : "var(--ink)",
                      }}
                    >
                      ${d.amount.toFixed(4)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION: Stake — default scenario + estimator ──────────── */}
      {currentPrice > 0 && (
        <section
          className="mt-10 sm:mt-14 pt-6 border-t-2 border-[var(--ink)]"
          aria-labelledby="stake-heading"
        >
          <p id="stake-heading" className="bs-stamp mb-3">
            The Stake
          </p>
          <h2
            className="bs-display text-[1.5rem] sm:text-[2rem] mb-2"
            style={{ color: "var(--ink)" }}
          >
            <em>What your stake</em> pays
          </h2>
          <p
            className="bs-caption italic mb-5"
            style={{ color: "var(--ink-soft)" }}
          >
            Based on trailing twelve months. Future distributions are not
            guaranteed.
          </p>

          <StakeDefault
            currentPrice={currentPrice}
            annualDistPerUnit={estimate.trailingAnnualAmount}
          />

          <div className="mt-6">
            <IncomeEstimator
              annualDistPerUnit={estimate.trailingAnnualAmount}
              currentPrice={currentPrice}
            />
          </div>
        </section>
      )}

      {/* SECTION: Fine print — understanding distributions ──────── */}
      <section
        className="mt-10 sm:mt-14 pt-6 border-t-2 border-[var(--ink)]"
        aria-labelledby="fineprint-heading"
      >
        <p id="fineprint-heading" className="bs-stamp mb-3">
          The Fine Print
        </p>
        <h2
          className="bs-display text-[1.5rem] sm:text-[2rem] mb-5"
          style={{ color: "var(--ink)" }}
        >
          <em>What a distribution</em>{" "}
          actually is
        </h2>

        <div
          className="bs-body text-[15px] leading-[1.65] space-y-4 max-w-[62ch]"
          style={{ color: "var(--ink)" }}
        >
          <p>
            A distribution is a payment from the fund to its holders.
            VEQT&apos;s payment is mostly dividends — earned by the
            ~13,700 stocks the fund holds through its underlying ETFs.
            When Apple, Royal Bank, and Nestl&eacute; pay their
            shareholders, that income flows through to you.
          </p>
          <p>
            <em>Yield is not return.</em> A fund with a 2% distribution
            yield and 8% price appreciation beats a fund with a 4% yield
            and 4% appreciation. Distribution size, on its own, says
            nothing about whether the fund is winning.
          </p>
          <p>
            Most long-term holders DRIP — Dividend Reinvestment Plan —
            through their brokerage. The December payment buys more units
            automatically, no fees, no decisions, the compounding does
            its quiet work.
          </p>
        </div>

        <p
          className="bs-caption italic mt-6 pt-4 border-t border-[var(--color-border)] text-[11px]"
          style={{ color: "var(--ink-soft)" }}
        >
          Source: Vanguard Canada · Distribution data updated periodically
        </p>
      </section>
    </InteriorShell>
  );
}
