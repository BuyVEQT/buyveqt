interface DistributionStatsProps {
  cumulativePaid: number; // dollars per unit since inception
  cagr: number | null; // 0.111 = 11.1%
  totalGrowthPct: number | null; // 88.2 = up 88.2%
  inceptionYear: number;
  yearsPaid: number;
}

/**
 * The Annual's headline ledger row — three numbers that summarize the
 * full distribution history at a glance.
 *
 * Layout: a 3-column grid on sm+ collapsing to a stack on mobile.
 * Each cell mirrors the home-page `Letters` rhythm — tiny stamp eyebrow,
 * big numeral, italic caption underneath.
 */
export default function DistributionStats({
  cumulativePaid,
  cagr,
  totalGrowthPct,
  inceptionYear,
  yearsPaid,
}: DistributionStatsProps) {
  return (
    <section
      className="mt-8 sm:mt-10 pt-6 border-t-2 border-[var(--ink)]"
      aria-labelledby="ledger-heading"
    >
      <p id="ledger-heading" className="bs-stamp mb-4">
        The Ledger
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
        {/* Cumulative since inception */}
        <div>
          <p
            className="bs-label mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            Paid since {inceptionYear}
          </p>
          <p
            className="bs-numerals tabular-nums text-[2rem] sm:text-[2.5rem] leading-none"
            style={{ color: "var(--stamp)" }}
          >
            ${cumulativePaid.toFixed(2)}
            <span
              className="bs-caption italic ml-2 text-[13px]"
              style={{ color: "var(--ink-soft)" }}
            >
              / unit
            </span>
          </p>
          <p
            className="bs-caption italic mt-2 text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            {yearsPaid} confirmed payments, no missed years.
          </p>
        </div>

        {/* CAGR */}
        <div>
          <p
            className="bs-label mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            Growth per year
          </p>
          <p
            className="bs-numerals tabular-nums text-[2rem] sm:text-[2.5rem] leading-none"
            style={{ color: "var(--ink)" }}
          >
            {cagr !== null ? (
              <>
                {(cagr * 100).toFixed(1)}
                <span className="text-[1.5rem] align-top ml-0.5">%</span>
              </>
            ) : (
              "—"
            )}
          </p>
          <p
            className="bs-caption italic mt-2 text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            Compound annual growth, {inceptionYear} → present.
          </p>
        </div>

        {/* Total growth */}
        <div>
          <p
            className="bs-label mb-2"
            style={{ color: "var(--ink-soft)" }}
          >
            Total growth
          </p>
          <p
            className="bs-numerals tabular-nums text-[2rem] sm:text-[2.5rem] leading-none"
            style={{ color: "var(--ink)" }}
          >
            {totalGrowthPct !== null ? (
              <>
                +{totalGrowthPct.toFixed(0)}
                <span className="text-[1.5rem] align-top ml-0.5">%</span>
              </>
            ) : (
              "—"
            )}
          </p>
          <p
            className="bs-caption italic mt-2 text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            Per-unit payment vs. {inceptionYear}, end-to-end.
          </p>
        </div>
      </div>
    </section>
  );
}
