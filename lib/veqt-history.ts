import data from "./data/veqt-history.json";

export interface HistoryAnchor {
  id: string;
  date: string;
  price: number;
  label: string;
  drawdown: number | null;
  note: string;
}

export interface HistoryPoint {
  d: string;
  p: number;
}

export interface VeqtHistory {
  ticker: string;
  launchDate: string;
  asOf: string;
  launchPrice: number;
  anchors: HistoryAnchor[];
  series: HistoryPoint[];
}

export const HISTORY: VeqtHistory = data as unknown as VeqtHistory;

const launchTime = new Date(HISTORY.launchDate + "T00:00:00").getTime();
const todayTime = new Date(HISTORY.asOf + "T00:00:00").getTime();
const SPAN = todayTime - launchTime;

/**
 * Map a date string to its 0..1 fractional position along the
 * launch-to-today axis.
 */
export function dateProgress(date: string): number {
  const t = new Date(date + "T00:00:00").getTime();
  return Math.min(1, Math.max(0, (t - launchTime) / SPAN));
}

const minP = Math.min(...HISTORY.series.map((p) => p.p));
const maxP = Math.max(...HISTORY.series.map((p) => p.p));

export const PRICE_MIN = minP;
export const PRICE_MAX = maxP;

/**
 * Map a price to a 0..1 vertical position. 0 = chart bottom (low
 * price), 1 = chart top (high price).
 */
export function priceProgress(price: number): number {
  return (price - minP) / Math.max(0.01, maxP - minP);
}

/**
 * Interpolate the VEQT price at a given progress fraction (0..1)
 * along the launch-to-today axis. Uses linear interpolation
 * between the two surrounding daily points.
 */
export function priceAtProgress(progress: number): number {
  const target = launchTime + progress * SPAN;
  for (let i = 0; i < HISTORY.series.length - 1; i++) {
    const t0 = new Date(HISTORY.series[i].d + "T00:00:00").getTime();
    const t1 = new Date(HISTORY.series[i + 1].d + "T00:00:00").getTime();
    if (target >= t0 && target <= t1) {
      const f = (target - t0) / Math.max(1, t1 - t0);
      return HISTORY.series[i].p + (HISTORY.series[i + 1].p - HISTORY.series[i].p) * f;
    }
  }
  return progress < 0.5
    ? HISTORY.series[0].p
    : HISTORY.series[HISTORY.series.length - 1].p;
}

/**
 * Snap-to-nearest-anchor caption. As the user scrolls, the
 * journey strip's caption changes when scroll progress is closest
 * to a given anchor.
 */
export function nearestAnchor(progress: number): HistoryAnchor {
  const ranked = HISTORY.anchors
    .map((a) => ({ a, dist: Math.abs(progress - dateProgress(a.date)) }))
    .sort((a, b) => a.dist - b.dist);
  return ranked[0].a;
}

export const JOURNEY_CAPTIONS: Record<string, string> = {
  launch: "…that's where it begins.",
  covid: "…that $10K is now worth $6,600. Hold or sell?",
  "rate-hikes": "…you stayed. It paid back, slowly.",
  yen: "…the wobble was three days. The recovery was two weeks.",
  today:
    "…that bought you a covid crash, two corrections, and seven years of paychecks.",
};
