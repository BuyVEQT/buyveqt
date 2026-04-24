import type { RegionSparkPoint } from "@/lib/useRegions";

interface Props {
  /** Oldest first. Component is a no-op if there are fewer than 2 points. */
  points: readonly RegionSparkPoint[];
  /** Color the line based on whether it ended above where it started. */
  directional?: boolean;
  /** Width and height in CSS px. Responsive-safe. */
  width?: number;
  height?: number;
  /** Aria label — defaults to a generic description. */
  ariaLabel?: string;
}

/**
 * Tiny inline SVG sparkline for region cards. No recharts, no hooks, no
 * resize observers — it lives inside a fixed box. The only thing it knows
 * how to do is plot a 1-pixel ink line with a small vermilion dot on the
 * final point.
 */
export default function RegionSparkline({
  points,
  directional = false,
  width = 86,
  height = 26,
  ariaLabel = "30-day price trend",
}: Props) {
  if (!points || points.length < 2) {
    return null;
  }

  const closes = points.map((p) => p.close);
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const range = max - min || 1;

  // Pad 2px top/bottom so the line isn't jammed against the viewBox edge.
  const PAD_Y = 2;
  const drawableHeight = height - PAD_Y * 2;

  const stepX = points.length > 1 ? width / (points.length - 1) : width;

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const normalized = (p.close - min) / range; // 0 at min, 1 at max
    const y = PAD_Y + (1 - normalized) * drawableHeight;
    return { x, y };
  });

  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(" ");

  const firstClose = closes[0];
  const lastClose = closes[closes.length - 1];
  const up = lastClose >= firstClose;
  const stroke = directional
    ? up
      ? "var(--print-green)"
      : "var(--print-red)"
    : "var(--ink)";

  const lastCoord = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      style={{ display: "block" }}
    >
      {/* Baseline — very faint, lines up with first close so the reader can
          see at a glance whether we're above or below where we started. */}
      <line
        x1={0}
        x2={width}
        y1={coords[0].y}
        y2={coords[0].y}
        stroke="var(--ink)"
        strokeWidth={0.5}
        strokeDasharray="2 3"
        opacity={0.25}
      />
      <path
        d={pathD}
        fill="none"
        stroke={stroke}
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.85}
      />
      {/* Vermilion dot on the most recent point */}
      <circle
        cx={lastCoord.x}
        cy={lastCoord.y}
        r={2.25}
        fill="var(--stamp)"
      />
    </svg>
  );
}
