"use client";

import { useState, useMemo } from "react";
import { formatDollars } from "@/lib/chart-utils";
import InkYearChart from "./InkYearChart";

const STRATEGIES = [
  { key: "veqt", label: "VEQT (Global Index)", rate: 0.085, color: "var(--color-positive)" },
  { key: "dividend", label: "Dividend ETF", rate: 0.068, color: "var(--color-chart-orange)" },
  { key: "covered", label: "Covered Call ETF", rate: 0.052, color: "var(--color-negative)" },
] as const;

const YEAR_OPTIONS = [5, 10, 15, 20, 25, 30];
const INITIAL_OPTIONS = [5_000, 10_000, 25_000, 50_000, 100_000];

interface ChartPoint {
  year: number;
  veqt: number;
  dividend: number;
  covered: number;
}

export function CoveredCallGrowthChart() {
  const [years, setYears] = useState(10);
  const [initial, setInitial] = useState(10_000);

  const { chartData, finals } = useMemo(() => {
    const points: ChartPoint[] = [{ year: 0, veqt: initial, dividend: initial, covered: initial }];
    for (let y = 1; y <= years; y++) {
      points.push({
        year: y,
        veqt: Math.round(initial * Math.pow(1 + STRATEGIES[0].rate, y)),
        dividend: Math.round(initial * Math.pow(1 + STRATEGIES[1].rate, y)),
        covered: Math.round(initial * Math.pow(1 + STRATEGIES[2].rate, y)),
      });
    }
    const last = points[points.length - 1];
    return { chartData: points, finals: last };
  }, [years, initial]);

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        Growth of $10K: Three Strategies Compared
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        How $10,000 grows under each strategy assuming constant annualized returns.
      </p>

      {/* Controls */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Time Horizon
          </label>
          <select
            value={years}
            onChange={(e) => setYears(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-2 px-3 font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            style={{ fontSize: "max(16px, 0.875rem)" }}
          >
            {YEAR_OPTIONS.map((y) => (
              <option key={y} value={y}>
                {y} years
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider mb-1.5">
            Initial Investment
          </label>
          <select
            value={initial}
            onChange={(e) => setInitial(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-card)] py-2 px-3 font-medium text-[var(--color-text-primary)] focus:border-[var(--color-brand)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand)]"
            style={{ fontSize: "max(16px, 0.875rem)" }}
          >
            {INITIAL_OPTIONS.map((v) => (
              <option key={v} value={v}>
                {formatDollars(v)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result cards */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {STRATEGIES.map((s) => {
          const val = finals[s.key as keyof ChartPoint] as number;
          const gap = s.key !== "veqt" ? finals.veqt - val : 0;
          return (
            <div
              key={s.key}
              className="rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-3"
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                {s.label}
              </p>
              <p
                className="text-lg sm:text-xl font-bold tabular-nums"
                style={{ color: s.color }}
              >
                {formatDollars(val)}
              </p>
              {gap > 0 && (
                <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
                  &minus;{formatDollars(gap)} vs VEQT
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart — hand-rolled ink lines. Red is spent on the covered-call
          line, the strategy this article is warning about. */}
      <InkYearChart
        years={chartData.map((p) => p.year)}
        series={[
          {
            id: "veqt",
            label: "VEQT",
            values: chartData.map((p) => p.veqt),
            tone: "ink",
          },
          {
            id: "dividend",
            label: "Dividend",
            values: chartData.map((p) => p.dividend),
            tone: "muted",
          },
          {
            id: "covered",
            label: "Covered call",
            values: chartData.map((p) => p.covered),
            tone: "signal",
          },
        ]}
        height={220}
        ariaLabel={`Growth of ${formatDollars(initial)} over ${years} years under three strategies: global index, dividend ETF and covered call ETF.`}
      />

      <p className="mt-4 text-[11px] text-[var(--color-text-muted)]">
        Illustrative hypothetical returns only. Assumes 8.5% (global index), 6.8% (dividend ETF), and 5.2% (covered call ETF) annualized returns compounded annually. Actual returns vary and past performance does not predict future results.
      </p>
    </div>
  );
}
