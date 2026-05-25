"use client";

/**
 * ProjectionChart — 3-line scenario chart used by DCA / TFSA / FIRE.
 * Custom SVG — no recharts dependency in the /calculators route.
 *
 * - Three scenario paths (pessimistic / realistic / optimistic). The
 *   active one is drawn at 2.4px / opacity 1; the others at 1.2px /
 *   opacity 0.35.
 * - Optional `baseline` (cumulative contributions only) drawn as a dashed
 *   muted line with an inline "contributions only" label at its end.
 * - End-dots on each line, larger for the active scenario.
 * - Year tick labels (Y0 / Y5 / Y10 / …) along the x-axis.
 * - 3 y-axis labels (min / mid / max).
 */
import { SCENARIOS, fmtCAD, type ScenarioKey } from "@/lib/calc-data";

export interface ProjectionPathPoint {
  month: number;
  balance: number;
  contributed: number;
}

export interface ProjectionPathSet {
  pessimistic: { final: number; contributed: number; path: ProjectionPathPoint[] };
  realistic: { final: number; contributed: number; path: ProjectionPathPoint[] };
  optimistic: { final: number; contributed: number; path: ProjectionPathPoint[] };
}

interface ProjectionChartProps {
  paths: ProjectionPathSet;
  activeKey: ScenarioKey;
  /** Optional contributions-only baseline. */
  baseline?: { month: number; balance: number }[];
  height?: number;
}

export default function ProjectionChart({
  paths,
  activeKey,
  baseline,
  /* Default height bumped from 240 → 320. The chart fills its wider
     parent on /calculators now, and 240px read as undersized against
     the dark result slab above it. */
  height = 320,
}: ProjectionChartProps) {
  const W = 820;
  const H = height;
  const padL = 56;
  const padR = 14;
  const padT = 18;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  let yMin = Infinity;
  let yMax = -Infinity;
  let xMax = 0;
  (Object.keys(paths) as ScenarioKey[]).forEach((key) => {
    const p = paths[key].path;
    for (const pt of p) {
      if (pt.balance < yMin) yMin = pt.balance;
      if (pt.balance > yMax) yMax = pt.balance;
      if (pt.month > xMax) xMax = pt.month;
    }
  });
  if (baseline) {
    for (const pt of baseline) {
      if (pt.balance < yMin) yMin = pt.balance;
      if (pt.balance > yMax) yMax = pt.balance;
      if (pt.month > xMax) xMax = pt.month;
    }
  }
  if (!Number.isFinite(yMin)) yMin = 0;
  if (!Number.isFinite(yMax)) yMax = 1;
  yMin = Math.min(yMin, 0);
  if (yMax - yMin < 1) yMax = yMin + 1;
  if (xMax <= 0) xMax = 1;

  const sx = (m: number) => padL + (m / xMax) * innerW;
  const sy = (v: number) => padT + ((yMax - v) / (yMax - yMin)) * innerH;

  function buildPath(points: { month: number; balance: number }[]): string {
    if (points.length === 0) return "";
    let d = "";
    points.forEach((pt, i) => {
      d += `${i === 0 ? "M" : "L"} ${sx(pt.month).toFixed(1)} ${sy(pt.balance).toFixed(1)} `;
    });
    return d;
  }

  const totalYears = Math.max(1, Math.ceil(xMax / 12));
  const yearTickEvery = totalYears > 30 ? 5 : totalYears > 15 ? 2 : 1;
  const yearTicks: { year: number; x: number }[] = [];
  for (let y = 0; y <= totalYears; y += yearTickEvery) {
    yearTicks.push({ year: y, x: sx(y * 12) });
  }

  const yLabels = [yMin, (yMin + yMax) / 2, yMax].map((v) => ({
    v,
    y: sy(v),
    label: fmtCAD(v, 0),
  }));

  const SCN = SCENARIOS;
  const ORDER: ScenarioKey[] = ["pessimistic", "realistic", "optimistic"];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="projc"
      role="img"
      aria-label="Projected balance under three return scenarios"
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
        >
          Y{t.year}
        </text>
      ))}

      {baseline && baseline.length > 0 && (
        <>
          <path
            d={buildPath(baseline)}
            fill="none"
            stroke="var(--ink-mute)"
            strokeWidth="1"
            strokeDasharray="4 4"
            opacity="0.7"
            vectorEffect="non-scaling-stroke"
          />
          <text
            x={W - padR - 6}
            y={sy(baseline[baseline.length - 1].balance) - 6}
            fontSize="10.5"
            fill="var(--ink-mute)"
            textAnchor="end"
            fontFamily="var(--font-sans)"
            fontStyle="italic"
          >
            contributions only
          </text>
        </>
      )}

      {ORDER.map((key) => {
        const isActive = key === activeKey;
        const color = SCN[key].color;
        return (
          <path
            key={key}
            d={buildPath(paths[key].path)}
            fill="none"
            stroke={color}
            strokeWidth={isActive ? 2.4 : 1.2}
            opacity={isActive ? 1 : 0.35}
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        );
      })}

      {ORDER.map((key) => {
        const p = paths[key].path;
        const last = p[p.length - 1];
        if (!last) return null;
        const color = SCN[key].color;
        const isActive = key === activeKey;
        return (
          <circle
            key={key}
            cx={sx(last.month)}
            cy={sy(last.balance)}
            r={isActive ? 5 : 3}
            fill={isActive ? color : "var(--paper)"}
            stroke={color}
            strokeWidth="1.8"
          />
        );
      })}

      <style jsx>{`
        .projc {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>
    </svg>
  );
}
