"use client";

/**
 * Compact color legend for the return-heatmap palette. Mirrors the
 * `shade()` curve used by both Heatmap.tsx (home) and VolatilityHeatmap.tsx
 * (/inside-veqt) so the gradient bar matches the cells visually.
 *
 *    −2%      −1%      0%      +1%      +2%
 *    [████████░░░░░░░░░░░░░░░░░░░░████████]
 *      red                              ink
 *
 * Endpoints clamp at ±2% which is where the intensity curve reaches its
 * "rare" zone — wider moves do exist but they don't get a darker shade.
 */
export default function HeatmapLegend() {
  // 9 swatches: -2.0, -1.5, -1.0, -0.5, 0, +0.5, +1.0, +1.5, +2.0
  const stops = [-2.0, -1.5, -1.0, -0.5, 0, 0.5, 1.0, 1.5, 2.0];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        marginTop: 14,
        fontFamily: "var(--font-sans)",
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        color: "var(--ink-mute)",
      }}
      aria-label="Color legend: vermilion for down days, ink for up days, paler shades for smaller moves."
    >
      <span style={{ flexShrink: 0 }}>−2%</span>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: `repeat(${stops.length}, 1fr)`,
          height: 10,
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid var(--rule-soft)",
        }}
        aria-hidden
      >
        {stops.map((pct) => (
          <div
            key={pct}
            style={{
              background: swatch(pct),
            }}
          />
        ))}
      </div>
      <span style={{ flexShrink: 0 }}>+2%</span>
    </div>
  );
}

// Matches the shade() function in VolatilityHeatmap.tsx and the color()
// function in Heatmap.tsx. Kept in sync by hand — if either changes the
// intensity curve, update here too.
function swatch(pct: number): string {
  if (Math.abs(pct) < 0.05) return "var(--paper-deep)";
  const abs = Math.abs(pct);
  let intensity: number;
  if (abs < 0.6) intensity = 0.05 + abs * 0.05;
  else if (abs < 1.2) intensity = 0.16 + (abs - 0.6) * 0.16;
  else if (abs < 2.0) intensity = 0.32 + (abs - 1.2) * 0.18;
  else intensity = 0.6 + Math.min(0.25, (abs - 2.0) * 0.15);
  const p = Math.round(intensity * 100);
  return pct >= 0
    ? `color-mix(in oklab, var(--ink) ${p}%, transparent)`
    : `color-mix(in oklab, var(--stamp) ${p}%, var(--paper))`;
}
