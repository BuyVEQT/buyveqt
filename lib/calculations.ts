/**
 * Shared performance calculation helpers.
 *
 * Originally duplicated between the (now removed) /today page and ChartSidebar.
 * Keep a single source of truth so sidebar and any future "performance snapshot"
 * surfaces report identical numbers.
 *
 * The adjustedClose vs close distinction: some callers (monthly history fetches)
 * carry `adjustedClose`, others (daily history) carry `close`. To avoid forcing
 * each call site to transform its data, the helpers accept both shapes.
 */

export interface PricePoint {
  date: string;
  close?: number;
  adjustedClose?: number;
}

function priceOf(p: PricePoint): number {
  return p.adjustedClose ?? p.close ?? 0;
}

/** Return % change looking back a fixed number of calendar days from the latest point. */
export function calcReturn(
  data: PricePoint[],
  calendarDaysBack: number
): number | null {
  if (data.length < 2) return null;
  const latest = data[data.length - 1];
  const latestPrice = priceOf(latest);
  if (!latest || latestPrice <= 0) return null;

  const cutoff = new Date(latest.date + "T00:00:00");
  cutoff.setDate(cutoff.getDate() - calendarDaysBack);
  const cutoffStr = cutoff.toISOString().split("T")[0];

  const earlier = data.find((d) => d.date >= cutoffStr);
  const earlierPrice = earlier ? priceOf(earlier) : 0;
  if (!earlier || earlierPrice <= 0) return null;
  return ((latestPrice - earlierPrice) / earlierPrice) * 100;
}

/** Year-to-date return relative to the first trading day of the current calendar year. */
export function calcYTDReturn(data: PricePoint[]): number | null {
  if (data.length < 2) return null;
  const yearStart = `${new Date().getFullYear()}-01-01`;
  const startPoint = data.find((d) => d.date >= yearStart);
  const latest = data[data.length - 1];
  const startPrice = startPoint ? priceOf(startPoint) : 0;
  const latestPrice = priceOf(latest);
  if (!startPoint || !latest || startPrice <= 0) return null;
  return ((latestPrice - startPrice) / startPrice) * 100;
}

/** Total return from the earliest data point to the latest. */
export function calcSinceInception(data: PricePoint[]): number | null {
  if (data.length < 2) return null;
  const first = data[0];
  const latest = data[data.length - 1];
  const firstPrice = priceOf(first);
  const latestPrice = priceOf(latest);
  if (!first || !latest || firstPrice <= 0) return null;
  return ((latestPrice - firstPrice) / firstPrice) * 100;
}

/** Format a percentage with an en-dash for null/missing, real minus sign otherwise. */
export function formatPct(val: number | null): string {
  if (val === null) return "\u2014";
  const sign = val >= 0 ? "+" : "\u2212";
  return `${sign}${Math.abs(val).toFixed(2)}%`;
}
