/**
 * calc-data.ts — Scenarios + math helpers for the /calculators V2 page.
 *
 * - SCENARIOS: the three return-rate envelopes the page projects against
 *   (4 / 7 / 10 percent), keyed pessimistic / realistic / optimistic.
 * - projectGrowth: walks a monthly compounding path from a lump-sum and/or
 *   recurring monthly contribution at a constant annual rate.
 * - yearsToTarget: inverse — given a target balance, returns years to reach
 *   it under the same compounding model.
 * - buildLookbackCohorts: derives every monthly cohort's "$X invested then,
 *   worth Y now" from a daily price series. Used by Lookback's scenario strip.
 * - cagr / fmtCAD / fmtPct: small formatting + math helpers.
 *
 * No React, no DOM — pure functions, easy to test.
 */
import type { HistoricalDataPoint } from "@/lib/data/types";

export type ScenarioKey = "pessimistic" | "realistic" | "optimistic";

export interface Scenario {
  label: string;
  /** Annual return as a decimal (0.04, 0.07, 0.10). */
  rate: number;
  /** CSS color reference, matches a `--token` in globals.css. */
  color: string;
  /** Short rationale shown in scenario toggles. */
  caption: string;
}

export const SCENARIOS: Record<ScenarioKey, Scenario> = {
  pessimistic: {
    label: "Pessimistic",
    rate: 0.04,
    color: "var(--stamp)",
    caption: "4% return · cautious",
  },
  realistic: {
    label: "Realistic",
    rate: 0.07,
    color: "var(--ink)",
    caption: "7% return · long-term average",
  },
  optimistic: {
    label: "Optimistic",
    rate: 0.10,
    color: "var(--green)",
    caption: "10% return · since-inception VEQT",
  },
};

export const SCENARIO_KEYS: ScenarioKey[] = [
  "pessimistic",
  "realistic",
  "optimistic",
];

// ─── Formatting ─────────────────────────────────────────────────

export function fmtCAD(n: number, fractionDigits = 0): string {
  if (!Number.isFinite(n)) return "—";
  return (
    "$" +
    n.toLocaleString("en-CA", {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    })
  );
}

export function fmtPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  const s = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${s}${Math.abs(n * 100).toFixed(digits)}%`;
}

// ─── Compounding ───────────────────────────────────────────────

export interface ProjectionPoint {
  month: number;
  balance: number;
  contributed: number;
}

export interface ProjectionResult {
  final: number;
  contributed: number;
  growth: number;
  path: ProjectionPoint[];
}

export interface ProjectGrowthInput {
  lumpSum?: number;
  monthly?: number;
  months: number;
  annualRate: number;
}

/**
 * Walk a monthly compounding path. balance_{m} = balance_{m-1} * (1+r/12) + monthly.
 * Returns the full path (including month 0) plus final/contributed/growth totals.
 */
export function projectGrowth({
  lumpSum = 0,
  monthly = 0,
  months,
  annualRate,
}: ProjectGrowthInput): ProjectionResult {
  const r = annualRate / 12;
  let bal = lumpSum;
  let contributed = lumpSum;
  const path: ProjectionPoint[] = [
    { month: 0, balance: bal, contributed },
  ];
  for (let m = 1; m <= months; m++) {
    bal = bal * (1 + r) + monthly;
    contributed += monthly;
    path.push({ month: m, balance: bal, contributed });
  }
  return { final: bal, contributed, growth: bal - contributed, path };
}

/**
 * Inverse of projectGrowth: given a target balance, find years to reach it.
 * Caps at 80 years so callers don't loop forever on impossible targets.
 */
export function yearsToTarget({
  lumpSum = 0,
  monthly = 0,
  target,
  annualRate,
}: {
  lumpSum?: number;
  monthly?: number;
  target: number;
  annualRate: number;
}): number {
  if (target <= lumpSum) return 0;
  const r = annualRate / 12;
  let bal = lumpSum;
  let m = 0;
  while (bal < target && m < 12 * 80) {
    bal = bal * (1 + r) + monthly;
    m++;
  }
  return m / 12;
}

// ─── CAGR ──────────────────────────────────────────────────────

export function cagr(a: number, b: number, years: number): number | null {
  if (!Number.isFinite(years) || years <= 0 || a <= 0) return null;
  return Math.pow(b / a, 1 / years) - 1;
}

// ─── Lookback support ──────────────────────────────────────────

export interface MonthlyBar {
  /** "YYYY-MM-DD" of the last trading day of the month. */
  date: string;
  close: number;
}

/**
 * Reduce a daily price series to one bar per calendar month, taking the
 * last close of each month. The daily series is assumed to be sorted.
 */
export function dailyToMonthly(
  daily: { date: string; close: number }[]
): MonthlyBar[] {
  const out: MonthlyBar[] = [];
  let curMonth = "";
  let last: MonthlyBar | null = null;
  for (const p of daily) {
    const ym = p.date.slice(0, 7);
    if (ym !== curMonth) {
      if (last) out.push(last);
      curMonth = ym;
    }
    last = { date: p.date, close: p.close };
  }
  if (last) out.push(last);
  return out;
}

export interface LookbackCohort {
  /** "YYYY-MM" of the cohort start. */
  start: string;
  startDate: string;
  startPrice: number;
  finalValue: number;
  finalReturn: number;
}

/**
 * For each monthly bar, treat that month as the start of a lump-sum
 * investment of `amount` and compute what it would be worth at the end.
 */
export function buildLookbackCohorts(
  amount: number,
  monthlyHistory: MonthlyBar[]
): LookbackCohort[] {
  if (monthlyHistory.length === 0) return [];
  const endPrice = monthlyHistory[monthlyHistory.length - 1].close;
  return monthlyHistory.map((m) => {
    const shares = amount / m.close;
    return {
      start: m.date.slice(0, 7),
      startDate: m.date,
      startPrice: m.close,
      finalValue: shares * endPrice,
      finalReturn: (endPrice - m.close) / m.close,
    };
  });
}

// ─── Adapter for the codebase's HistoricalDataPoint ─────────────

/**
 * Pull a clean `{date, close}` daily series from the project's wider
 * HistoricalDataPoint type. Uses `close` (not adjusted) because Lookback
 * paths are nominal $ amounts. Filters out any invalid bars.
 */
export function toDailySeries(
  points: readonly HistoricalDataPoint[] | null | undefined
): { date: string; close: number }[] {
  if (!points || points.length === 0) return [];
  return points
    .filter(
      (p) =>
        typeof p.date === "string" &&
        typeof p.close === "number" &&
        Number.isFinite(p.close) &&
        p.close > 0
    )
    .map((p) => ({ date: p.date, close: p.close }));
}

// ─── Month label helper ────────────────────────────────────────

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function fmtMonth(ym: string): string {
  const y = ym.slice(0, 4);
  const m = Number(ym.slice(5, 7));
  if (!y || !m || m < 1 || m > 12) return ym;
  return `${MONTHS[m - 1]} ${y}`;
}
