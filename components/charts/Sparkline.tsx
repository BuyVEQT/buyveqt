"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

interface SparkPoint {
  /** Required for tooltip date readout. Falls back to index if absent. */
  date?: string;
  close: number;
}

interface SparklineProps {
  data: readonly SparkPoint[];
  width?: number;
  height?: number;
  stroke?: string;
  /** Solid fill color (legacy) — if set, no gradient. */
  fill?: string | null;
  /**
   * Render a vertical gradient area under the line (top color = stroke at
   * ~16% alpha, fading to transparent at the bottom). Default off; the
   * hero turns this on for a richer area.
   */
  gradient?: boolean;
  dot?: boolean;
  strokeWidth?: number;
  /** Mark the min + max closes with small labelled dots. */
  showExtrema?: boolean;
  /**
   * Render faint vertical tick lines at each calendar-year boundary in
   * `data`. Needs `date` on each point. Adds rhythm to multi-year views.
   */
  yearTicks?: boolean;
  /** Show hover scrubber (line + dot + readout). Client-only. */
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

const PAD_Y = 6;

function formatUSD(n: number): string {
  return `$${n.toLocaleString("en-CA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(iso: string): string {
  // Cheap formatter — keep it short for tooltip real estate.
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

/**
 * Inline-SVG sparkline. Server-renderable; `interactive` opt-in adds a
 * hover scrubber for desktop chrome. Gradient fill, year ticks, and
 * min/max markers are also opt-in.
 */
export default function Sparkline({
  data,
  width = 200,
  height = 44,
  stroke = "var(--ink)",
  fill = null,
  gradient = false,
  dot = true,
  strokeWidth = 1.4,
  showExtrema = false,
  yearTicks = false,
  interactive = false,
  className = "",
  style,
  ariaLabel,
}: SparklineProps) {
  const gradId = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [boxW, setBoxW] = useState(width);

  // Observe container width so the scrubber math matches the actually-
  // rendered (responsive) SVG width, not the viewBox.
  useEffect(() => {
    if (!interactive || !wrapRef.current) return;
    const el = wrapRef.current;
    const ro = new ResizeObserver(() => {
      setBoxW(el.clientWidth || width);
    });
    ro.observe(el);
    setBoxW(el.clientWidth || width);
    return () => ro.disconnect();
  }, [interactive, width]);

  const valid = data && data.length >= 2;

  const geometry = useMemo(() => {
    if (!valid) return null;
    const closes = data.map((d) => d.close);
    const min = Math.min(...closes);
    const max = Math.max(...closes);
    const range = max - min || 1;
    const minIdx = closes.indexOf(min);
    const maxIdx = closes.indexOf(max);
    const xAt = (i: number) => (i / (data.length - 1)) * width;
    const yAt = (c: number) => height - PAD_Y - ((c - min) / range) * (height - PAD_Y * 2);
    const path = data
      .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(2)},${yAt(d.close).toFixed(2)}`)
      .join(" ");
    const area = `${path} L${width.toFixed(2)},${(height - PAD_Y).toFixed(2)} L0,${(height - PAD_Y).toFixed(2)} Z`;
    return { min, max, range, minIdx, maxIdx, xAt, yAt, path, area, closes };
  }, [data, valid, width, height]);

  // Year tick xs (one per new calendar year, excluding first).
  const yearTickXs = useMemo(() => {
    if (!yearTicks || !geometry) return [] as number[];
    const xs: number[] = [];
    let last: string | null = null;
    for (let i = 0; i < data.length; i++) {
      const y = (data[i].date ?? "").slice(0, 4);
      if (!y) continue;
      if (last !== null && y !== last) xs.push(geometry.xAt(i));
      last = y;
    }
    return xs;
  }, [yearTicks, geometry, data]);

  if (!geometry) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
        style={{ display: "block", ...style }}
        role="img"
        aria-label={ariaLabel ?? "Sparkline"}
      />
    );
  }

  const { min, max, minIdx, maxIdx, xAt, yAt, path, area, closes } = geometry;
  const last = data[data.length - 1];

  // Hover scrubber — map mouse X (in screen px) → data index.
  const renderedWidth = boxW || width;
  let hoverIdx: number | null = null;
  if (hoverX !== null && data.length >= 2) {
    const ratio = Math.max(0, Math.min(1, hoverX / renderedWidth));
    hoverIdx = Math.round(ratio * (data.length - 1));
  }
  const hoverPoint = hoverIdx !== null ? data[hoverIdx] : null;
  const hoverPx = hoverIdx !== null ? xAt(hoverIdx) : 0;
  const hoverPy = hoverPoint !== null ? yAt(hoverPoint.close) : 0;

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{ position: "relative", width: "100%", ...style }}
    >
      <svg
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ display: "block", overflow: "visible" }}
        role="img"
        aria-label={
          ariaLabel ??
          `Sparkline, ${data.length} points, ${closes[0].toFixed(2)} to ${last.close.toFixed(2)}`
        }
        onMouseMove={
          interactive
            ? (e) => {
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                setHoverX(e.clientX - rect.left);
              }
            : undefined
        }
        onMouseLeave={interactive ? () => setHoverX(null) : undefined}
      >
        <defs>
          {gradient && (
            <linearGradient id={`spark-${gradId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.22} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          )}
        </defs>

        {/* Year tick rhythm — faint vertical lines */}
        {yearTickXs.map((x, i) => (
          <line
            key={i}
            x1={x}
            x2={x}
            y1={PAD_Y}
            y2={height - PAD_Y}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.12}
          />
        ))}

        {/* Area */}
        {gradient ? (
          <path d={area} fill={`url(#spark-${gradId})`} vectorEffect="non-scaling-stroke" />
        ) : fill ? (
          <path d={area} fill={fill} />
        ) : null}

        {/* Line */}
        <path
          d={path}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Extrema markers */}
        {showExtrema && (
          <>
            <circle cx={xAt(maxIdx)} cy={yAt(max)} r={2.5} fill={stroke} />
            <circle cx={xAt(minIdx)} cy={yAt(min)} r={2.5} fill={stroke} opacity={0.55} />
          </>
        )}

        {/* Last-point dot */}
        {dot && (
          <>
            <circle cx={xAt(data.length - 1)} cy={yAt(last.close)} r={4} fill={stroke} opacity={0.18} />
            <circle cx={xAt(data.length - 1)} cy={yAt(last.close)} r={2.5} fill={stroke} />
          </>
        )}

        {/* Hover scrubber line + dot */}
        {interactive && hoverIdx !== null && (
          <>
            <line
              x1={hoverPx}
              x2={hoverPx}
              y1={PAD_Y}
              y2={height - PAD_Y}
              stroke={stroke}
              strokeWidth={0.8}
              opacity={0.4}
              strokeDasharray="2 3"
              vectorEffect="non-scaling-stroke"
            />
            <circle cx={hoverPx} cy={hoverPy} r={3.5} fill="var(--paper-light)" stroke={stroke} strokeWidth={1.5} />
          </>
        )}
      </svg>

      {/* Extrema labels — positioned in screen px via the wrapper */}
      {showExtrema && (
        <>
          <span
            aria-hidden
            className="ed-numerals"
            style={{
              position: "absolute",
              top: 0,
              left: `${(xAt(maxIdx) / width) * 100}%`,
              transform: "translate(4px, -110%)",
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              color: "var(--ink-mute)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {formatUSD(max)}
          </span>
          <span
            aria-hidden
            className="ed-numerals"
            style={{
              position: "absolute",
              bottom: 0,
              left: `${(xAt(minIdx) / width) * 100}%`,
              transform: "translate(4px, 100%)",
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              color: "var(--ink-mute)",
              whiteSpace: "nowrap",
              pointerEvents: "none",
            }}
          >
            {formatUSD(min)}
          </span>
        </>
      )}

      {/* Hover readout */}
      {interactive && hoverPoint && (
        <div
          aria-hidden
          className="ed-numerals"
          style={{
            position: "absolute",
            top: -8,
            left: `${(hoverPx / width) * 100}%`,
            transform: "translate(-50%, -100%)",
            background: "var(--ink)",
            color: "var(--paper-light)",
            padding: "5px 9px",
            borderRadius: 6,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 4px 12px rgba(15,13,10,0.18)",
            zIndex: 2,
          }}
        >
          <span style={{ opacity: 0.65 }}>{hoverPoint.date ? formatDate(hoverPoint.date) : `#${hoverIdx}`}</span>
          {"  "}
          <span>{formatUSD(hoverPoint.close)}</span>
        </div>
      )}
    </div>
  );
}
