import type { CSSProperties } from "react";

interface SeverityRingProps {
  /** Z-score (signed). Negative = down-day side (vermilion), positive = up-day side (ink). Clamped to ±3 for display. */
  z: number;
  /** Phrase rendered in the center (zone label, e.g. "Notable"). */
  label?: string;
  /** Diameter in px. Default 160. */
  size?: number;
  className?: string;
  style?: CSSProperties;
  ariaLabel?: string;
}

/**
 * Severity gauge — 180° half-arc, vermilion left (down-day side) and ink right
 * (up-day side), faintly tinted. σ tick marks at ±1, ±2. A marker disc sits
 * along the arc at the z-position. Center text shows the zone label in
 * Fraunces and a small "TODAY · σ X.XX" caption beneath.
 *
 * Mirrors `prototypes/primitives.jsx SeverityRing` from the V2 design hand-off.
 */
export default function SeverityRing({
  z,
  label,
  size = 160,
  className = "",
  style,
  ariaLabel,
}: SeverityRingProps) {
  const Z_RANGE = 3;
  const clamped = Math.max(-Z_RANGE, Math.min(Z_RANGE, z));

  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 10;
  const isDown = clamped < 0;

  // Marker angle: linear map from z ∈ [-3, 3] to angle ∈ [180°, 360°],
  // where 180° = leftmost point of the arc, 270° = top, 360°/0° = rightmost.
  const angleDeg = 180 + ((clamped + Z_RANGE) / (2 * Z_RANGE)) * 180;
  const rad = (angleDeg * Math.PI) / 180;
  const mx = cx + r * Math.cos(rad);
  const my = cy + r * Math.sin(rad);

  const zoneLabel =
    label ?? (Math.abs(clamped) < 0.5 ? "Calm" : clamped > 0 ? "Above average" : "Below average");

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      style={{ display: "block", ...style }}
      role="img"
      aria-label={
        ariaLabel ??
        `Severity ring: ${zoneLabel}, ${Math.abs(clamped).toFixed(2)} sigma ${isDown ? "down" : "up"}`
      }
    >
      {/* Vermilion left half */}
      <path
        d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx} ${cy - r}`}
        fill="none"
        stroke="var(--stamp)"
        strokeWidth="4"
        opacity="0.18"
        strokeLinecap="round"
      />
      {/* Ink right half */}
      <path
        d={`M ${cx} ${cy - r} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="4"
        opacity="0.18"
        strokeLinecap="round"
      />
      {/* Centre tick */}
      <line
        x1={cx}
        x2={cx}
        y1={cy - r - 4}
        y2={cy - r + 4}
        stroke="var(--ink)"
        strokeWidth="1.5"
      />

      {/* σ tick marks at ±1 and ±2 */}
      {[-2, -1, 1, 2].map((s) => {
        const a = 180 + ((s + Z_RANGE) / (2 * Z_RANGE)) * 180;
        const rd = (a * Math.PI) / 180;
        const x1 = cx + (r - 6) * Math.cos(rd);
        const y1 = cy + (r - 6) * Math.sin(rd);
        const x2 = cx + (r + 2) * Math.cos(rd);
        const y2 = cy + (r + 2) * Math.sin(rd);
        return (
          <line
            key={s}
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="var(--ink-faint)"
            strokeWidth="1"
          />
        );
      })}

      {/* Marker disc — colored by direction, with paper-coloured inner halo */}
      <circle cx={mx} cy={my} r="7" fill={isDown ? "var(--stamp)" : "var(--ink)"} />
      <circle cx={mx} cy={my} r="3" fill="var(--paper)" />

      {/* Centre label — zone phrase in Fraunces */}
      <text
        x={cx}
        y={cy - 4}
        textAnchor="middle"
        fontFamily="var(--font-display)"
        fontWeight="500"
        fontSize={size * 0.18}
        fill="var(--ink)"
      >
        {zoneLabel}
      </text>
      {/* Subtitle — TODAY · σ X.XX in Inter caps */}
      <text
        x={cx}
        y={cy + 16}
        textAnchor="middle"
        fontFamily="var(--font-sans)"
        fontSize="9"
        fontWeight="700"
        letterSpacing="0.22em"
        fill="var(--ink-mute)"
      >
        TODAY · σ {Math.abs(clamped).toFixed(2)}
      </text>
    </svg>
  );
}
