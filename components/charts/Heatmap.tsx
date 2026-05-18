"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { CSSProperties } from "react";

export interface HeatmapEntry {
  /** ISO date (YYYY-MM-DD). Needed when interactive. */
  date?: string;
  /** Signed daily return %, e.g. -1.24 */
  pct: number;
}

interface HeatmapProps {
  data: readonly HeatmapEntry[];
  /** Cell side in px. Default 14. */
  cell?: number;
  /** Gap between cells in px. Default 2. */
  gap?: number;
  /** Number of columns. Default 6 (mobile compact). */
  cols?: number;
  /** Index of "today" — receives an ink outline. -1 to disable. */
  todayIndex?: number;
  /** Tone of the empty / near-zero cell background. */
  tone?: "paper" | "dark";
  /**
   * When set, each cell renders as a `<Link>` to
   * `${linkPrefix}{date}#heatmap` (the `#heatmap` is appended for you).
   * If a cell has no `date`, it renders as a non-interactive span.
   */
  linkPrefix?: string;
  /** Show hover tooltip with date + return%. Defaults to true if interactive. */
  tooltip?: boolean;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

interface TipState {
  index: number;
  x: number;
  y: number;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

function fmtPct(pct: number): string {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(2)}%`;
}

/**
 * 90-day return grid. Diverging green/red ramp on cream paper.
 * Optional per-cell hover tooltip + per-cell click-through to a
 * date-anchored destination.
 */
export default function Heatmap({
  data,
  cell = 14,
  gap = 2,
  cols = 6,
  todayIndex = -1,
  tone = "paper",
  linkPrefix,
  tooltip,
  className = "",
  style,
  ariaLabel,
}: HeatmapProps) {
  const interactive = !!linkPrefix;
  const showTip = tooltip ?? interactive;
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<TipState | null>(null);

  const rows = Math.ceil(data.length / cols);
  const W = cols * cell + (cols - 1) * gap;
  const H = rows * cell + (rows - 1) * gap;

  const color = (pct: number) => {
    if (pct >= 0.8) return "var(--green)";
    if (pct >= 0.3) return "color-mix(in oklab, var(--green) 65%, var(--paper))";
    if (pct >= 0.05) return "color-mix(in oklab, var(--green) 30%, var(--paper))";
    if (pct > -0.05)
      return tone === "paper" ? "var(--paper-deep)" : "rgba(255,255,255,0.06)";
    if (pct > -0.3) return "color-mix(in oklab, var(--stamp) 30%, var(--paper))";
    if (pct > -0.8) return "color-mix(in oklab, var(--stamp) 65%, var(--paper))";
    return "var(--stamp)";
  };

  function handleEnter(e: React.PointerEvent<HTMLElement>, index: number) {
    if (!showTip) return;
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setTip({
      index,
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  }

  function handleLeave() {
    if (!showTip) return;
    setTip(null);
  }

  const tipEntry = tip !== null ? data[tip.index] : null;

  return (
    <div
      ref={wrapRef}
      className={className}
      role="img"
      aria-label={ariaLabel ?? `Heatmap of last ${data.length} sessions`}
      style={{
        position: "relative",
        display: "inline-block",
        ...style,
      }}
    >
      <div
        style={{
          display: "inline-grid",
          gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
          gridAutoRows: `${cell}px`,
          gap: `${gap}px`,
          width: W,
          height: H,
        }}
      >
        {data.map((d, i) => {
          const isToday = i === todayIndex;
          const cellStyle: CSSProperties = {
            width: cell,
            height: cell,
            background: color(d.pct),
            outline: isToday ? "1.5px solid var(--ink)" : "none",
            outlineOffset: "-1.5px",
            boxSizing: "border-box",
            display: "block",
            transition: "transform 0.12s ease",
          };
          const aria = d.date ? `${d.date}: ${fmtPct(d.pct)}` : fmtPct(d.pct);

          if (interactive && d.date) {
            return (
              <Link
                key={i}
                href={`${linkPrefix}${d.date}#heatmap`}
                aria-label={aria}
                style={cellStyle}
                onPointerMove={(e) => handleEnter(e, i)}
                onPointerEnter={(e) => handleEnter(e, i)}
                onPointerLeave={handleLeave}
                onFocus={(e) => {
                  const wrap = wrapRef.current;
                  if (!wrap) return;
                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                  const wrapRect = wrap.getBoundingClientRect();
                  setTip({
                    index: i,
                    x: rect.left - wrapRect.left + rect.width / 2,
                    y: rect.top - wrapRect.top + rect.height,
                  });
                }}
                onBlur={handleLeave}
              />
            );
          }
          return (
            <span
              key={i}
              aria-label={aria}
              style={cellStyle}
              onPointerMove={showTip ? (e) => handleEnter(e, i) : undefined}
              onPointerEnter={showTip ? (e) => handleEnter(e, i) : undefined}
              onPointerLeave={showTip ? handleLeave : undefined}
            />
          );
        })}
      </div>

      {showTip && tip !== null && tipEntry && (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            left: tip.x,
            top: tip.y,
            transform: "translate(-50%, 8px)",
            background: "var(--ink)",
            color: "var(--paper-light)",
            padding: "6px 10px",
            borderRadius: 6,
            fontFamily: "var(--font-sans)",
            fontSize: 11,
            fontWeight: 600,
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 6px 16px rgba(15,13,10,0.22)",
            zIndex: 10,
          }}
        >
          {tipEntry.date && (
            <span style={{ opacity: 0.65 }}>{formatDate(tipEntry.date)}{"  "}</span>
          )}
          <span
            style={{
              color:
                tipEntry.pct >= 0 ? "var(--green)" : "var(--stamp)",
            }}
          >
            {tipEntry.pct >= 0 ? "▲" : "▼"} {fmtPct(tipEntry.pct)}
          </span>
        </div>
      )}
    </div>
  );
}
