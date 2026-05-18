import type { CSSProperties } from "react";

interface SparkPoint {
  close: number;
}

interface SparklineProps {
  data: readonly SparkPoint[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string | null;
  dot?: boolean;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  /** Accessible label for the chart. */
  ariaLabel?: string;
}

/**
 * Inline SVG sparkline. Auto-scales to the min/max of `close` values.
 * Pure server-component-safe (no client JS).
 */
export default function Sparkline({
  data,
  width = 200,
  height = 44,
  stroke = "var(--ink)",
  fill = null,
  dot = true,
  strokeWidth = 1.4,
  className = "",
  style,
  ariaLabel,
}: SparklineProps) {
  if (!data || data.length < 2) {
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

  const closes = data.map((d) => d.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;
  const padY = 4;
  const xAt = (i: number) => (i / (data.length - 1)) * width;
  const yAt = (c: number) => height - padY - ((c - min) / range) * (height - padY * 2);

  const path = data
    .map((d, i) => `${i === 0 ? "M" : "L"}${xAt(i).toFixed(1)},${yAt(d.close).toFixed(1)}`)
    .join(" ");
  const area = `${path} L${width.toFixed(1)},${(height - padY).toFixed(1)} L0,${(height - padY).toFixed(1)} Z`;
  const last = data[data.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      style={{ display: "block", ...style }}
      role="img"
      aria-label={
        ariaLabel ??
        `Sparkline, ${data.length} points, ${closes[0].toFixed(2)} to ${last.close.toFixed(2)}`
      }
    >
      {fill && <path d={area} fill={fill} />}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {dot && (
        <circle cx={xAt(data.length - 1)} cy={yAt(last.close)} r={2.5} fill={stroke} />
      )}
    </svg>
  );
}
