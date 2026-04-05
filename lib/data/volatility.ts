import type { HistoricalData } from './types';

export interface VolatilityStats {
  /** Annualized mean return as a decimal (e.g. 0.08 = 8%) */
  meanReturn: number;
  /** Annualized standard deviation as a decimal (e.g. 0.15 = 15%) */
  stdDev: number;
}

/** Fallback when historical data is unavailable */
export const DEFAULT_VOLATILITY: VolatilityStats = {
  meanReturn: 0.08,
  stdDev: 0.15,
};

const TRADING_DAYS_PER_YEAR = 252;
const MIN_DATA_POINTS = 30;

/**
 * Compute annualized mean return and standard deviation from historical
 * daily adjusted close prices using log returns.
 *
 * Returns null if insufficient data — caller should use DEFAULT_VOLATILITY.
 */
export function computeVolatilityStats(
  history: HistoricalData | null
): VolatilityStats | null {
  if (!history || history.data.length < MIN_DATA_POINTS) return null;

  // Sort ascending by date (should already be sorted, but be safe)
  const sorted = [...history.data].sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  // Compute daily log returns
  const logReturns: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].adjustedClose || sorted[i - 1].close;
    const curr = sorted[i].adjustedClose || sorted[i].close;
    if (prev > 0 && curr > 0) {
      logReturns.push(Math.log(curr / prev));
    }
  }

  if (logReturns.length < MIN_DATA_POINTS) return null;

  // Mean daily log return
  const meanDaily =
    logReturns.reduce((sum, r) => sum + r, 0) / logReturns.length;

  // Daily standard deviation (sample)
  const variance =
    logReturns.reduce((sum, r) => sum + (r - meanDaily) ** 2, 0) /
    (logReturns.length - 1);
  const stdDaily = Math.sqrt(variance);

  // Annualize
  const meanReturn = meanDaily * TRADING_DAYS_PER_YEAR;
  const stdDev = stdDaily * Math.sqrt(TRADING_DAYS_PER_YEAR);

  return { meanReturn, stdDev };
}
