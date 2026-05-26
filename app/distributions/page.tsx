import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
// DistributionChart loaded via a client-only wrapper to suppress the
// recharts "width(-1) and height(-1)" SSG warning and shave the
// recharts payload off the initial server render. See the wrapper for
// details.
import DistributionChart from "@/components/distributions/DistributionChartClient";
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
    title: "The Annual — VEQT Distribution History & Income",
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

      {/* SECTION: V2 Masthead — stamp row + 2-col italic lockup ── */}
      <header className="v2-masthead">
        <div className="v2-masthead__top">
          <span className="ed-stamp">
            The annual · {yearsPaid} payments on record · Updated quarterly
          </span>
          <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
            {new Intl.DateTimeFormat("en-CA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            }).format(new Date())}
          </span>
        </div>
        <div className="v2-masthead__lockup">
          <h1 className="ed-display-italic v2-masthead__h1">
            Every <em style={{ fontStyle: "italic", fontWeight: 500 }}>December.</em>
          </h1>
          <p className="ed-body v2-masthead__lede">
            VEQT pays once a year, in late December. It&apos;s grown every
            year since inception. Here&apos;s the rhythm — and what your
            stake pays.
          </p>
        </div>
        <style>{`
          .v2-masthead {
            padding: 26px 0 22px;
          }
          .v2-masthead__top {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            gap: 12px;
            flex-wrap: wrap;
            padding-bottom: 10px;
          }
          .v2-masthead__lockup {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
            padding: 18px 0 8px;
            border-top: 3px solid var(--ink);
            border-bottom: 1px solid var(--ink);
            align-items: end;
          }
          @media (min-width: 720px) {
            .v2-masthead__lockup {
              grid-template-columns: auto 1fr;
              gap: 40px;
              padding: 22px 0 12px;
            }
          }
          .v2-masthead__h1 {
            font-size: clamp(3rem, 8vw, 6rem);
            line-height: 1;
            letter-spacing: -0.035em;
            margin: 0;
            color: var(--ink);
            white-space: nowrap;
          }
          .v2-masthead__lede {
            font-size: clamp(15px, 1.6vw, 17.5px);
            line-height: 1.55;
            color: var(--ink-soft);
            margin: 0;
            max-width: 52ch;
            padding-bottom: 8px;
          }
        `}</style>
      </header>

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
        <p id="window-heading" className="ed-stamp" style={{ marginBottom: 10 }}>
          The window
        </p>
        <h2
          className="ed-display-italic"
          style={{
            fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)",
            lineHeight: 1.1,
            color: "var(--ink)",
            margin: "0 0 18px",
            letterSpacing: "-0.02em",
          }}
        >
          What&apos;s next and what{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>
            just landed.
          </em>
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
        <p id="chronicle-heading" className="ed-stamp" style={{ marginBottom: 10 }}>
          The chronicle
        </p>
        <h2
          className="ed-display-italic"
          style={{
            fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)",
            lineHeight: 1.1,
            color: "var(--ink)",
            margin: "0 0 6px",
            letterSpacing: "-0.02em",
          }}
        >
          The check,{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>
            year by year.
          </em>
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
        <p id="books-heading" className="ed-stamp" style={{ marginBottom: 10 }}>
          The books
        </p>
        <h2
          className="ed-display-italic"
          style={{
            fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)",
            lineHeight: 1.1,
            color: "var(--ink)",
            margin: "0 0 18px",
            letterSpacing: "-0.02em",
          }}
        >
          Every payment{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>
            on record.
          </em>
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
          <p id="stake-heading" className="ed-stamp" style={{ marginBottom: 10 }}>
            The stake
          </p>
          <h2
            className="ed-display-italic"
            style={{
              fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)",
              lineHeight: 1.1,
              color: "var(--ink)",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            What your stake{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>pays.</em>
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
        <p id="fineprint-heading" className="ed-stamp" style={{ marginBottom: 10 }}>
          The fine print
        </p>
        <h2
          className="ed-display-italic"
          style={{
            fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)",
            lineHeight: 1.1,
            color: "var(--ink)",
            margin: "0 0 18px",
            letterSpacing: "-0.02em",
          }}
        >
          What a distribution{" "}
          <em style={{ fontStyle: "italic", fontWeight: 500 }}>
            actually is.
          </em>
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
