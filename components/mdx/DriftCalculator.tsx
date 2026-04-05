"use client";

import { useState } from "react";

const PORTFOLIOS = [
  { label: "$50K", value: 50000 },
  { label: "$100K", value: 100000 },
  { label: "$200K", value: 200000 },
  { label: "$500K", value: 500000 },
];

const CONTRIBUTIONS = [
  { label: "$250/mo", value: 250 },
  { label: "$500/mo", value: 500 },
  { label: "$1,000/mo", value: 1000 },
  { label: "$2,000/mo", value: 2000 },
];

export function DriftCalculator() {
  const [portfolioIdx, setPortfolioIdx] = useState(1);
  const [contributionIdx, setContributionIdx] = useState(1);

  const portfolio = PORTFOLIOS[portfolioIdx].value;
  const contribution = CONTRIBUTIONS[contributionIdx].value;

  // 5% drift on US allocation = that % of portfolio in dollars
  const driftAmount = portfolio * 0.05;
  const monthsToCorrect = Math.ceil(driftAmount / contribution);
  const yearsToCorrect = (monthsToCorrect / 12).toFixed(1);

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        How Long Does DIY Rebalancing Take?
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        If your US allocation drifts 5% above target, how many months of
        contributions would you need to direct entirely to other ETFs to correct
        it?
      </p>

      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
            Portfolio size
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PORTFOLIOS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setPortfolioIdx(i)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  portfolioIdx === i
                    ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
            Monthly contribution
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CONTRIBUTIONS.map((c, i) => (
              <button
                key={c.label}
                onClick={() => setContributionIdx(i)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  contributionIdx === i
                    ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                    : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result */}
      <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-4">
        <div className="grid grid-cols-3 gap-4 text-center mb-3">
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              Drift amount
            </p>
            <p className="text-lg font-bold text-[var(--color-negative)]">
              ${driftAmount.toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              Months to correct
            </p>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              {monthsToCorrect}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--color-text-muted)] mb-1">
              That&apos;s
            </p>
            <p className="text-lg font-bold text-[var(--color-text-primary)]">
              {yearsToCorrect} yrs
            </p>
          </div>
        </div>

        {/* Visual bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-[var(--color-text-muted)] mb-1">
            <span>Start of drift</span>
            <span>Back to target</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (12 / monthsToCorrect) * 100)}%`,
                backgroundColor:
                  monthsToCorrect <= 6
                    ? "var(--color-positive)"
                    : monthsToCorrect <= 12
                      ? "var(--color-chart-orange, #f59e0b)"
                      : "var(--color-negative)",
              }}
            />
          </div>
          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
            {monthsToCorrect <= 6
              ? "Manageable — contributions can keep up."
              : monthsToCorrect <= 12
                ? "Slow — your portfolio will likely drift again before you finish correcting."
                : "Impractical — contributions can't keep up with drift at this portfolio size. You'd need to sell winners to rebalance, triggering taxes in a non-registered account."}
          </p>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        VEQT handles this automatically using cash flow rebalancing across
        billions in fund assets — new investor purchases are directed
        disproportionately toward underweight positions. At scale, this is far
        more efficient than any individual investor can achieve.
      </p>
    </div>
  );
}
