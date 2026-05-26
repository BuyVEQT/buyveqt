"use client";

import { useEffect, useState } from "react";

interface WeatherBellCurveProps {
  /** Signed σ position of today's move. Clamped to [-3, 3] inside. */
  z: number;
  width?: number;
  height?: number;
}

/**
 * Bell curve showing the normal-ish distribution of every daily VEQT move,
 * with today's σ position dropping onto the curve. The "fidelity" half of
 * the hybrid weather card (the glyph being the "vibe" half).
 *
 * Tail shading beyond |σ| = 1.5 marks the empirically "unusual" territory
 * (stamp on the left tail, green on the right). On mount the today marker
 * drops from the baseline up to the curve via a 0.7s CSS transition —
 * driven by a `mounted` state toggle, not a JS animation loop, so it
 * survives StrictMode double-renders.
 *
 * Ported from `design_handoff_round4/.../hero-almanac.jsx`.
 */
export default function WeatherBellCurve({
  z,
  width = 260,
  height = 110,
}: WeatherBellCurveProps) {
  // Sample 60 points across ±3σ for the curve outline.
  const steps = 60;
  const xs: { sigma: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const sigma = -3 + (i / steps) * 6;
    xs.push({
      sigma,
      y: Math.exp(-0.5 * sigma * sigma) / Math.sqrt(2 * Math.PI),
    });
  }
  const maxY = Math.max(...xs.map((p) => p.y));

  const pad = 12;
  const innerW = width - pad * 2;
  const innerH = height - pad * 2 - 14;
  const toX = (s: number) => pad + ((s + 3) / 6) * innerW;
  const toY = (yv: number) => pad + (1 - yv / maxY) * innerH;

  let curve = `M ${toX(xs[0].sigma)} ${toY(xs[0].y)}`;
  for (let i = 1; i < xs.length; i++) {
    curve += ` L ${toX(xs[i].sigma)} ${toY(xs[i].y)}`;
  }
  const closed = curve + ` L ${toX(3)} ${pad + innerH} L ${toX(-3)} ${pad + innerH} Z`;

  // Tail polygons — beyond |σ| 1.5.
  const tailLeft =
    "M " +
    toX(-3) +
    " " +
    (pad + innerH) +
    xs
      .filter((p) => p.sigma <= -1.5)
      .map((p) => ` L ${toX(p.sigma)} ${toY(p.y)}`)
      .join("") +
    ` L ${toX(-1.5)} ${pad + innerH} Z`;
  const tailRight =
    "M " +
    toX(1.5) +
    " " +
    (pad + innerH) +
    xs
      .filter((p) => p.sigma >= 1.5)
      .map((p) => ` L ${toX(p.sigma)} ${toY(p.y)}`)
      .join("") +
    ` L ${toX(3)} ${pad + innerH} Z`;

  const clamped = Math.max(-3, Math.min(3, z));
  const todayX = toX(clamped);
  const todayCurveY = toY(
    Math.exp(-0.5 * clamped * clamped) / Math.sqrt(2 * Math.PI)
  );

  // Mount toggle drives the CSS-transition drop from baseline → curve.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  const lineY2 = mounted ? todayCurveY : pad + innerH;
  const dotCy = mounted ? todayCurveY : pad + innerH;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      // Responsive sizing: SVG fills its container up to the natural width,
      // never overflows on narrow weather cards. Aspect ratio is preserved
      // by `preserveAspectRatio` defaulting to xMidYMid meet, so the curve
      // looks identical at 260px and at 200px wide.
      style={{
        width: "100%",
        height: "auto",
        maxWidth: width,
        display: "block",
      }}
      role="img"
      aria-label="Today's move on the daily-distribution bell curve"
    >
      {/* Baseline */}
      <line
        x1={pad}
        y1={pad + innerH}
        x2={width - pad}
        y2={pad + innerH}
        stroke="var(--ink)"
        strokeWidth="0.8"
      />
      {/* Filled body */}
      <path d={closed} fill="var(--ink)" opacity="0.07" />
      {/* Tails */}
      <path d={tailLeft} fill="var(--stamp)" opacity="0.22" />
      <path d={tailRight} fill="var(--green)" opacity="0.22" />
      {/* Curve outline */}
      <path
        d={curve}
        fill="none"
        stroke="var(--ink)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* σ ticks */}
      {[-2, -1, 0, 1, 2].map((s) => (
        <g key={s}>
          <line
            x1={toX(s)}
            x2={toX(s)}
            y1={pad + innerH}
            y2={pad + innerH + 4}
            stroke="var(--ink-mute)"
            strokeWidth="0.8"
          />
          <text
            x={toX(s)}
            y={pad + innerH + 14}
            textAnchor="middle"
            fontSize="9"
            fontFamily="var(--font-sans)"
            fontWeight="700"
            fill="var(--ink-mute)"
            letterSpacing="0.06em"
          >
            {s > 0 ? `+${s}` : s}σ
          </text>
        </g>
      ))}

      {/* Today marker — animates onto the curve on first paint */}
      <g
        style={{
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.5s ease 0.1s",
        }}
      >
        <line
          x1={todayX}
          x2={todayX}
          y1={pad + innerH}
          y2={lineY2}
          stroke="var(--stamp)"
          strokeWidth="1.5"
          strokeDasharray="3 2"
          style={{ transition: "y2 0.7s cubic-bezier(0.2, 0.7, 0.3, 1)" }}
        />
        <circle
          cx={todayX}
          cy={dotCy}
          r="5"
          fill="var(--stamp)"
          stroke="var(--paper)"
          strokeWidth="2"
          style={{ transition: "cy 0.7s cubic-bezier(0.2, 0.7, 0.3, 1)" }}
        />
      </g>
    </svg>
  );
}
