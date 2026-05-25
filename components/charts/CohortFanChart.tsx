"use client";

/**
 * CohortFanChart — Lookback's "every monthly cohort since inception" SVG.
 *
 * For every monthly cohort, build a value-over-time path representing what
 * a $10,000 investment that month is worth at each subsequent month, then
 * draw:
 * - Each cohort path as a 0.6px var(--rule) line at 35% opacity (the fan).
 * - The median cohort as a 1.2px dashed var(--ink) line.
 * - A $10K baseline as 0.8px solid var(--ink) at 40% opacity with an
 *   inline label.
 * - The user's selected cohort as a 2.4px solid var(--stamp) line, with a
 *   6px circular end-dot.
 *
 * The user's path is normalised to a $10K-equivalent so it can be compared
 * apples-to-apples with the fan even if they entered a different amount.
 * The actual dollar value is rendered in the dark slab; the chart shows
 * the percentage-shape of their cohort.
 */
import { useMemo } from "react";
import { fmtCAD, type MonthlyBar } from "@/lib/calc-data";

export interface CohortPathPoint {
  date: string;
  value: number;
}

interface CohortFanChartProps {
  /** User's value-over-time path (any starting amount). */
  userPath: CohortPathPoint[];
  /** Monthly history of the underlying fund (inception → today). */
  monthlyHistory: MonthlyBar[];
  height?: number;
}

export default function CohortFanChart({
  userPath,
  monthlyHistory,
  height = 280,
}: CohortFanChartProps) {
  const W = 820;
  const H = height;
  const padL = 56;
  const padR = 14;
  const padT = 18;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const cohorts = useMemo(() => {
    if (monthlyHistory.length === 0) return [] as { start: string; path: CohortPathPoint[] }[];
    const out: { start: string; path: CohortPathPoint[] }[] = [];
    for (let i = 0; i < monthlyHistory.length; i++) {
      const startBar = monthlyHistory[i];
      if (!startBar.close || startBar.close <= 0) continue;
      const shares = 10000 / startBar.close;
      const path: CohortPathPoint[] = [];
      for (let j = i; j < monthlyHistory.length; j++) {
        const m = monthlyHistory[j];
        path.push({ date: m.date, value: shares * m.close });
      }
      out.push({ start: startBar.date, path });
    }
    return out;
  }, [monthlyHistory]);

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
  yMin = Math.min(yMin, 10000);
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

  const userContributed = userPath[0]?.value || 1;
  const userPathScaled: CohortPathPoint[] = userPath.map((p) => ({
    date: p.date,
    value: (p.value / userContributed) * 10000,
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

  const yLabels = [yMin, (yMin + yMax) / 2, yMax].map((v) => ({
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
        aria-label="Cohort fan chart"
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

        {yearTicks.map((t, i) => (
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

        <line
          x1={padL}
          x2={W - padR}
          y1={sy(10000)}
          y2={sy(10000)}
          stroke="var(--ink)"
          strokeWidth="0.8"
          opacity="0.4"
        />
        <text
          x={padL + 4}
          y={sy(10000) - 4}
          fontSize="9.5"
          fill="var(--ink-mute)"
          fontFamily="var(--font-sans)"
          fontWeight="700"
          letterSpacing="0.06em"
        >
          $10,000 baseline
        </text>

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
          All other cohorts
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
