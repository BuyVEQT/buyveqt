"use client";

import { useMemo } from "react";
import {
  computeStats,
  type Cohort,
} from "@/lib/calculators";

interface CohortFanProps {
  cohorts: Cohort[];
  userCohort: Cohort | null;
  /** Display amount used in the headline copy. */
  amount: number;
  durationMonths?: number;
  mode: "lumpsum" | "dca";
}

const VIEW_W = 480;
const VIEW_H = 300;
const PAD_L = 56;
const PAD_R = 12;
const PAD_T = 12;
const PAD_B = 36;

function fmtCAD(v: number): string {
  return v.toLocaleString("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  });
}

function fmtMonthHuman(ym: string): string {
  const [y, m] = ym.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, 1));
  return date.toLocaleDateString("en-CA", { year: "numeric", month: "long" });
}

function makeScales(maxMonths: number, maxValue: number, minValue: number) {
  const usableW = VIEW_W - PAD_L - PAD_R;
  const usableH = VIEW_H - PAD_T - PAD_B;
  const xs = (m: number) => PAD_L + (m / Math.max(1, maxMonths)) * usableW;
  const ys = (v: number) => {
    const t = (v - minValue) / Math.max(0.001, maxValue - minValue);
    return PAD_T + (1 - t) * usableH;
  };
  return { xs, ys };
}

function pathFor(
  pts: { m: number; v: number }[],
  xs: (m: number) => number,
  ys: (v: number) => number
): string {
  return pts
    .map(
      (pt, i) =>
        `${i === 0 ? "M" : "L"}${xs(pt.m).toFixed(1)},${ys(pt.v).toFixed(1)}`
    )
    .join(" ");
}

/**
 * Compute a per-month median path across cohorts, using only those
 * cohorts that have a value at month `m`.
 */
function medianPath(cohorts: Cohort[]): { m: number; v: number }[] {
  if (cohorts.length === 0) return [];
  const maxM = Math.max(...cohorts.map((c) => c.path.length - 1));
  const out: { m: number; v: number }[] = [];
  for (let m = 0; m <= maxM; m++) {
    const vals: number[] = [];
    for (const c of cohorts) {
      const pt = c.path.find((p) => p.m === m);
      if (pt) vals.push(pt.v);
    }
    if (vals.length === 0) continue;
    vals.sort((a, b) => a - b);
    const mid = Math.floor(vals.length / 2);
    const med =
      vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];
    out.push({ m, v: med });
  }
  return out;
}

/**
 * Fan chart of every monthly cohort + the user's highlighted line +
 * a dashed median path. Below: a three-number stat strip and a
 * percentile sentence. Replaces the calculator's single-number
 * \"hero result\" with a distribution.
 */
export default function CohortFan({
  cohorts,
  userCohort,
  amount,
  durationMonths,
  mode,
}: CohortFanProps) {
  const stats = useMemo(
    () => computeStats(cohorts, userCohort?.finalValue ?? null),
    [cohorts, userCohort]
  );
  const median = useMemo(() => medianPath(cohorts), [cohorts]);

  if (cohorts.length === 0) {
    return (
      <p
        className="bs-body italic py-6 text-center"
        style={{ color: "var(--ink-soft)" }}
      >
        Not enough history yet to plot cohorts for this duration.
      </p>
    );
  }

  const allPts = cohorts.flatMap((c) => c.path);
  const maxMonths = Math.max(...cohorts.map((c) => c.path.length - 1));
  const maxValue = Math.max(...allPts.map((p) => p.v));
  const minValue = Math.min(...allPts.map((p) => p.v), 0);
  const { xs, ys } = makeScales(maxMonths, maxValue, minValue);

  const userValue = userCohort?.finalValue ?? null;
  const totalCohorts = cohorts.length;
  const userRank = userValue !== null ? stats.countBelow : 0;
  const userPercentile =
    userValue !== null && totalCohorts > 1
      ? Math.round((userRank / (totalCohorts - 1)) * 100)
      : null;

  const headline = useMemo(() => {
    if (!userCohort) return "Pick a start date to see your cohort.";
    const value = fmtCAD(userCohort.finalValue);
    const startedHuman = fmtMonthHuman(userCohort.startMonth);
    if (mode === "lumpsum") {
      return `You started in ${startedHuman}. ${fmtCAD(amount)} is now ${value}.`;
    }
    const dur = durationMonths ?? userCohort.path.length;
    return `You started in ${startedHuman}. ${fmtCAD(amount)}/month for ${dur} months grew to ${value}.`;
  }, [mode, userCohort, amount, durationMonths]);

  // Y-axis ticks (4 evenly spaced)
  const yTicks = [
    minValue,
    minValue + (maxValue - minValue) * 0.33,
    minValue + (maxValue - minValue) * 0.66,
    maxValue,
  ];

  return (
    <div>
      {/* Headline */}
      <h3
        className="bs-display text-[1.375rem] sm:text-[1.625rem] leading-[1.15] mb-6 max-w-[40ch]"
        style={{ color: "var(--ink)" }}
      >
        {userCohort ? (
          <>
            You started in{" "}
            <em className="bs-display-italic">
              {fmtMonthHuman(userCohort.startMonth)}.
            </em>{" "}
            {fmtCAD(amount)} is now{" "}
            <span style={{ color: "var(--stamp)" }}>
              {fmtCAD(userCohort.finalValue)}
            </span>
            .
          </>
        ) : (
          headline
        )}
      </h3>

      {/* Caption — mirrors MonteCarloChart's "Distribution across N
          scenarios" so both uncertainty visuals on the page introduce
          themselves with the same shape. */}
      <p className="text-xs text-[var(--color-text-muted)] mb-2">
        Distribution across {totalCohorts} historical start dates
      </p>

      {/* Fan chart */}
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="block w-full h-[260px] sm:h-[300px] mb-5"
        role="img"
        aria-label={`Cohort fan chart: ${totalCohorts} cohorts, user cohort highlighted`}
      >
        {/* Y-axis */}
        {yTicks.map((tick, i) => (
          <g key={i}>
            <line
              x1={PAD_L}
              y1={ys(tick)}
              x2={VIEW_W - PAD_R}
              y2={ys(tick)}
              stroke="var(--rule)"
              strokeWidth={0.5}
              opacity={0.4}
            />
            <text
              x={PAD_L - 6}
              y={ys(tick) + 3}
              textAnchor="end"
              fill="var(--ink-mute)"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
              }}
            >
              {fmtCAD(tick)}
            </text>
          </g>
        ))}

        {/* All cohort lines (grey, thin) */}
        {cohorts.map((c) => (
          <path
            key={c.startMonth}
            d={pathFor(c.path, xs, ys)}
            stroke="var(--rule)"
            strokeWidth={0.5}
            fill="none"
            opacity={0.5}
          />
        ))}

        {/* Median line (dashed ink) */}
        {median.length > 0 && (
          <path
            d={pathFor(median, xs, ys)}
            stroke="var(--ink)"
            strokeWidth={1}
            fill="none"
            strokeDasharray="4 2"
          />
        )}

        {/* User cohort (vermilion, on top) */}
        {userCohort && (
          <path
            d={pathFor(userCohort.path, xs, ys)}
            stroke="var(--stamp)"
            strokeWidth={2}
            fill="none"
            strokeLinejoin="round"
          />
        )}

        {/* X-axis labels */}
        <text
          x={PAD_L}
          y={VIEW_H - PAD_B + 18}
          fill="var(--ink-mute)"
          style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
        >
          Month 0
        </text>
        <text
          x={VIEW_W - PAD_R}
          y={VIEW_H - PAD_B + 18}
          textAnchor="end"
          fill="var(--ink-mute)"
          style={{ fontFamily: "var(--font-mono)", fontSize: 9 }}
        >
          Month {maxMonths}
        </text>
      </svg>

      {/* Stat strip */}
      <div className="grid grid-cols-3 gap-4 sm:gap-8 border-t border-b border-[var(--ink)] py-4 mb-4">
        <div>
          <p className="bs-label mb-1" style={{ color: "var(--ink-mute)" }}>
            Median outcome
          </p>
          <p
            className="bs-numerals tabular-nums text-[1.125rem] sm:text-[1.375rem]"
            style={{ color: "var(--ink)" }}
          >
            {fmtCAD(stats.median)}
          </p>
        </div>
        <div>
          <p className="bs-label mb-1" style={{ color: "var(--stamp)" }}>
            Your cohort
          </p>
          <p
            className="bs-numerals tabular-nums text-[1.25rem] sm:text-[1.625rem] font-semibold"
            style={{ color: "var(--stamp)" }}
          >
            {userCohort ? fmtCAD(userCohort.finalValue) : "—"}
          </p>
        </div>
        <div>
          <p className="bs-label mb-1" style={{ color: "var(--ink-mute)" }}>
            Worst case
          </p>
          <p
            className="bs-numerals tabular-nums text-[1.125rem] sm:text-[1.375rem]"
            style={{ color: "var(--ink-mute)", fontStyle: "italic" }}
          >
            {stats.worstCase ? fmtCAD(stats.worstCase.finalValue) : "—"}
          </p>
          {stats.worstCase && (
            <p
              className="bs-caption italic mt-1 text-[0.75rem]"
              style={{ color: "var(--ink-mute)" }}
            >
              {fmtMonthHuman(stats.worstCase.startMonth)}
            </p>
          )}
        </div>
      </div>

      {/* Percentile sentence */}
      {userCohort && (
        <p
          className="bs-body italic text-[0.9375rem] sm:text-[1rem]"
          style={{ color: "var(--ink-soft)" }}
        >
          {stats.countAbove} of {stats.totalOthers} cohorts did better than
          yours; {stats.countBelow} did worse.
          {userPercentile !== null && (
            <>
              {" "}
              Your cohort is in the{" "}
              <span style={{ color: "var(--ink)", fontStyle: "normal" }}>
                {userPercentile}th percentile
              </span>{" "}
              of all start dates.
            </>
          )}
        </p>
      )}
    </div>
  );
}
