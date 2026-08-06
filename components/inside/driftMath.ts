import { MINUS } from "@/lib/instrument-format";

export type DriftKind = "over" | "under" | "on";

export interface DriftReading {
  kind: DriftKind;
  /** "+0.8 PP OVER" · "−0.4 PP UNDER" · "ON TARGET" */
  label: string;
  /** Signed drift in percentage points (live − target). 0 when unknown. */
  pp: number;
}

/** Below this |drift| the sleeve reads ON TARGET (would print as 0.0/0.1). */
const ON_TARGET_BAND = 0.15;

/**
 * One drift grammar for the whole page (ledger lines, sleeve panel):
 * drift = live weight − tick. Red is spent on OVER only — a sleeve running
 * heavy is the signal; running light or sitting on the tick stays quiet —
 * matching the 10b mock (VUN over prints red, VCN under prints ink).
 */
export function classifyDrift(
  liveWeight: number | null,
  targetWeight: number
): DriftReading {
  if (liveWeight === null) {
    return { kind: "on", label: "ON TARGET", pp: 0 };
  }
  const pp = liveWeight - targetWeight;
  if (Math.abs(pp) < ON_TARGET_BAND) {
    return { kind: "on", label: "ON TARGET", pp };
  }
  const magnitude = Math.abs(pp).toFixed(1);
  return pp > 0
    ? { kind: "over", label: `+${magnitude} PP OVER`, pp }
    : { kind: "under", label: `${MINUS}${magnitude} PP UNDER`, pp };
}

/** Dot offset from the track's centre, in percent of track width. ±1 pp of
 *  drift moves the dot ±40% of the half-track, clamped just inside the ends
 *  — the 10b mock's scale (0.2 pp → 8%). */
export function driftDotLeft(pp: number): number {
  const offset = Math.max(-45, Math.min(45, pp * 40));
  return 50 + offset;
}
