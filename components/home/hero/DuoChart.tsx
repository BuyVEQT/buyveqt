"use client";

import { useId, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";

interface DuoChartProps {
  data: readonly HistoricalDataPoint[];
  width?: number;
  height?: number;
  showExtrema?: boolean;
}

/**
 * Duotone area chart — green fill above the period's first close, stamp
 * (vermilion) fill below. A dashed ink reference line marks the start.
 * Pure SVG with `preserveAspectRatio="none"` so the path scales to the
 * container; the main line uses `vector-effect: non-scaling-stroke` so
 * it never gets squashed.
 *
 * Features:
 *   • Year ticks (auto-detected from `data[i].date`) when the slice
 *     spans multiple years
 *   • START anchor on the first point (small ring + label)
 *   • End dot (solid ink)
 *   • HIGH (green) + LOW (stamp) extrema markers when minIdx ≠ maxIdx
 *   • Hover crosshair: vertical line + filled dot in the toned colour
 *     + a 114×32 readout card with the date and price + delta vs ref
 *
 * Ported from `design_handoff_round4/.../hero-almanac.jsx`.
 */
export default function DuoChart({
  data,
  width = 920,
  height = 220,
  showExtrema = true,
}: DuoChartProps) {
  // Unique gradient/clip ids so multiple charts can share the page.
  const uid = useId().replace(/:/g, "");
  const clipUp = `duo-clip-up-${uid}`;
  const clipDown = `duo-clip-down-${uid}`;
  const gradUp = `duo-grad-up-${uid}`;
  const gradDown = `duo-grad-down-${uid}`;

  const [hover, setHover] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const closes = data.map((d) => d.close);
  const ref = closes[0];
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = Math.max(max, ref) - Math.min(min, ref);
  const pad = span * 0.1 || 0.5;
  const yMin = Math.min(min, ref) - pad;
  const yMax = Math.max(max, ref) + pad;
  const yRange = yMax - yMin || 1;

  const x = (i: number) => (i / (data.length - 1)) * width;
  const y = (v: number) => height - ((v - yMin) / yRange) * height;
  const refY = y(ref);

  // Period extrema indices.
  let minIdx = 0;
  let maxIdx = 0;
  closes.forEach((c, i) => {
    if (c < closes[minIdx]) minIdx = i;
    if (c > closes[maxIdx]) maxIdx = i;
  });

  // Main line path.
  let line = `M ${x(0)} ${y(closes[0])}`;
  for (let i = 1; i < closes.length; i++) {
    line += ` L ${x(i)} ${y(closes[i])}`;
  }
  // Closed shape — line, then down to the reference line, back to start.
  const closedPath = line + ` L ${width} ${refY} L 0 ${refY} Z`;

  const onMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * width;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.round((px / width) * (data.length - 1)))
    );
    setHover(idx);
  };

  // Year ticks — only emit when the year crosses.
  const ticks: { x: number; year: number }[] = [];
  if (data[0]?.date) {
    let prev = new Date(data[0].date).getFullYear();
    for (let i = 1; i < data.length; i++) {
      const yr = new Date(data[i].date).getFullYear();
      if (yr !== prev) {
        ticks.push({ x: x(i), year: yr });
        prev = yr;
      }
    }
  }

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block" }}
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
      role="img"
      aria-label="VEQT duotone chart"
    >
      <defs>
        <clipPath id={clipUp}>
          <rect x="0" y="0" width={width} height={refY} />
        </clipPath>
        <clipPath id={clipDown}>
          <rect x="0" y={refY} width={width} height={height - refY} />
        </clipPath>
        <linearGradient id={gradUp} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--green)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--green)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={gradDown} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--stamp)" stopOpacity="0.02" />
          <stop offset="100%" stopColor="var(--stamp)" stopOpacity="0.28" />
        </linearGradient>
      </defs>

      {/* Reference line (period start) */}
      <line
        x1={0}
        x2={width}
        y1={refY}
        y2={refY}
        stroke="var(--ink-mute)"
        strokeWidth="0.6"
        strokeDasharray="3 3"
      />

      {/* Duotone fills */}
      <path d={closedPath} fill={`url(#${gradUp})`} clipPath={`url(#${clipUp})`} />
      <path d={closedPath} fill={`url(#${gradDown})`} clipPath={`url(#${clipDown})`} />

      {/* Year ticks */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line
            x1={t.x}
            x2={t.x}
            y1={0}
            y2={height}
            stroke="var(--rule-soft)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
          <text
            x={t.x + 4}
            y={11}
            fontSize="9"
            fill="var(--ink-mute)"
            fontFamily="var(--font-sans)"
            fontWeight="600"
            letterSpacing="0.1em"
          >
            {t.year}
          </text>
        </g>
      ))}

      {/* Main line */}
      <path
        d={line}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {/* End dot */}
      <circle
        cx={x(data.length - 1)}
        cy={y(closes[closes.length - 1])}
        r="3.5"
        fill="var(--ink)"
      />

      {/* Start anchor */}
      <circle cx={x(0)} cy={refY} r="3" fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.2" />
      <text
        x={6}
        y={refY - 6}
        fontSize="9"
        fill="var(--ink-mute)"
        fontFamily="var(--font-sans)"
        fontWeight="700"
        letterSpacing="0.18em"
      >
        START ${ref.toFixed(2)}
      </text>

      {/* Period extrema */}
      {showExtrema && minIdx !== maxIdx && (
        <g>
          <circle
            cx={x(maxIdx)}
            cy={y(closes[maxIdx])}
            r="3"
            fill="var(--green)"
          />
          <text
            x={x(maxIdx)}
            y={y(closes[maxIdx]) - 8}
            fontSize="10"
            fill="var(--green)"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontWeight="700"
            letterSpacing="0.04em"
          >
            HIGH ${closes[maxIdx].toFixed(2)}
          </text>
          <circle
            cx={x(minIdx)}
            cy={y(closes[minIdx])}
            r="3"
            fill="var(--stamp)"
          />
          <text
            x={x(minIdx)}
            y={y(closes[minIdx]) + 16}
            fontSize="10"
            fill="var(--stamp)"
            textAnchor="middle"
            fontFamily="var(--font-sans)"
            fontWeight="700"
            letterSpacing="0.04em"
          >
            LOW ${closes[minIdx].toFixed(2)}
          </text>
        </g>
      )}

      {/* Hover crosshair + readout */}
      {hover !== null && (
        <g pointerEvents="none">
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={0}
            y2={height}
            stroke="var(--ink)"
            strokeWidth="0.6"
            opacity="0.4"
          />
          <circle
            cx={x(hover)}
            cy={y(closes[hover])}
            r="4"
            fill={closes[hover] >= ref ? "var(--green)" : "var(--stamp)"}
            stroke="var(--paper)"
            strokeWidth="1.5"
          />
          <rect
            x={Math.min(width - 120, Math.max(0, x(hover) + 8))}
            y={4}
            width={114}
            height={32}
            rx="4"
            fill="var(--paper)"
            stroke="var(--ink)"
            strokeWidth="0.6"
          />
          <text
            x={Math.min(width - 112, Math.max(8, x(hover) + 16))}
            y={17}
            fontSize="9"
            fill="var(--ink-mute)"
            fontFamily="var(--font-sans)"
            fontWeight="700"
            letterSpacing="0.1em"
          >
            {data[hover].date}
          </text>
          <text
            x={Math.min(width - 112, Math.max(8, x(hover) + 16))}
            y={30}
            fontSize="12"
            fill="var(--ink)"
            fontFamily="var(--font-display)"
            fontWeight="500"
          >
            ${closes[hover].toFixed(2)}
            <tspan
              fill={closes[hover] >= ref ? "var(--green)" : "var(--stamp)"}
              fontFamily="var(--font-sans)"
              fontWeight="700"
              fontSize="9"
              dx="6"
              letterSpacing="0.04em"
            >
              {closes[hover] >= ref ? "+" : "−"}
              {Math.abs(((closes[hover] - ref) / ref) * 100).toFixed(1)}%
            </tspan>
          </text>
        </g>
      )}
    </svg>
  );
}
