/**
 * "How unusual is today?" — statistical severity of today's VEQT move
 * relative to VEQT's own historical daily-return distribution.
 *
 * Built to be honest where xeqtbrief's version is homespun:
 *   - Zones are defined by σ (standard deviation), not "× the 20-day average"
 *   - Zone widths on the strip are proportional to *empirical frequency*,
 *     so a reader sees how rare "Unusual" and "Rare" days actually are
 *   - Reader is told what a typical session looks like, in plain %
 *   - Reader is told where today ranks vs. every prior session since inception
 *
 * All math runs client-side from the historical closes we already fetch.
 * No new data provider, no LLM, no hand-tuned thresholds.
 */

export type SeverityZone = "Typical" | "Notable" | "Unusual" | "Rare";

export interface SeverityReading {
  /** Today's daily % change (signed). Copied through for the marker label. */
  todayChangePercent: number;
  /** |today| in units of σ (std dev of daily returns across the window). */
  sigmaRatio: number;
  /** The zone today lands in. */
  zone: SeverityZone;
  /** Marker position along the strip, 0–100 (empirical percentile of |today|). */
  markerPosition: number;
  /**
   * Zone boundaries along the strip, 0–100. Positions are *empirical*
   * cumulative frequencies — the strip shows real rarities, not equal quarters.
   * Always four entries: [endOfTypical, endOfNotable, endOfUnusual, 100].
   */
  zoneBoundaries: [number, number, number, number];
  /**
   * Empirical share (0–1) of historical days in each zone.
   * [typical, notable, unusual, rare]. Sums to 1.
   */
  zoneFrequencies: [number, number, number, number];
  /**
   * "A typical VEQT day moves ±X%." — 1σ expressed as a daily % move.
   * (σ of daily log-ish returns × 100, same units as `changePercent`.)
   */
  typicalMovePercent: number;
  /**
   * How many historical days had |return| ≤ |today|, as share (0–1).
   * Lets us say "noisier than 32% of days since 2019."
   */
  percentileRank: number;
  /** The earliest year in the sample, for copy like "since 2019". */
  sampleFromYear: number;
}

export interface HistoricalPoint {
  date: string;
  close: number;
}

/**
 * Compute severity reading from a sorted-ascending historical series and
 * today's % change. Returns null when there aren't enough sessions to
 * build a defensible distribution.
 */
export function computeSeverity(
  historical: readonly HistoricalPoint[],
  todayChangePercent: number | null | undefined
): SeverityReading | null {
  if (
    todayChangePercent === null ||
    todayChangePercent === undefined ||
    !Number.isFinite(todayChangePercent)
  ) {
    return null;
  }

  if (!historical || historical.length < 60) {
    // Need a reasonable window for σ to mean anything.
    return null;
  }

  // Build daily % returns from closes. Ascending order assumed.
  const returns: number[] = [];
  for (let i = 1; i < historical.length; i += 1) {
    const prev = historical[i - 1].close;
    const curr = historical[i].close;
    if (prev > 0 && Number.isFinite(prev) && Number.isFinite(curr)) {
      returns.push(((curr - prev) / prev) * 100);
    }
  }

  if (returns.length < 60) return null;

  // σ of returns (population stddev — we have the full sample).
  const mean = returns.reduce((s, r) => s + r, 0) / returns.length;
  const variance =
    returns.reduce((s, r) => s + (r - mean) ** 2, 0) / returns.length;
  const sigma = Math.sqrt(variance);

  if (sigma <= 0 || !Number.isFinite(sigma)) return null;

  const todayAbs = Math.abs(todayChangePercent);
  const sigmaRatio = todayAbs / sigma;

  // Empirical distribution of |return| — used for both frequency bands
  // and the marker's percentile rank. We exclude returns of 0 neither
  // here nor in the zone buckets because they're legitimate data.
  const absReturns = returns.map((r) => Math.abs(r));

  // Bucket by σ-band.
  let nTypical = 0;
  let nNotable = 0;
  let nUnusual = 0;
  let nRare = 0;
  for (const r of absReturns) {
    const z = r / sigma;
    if (z < 1) nTypical += 1;
    else if (z < 2) nNotable += 1;
    else if (z < 3) nUnusual += 1;
    else nRare += 1;
  }
  const n = absReturns.length;
  const freqTypical = nTypical / n;
  const freqNotable = nNotable / n;
  const freqUnusual = nUnusual / n;
  const freqRare = nRare / n;

  // Cumulative boundaries (in %-of-sample units, 0–100).
  const b1 = freqTypical * 100;
  const b2 = (freqTypical + freqNotable) * 100;
  const b3 = (freqTypical + freqNotable + freqUnusual) * 100;
  const zoneBoundaries: [number, number, number, number] = [b1, b2, b3, 100];

  // Percentile rank of today among |historical returns|.
  // Use "share ≤ today" so the reader can say "noisier than X%".
  let countLe = 0;
  for (const r of absReturns) {
    if (r <= todayAbs) countLe += 1;
  }
  const percentileRank = countLe / n;

  // Marker position: empirical percentile of today × 100, clamped so
  // the dot never hides behind the strip's rounded endcaps.
  const markerPosition = Math.max(0.5, Math.min(99.5, percentileRank * 100));

  // Zone assignment from sigmaRatio (not percentile — they align by design).
  const zone: SeverityZone =
    sigmaRatio < 1
      ? "Typical"
      : sigmaRatio < 2
      ? "Notable"
      : sigmaRatio < 3
      ? "Unusual"
      : "Rare";

  const sampleFromYear = new Date(historical[0].date).getFullYear();

  return {
    todayChangePercent,
    sigmaRatio,
    zone,
    markerPosition,
    zoneBoundaries,
    zoneFrequencies: [freqTypical, freqNotable, freqUnusual, freqRare],
    typicalMovePercent: sigma,
    percentileRank,
    sampleFromYear,
  };
}

/**
 * Short editorial verdict keyed to the zone. The meter already shows the
 * math; this sentence closes the loop for the reader's behavior.
 */
export function severitySentence(reading: SeverityReading): string {
  const rankPct = Math.round(reading.percentileRank * 100);
  const noisierThan = Math.max(0, Math.min(100, rankPct));
  const year = reading.sampleFromYear;
  const todayPct = reading.todayChangePercent;
  const sign = todayPct >= 0 ? "+" : "−";
  const formattedToday = `${sign}${Math.abs(todayPct).toFixed(2)}%`;

  switch (reading.zone) {
    case "Typical":
      return `Typical day · today's ${formattedToday} is noisier than ${noisierThan}% of sessions since ${year}.`;
    case "Notable":
      return `Notable · today's ${formattedToday} is bigger than ${noisierThan}% of sessions since ${year}, but still inside the normal range.`;
    case "Unusual":
      return `Unusual · today's ${formattedToday} is bigger than ${noisierThan}% of sessions since ${year}. Rare, but not unseen.`;
    case "Rare":
      return `Rare · today's ${formattedToday} is among the largest moves since ${year}. Days like this happen; holding through them is the job.`;
  }
}
