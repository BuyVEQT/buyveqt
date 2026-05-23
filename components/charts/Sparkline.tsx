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
  /**
   * Draw a faint dashed horizontal line at this price. Used by the hero to
   * mark "where the selected period started" so the chart visually communicates
   * above/below the period's starting price.
   */
  referencePrice?: number | null;
  /** Show hover scrubber (line + dot + readout). Client-only. */
  interactive?: boolean;
  /**
   * Drag-to-compare: press on the chart and drag to a second point to see the
   * return between those two dates. Requires `interactive`. Selection persists
   * until the user clicks the chart without dragging (or the data changes).
   */
  dragSelect?: boolean;
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
  referencePrice = null,
  interactive = false,
  dragSelect = false,
  className = "",
  style,
  ariaLabel,
}: SparklineProps) {
  const gradId = useId().replace(/:/g, "");
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);
  const [boxW, setBoxW] = useState(width);

  // Drag-to-compare state. `dragAnchorPx` is where the pointer went down;
  // `dragCursorPx` follows the pointer while held. On pointerup, if the user
  // moved more than DRAG_THRESHOLD_PX, the indices freeze into `selection`.
  // A bare click without enough movement clears the selection.
  const [dragAnchorPx, setDragAnchorPx] = useState<number | null>(null);
  const [dragCursorPx, setDragCursorPx] = useState<number | null>(null);
  const [selection, setSelection] = useState<{ aIdx: number; bIdx: number } | null>(null);
  const DRAG_THRESHOLD_PX = 4;

  // Clear the selection when the data window changes (e.g. range tab swap).
  // Indices in `selection` would point at the wrong dates otherwise.
  useEffect(() => {
    setSelection(null);
    setDragAnchorPx(null);
    setDragCursorPx(null);
  }, [data]);

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
  const pxToIdx = (px: number): number => {
    const ratio = Math.max(0, Math.min(1, px / renderedWidth));
    return Math.round(ratio * (data.length - 1));
  };

  // While the pointer is held with enough movement, draw the drag preview;
  // once released we fall through to the persisted `selection`. Either way
  // we compute a single `activeSelection` for rendering.
  const dragInProgress =
    dragAnchorPx !== null &&
    dragCursorPx !== null &&
    Math.abs(dragCursorPx - dragAnchorPx) >= DRAG_THRESHOLD_PX;
  const activeSelection = dragInProgress
    ? { aIdx: pxToIdx(dragAnchorPx as number), bIdx: pxToIdx(dragCursorPx as number) }
    : selection;

  const selStart = activeSelection ? Math.min(activeSelection.aIdx, activeSelection.bIdx) : -1;
  const selEnd = activeSelection ? Math.max(activeSelection.aIdx, activeSelection.bIdx) : -1;
  const selStartPoint = selStart >= 0 ? data[selStart] : null;
  const selEndPoint = selEnd >= 0 ? data[selEnd] : null;
  const selStartPx = selStart >= 0 ? xAt(selStart) : 0;
  const selEndPx = selEnd >= 0 ? xAt(selEnd) : 0;
  const selStartPy = selStartPoint ? yAt(selStartPoint.close) : 0;
  const selEndPy = selEndPoint ? yAt(selEndPoint.close) : 0;
  const selChangeAbs =
    selStartPoint && selEndPoint ? selEndPoint.close - selStartPoint.close : 0;
  const selChangePct =
    selStartPoint && selEndPoint && selStartPoint.close > 0
      ? (selChangeAbs / selStartPoint.close) * 100
      : 0;
  const selUp = selChangePct >= 0;
  const selMidPx = activeSelection ? (selStartPx + selEndPx) / 2 : 0;
  const selColor = selUp ? "var(--green)" : "var(--stamp)";

  // Hide the hover scrubber whenever a drag/selection is active.
  let hoverIdx: number | null = null;
  if (hoverX !== null && data.length >= 2 && !activeSelection) {
    hoverIdx = pxToIdx(hoverX);
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
        style={{
          display: "block",
          overflow: "visible",
          // Visual hint that the chart accepts a drag-to-compare gesture.
          cursor: dragSelect ? (dragAnchorPx !== null ? "grabbing" : "crosshair") : undefined,
          // Prevents touch drag on the chart from scrolling the page while
          // the user is sweeping out a selection. Only when dragSelect is on.
          touchAction: dragSelect ? "none" : undefined,
        }}
        role="img"
        aria-label={
          ariaLabel ??
          `Sparkline, ${data.length} points, ${closes[0].toFixed(2)} to ${last.close.toFixed(2)}`
        }
        onPointerDown={
          interactive && dragSelect
            ? (e) => {
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                setDragAnchorPx(x);
                setDragCursorPx(x);
                setSelection(null);
                setHoverX(null);
                try {
                  (e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);
                } catch {
                  /* setPointerCapture can throw on some browsers */
                }
              }
            : undefined
        }
        onPointerMove={
          interactive
            ? (e) => {
                const rect = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
                const x = e.clientX - rect.left;
                if (dragAnchorPx !== null) {
                  setDragCursorPx(x);
                } else {
                  setHoverX(x);
                }
              }
            : undefined
        }
        onPointerUp={
          interactive && dragSelect
            ? (e) => {
                if (dragAnchorPx !== null && dragCursorPx !== null) {
                  const dist = Math.abs(dragCursorPx - dragAnchorPx);
                  if (dist >= DRAG_THRESHOLD_PX) {
                    setSelection({
                      aIdx: pxToIdx(dragAnchorPx),
                      bIdx: pxToIdx(dragCursorPx),
                    });
                  } else {
                    // A bare click clears any persisted selection.
                    setSelection(null);
                  }
                }
                setDragAnchorPx(null);
                setDragCursorPx(null);
                try {
                  (e.currentTarget as SVGSVGElement).releasePointerCapture(e.pointerId);
                } catch {
                  /* may not have capture */
                }
              }
            : undefined
        }
        onPointerLeave={
          interactive
            ? () => {
                // Cancel a partial drag if the pointer leaves the chart entirely.
                if (dragAnchorPx !== null) {
                  setDragAnchorPx(null);
                  setDragCursorPx(null);
                }
                setHoverX(null);
              }
            : undefined
        }
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

        {/* Period-start reference line — drawn behind the line+area so the
            data still reads as the foreground. Clamped to the chart's value
            range; if the reference is outside the range we just skip it. */}
        {referencePrice !== null &&
          referencePrice >= min &&
          referencePrice <= max && (
            <line
              x1={0}
              x2={width}
              y1={yAt(referencePrice)}
              y2={yAt(referencePrice)}
              stroke="currentColor"
              strokeWidth={0.8}
              strokeDasharray="3 4"
              opacity={0.28}
              vectorEffect="non-scaling-stroke"
            />
          )}

        {/* Area */}
        {gradient ? (
          <path d={area} fill={`url(#spark-${gradId})`} vectorEffect="non-scaling-stroke" />
        ) : fill ? (
          <path d={area} fill={fill} />
        ) : null}

        {/* Drag-to-compare selection band — painted over the gradient area
            but under the data line so the line stays the visual lead. */}
        {activeSelection && selEndPx > selStartPx && (
          <rect
            x={selStartPx}
            y={PAD_Y}
            width={selEndPx - selStartPx}
            height={height - 2 * PAD_Y}
            fill={selColor}
            opacity={0.12}
          />
        )}

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

        {/* Selection endpoint markers — drawn last so they sit on top of
            the line and area, clearly anchoring the selected range. */}
        {activeSelection && selStartPoint && selEndPoint && (
          <>
            <line
              x1={selStartPx}
              x2={selStartPx}
              y1={PAD_Y}
              y2={height - PAD_Y}
              stroke={selColor}
              strokeWidth={1}
              opacity={0.55}
              vectorEffect="non-scaling-stroke"
            />
            <line
              x1={selEndPx}
              x2={selEndPx}
              y1={PAD_Y}
              y2={height - PAD_Y}
              stroke={selColor}
              strokeWidth={1}
              opacity={0.55}
              vectorEffect="non-scaling-stroke"
            />
            <circle
              cx={selStartPx}
              cy={selStartPy}
              r={4}
              fill="var(--paper-light)"
              stroke={selColor}
              strokeWidth={1.8}
            />
            <circle
              cx={selEndPx}
              cy={selEndPy}
              r={4}
              fill="var(--paper-light)"
              stroke={selColor}
              strokeWidth={1.8}
            />
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

      {/* Drag-to-compare readout — anchored INSIDE the chart at the top so
          it never collides with the price headline or today's pill row sitting
          above the chart. Horizontally clamped so the badge stays inside the
          chart bounds when the selection midpoint is near an edge. */}
      {activeSelection && selStartPoint && selEndPoint && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 6,
            left: `${Math.max(
              14,
              Math.min(86, (selMidPx / width) * 100)
            )}%`,
            transform: "translateX(-50%)",
            background: "var(--ink)",
            color: "var(--paper-light)",
            padding: "8px 12px",
            borderRadius: 8,
            fontFamily: "var(--font-sans)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 6px 18px rgba(15,13,10,0.22)",
            zIndex: 3,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "rgba(246, 239, 220, 0.65)",
              marginBottom: 3,
            }}
          >
            {formatShortDate(
              selStartPoint.date ?? "",
              selStartPoint.date,
              selEndPoint.date
            )}
            {"  →  "}
            {formatShortDate(
              selEndPoint.date ?? "",
              selStartPoint.date,
              selEndPoint.date
            )}
          </div>
          <div
            className="ed-numerals"
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: selUp ? "#6cca8b" : "#ef8079",
              fontVariantNumeric: "tabular-nums",
              letterSpacing: "-0.005em",
            }}
          >
            {selUp ? "+" : "−"}
            {Math.abs(selChangePct).toFixed(2)}%
            <span
              style={{
                color: "rgba(246, 239, 220, 0.55)",
                margin: "0 6px",
                fontWeight: 400,
              }}
            >
              ·
            </span>
            <span style={{ fontWeight: 600 }}>
              {selUp ? "+" : "−"}
              {formatUSD(Math.abs(selChangeAbs))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Range-endpoint formatter for the drag-compare badge. Drops the year when
 * both endpoints sit in the same calendar year so the label stays compact.
 */
function formatShortDate(
  iso: string,
  startIso?: string,
  endIso?: string
): string {
  if (!iso) return "—";
  const sameYear =
    startIso && endIso && startIso.slice(0, 4) === endIso.slice(0, 4);
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}
