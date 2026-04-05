/**
 * Compute a simple return (%) from historical data.
 *
 * Finds the first data point on or after `sinceDate` and calculates
 * (currentPrice - startPrice) / startPrice * 100.
 *
 * Returns null when there isn't enough data to compute.
 */
export function computeReturn(
  history: { date: string; adjustedClose: number; close: number }[],
  currentPrice: number,
  sinceDate: string
): number | null {
  if (history.length === 0 || currentPrice <= 0) return null;
  const start = history.find((d) => d.date >= sinceDate);
  if (!start) return null;
  const sp = start.adjustedClose || start.close;
  return sp > 0 ? ((currentPrice - sp) / sp) * 100 : null;
}

/** YTD cutoff string for the current year, e.g. "2026-01-01" */
export function ytdCutoff(): string {
  return `${new Date().getFullYear()}-01-01`;
}

/** 1-year-ago cutoff string, e.g. "2025-04-05" */
export function oneYearAgoCutoff(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 1);
  return d.toISOString().split('T')[0];
}
