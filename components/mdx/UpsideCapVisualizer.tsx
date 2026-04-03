"use client";

const SCENARIOS = [
  { label: "Market drops 30%", veqt: -30, covered: -30 },
  { label: "Market flat", veqt: 0, covered: 3 },
  { label: "Market up 8%", veqt: 8, covered: 5 },
  { label: "Market up 20%", veqt: 20, covered: 7 },
  { label: "Market up 40%", veqt: 40, covered: 8 },
  { label: "Recovery +55%", veqt: 55, covered: 9 },
] as const;

const MAX_ABS = 55;

function Bar({ value, color }: { value: number; color: string }) {
  const width = Math.abs(value) / MAX_ABS;
  const isNeg = value < 0;
  return (
    <div className="flex items-center gap-2 h-5">
      {isNeg ? (
        <>
          <div className="flex-1 flex justify-end">
            <div
              className="h-4 rounded-r-sm"
              style={{
                width: `${width * 100}%`,
                backgroundColor: color,
                opacity: 0.8,
              }}
            />
          </div>
          <span
            className="text-xs font-semibold tabular-nums w-11 text-right shrink-0"
            style={{ color }}
          >
            {value}%
          </span>
        </>
      ) : (
        <>
          <div className="flex-1">
            <div
              className="h-4 rounded-r-sm"
              style={{
                width: `${width * 100}%`,
                backgroundColor: color,
                opacity: 0.8,
                minWidth: value > 0 ? "4px" : "0px",
              }}
            />
          </div>
          <span
            className="text-xs font-semibold tabular-nums w-11 text-right shrink-0"
            style={{ color }}
          >
            {value > 0 ? "+" : ""}
            {value}%
          </span>
        </>
      )}
    </div>
  );
}

export function UpsideCapVisualizer() {
  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        The Asymmetric Payoff Problem
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        Covered call ETFs absorb the full downside but cap the upside.
      </p>

      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs font-medium">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: "var(--color-positive)" }}
          />
          <span className="text-[var(--color-text-secondary)]">VEQT</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block w-3 h-3 rounded-sm"
            style={{ backgroundColor: "var(--color-negative)" }}
          />
          <span className="text-[var(--color-text-secondary)]">
            Covered Call ETF
          </span>
        </span>
      </div>

      {/* Bars */}
      <div className="space-y-4">
        {SCENARIOS.map((s) => (
          <div key={s.label}>
            <p className="text-xs font-medium text-[var(--color-text-muted)] mb-1">
              {s.label}
            </p>
            <div className="space-y-1">
              <Bar value={s.veqt} color="var(--color-positive)" />
              <Bar value={s.covered} color="var(--color-negative)" />
            </div>
          </div>
        ))}
      </div>

      {/* Callout */}
      <div className="mt-5 rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4">
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-text-primary)]">
            The math that matters:
          </strong>{" "}
          In a 30% crash followed by a 55% recovery (a typical market cycle),
          VEQT recovers fully. The covered call ETF absorbs the full 30% loss
          but only captures ~9% of the recovery. Over repeated cycles, this
          asymmetry compounds into a massive performance gap.
        </p>
      </div>

      <p className="mt-4 text-[11px] text-[var(--color-text-muted)]">
        Illustrative single-period returns. Covered call returns approximate a
        typical at-the-money covered call strategy. Actual results depend on
        option strike selection, volatility, and market conditions.
      </p>
    </div>
  );
}
