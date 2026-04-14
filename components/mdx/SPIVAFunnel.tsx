"use client";

const PERIODS = [
  { label: "1 Year", underperform: 55, color: "#d97706" },
  { label: "10 Years", underperform: 67, color: "var(--color-negative)" },
  { label: "15 Years", underperform: 76, color: "var(--color-negative)" },
  { label: "Global (15Y)", underperform: 92.5, color: "var(--color-negative)" },
] as const;

export function SPIVAFunnel() {
  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Active Managers Who Underperform Their Benchmark
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        The longer the time horizon, the worse active management looks. These are
        professionals with billions, analysts, and Bloomberg terminals.
      </p>

      {/* Bars */}
      <div className="space-y-3">
        {PERIODS.map((p) => (
          <div key={p.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {p.label}
              </span>
              <span
                className="text-sm font-bold tabular-nums"
                style={{ color: p.color }}
              >
                {p.underperform}%
              </span>
            </div>
            <div className="h-5 rounded-sm bg-[var(--color-base)] overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{
                  width: `${p.underperform}%`,
                  backgroundColor: p.color,
                  opacity: 0.75,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Buffett's Bet */}
      <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
          Buffett&apos;s $1M Bet (2008&ndash;2017)
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-md border border-[var(--color-positive)]/30 bg-[var(--color-positive-bg)] p-3 text-center">
            <p className="text-[11px] text-[var(--color-text-muted)] mb-1">
              S&amp;P 500 Index Fund
            </p>
            <p className="text-xl font-bold tabular-nums text-[var(--color-positive)]">
              7.1%
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              annualized
            </p>
          </div>
          <div className="rounded-md border border-[var(--color-negative)]/30 bg-[var(--color-card)] p-3 text-center">
            <p className="text-[11px] text-[var(--color-text-muted)] mb-1">
              Hedge Fund Portfolio
            </p>
            <p className="text-xl font-bold tabular-nums text-[var(--color-negative)]">
              2.2%
            </p>
            <p className="text-[10px] text-[var(--color-text-muted)]">
              annualized
            </p>
          </div>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed mt-3">
          Warren Buffett bet $1 million that a simple S&amp;P 500 index fund
          would beat a basket of hedge funds over 10 years. The index fund won
          by more than triple. It wasn&apos;t even close.
        </p>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        Source: SPIVA Canada Mid-Year 2025 Scorecard (Canadian equity funds vs
        S&amp;P/TSX Composite). Global figure from SPIVA Year-End 2024
        (S&amp;P World Index). Buffett bet data from Berkshire Hathaway 2017
        Annual Letter.
      </p>
    </div>
  );
}
