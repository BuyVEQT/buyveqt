import { SCENARIOS } from "@/lib/calc-data";

/**
 * Pure math behind the scoreboard. Everything here runs on the daily
 * closes already fetched from `/api/funds/chart/{ticker}?range=ALL` —
 * no new data sources.
 */

export interface PricePoint {
  date: string;
  close: number;
}

export interface PairMetrics {
  /** ISO date of the first session both funds traded. Null if no overlap. */
  commonStart: string | null;
  /** Growth of $1 over the common tape — the house side (VEQT). */
  multipleA: number | null;
  /** Growth of $1 over the common tape — the contender. */
  multipleB: number | null;
  /**
   * Cumulative return difference over the common tape, in percentage
   * points, house minus contender. Positive = VEQT ahead.
   */
  spreadPp: number | null;
  /** Mean absolute daily move over the common tape, in percent. */
  typicalDayA: number | null;
  typicalDayB: number | null;
  /** Sessions on the common tape. */
  sessions: number;
}

const EMPTY: PairMetrics = {
  commonStart: null,
  multipleA: null,
  multipleB: null,
  spreadPp: null,
  typicalDayA: null,
  typicalDayB: null,
  sessions: 0,
};

function meanAbsDailyMove(closes: number[]): number | null {
  if (closes.length < 2) return null;
  let sum = 0;
  for (let i = 1; i < closes.length; i++) {
    const prev = closes[i - 1];
    if (!prev) continue;
    sum += Math.abs(closes[i] / prev - 1);
  }
  return (sum / (closes.length - 1)) * 100;
}

/**
 * Intersect two daily series on date and derive the common-tape figures.
 * The tape starts the first session BOTH funds traded, so a fund that
 * launched later never gets credit for a window it wasn't in.
 */
export function pairMetrics(a: PricePoint[], b: PricePoint[]): PairMetrics {
  if (a.length < 2 || b.length < 2) return EMPTY;

  const bByDate = new Map(b.map((p) => [p.date, p.close]));
  const dates: string[] = [];
  const closesA: number[] = [];
  const closesB: number[] = [];
  for (const p of a) {
    const bClose = bByDate.get(p.date);
    if (bClose === undefined || !p.close || !bClose) continue;
    dates.push(p.date);
    closesA.push(p.close);
    closesB.push(bClose);
  }
  if (dates.length < 2) return EMPTY;

  const multipleA = closesA[closesA.length - 1] / closesA[0];
  const multipleB = closesB[closesB.length - 1] / closesB[0];

  return {
    commonStart: dates[0],
    multipleA,
    multipleB,
    spreadPp: (multipleA - multipleB) * 100,
    typicalDayA: meanAbsDailyMove(closesA),
    typicalDayB: meanAbsDailyMove(closesB),
    sessions: dates.length,
  };
}

/** Marker offset for the spread bar, as a % of half the track. */
export function spreadBarWidth(spreadPp: number): number {
  return Math.min(48, Math.max(1.5, Math.abs(spreadPp) * 2.5));
}

export const FEE_GAP_PRINCIPAL = 10000;
export const FEE_GAP_YEARS = 25;
/** The site's own "realistic" envelope, so the rail agrees with /calculators. */
export const FEE_GAP_RATE = SCENARIOS.realistic.rate;

/**
 * What the MER gap costs over a lifetime: the dollar difference between
 * two otherwise-identical $10,000 positions compounded for 25 years at
 * the calculators page's realistic rate, net of each fund's MER.
 */
export function feeGapDollars(
  merA: number,
  merB: number,
  principal = FEE_GAP_PRINCIPAL,
  years = FEE_GAP_YEARS,
  rate = FEE_GAP_RATE
): number {
  const grow = (mer: number) =>
    principal * Math.pow(1 + rate - mer / 100, years);
  return Math.abs(grow(merA) - grow(merB));
}
