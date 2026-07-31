/**
 * The Almanac — presentation-layer derivation for /almanac.
 *
 * The archive is *not* a new dataset: it is the seven-state weather engine
 * (lib/severity.ts) run over the whole ALL history instead of the last five
 * sessions. Everything here is derived client-side from the closes the home
 * page already fetches — no new API route, no second yardstick.
 *
 * Agreement with the home gauge is structural, not coincidental:
 *
 *   · States come straight out of `recentSessionWeather(history, ∞)`, which
 *     is the same function the Conditions band's week strip uses. It builds
 *     one return per adjacent close pair, ranks |return| against the *full*
 *     sample, and hands the percentile to `weatherStateFor` — the one band
 *     table. The almanac never re-implements the bands, so it cannot drift.
 *
 *   · The percentile printed beside each row uses the identical convention:
 *     share of |returns| ≤ this |return|, over the same denominator
 *     n = number of classified sessions (= closes − 1). Same numerator,
 *     same denominator, same inclusive bound as `computeSeverity`'s
 *     `percentileRank` and `recentSessionWeather`'s internal `percentileOf`.
 *
 * "Notable" is defined by the state, not by a hand-copied threshold, so the
 * engine's exact bounds (surge/squall strictly > P90, rally/gale ≥ P98) hold
 * here by construction.
 */

import { recentSessionWeather, type WeatherState } from "@/lib/severity";
import { parseSessionDate } from "@/lib/instrument-format";
import type { HistoricalDataPoint } from "@/lib/types";

/** The four states the almanac archives — everything the sky split over. */
export const NOTABLE_STATES = ["rally", "gale", "surge", "squall"] as const;
export type NotableState = (typeof NOTABLE_STATES)[number];

const NOTABLE_SET: ReadonlySet<WeatherState> = new Set<WeatherState>(
  NOTABLE_STATES
);

export function isNotable(state: WeatherState): state is NotableState {
  return NOTABLE_SET.has(state);
}

/**
 * How far forward we look for a squall to be undone. 30 sessions ≈ six
 * trading weeks — long enough to be a real recovery window, short enough
 * that "recovered" still means something.
 */
export const RECOVERY_WINDOW = 30;

export interface AlmanacEntry {
  /** "YYYY-MM-DD" — also the row's DOM id, so /almanac#2025-10-08 works. */
  date: string;
  /** Signed % move vs. the previous close. */
  changePercent: number;
  state: NotableState;
  /** 0–100, share of |moves| ≤ this one. Same convention as the home gauge. */
  percentile: number;
  /** 1-based position in the classified series (session № 1 = first move). */
  sessionNo: number;
  /** Sentence-case one-liner. Never uppercased — σ must stay σ. */
  dispatch: string;
}

export interface Almanac {
  /** Notable sessions, newest first. */
  entries: AlmanacEntry[];
  /** Classified sessions in the sample — the percentile's denominator. */
  totalSessions: number;
  /** Earliest year on file, for "SINCE 2019" copy. */
  firstYear: number;
  counts: Record<NotableState, number>;
  /** entries.length / totalSessions × 100. */
  sharePercent: number;
}

/**
 * First session within `window` after index `i` whose close regains the
 * close *before* the drop — i.e. the day the tape undid the squall.
 * Returns the number of sessions it took, or null if it never did (or
 * hasn't yet: a recent squall with no room left to look is honestly null).
 */
function recoveryWithin(
  history: readonly HistoricalDataPoint[],
  i: number,
  window: number
): number | null {
  if (i <= 0 || i >= history.length) return null;
  const priorClose = history[i - 1].close;
  if (!Number.isFinite(priorClose) || priorClose <= 0) return null;
  const last = Math.min(i + window, history.length - 1);
  for (let j = i + 1; j <= last; j += 1) {
    const close = history[j].close;
    if (Number.isFinite(close) && close >= priorClose) return j - i;
  }
  return null;
}

/**
 * The one-line dispatch. Formulaic by design — the almanac is a record,
 * not commentary, and the same state always says the same thing. Copy is
 * the Instrument's, matching the Conditions band's captions and rail
 * extras so a reader who saw the day live reads the same verdict here.
 *
 * Squall is the only state whose line is data-driven: it reports whether
 * the tape actually undid the drop, because that is the fact a reader
 * scanning a down day wants.
 */
function dispatchFor(state: NotableState, recovery: number | null): string {
  switch (state) {
    case "squall":
      if (recovery === null) return "Still on the tape.";
      return `Recovered in ${recovery} session${recovery === 1 ? "" : "s"}.`;
    case "rally":
      return "A day for the almanac — the good kind.";
    case "gale":
      return "The plan was built for this.";
    case "surge":
      return "Don’t extrapolate — σ cuts both ways.";
  }
}

/**
 * Classify every session on file and keep the notable ones, newest first.
 * Returns null when the sample is too thin for the engine to classify
 * honestly (`recentSessionWeather` needs 60 sessions, same as the gauge).
 */
export function buildAlmanac(
  history: readonly HistoricalDataPoint[]
): Almanac | null {
  // count = history.length is deliberately ≥ the number of classifiable
  // sessions, so this is "every session", not a tail slice.
  const sessions = recentSessionWeather(history, history.length);
  if (sessions.length === 0) return null;

  const n = sessions.length;

  // Percentile machinery, mirroring lib/severity's convention exactly:
  // share of |returns| ≤ value, over the full sample. Binary search over
  // the ascending |returns| — sessions already carries every classified
  // move, so this is the same population the states were ranked against.
  const sortedAbs = sessions
    .map((s) => Math.abs(s.changePercent))
    .sort((a, b) => a - b);
  const percentileOf = (abs: number): number => {
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sortedAbs[mid] <= abs) lo = mid + 1;
      else hi = mid;
    }
    return (lo / n) * 100;
  };

  // Session date → index in the raw closes, for the recovery scan.
  const closeIndex = new Map<string, number>();
  history.forEach((h, i) => closeIndex.set(h.date, i));

  const counts: Record<NotableState, number> = {
    rally: 0,
    gale: 0,
    surge: 0,
    squall: 0,
  };
  const entries: AlmanacEntry[] = [];

  sessions.forEach((s, i) => {
    const state = s.state;
    if (!isNotable(state)) return;
    counts[state] += 1;

    const closeIdx = closeIndex.get(s.date);
    const recovery =
      state === "squall" && closeIdx !== undefined
        ? recoveryWithin(history, closeIdx, RECOVERY_WINDOW)
        : null;

    entries.push({
      date: s.date.slice(0, 10),
      changePercent: s.changePercent,
      state,
      percentile: percentileOf(Math.abs(s.changePercent)),
      sessionNo: i + 1,
      dispatch: dispatchFor(state, recovery),
    });
  });

  entries.reverse(); // newest first

  return {
    entries,
    totalSessions: n,
    firstYear: parseSessionDate(history[0].date).getUTCFullYear(),
    counts,
    sharePercent: n > 0 ? (entries.length / n) * 100 : 0,
  };
}

/** "96" → "96TH", "1" → "1ST" — the percentile micro-label. */
export function ordinal(value: number): string {
  const tens = value % 100;
  if (tens >= 11 && tens <= 13) return `${value}TH`;
  switch (value % 10) {
    case 1:
      return `${value}ST`;
    case 2:
      return `${value}ND`;
    case 3:
      return `${value}RD`;
    default:
      return `${value}TH`;
  }
}
