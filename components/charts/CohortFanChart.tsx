"use client";

/**
 * CohortFanChart — Lookback's "every monthly cohort since inception" SVG.
 *
 * For every monthly cohort, build a value-over-time path representing what
 * a $10,000 investment that month is worth at each subsequent month, then
 * draw:
 * - Each cohort path as a 0.6px var(--rule) line at 35% opacity (the fan).
 * - The median cohort as a 1.2px dashed var(--ink) line.
 * - A baseline reference (lump-sum mode: flat $10K; DCA mode: contributions
 *   accumulating at $10K/mo, since later months represent more money in).
 * - The user's selected cohort as a 2.4px solid var(--stamp) line, with a
 *   6px circular end-dot.
 *
 * The user's path is normalised to a $10K-equivalent (lump-sum mode) or
 * $10K-per-month equivalent (DCA mode) so it sits inside the same fan even
 * if they entered a different amount. The actual dollar value is shown in
 * the dark slab; this chart shows the percentage-shape of the cohort.
 */
import { useMemo } from "react";
import { fmtCAD, buildLookbackDCAPaths, type MonthlyBar } from "@/lib/calc-data";

export interface CohortPathPoint {
  date: string;
  value: number;
}

interface CohortFanChartProps {
  /** User's value-over-time path (any starting amount). */
  userPath: CohortPathPoint[];
  /** Monthly history of the underlying fund (inception → today). */
  monthlyHistory: MonthlyBar[];
  /**
   * "lump" → each cohort is a one-shot $10K buy on cohort start month.
   * "dca"  → each cohort is $10K/mo recurring from cohort start month.
   * Defaults to "lump" for back-compat.
   */
  mode?: "lump" | "dca";
  /**
   * The user's amount. Used to normalise the user path into the chart's
   * $10K-equivalent space. Lump: the lump amount. DCA: the monthly amount.
   * Defaults to 10000 (no scaling applied).
   */
  userAmount?: number;
  height?: number;
}

const COHORT_BASELINE = 10000;

export default function CohortFanChart({
  userPath,
  monthlyHistory,
  mode = "lump",
  userAmount = COHORT_BASELINE,
  /* Default height bumped from 280 → 360 — the cohort fan is the
     marquee chart on the Lookback calculator and benefits from more
     vertical room to read the fan's spread between best and worst
     monthly cohorts. */
  height = 360,
}: CohortFanChartProps) {
  const W = 820;
  const H = height;
  /* Wider left padding for DCA: the y-axis grows into the hundreds of
     thousands as cohorts accumulate, and a tighter padL truncates the
     "$540,000" labels into the chart area. */
  const padL = mode === "dca" ? 70 : 56;
  const padR = 14;
  const padT = 18;
  /* Slightly more bottom padding on DCA mode so the legend below + the
     year-tick row don't crowd. */
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const cohorts = useMemo(() => {
    if (monthlyHistory.length === 0) return [] as { start: string; path: CohortPathPoint[] }[];
    if (mode === "dca") {
      return buildLookbackDCAPaths(COHORT_BASELINE, monthlyHistory);
    }
    const out: { start: string; path: CohortPathPoint[] }[] = [];
    for (let i = 0; i < monthlyHistory.length; i++) {
      const startBar = monthlyHistory[i];
      if (!startBar.close || startBar.close <= 0) continue;
      const shares = COHORT_BASELINE / startBar.close;
      const path: CohortPathPoint[] = [];
      for (let j = i; j < monthlyHistory.length; j++) {
        const m = monthlyHistory[j];
        path.push({ date: m.date, value: shares * m.close });
      }
      out.push({ start: startBar.date, path });
    }
    return out;
  }, [monthlyHistory, mode]);

  const medianPath = useMemo<CohortPathPoint[]>(() => {
    if (cohorts.length === 0) return [];
    const dateMap = new Map<string, number[]>();
    for (const c of cohorts) {
      for (const p of c.path) {
        let arr = dateMap.get(p.date);
        if (!arr) {
          arr = [];
          dateMap.set(p.date, arr);
        }
        arr.push(p.value);
      }
    }
    const out: CohortPathPoint[] = [];
    for (const [date, vals] of dateMap) {
      const sorted = [...vals].sort((a, b) => a - b);
      const med = sorted[Math.floor(sorted.length / 2)];
      out.push({ date, value: med });
    }
    out.sort((a, b) => a.date.localeCompare(b.date));
    return out;
  }, [cohorts]);

  /* For DCA mode, build the "contributions-over-time" reference line
     (the longest cohort's running total contributed). Each cohort
     contributes COHORT_BASELINE per bar, so contributions[i] equals
     COHORT_BASELINE × (i+1) for the longest cohort. */
  const contributionsPath = useMemo<CohortPathPoint[]>(() => {
    if (mode !== "dca" || cohorts.length === 0) return [];
    const longest = cohorts[0].path;
    return longest.map((p, i) => ({ date: p.date, value: COHORT_BASELINE * (i + 1) }));
  }, [cohorts, mode]);

  if (!userPath || userPath.length < 2 || monthlyHistory.length < 2 || cohorts.length === 0) {
    return (
      <div className="cfan cfan--empty">
        <p className="cfan__empty">
          Not enough history yet to draw the cohort chart. Pick an earlier start year.
        </p>
        <style jsx>{`
          .cfan--empty {
            padding: 36px 12px;
            text-align: center;
          }
          .cfan__empty {
            font-family: var(--font-serif);
            font-style: italic;
            color: var(--ink-mute);
            margin: 0;
            font-size: 14px;
          }
        `}</style>
      </div>
    );
  }

  const longest = cohorts[0].path;
  const xStart = new Date(longest[0].date).getTime();
  const xEnd = new Date(longest[longest.length - 1].date).getTime();
  const xRange = xEnd - xStart || 1;

  let yMin = Infinity;
  let yMax = -Infinity;
  for (const c of cohorts) {
    for (const p of c.path) {
      if (p.value < yMin) yMin = p.value;
      if (p.value > yMax) yMax = p.value;
    }
  }
  if (!Number.isFinite(yMin) || !Number.isFinite(yMax)) {
    yMin = 0;
    yMax = 1;
  }
  yMin = Math.min(yMin, COHORT_BASELINE);
  yMax = yMax * 1.05;
  if (yMax - yMin < 1) yMax = yMin + 1;

  const sx = (iso: string) =>
    padL + ((new Date(iso).getTime() - xStart) / xRange) * innerW;
  const sy = (v: number) => padT + ((yMax - v) / (yMax - yMin)) * innerH;

  function buildPath(points: CohortPathPoint[]): string {
    if (points.length === 0) return "";
    let d = "";
    points.forEach((pt, i) => {
      d += `${i === 0 ? "M" : "L"} ${sx(pt.date).toFixed(1)} ${sy(pt.value).toFixed(1)} `;
    });
    return d;
  }

  /* Scale the user's path into $10K-equivalent space.
     - Lump: their value at month 0 IS their lump amount → scale = 10000/amount.
     - DCA:  their monthly contribution is `userAmount` → at any month their
       value is proportional to their monthly amount, so the same scale works. */
  const scaleFactor = userAmount > 0 ? COHORT_BASELINE / userAmount : 1;
  const userPathScaled: CohortPathPoint[] = userPath.map((p) => ({
    date: p.date,
    value: p.value * scaleFactor,
  }));

  const yearTicks: { year: number; x: number }[] = [];
  let lastYear = -1;
  for (const p of longest) {
    const yr = new Date(p.date).getFullYear();
    if (yr !== lastYear) {
      yearTicks.push({ year: yr, x: sx(p.date) });
      lastYear = yr;
    }
  }

  /* On narrow viewports, year labels collide. SVG scales to container
     so "narrow" can't be detected from inside; instead drop every other
     label when there are 6+ years (chart loses precision at small widths
     anyway). The CSS owns the actual width — we just thin the labels. */
  const yearTicksThinned =
    yearTicks.length > 6
      ? yearTicks.filter((_, i) => i % 2 === 0 || i === yearTicks.length - 1)
      : yearTicks;

  /* Build 4 nicely-rounded y-axis labels rather than the previous 3
     (min / mid / max). For DCA mode, the y-range can span $10K → $500K+,
     so we generate "nice" round numbers within range. */
  const yLabelTargets = (() => {
    const span = yMax - yMin;
    if (span <= 0) return [yMin];
    const roughStep = span / 3;
    const magnitude = Math.pow(10, Math.floor(Math.log10(roughStep)));
    const niceStep = (() => {
      const normalized = roughStep / magnitude;
      if (normalized < 1.5) return 1 * magnitude;
      if (normalized < 3) return 2 * magnitude;
      if (normalized < 7) return 5 * magnitude;
      return 10 * magnitude;
    })();
    const first = Math.ceil(yMin / niceStep) * niceStep;
    const out: number[] = [];
    for (let v = first; v <= yMax; v += niceStep) out.push(v);
    if (out.length === 0) out.push(yMin, yMax);
    return out;
  })();

  const yLabels = yLabelTargets.map((v) => ({
    v,
    y: sy(v),
    label: fmtCAD(v, 0),
  }));

  const last = userPathScaled[userPathScaled.length - 1];

  return (
    <div className="cfan">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="cfan__svg"
        role="img"
        aria-label={mode === "dca" ? "DCA cohort fan chart" : "Lump-sum cohort fan chart"}
        preserveAspectRatio="xMidYMid meet"
      >
        {yLabels.map((l, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={W - padR}
              y1={l.y}
              y2={l.y}
              stroke="var(--rule-hair)"
              strokeWidth="0.6"
              strokeDasharray={i === 0 ? "0" : "2 4"}
            />
            <text
              x={padL - 8}
              y={l.y + 4}
              fontSize="10"
              fill="var(--ink-mute)"
              textAnchor="end"
              fontFamily="var(--font-sans)"
              fontWeight="600"
            >
              {l.label}
            </text>
          </g>
        ))}

        {yearTicksThinned.map((t, i) => (
          <text
            key={i}
            x={t.x}
            y={H - padB + 16}
            fontSize="10.5"
            fill="var(--ink-mute)"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontWeight="600"
            letterSpacing="0.08em"
          >
            {t.year}
          </text>
        ))}

        {cohorts.map((c, i) => (
          <path
            key={i}
            d={buildPath(c.path)}
            fill="none"
            stroke="var(--rule)"
            strokeWidth="0.6"
            opacity="0.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        <path
          d={buildPath(medianPath)}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.65"
          vectorEffect="non-scaling-stroke"
        />

        {/* Reference baseline:
            - Lump mode: flat line at $10K (the cohort baseline buy-in)
            - DCA mode:  contributions line ($10K accumulating per month) */}
        {mode === "lump" ? (
          <>
            <line
              x1={padL}
              x2={W - padR}
              y1={sy(COHORT_BASELINE)}
              y2={sy(COHORT_BASELINE)}
              stroke="var(--ink)"
              strokeWidth="0.8"
              opacity="0.4"
            />
            <g>
              <rect
                x={padL + 2}
                y={sy(COHORT_BASELINE) - 16}
                width="92"
                height="14"
                fill="var(--paper-light)"
                opacity="0.92"
                rx="2"
              />
              <text
                x={padL + 6}
                y={sy(COHORT_BASELINE) - 5}
                fontSize="9.5"
                fill="var(--ink-mute)"
                fontFamily="var(--font-sans)"
                fontWeight="700"
                letterSpacing="0.06em"
              >
                $10,000 BASELINE
              </text>
            </g>
          </>
        ) : (
          <>
            <path
              d={buildPath(contributionsPath)}
              fill="none"
              stroke="var(--ink)"
              strokeWidth="1"
              strokeDasharray="3 3"
              opacity="0.5"
              vectorEffect="non-scaling-stroke"
            />
            {contributionsPath.length > 0 && (() => {
              const tip = contributionsPath[contributionsPath.length - 1];
              const tipX = sx(tip.date);
              const tipY = sy(tip.value);
              return (
                <g>
                  <rect
                    x={tipX - 96}
                    y={tipY - 18}
                    width="92"
                    height="14"
                    fill="var(--paper-light)"
                    opacity="0.92"
                    rx="2"
                  />
                  <text
                    x={tipX - 6}
                    y={tipY - 7}
                    fontSize="9.5"
                    fill="var(--ink-mute)"
                    fontFamily="var(--font-sans)"
                    fontWeight="700"
                    letterSpacing="0.06em"
                    textAnchor="end"
                  >
                    CONTRIBUTIONS
                  </text>
                </g>
              );
            })()}
          </>
        )}

        <path
          d={buildPath(userPathScaled)}
          fill="none"
          stroke="var(--stamp)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {last && (
          <>
            <circle
              cx={sx(last.date)}
              cy={sy(last.value)}
              r="6"
              fill="var(--paper)"
              stroke="var(--stamp)"
              strokeWidth="2"
            />
            <circle
              cx={sx(last.date)}
              cy={sy(last.value)}
              r="3"
              fill="var(--stamp)"
            />
          </>
        )}
      </svg>

      <div className="cfan__legend">
        <span className="cfan__legend-item">
          <span className="cfan__legend-sw cfan__legend-sw--solid" />
          Your cohort
        </span>
        <span className="cfan__legend-item">
          <span className="cfan__legend-sw cfan__legend-sw--dashed" />
          Median of all cohorts
        </span>
        <span className="cfan__legend-item">
          <span className="cfan__legend-sw cfan__legend-sw--muted" />
          {mode === "dca"
            ? "All other DCA cohorts ($10K/mo)"
            : "All other cohorts ($10K each)"}
        </span>
      </div>

      <style jsx>{`
        .cfan {
          margin-top: 8px;
          width: 100%;
        }
        .cfan__svg {
          width: 100%;
          height: auto;
          display: block;
        }
        .cfan__legend {
          display: flex;
          gap: 22px;
          margin-top: 8px;
          font-family: var(--font-sans);
          font-size: 11.5px;
          color: var(--ink-soft);
          font-weight: 600;
          flex-wrap: wrap;
        }
        @media (max-width: 640px) {
          .cfan__legend {
            gap: 14px;
            font-size: 11px;
          }
        }
        .cfan__legend-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .cfan__legend-sw {
          display: inline-block;
          width: 16px;
          height: 3px;
          border-radius: 2px;
        }
        .cfan__legend-sw--solid {
          background: var(--stamp);
        }
        .cfan__legend-sw--dashed {
          background: linear-gradient(
            to right,
            var(--ink) 0 40%,
            transparent 40% 60%,
            var(--ink) 60% 100%
          );
        }
        .cfan__legend-sw--muted {
          background: var(--rule);
          opacity: 0.55;
        }
      `}</style>
    </div>
  );
}
