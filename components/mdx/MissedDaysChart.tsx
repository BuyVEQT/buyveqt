"use client";

const MAX_VALUE = 71750;

const SCENARIOS = [
  { label: "Fully invested", value: 71750, return: "10.4%", color: "var(--color-positive)" },
  { label: "Missed 10 best days", value: 32871, return: "6.1%", color: "#d97706" },
  { label: "Missed 20 best days", value: 19100, return: "~3.3%", color: "#d97706" },
  { label: "Missed 30 best days", value: 11600, return: "~0.7%", color: "var(--color-negative)" },
  { label: "Missed 40 best days", value: 7400, return: "~-1.5%", color: "var(--color-negative)" },
] as const;

function formatValue(v: number): string {
  return "$" + v.toLocaleString("en-CA");
}

export function MissedDaysChart() {
  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        The Devastating Cost of Missing the Best Days
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        $10,000 invested in the S&amp;P 500 over 20 years (Jan 2005 &ndash; Dec
        2024). Missing even a few of the best days destroys decades of returns.
      </p>

      {/* Bars */}
      <div className="space-y-3">
        {SCENARIOS.map((s) => (
          <div key={s.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-[var(--color-text-secondary)]">
                {s.label}
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="text-sm font-bold tabular-nums"
                  style={{ color: s.color }}
                >
                  {formatValue(s.value)}
                </span>
                <span className="text-[10px] tabular-nums text-[var(--color-text-muted)] w-12 text-right">
                  {s.return}
                </span>
              </span>
            </div>
            <div className="h-6 rounded-sm bg-[var(--color-base)] overflow-hidden">
              <div
                className="h-full rounded-sm transition-all"
                style={{
                  width: `${(s.value / MAX_VALUE) * 100}%`,
                  backgroundColor: s.color,
                  opacity: 0.75,
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            10 Best Days Out of ~5,000
          </p>
          <p className="text-xl font-bold tabular-nums text-[var(--color-negative)]">
            0.2%
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            of all trading days
          </p>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Missing Those 10 Days
          </p>
          <p className="text-xl font-bold tabular-nums text-[var(--color-negative)]">
            -54%
          </p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            of your total wealth
          </p>
        </div>
      </div>

      {/* Cruel irony callout */}
      <div className="mt-4 rounded-md border border-[var(--color-border)] bg-[var(--color-base)] p-3">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-text-primary)]">
            The cruel irony:
          </strong>{" "}
          7 of the 10 best days occurred within two weeks of the 10 worst days.
          The biggest gains happen during peak fear &mdash; exactly when market
          timers are sitting in cash.
        </p>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        Source: JP Morgan Guide to the Markets, 2025. S&amp;P 500 total return,
        Jan 3, 2005 &ndash; Dec 31, 2024.
      </p>
    </div>
  );
}
