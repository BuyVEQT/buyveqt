interface StakeDefaultProps {
  currentPrice: number;
  annualDistPerUnit: number;
}

const DEFAULT_STAKE_DOLLARS = 100_000;

/**
 * Default-scenario card for The Stake section. Shows what a $100k
 * VEQT position pays at the trailing rate, without needing the
 * reader to interact with the estimator. Most readers won't type;
 * this gives them the headline number on first read.
 */
export default function StakeDefault({
  currentPrice,
  annualDistPerUnit,
}: StakeDefaultProps) {
  const units = currentPrice > 0 ? DEFAULT_STAKE_DOLLARS / currentPrice : 0;
  const annualIncome = units * annualDistPerUnit;
  const monthlyIncome = annualIncome / 12;
  const fmt = (n: number) =>
    n.toLocaleString("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

  return (
    <div
      className="border-t-2 border-b-2 border-[var(--ink)] py-6 px-5 sm:px-7"
    >
      <p className="bs-stamp mb-3">A worked example</p>
      <p
        className="bs-display text-[1.5rem] sm:text-[1.875rem] leading-[1.15] mb-4"
        style={{ color: "var(--ink)" }}
      >
        On a {fmt(DEFAULT_STAKE_DOLLARS)} VEQT position…
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8">
        <div>
          <p
            className="bs-label mb-1.5"
            style={{ color: "var(--ink-soft)" }}
          >
            Approx. units
          </p>
          <p
            className="bs-numerals tabular-nums text-[1.5rem] sm:text-[1.75rem] leading-none"
            style={{ color: "var(--ink)" }}
          >
            {units.toFixed(0)}
          </p>
        </div>
        <div>
          <p
            className="bs-label mb-1.5"
            style={{ color: "var(--ink-soft)" }}
          >
            Yearly income
          </p>
          <p
            className="bs-numerals tabular-nums text-[1.5rem] sm:text-[1.75rem] leading-none"
            style={{ color: "var(--stamp)" }}
          >
            {fmt(annualIncome)}
          </p>
        </div>
        <div>
          <p
            className="bs-label mb-1.5"
            style={{ color: "var(--ink-soft)" }}
          >
            Monthly average
          </p>
          <p
            className="bs-numerals tabular-nums text-[1.5rem] sm:text-[1.75rem] leading-none"
            style={{ color: "var(--ink)" }}
          >
            {fmt(monthlyIncome)}
          </p>
        </div>
      </div>
      <p
        className="bs-caption italic mt-4 text-[11.5px]"
        style={{ color: "var(--ink-soft)" }}
      >
        Reminder: VEQT pays the full year at once, in late December —
        not in twelve monthly checks. The monthly figure is the
        annual divided by twelve, for comparison only.
      </p>
    </div>
  );
}
