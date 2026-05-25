/**
 * Drawdown / recovery helpers for the /compare ledger.
 *
 * "Max drawdown" is the deepest peak-to-trough drop in a price series.
 * It's the metric that answers the question that actually matters
 * during a bear market: "how much pain did I have to sit through to
 * collect this return?" Two funds with identical 5-year returns can
 * have very different drawdown profiles, and the one that bottomed
 * out 35% will feel completely different from the one that bottomed
 * out 22% — even if they end at the same place.
 *
 * "Recovery days" is the calendar-day count from the trough back to a
 * new all-time high. Or "still recovering" if the fund hasn't gotten
 * there yet. Together these two numbers tell the story of the worst
 * stretch of holding the fund.
 */

export interface RiskMetrics {
  /**
   * Worst peak-to-trough drop, expressed as a negative percentage.
   * E.g. -32.5 means the fund dropped 32.5% from its all-time high
   * to a subsequent trough.
   */
  maxDrawdownPct: number;
  /** ISO date of the peak that started the worst drawdown. */
  peakDate: string;
  /** ISO date of the trough that ended the worst drawdown. */
  troughDate: string;
  /**
   * ISO date when the price first reclaimed the previous peak,
   * or null if it hasn't recovered yet.
   */
  recoveryDate: string | null;
  /**
   * Calendar days from trough to recovery, or null if still
   * recovering. Calendar days, not trading days — the human reading
   * is "how long did I have to wait" not "how many sessions."
   */
  recoveryDays: number | null;
  /** True if the fund has not yet reclaimed its prior peak. */
  stillRecovering: boolean;
  /**
   * Current drawdown as of the latest observation, vs the most recent
   * all-time high. Useful when stillRecovering is true so the table
   * can show "−18% from peak" alongside the historical max.
   */
  currentDrawdownPct: number;
  /**
   * Annualised standard deviation of daily returns, expressed as a
   * percentage. Computed as sqrt(variance_of_daily_returns * 252) * 100.
   * Null if the series is too short.
   */
  annualVol: number | null;
}

interface PricePoint {
  date: string;
  close: number;
}

/** Calendar days between two ISO date strings (UTC, integer). */
function daysBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO + "T00:00:00Z").getTime();
  const end = new Date(endISO + "T00:00:00Z").getTime();
  return Math.round((end - start) / 86_400_000);
}

/**
 * Compute max drawdown + recovery for a daily price series.
 *
 * Series must be sorted oldest-first. Prices should be adjusted-close
 * so dividends don't manufacture phantom drops. Returns null if the
 * series is too short to meaningfully measure (< 30 sessions).
 */
export function computeRiskMetrics(series: PricePoint[]): RiskMetrics | null {
  if (!series || series.length < 30) return null;

  let peak = series[0].close;
  let peakIdx = 0;
  let worstDrawdown = 0; // most negative seen
  let worstPeakIdx = 0;
  let worstTroughIdx = 0;

  for (let i = 0; i < series.length; i++) {
    const c = series[i].close;
    if (c > peak) {
      peak = c;
      peakIdx = i;
    }
    const dd = (c - peak) / peak;
    if (dd < worstDrawdown) {
      worstDrawdown = dd;
      worstPeakIdx = peakIdx;
      worstTroughIdx = i;
    }
  }

  // Walk forward from the worst trough looking for a session that
  // reclaims the worst-drawdown peak. Recovery is the first such close.
  const peakPrice = series[worstPeakIdx].close;
  let recoveryIdx = -1;
  for (let i = worstTroughIdx + 1; i < series.length; i++) {
    if (series[i].close >= peakPrice) {
      recoveryIdx = i;
      break;
    }
  }

  const stillRecovering = recoveryIdx === -1;
  const troughDate = series[worstTroughIdx].date;
  const recoveryDate = stillRecovering ? null : series[recoveryIdx].date;
  const recoveryDays = stillRecovering
    ? null
    : daysBetween(troughDate, series[recoveryIdx].date);

  // Current drawdown vs all-time high in the series, using the latest
  // observation. Used to pair with "still recovering" cells.
  let allTimeHigh = series[0].close;
  for (const p of series) {
    if (p.close > allTimeHigh) allTimeHigh = p.close;
  }
  const lastClose = series[series.length - 1].close;
  const currentDrawdownPct = ((lastClose - allTimeHigh) / allTimeHigh) * 100;

  // Annualised volatility: std-dev of daily log returns * sqrt(252) * 100
  let annualVol: number | null = null;
  if (series.length >= 30) {
    const dailyReturns: number[] = [];
    for (let i = 1; i < series.length; i++) {
      const prev = series[i - 1].close;
      const cur = series[i].close;
      if (prev > 0 && cur > 0) {
        dailyReturns.push(Math.log(cur / prev));
      }
    }
    if (dailyReturns.length >= 20) {
      const mean = dailyReturns.reduce((s, x) => s + x, 0) / dailyReturns.length;
      const variance =
        dailyReturns.reduce((s, x) => s + (x - mean) ** 2, 0) /
        (dailyReturns.length - 1);
      annualVol = Math.sqrt(variance * 252) * 100;
    }
  }

  return {
    maxDrawdownPct: worstDrawdown * 100,
    peakDate: series[worstPeakIdx].date,
    troughDate,
    recoveryDate,
    recoveryDays,
    stillRecovering,
    currentDrawdownPct,
    annualVol,
  };
}
