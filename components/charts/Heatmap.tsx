import type { CSSProperties } from "react";

export interface HeatmapEntry {
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
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

/**
 * 90-day return grid. Diverging green/red ramp on cream paper.
 * Read-only (no hover/tooltip) — for the hero card on the new home.
 * The existing VolatilityHeatmap in components/broadsheet/ keeps the
 * interactive tooltip behavior for legacy routes.
 */
export default function Heatmap({
  data,
  cell = 14,
  gap = 2,
  cols = 6,
  todayIndex = -1,
  tone = "paper",
  className = "",
  style,
  ariaLabel,
}: HeatmapProps) {
  const rows = Math.ceil(data.length / cols);
  const W = cols * cell + (cols - 1) * gap;
  const H = rows * cell + (rows - 1) * gap;

  const color = (pct: number) => {
    if (pct >= 0.8) return "var(--green)";
    if (pct >= 0.3)
      return "color-mix(in oklab, var(--green) 65%, var(--paper))";
    if (pct >= 0.05)
      return "color-mix(in oklab, var(--green) 30%, var(--paper))";
    if (pct > -0.05)
      return tone === "paper" ? "var(--paper-deep)" : "rgba(255,255,255,0.06)";
    if (pct > -0.3)
      return "color-mix(in oklab, var(--stamp) 30%, var(--paper))";
    if (pct > -0.8)
      return "color-mix(in oklab, var(--stamp) 65%, var(--paper))";
    return "var(--stamp)";
  };

  return (
    <div
      className={className}
      role="img"
      aria-label={ariaLabel ?? `Heatmap of last ${data.length} sessions`}
      style={{
        display: "inline-grid",
        gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
        gridAutoRows: `${cell}px`,
        gap: `${gap}px`,
        width: W,
        height: H,
        ...style,
      }}
    >
      {data.map((d, i) => {
        const isToday = i === todayIndex;
        return (
          <div
            key={i}
            style={{
              width: cell,
              height: cell,
              background: color(d.pct),
              outline: isToday ? "1.5px solid var(--ink)" : "none",
              outlineOffset: "-1.5px",
              boxSizing: "border-box",
            }}
          />
        );
      })}
    </div>
  );
}
