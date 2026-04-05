"use client";

import { useState } from "react";

// Approximate historical probability of global equities beating a fixed rate
// over various holding periods, based on Dimson/Marsh/Staunton and Vanguard data
function equityWinProbability(years: number): number {
  if (years <= 1) return 0.6;
  if (years <= 2) return 0.65;
  if (years <= 3) return 0.7;
  if (years <= 5) return 0.76;
  if (years <= 7) return 0.82;
  if (years <= 10) return 0.88;
  if (years <= 15) return 0.94;
  if (years <= 20) return 0.97;
  return 0.99;
}

// Approximate best/worst/median real return ranges for global equities
function returnRange(years: number): {
  worst: number;
  median: number;
  best: number;
} {
  if (years <= 1) return { worst: -38, median: 8, best: 45 };
  if (years <= 3)
    return {
      worst: -12,
      median: 7.5,
      best: 28,
    };
  if (years <= 5)
    return {
      worst: -5,
      median: 7,
      best: 22,
    };
  if (years <= 10)
    return {
      worst: -1,
      median: 7,
      best: 17,
    };
  if (years <= 15) return { worst: 2, median: 7, best: 14 };
  if (years <= 20) return { worst: 3, median: 7, best: 12 };
  return { worst: 4, median: 7, best: 11 };
}

const HORIZONS = [1, 2, 3, 5, 7, 10, 15, 20];

export function TimeHorizonCalculator() {
  const [selectedYear, setSelectedYear] = useState(5);

  const prob = equityWinProbability(selectedYear);
  const range = returnRange(selectedYear);
  const probPct = Math.round(prob * 100);

  const barColor =
    probPct >= 90
      ? "var(--color-positive)"
      : probPct >= 75
        ? "var(--color-brand)"
        : probPct >= 65
          ? "var(--color-chart-orange, #f59e0b)"
          : "var(--color-negative)";

  const verdictText =
    selectedYear <= 2
      ? "GIC or HISA is the right call. Equity risk isn't worth it on this timeline."
      : selectedYear <= 5
        ? "The grey zone. A balanced ETF (VBAL, VGRO) or a GIC depending on your risk tolerance."
        : selectedYear <= 10
          ? "VEQT is favoured. History strongly supports equities over this horizon."
          : "VEQT territory. Over every 15+ year period in modern history, equities have beaten fixed income.";

  return (
    <div className="my-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6">
      <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
        How Long Until You Need This Money?
      </h3>
      <p className="text-sm text-[var(--color-text-muted)] mb-5">
        The longer your time horizon, the more likely equities beat fixed
        income. Select your timeline to see the historical odds.
      </p>

      {/* Horizon selector */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {HORIZONS.map((y) => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors ${
              selectedYear === y
                ? "bg-[var(--color-brand)] border-[var(--color-brand)] text-white"
                : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
            }`}
          >
            {y} yr{y > 1 ? "s" : ""}
          </button>
        ))}
      </div>

      {/* Result */}
      <div className="rounded-md bg-[var(--color-base)] border border-[var(--color-border)] p-4 mb-4">
        <div className="flex items-end justify-between mb-2">
          <p className="text-xs font-semibold text-[var(--color-text-muted)]">
            Historical probability equities beat GICs
          </p>
          <p className="text-2xl font-bold tabular-nums" style={{ color: barColor }}>
            {probPct}%
          </p>
        </div>

        {/* Probability bar */}
        <div className="h-3 rounded-full bg-[var(--color-border)] overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${probPct}%`,
              backgroundColor: barColor,
            }}
          />
        </div>

        {/* Return range cone */}
        <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
          Annualized return range (global equities, {selectedYear}-year
          holding periods)
        </p>
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold tabular-nums"
            style={{ color: range.worst < 0 ? "var(--color-negative)" : "var(--color-positive)" }}
          >
            {range.worst > 0 ? "+" : ""}
            {range.worst}%
          </span>
          <div className="flex-1 h-2 rounded-full bg-[var(--color-border)] relative overflow-hidden">
            {/* Range bar */}
            <div
              className="absolute h-full rounded-full"
              style={{
                left: `${((range.worst + 40) / 85) * 100}%`,
                right: `${100 - ((range.best + 40) / 85) * 100}%`,
                backgroundColor: barColor,
                opacity: 0.3,
              }}
            />
            {/* Median marker */}
            <div
              className="absolute top-0 w-0.5 h-full"
              style={{
                left: `${((range.median + 40) / 85) * 100}%`,
                backgroundColor: barColor,
              }}
            />
          </div>
          <span className="text-xs font-bold tabular-nums text-[var(--color-positive)]">
            +{range.best}%
          </span>
        </div>
        <p className="text-[10px] text-[var(--color-text-muted)] mt-1">
          Worst / median / best annualized returns across rolling historical
          periods
        </p>
      </div>

      {/* Verdict */}
      <div
        className="rounded-md border p-3"
        style={{ borderColor: barColor, backgroundColor: `color-mix(in srgb, ${barColor} 4%, transparent)` }}
      >
        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
          <strong className="text-[var(--color-text-primary)]">
            {selectedYear}-year verdict:
          </strong>{" "}
          {verdictText}
        </p>
      </div>

      <p className="mt-3 text-[11px] text-[var(--color-text-muted)]">
        Based on Dimson, Marsh &amp; Staunton global equity data and Vanguard
        research. Past performance does not guarantee future results. GIC
        comparison assumes current rates of ~4-5%.
      </p>
    </div>
  );
}
