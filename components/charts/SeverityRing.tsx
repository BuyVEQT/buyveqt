import type { CSSProperties } from "react";

interface SeverityRingProps {
  /** Z-score, expected in roughly [-3, +3]. Clamped for display. */
  z: number;
  /** Phrase rendered in the center (e.g. "An average Tuesday"). */
  label?: string;
  /** Diameter in px. Default 168. */
  size?: number;
  /** Stroke width. Default 14. */
  stroke?: number;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

/**
 * Radial severity dial — 270° sweep from -135° (crash) through 0° (calm)
 * to +135° (rally). Gradient stroke (stamp → amber → rule → amber → green).
 * Marker dot at the z-position. Center text shows label + numeric z.
 *
 * Animation: the marker animates from 0 to its target angle on first render
 * via the `.ed-ring-marker` utility class (defined in globals.css).
 */
export default function SeverityRing({
  z,
  label,
  size = 168,
  stroke = 14,
  className = "",
  style,
  ariaLabel,
}: SeverityRingProps) {
  const SWEEP_DEG = 270;
  const HALF_SWEEP = SWEEP_DEG / 2;
  const Z_RANGE = 3; // clamp z to ±3 for visualization

  const clampedZ = Math.max(-Z_RANGE, Math.min(Z_RANGE, z));
  // Marker angle: 0 = straight down (z=0). Negative z → left (crash), positive → right (rally).
  // SVG rotate(0) means pointing up by our convention. We use an offset of -HALF_SWEEP
  // so that z=0 lands at the top of the arc, then the arc sweeps symmetrically.
  // Actually: simpler to anchor the arc visually at the bottom. Convention used:
  //   z = -3 → angle = -HALF_SWEEP (left side)
  //   z =  0 → angle = 0 (top center)
  //   z = +3 → angle = +HALF_SWEEP (right side)
  const angleDeg = (clampedZ / Z_RANGE) * HALF_SWEEP;

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - stroke / 2 - 2;

  // Arc geometry. Start at angle -135° from top (i.e. bottom-left-ish),
  // end at +135° from top (bottom-right-ish), sweeping clockwise through the top.
  // Using SVG arcs: convert (radius, angle-from-top) → cartesian.
  const angleToPoint = (deg: number) => {
    // deg measured from "12 o'clock", positive = clockwise.
    const rad = (deg - 90) * (Math.PI / 180);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const start = angleToPoint(-HALF_SWEEP);
  const end = angleToPoint(HALF_SWEEP);
  const largeArc = SWEEP_DEG > 180 ? 1 : 0;
  const arcD = `M${start.x.toFixed(2)} ${start.y.toFixed(2)} A${r} ${r} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;

  const marker = angleToPoint(angleDeg);

  const zoneLabel = label ?? (Math.abs(clampedZ) < 0.5 ? "Calm" : clampedZ > 0 ? "Above average" : "Below average");

  return (
    <div
      className={className}
      style={{ position: "relative", width: size, height: size, ...style }}
      role="img"
      aria-label={
        ariaLabel ??
        `Severity ring: ${zoneLabel}, z-score ${clampedZ.toFixed(2)} sigma`
      }
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
        <defs>
          <linearGradient id="severity-ring-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--stamp)" />
            <stop offset="25%" stopColor="var(--amber)" />
            <stop offset="50%" stopColor="var(--rule)" />
            <stop offset="75%" stopColor="var(--amber)" />
            <stop offset="100%" stopColor="var(--green)" />
          </linearGradient>
        </defs>

        {/* Track (dim background arc) */}
        <path
          d={arcD}
          fill="none"
          stroke="var(--paper-warm)"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        {/* Active gradient stroke */}
        <path
          d={arcD}
          fill="none"
          stroke="url(#severity-ring-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          opacity={0.85}
        />

        {/* Marker — small disc with a paper halo so it clears the arc visually */}
        <g
          className="ed-ring-marker"
          style={
            {
              "--ed-ring-angle": `${angleDeg}deg`,
              "--ed-ring-origin": `${cx}px ${cy}px`,
            } as CSSProperties
          }
        >
          {/* Marker rendered at "12 o'clock" then rotated via CSS animation */}
          <circle cx={cx} cy={cy - r} r={stroke / 2 + 3} fill="var(--paper)" />
          <circle cx={cx} cy={cy - r} r={stroke / 2 - 1} fill="var(--ink)" />
        </g>
      </svg>

      {/* Center text */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          pointerEvents: "none",
          padding: "0 18%",
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontStyle: "italic",
            fontWeight: 500,
            fontSize: size * 0.115,
            lineHeight: 1.1,
            color: "var(--ink)",
            marginBottom: 4,
          }}
        >
          {zoneLabel}
        </div>
        <div
          className="ed-numerals"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: size * 0.075,
            color: "var(--ink-mute)",
            letterSpacing: "0.02em",
          }}
        >
          z = {clampedZ.toFixed(2)}σ
        </div>
      </div>
    </div>
  );
}
