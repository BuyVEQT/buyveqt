"use client";

import type { ChartPeriod, HistoricalDataPoint } from "@/lib/types";

export type HeroPeriod = "1M" | "3M" | "1Y" | "5Y" | "ALL";

export const HERO_RANGES: readonly HeroPeriod[] = [
  "1M",
  "3M",
  "1Y",
  "5Y",
  "ALL",
] as const;

export interface PeriodStats {
  startClose: number;
  endClose: number;
  high: number;
  low: number;
  returnPct: number;
  typicalDailyPct: number;
}

/**
 * Returns stats for a sliced history window.
 *
 *   returnPct        — (last − first) / first × 100
 *   typicalDailyPct  — mean of |daily Δ%| across the window
 *   high / low       — min / max close within the window
 */
export function computePeriodStats(
  history: readonly HistoricalDataPoint[]
): PeriodStats | null {
  if (history.length < 2) return null;
  const startClose = history[0].close;
  const endClose = history[history.length - 1].close;
  let high = -Infinity;
  let low = Infinity;
  let absSum = 0;
  let absCount = 0;
  for (let i = 0; i < history.length; i++) {
    const c = history[i].close;
    if (c > high) high = c;
    if (c < low) low = c;
    if (i > 0) {
      const prev = history[i - 1].close;
      if (prev > 0) {
        absSum += Math.abs((c - prev) / prev) * 100;
        absCount += 1;
      }
    }
  }
  const returnPct =
    startClose > 0 ? ((endClose - startClose) / startClose) * 100 : 0;
  const typicalDailyPct = absCount > 0 ? absSum / absCount : 0;
  return { startClose, endClose, high, low, returnPct, typicalDailyPct };
}

/**
 * Slice the trailing N trading days for a given period. "ALL" returns
 * the full series unchanged. The slice lives in this file (vs. inside
 * `useVeqtData`) because the hero now drives its own period state from
 * a single ALL fetch, so this is the *only* slicer it needs.
 */
export function sliceHistoryForPeriod(
  history: readonly HistoricalDataPoint[],
  period: HeroPeriod
): readonly HistoricalDataPoint[] {
  if (period === "ALL") return history;
  const days =
    period === "1M"
      ? 22
      : period === "3M"
      ? 66
      : period === "1Y"
      ? 252
      : 252 * 5;
  return history.slice(-days);
}

/**
 * The "period sub-headline" copy that lives just below the price.
 * `"+9.5% over the trailing year."` — % colored by sign, suffix keyed
 * to the active period.
 */
export function periodSuffix(period: HeroPeriod): string {
  switch (period) {
    case "1M":
      return "last month";
    case "3M":
      return "last quarter";
    case "1Y":
      return "trailing year";
    case "5Y":
      return "last five years";
    case "ALL":
      return "fund's full life";
  }
}

/**
 * Allow the hero to round-trip its period state with the legacy
 * `ChartPeriod` union (so the existing `useVeqtData` hook stays
 * compatible if the parent ever needs it).
 */
export function heroPeriodToChartPeriod(p: HeroPeriod): ChartPeriod {
  return p;
}

interface PeriodStatsRibbonProps {
  stats: PeriodStats;
  period: HeroPeriod;
  onPeriodChange: (p: HeroPeriod) => void;
}

/**
 * The 7-column stats ribbon below the duotone chart:
 *
 *   {Period} return  │  Range  │  Typical day  │  [1M 3M 1Y 5Y ALL]
 *
 * Separators are 1px ink-soft hairlines. Below 880px wide the ribbon
 * collapses to a 2-column grid with the range tabs spanning the full
 * row underneath.
 */
export default function PeriodStatsRibbon({
  stats,
  period,
  onPeriodChange,
}: PeriodStatsRibbonProps) {
  const ret = stats.returnPct;
  return (
    <div className="ribbon">
      <div className="ribbon__stat">
        <span className="ed-label">{period} return</span>
        <span
          className="ed-numerals ribbon__stat-val"
          style={{
            color: ret >= 0 ? "var(--green)" : "var(--stamp)",
          }}
        >
          {ret >= 0 ? "+" : "−"}
          {Math.abs(ret).toFixed(2)}%
        </span>
      </div>
      <div className="ribbon__sep" />
      <div className="ribbon__stat">
        <span className="ed-label">Range</span>
        <span className="ed-numerals ribbon__stat-val">
          ${stats.low.toFixed(2)}
          <span style={{ color: "var(--ink-mute)" }}> – </span>$
          {stats.high.toFixed(2)}
        </span>
      </div>
      <div className="ribbon__sep" />
      <div className="ribbon__stat">
        <span className="ed-label">Typical day</span>
        <span className="ed-numerals ribbon__stat-val">
          ±{stats.typicalDailyPct.toFixed(2)}%
        </span>
      </div>
      <div className="ribbon__sep" />
      <div className="ribbon__tabs" role="tablist" aria-label="Chart period">
        {HERO_RANGES.map((p) => (
          <button
            key={p}
            type="button"
            role="tab"
            aria-selected={p === period}
            onClick={() => onPeriodChange(p)}
            className={`ribbon__tab ${p === period ? "is-active" : ""}`}
          >
            {p}
          </button>
        ))}
      </div>

      <style jsx>{`
        .ribbon {
          display: grid;
          grid-template-columns: 1fr 1px 1fr 1px 1fr 1px auto;
          align-items: center;
          gap: 14px;
          padding: 16px 6px 6px;
          border-top: 1px solid var(--rule-soft);
          border-bottom: 1px solid var(--rule-soft);
        }
        .ribbon__stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .ribbon__stat-val {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 22px;
          letter-spacing: -0.01em;
          line-height: 1.05;
          color: var(--ink);
        }
        .ribbon__sep {
          width: 1px;
          height: 36px;
          background: var(--rule-soft);
        }
        .ribbon__tabs {
          display: flex;
          gap: 2px;
          justify-content: flex-end;
        }
        .ribbon__tab {
          appearance: none;
          border: 0;
          padding: 7px 12px;
          border-radius: 7px;
          background: transparent;
          color: var(--ink-soft);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .ribbon__tab.is-active {
          background: var(--ink);
          color: var(--paper-light);
        }
        .ribbon__tab:not(.is-active):hover {
          background: var(--paper-warm);
        }

        @media (max-width: 880px) {
          .ribbon {
            grid-template-columns: 1fr 1fr;
            row-gap: 18px;
          }
          .ribbon__sep {
            display: none;
          }
          .ribbon__tabs {
            grid-column: 1 / -1;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </div>
  );
}
