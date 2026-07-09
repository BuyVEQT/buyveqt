"use client";

import type { SeverityZone } from "@/lib/severity";

/**
 * WeatherGlyph — illustrated weather scene with **6** conditions, one
 * per cell of the 3-zone × 2-direction severity matrix:
 *
 *               ↑ up day        ↓ down day
 *   Typical     clear           clear
 *   Notable     breeze          overcast
 *   Rare        radiant (NEW)   storm
 *
 * `rainy` is preserved as the Unusual-down slot.
 *
 *   • clear     — bright sun, rotating rays + slow breathe   (Typical)
 *   • breeze    — sun + drifting wispy streaks + cloud drift (Notable up / Unusual up)
 *   • overcast  — clouds dominant, sun dim, sway + bob       (Notable down)
 *   • rainy     — cloud + per-drop staggered rainfall        (Unusual down)
 *   • radiant   — centred sun, pulse + halo + 4 sparkles     (Rare up, NEW)
 *   • storm     — dark cloud, hard shake, fast staggered rain,
 *                 lightning flash with drop-shadow halo      (Rare down)
 *
 * Direction tints the warm accent: up → amber, down → stamp.
 *
 * All motion is CSS keyframes — no rAF / no JS animation loop, so the
 * animations fire reliably under React StrictMode and on first paint.
 * Reduced-motion is honoured: every `.wxg *` animation slows to 8s so
 * the glyph still reads as "alive" but doesn't draw the eye.
 *
 * Ported from `design_handoff_round5/.../Weather Glyphs Plan.html`.
 */
export type WxCondition =
  | "clear"
  | "breeze"
  | "overcast"
  | "rainy"
  | "radiant"
  | "storm";

export const WX_CONDITIONS: readonly WxCondition[] = [
  "clear",
  "breeze",
  "overcast",
  "rainy",
  "radiant",
  "storm",
] as const;

/**
 * Map a SeverityZone + direction to a glyph condition. Direction
 * symmetric at every zone — a quiet-down day still reads visually
 * "down" even when the magnitude is small.
 *
 *   Typical   → clear / overcast      (overcast keeps Typical-down honest
 *                                       with the "passing cloud" copy)
 *   Notable   → breeze / overcast
 *   Unusual   → breeze / rainy        (mild up shares with Notable)
 *   Rare      → radiant / storm       (radiant is the new celebratory glyph)
 */
export function zoneToCondition(zone: SeverityZone, up: boolean): WxCondition {
  if (zone === "Typical") return up ? "clear" : "overcast";
  if (zone === "Notable") return up ? "breeze" : "overcast";
  if (zone === "Unusual") return up ? "breeze" : "rainy";
  if (zone === "Rare") return up ? "radiant" : "storm";
  return "clear";
}

interface WeatherGlyphProps {
  zone?: SeverityZone;
  up?: boolean;
  /** Override the condition picker (mostly for storybook/QA). */
  condition?: WxCondition;
  size?: number;
}

export default function WeatherGlyph({
  zone,
  up = true,
  condition,
  size = 132,
}: WeatherGlyphProps) {
  const cond: WxCondition =
    condition ?? (zone ? zoneToCondition(zone, up) : "clear");
  const accent = up ? "var(--amber)" : "var(--stamp)";
  const r = size / 2;
  const cx = r;
  const cy = r;

  // Sun lives off-centre for the cloud-bearing conditions, but radiant
  // gets a centred, slightly larger sun — clouds aren't in that scene.
  const sunCx = cond === "radiant" ? cx : cx - 10;
  const sunCy = cond === "radiant" ? cy - 4 : cy - 8;
  const sunR = cond === "radiant" ? size * 0.22 : size * 0.2;

  const showSun =
    cond === "clear" ||
    cond === "breeze" ||
    cond === "overcast" ||
    cond === "radiant";
  const showRays =
    cond === "clear" || cond === "breeze" || cond === "radiant";
  const showStreaks = cond === "breeze";
  const showClouds =
    cond === "breeze" ||
    cond === "overcast" ||
    cond === "rainy" ||
    cond === "storm";
  const showDarkCloud = cond === "rainy" || cond === "storm";
  const showRain = cond === "rainy" || cond === "storm";
  const showLightning = cond === "storm";
  const showHalo = cond === "radiant";
  const showSparkles = cond === "radiant";

  const sunOpacity =
    cond === "clear"
      ? 1
      : cond === "breeze"
      ? 0.95
      : cond === "overcast"
      ? 0.55
      : cond === "radiant"
      ? 1
      : 0;

  // Ray count + radii vary by condition. Radiant gets 12 longer, thicker
  // rays; the rest keep the existing 8-ray pattern.
  const rayCount = cond === "radiant" ? 12 : 8;
  const rayInner = size * (cond === "radiant" ? 0.3 : 0.27);
  const rayOuter = size * (cond === "radiant" ? 0.42 : 0.36);
  const rayStroke = cond === "radiant" ? 2.2 : 1.8;
  const rayOpacity =
    cond === "clear" || cond === "radiant" ? 0.92 : 0.55;
  const rayIndices = Array.from({ length: rayCount }, (_, i) => i);

  // Sparkle positions — 4 corners, staggered animation delays. Shape is
  // a 4-point star (8-vertex diamond with inset midpoints).
  const sparkles = showSparkles
    ? [
        { x: cx - size * 0.32, y: cy - size * 0.28, s: 5, d: "0s" },
        { x: cx + size * 0.3, y: cy - size * 0.3, s: 4, d: "0.45s" },
        { x: cx - size * 0.3, y: cy + size * 0.3, s: 3.5, d: "0.9s" },
        { x: cx + size * 0.32, y: cy + size * 0.26, s: 4.5, d: "1.35s" },
      ]
    : [];

  // Unique ids per instance so multiple glyphs on the page don't clash
  // on `<defs>`. `accent` is part of the id because the halo gradient
  // depends on the direction-tint.
  const uidSuffix = `${cond}-${size}-${up ? "u" : "d"}`;
  const sunGradId = `wxc-sun-${uidSuffix}`;
  const haloGradId = `wxc-halo-${uidSuffix}`;

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      role="img"
      aria-label={`Weather: ${cond}`}
      className={`wxg wxg--${cond}`}
    >
      <defs>
        <radialGradient id={sunGradId} cx="0.4" cy="0.4" r="0.65">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
        </radialGradient>
        {showHalo && (
          <radialGradient id={haloGradId} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor={accent} stopOpacity="0" />
            <stop offset="60%" stopColor={accent} stopOpacity="0.35" />
            <stop offset="100%" stopColor={accent} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      {/* Halo (radiant only) — sits BEHIND the sun so the sun reads on top.
          Two circles, phase-offset by 1.2s, expand from 0.6× → 2× and fade. */}
      {showHalo && (
        <g className="wxg-halo-wrap">
          <circle
            className="wxg-halo wxg-halo--a"
            cx={sunCx}
            cy={sunCy}
            r={sunR * 1.4}
            fill={`url(#${haloGradId})`}
          />
          <circle
            className="wxg-halo wxg-halo--b"
            cx={sunCx}
            cy={sunCy}
            r={sunR * 1.4}
            fill={`url(#${haloGradId})`}
          />
        </g>
      )}

      {/* Sun + rays */}
      {showSun && (
        <g style={{ opacity: sunOpacity, transition: "opacity 0.5s ease" }}>
          {showRays && (
            <g className="wxg-rays">
              {rayIndices.map((i) => {
                const a = (i / rayCount) * Math.PI * 2;
                const x1 = sunCx + Math.cos(a) * rayInner;
                const y1 = sunCy + Math.sin(a) * rayInner;
                const x2 = sunCx + Math.cos(a) * rayOuter;
                const y2 = sunCy + Math.sin(a) * rayOuter;
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={accent}
                    strokeWidth={rayStroke}
                    strokeLinecap="round"
                    opacity={rayOpacity}
                  />
                );
              })}
            </g>
          )}
          <circle
            className="wxg-sun"
            cx={sunCx}
            cy={sunCy}
            r={sunR}
            fill={`url(#${sunGradId})`}
          />
          <circle
            cx={sunCx - 4}
            cy={sunCy - 4}
            r={size * 0.06}
            fill="var(--paper-light)"
            opacity="0.4"
          />
        </g>
      )}

      {/* Sparkles (radiant only) — 4 corners, twinkle on staggered delays.
          `transform-origin` points at each sparkle's own centre so the
          scale animation pulses outward from that point. */}
      {showSparkles && (
        <g className="wxg-sparkles">
          {sparkles.map((sp, i) => (
            <g
              key={i}
              className="wxg-sparkle"
              // transform-box: fill-box + transform-origin: 50% 50%
              // live in the global rule block below. The sparkle path
              // is symmetric around (sp.x, sp.y), so the fill-box centre
              // matches the inline-pixel origin without the iOS quirk.
              style={{ animationDelay: sp.d }}
            >
              <path
                d={`M ${sp.x} ${sp.y - sp.s} L ${sp.x + sp.s * 0.3} ${
                  sp.y - sp.s * 0.3
                } L ${sp.x + sp.s} ${sp.y} L ${sp.x + sp.s * 0.3} ${
                  sp.y + sp.s * 0.3
                } L ${sp.x} ${sp.y + sp.s} L ${sp.x - sp.s * 0.3} ${
                  sp.y + sp.s * 0.3
                } L ${sp.x - sp.s} ${sp.y} L ${sp.x - sp.s * 0.3} ${
                  sp.y - sp.s * 0.3
                } Z`}
                fill={accent}
                stroke="none"
              />
            </g>
          ))}
        </g>
      )}

      {/* Wind streaks (breeze) */}
      {showStreaks && (
        <g
          className="wxg-streaks"
          stroke="var(--ink-mute)"
          strokeLinecap="round"
          opacity="0.6"
        >
          <line x1={cx - 14} y1={cy + 18} x2={cx + 14} y2={cy + 18} strokeWidth="1.2" />
          <line x1={cx - 6} y1={cy + 26} x2={cx + 22} y2={cy + 26} strokeWidth="1" />
          <line x1={cx - 18} y1={cy + 10} x2={cx + 4} y2={cy + 10} strokeWidth="0.8" />
        </g>
      )}

      {/* Clouds */}
      {showClouds && (
        <g className={`wxg-clouds wxg-clouds--${cond}`}>
          <ellipse
            cx={cx + 14}
            cy={cy + 4}
            rx={size * 0.32}
            ry={size * 0.14}
            fill="var(--paper-warm)"
            stroke="var(--ink-mute)"
            strokeWidth="1"
          />
          <ellipse
            cx={cx + 2}
            cy={cy - 4}
            rx={size * 0.2}
            ry={size * 0.14}
            fill="var(--paper)"
            stroke="var(--ink-mute)"
            strokeWidth="1"
          />
          <ellipse
            cx={cx + 26}
            cy={cy - 2}
            rx={size * 0.17}
            ry={size * 0.12}
            fill="var(--paper)"
            stroke="var(--ink-mute)"
            strokeWidth="1"
          />
          {showDarkCloud && (
            <ellipse
              cx={cx + 14}
              cy={cy + 10}
              rx={size * 0.26}
              ry={size * 0.1}
              fill="var(--ink)"
              opacity={cond === "storm" ? 0.32 : 0.16}
            />
          )}
        </g>
      )}

      {/* Rain dashes — 4 base lines (rainy & storm), +3 more for storm.
          Per-line stagger lives in the CSS via :nth-child selectors below. */}
      {showRain && (
        <g
          className={`wxg-rain wxg-rain--${cond}`}
          stroke="var(--stamp)"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.9"
        >
          <line x1={cx - 4} y1={cy + 22} x2={cx - 8} y2={cy + 32} />
          <line x1={cx + 6} y1={cy + 22} x2={cx + 2} y2={cy + 32} />
          <line x1={cx + 16} y1={cy + 22} x2={cx + 12} y2={cy + 32} />
          <line x1={cx + 26} y1={cy + 22} x2={cx + 22} y2={cy + 32} />
          {cond === "storm" && (
            <>
              <line x1={cx + 0} y1={cy + 34} x2={cx - 4} y2={cy + 44} />
              <line x1={cx + 10} y1={cy + 34} x2={cx + 6} y2={cy + 44} />
              <line x1={cx + 20} y1={cy + 34} x2={cx + 16} y2={cy + 44} />
            </>
          )}
        </g>
      )}

      {/* Lightning (storm) */}
      {showLightning && (
        <g className="wxg-lightning">
          <path
            d={`M ${cx + 8} ${cy + 14} L ${cx - 4} ${cy + 30} L ${
              cx + 4
            } ${cy + 30} L ${cx - 6} ${cy + 46} L ${cx + 16} ${
              cy + 26
            } L ${cx + 8} ${cy + 26} L ${cx + 14} ${cy + 14} Z`}
            fill="var(--amber)"
            stroke="var(--ink)"
            strokeWidth="0.7"
          />
        </g>
      )}

      {/* Per-condition CSS animations — keyframes only, no JS loop.
          Every animated element uses `transform-box: fill-box;
          transform-origin: 50% 50%` so the pivot point is each
          element's own bounding-box centre. iOS Safari interprets
          the `${sunCx}px` form as CSS pixels (not viewBox user
          units), which lands off-centre at any rendered size other
          than 1:1. PR #246 caught this for the sleeve gauges; this
          block had been regressing the same fix. */}
      <style jsx>{`
        /* Reduced-motion: hold every animation to a slow, gentle pace so
           the glyph still reads as "alive" but doesn't draw the eye.
           Don't override individual rules — let duration scaling do it. */
        @media (prefers-reduced-motion: reduce) {
          .wxg :global(*) {
            animation-duration: 8s !important;
          }
        }

        /* Every animated SVG element pivots around its own bounding box. */
        .wxg :global(.wxg-rays),
        .wxg :global(.wxg-sun),
        .wxg :global(.wxg-halo),
        .wxg :global(.wxg-streaks),
        .wxg :global(.wxg-lightning),
        .wxg :global(.wxg-sparkle) {
          transform-box: fill-box;
          transform-origin: 50% 50%;
        }

        @keyframes wxg-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* CLEAR — rotating rays + sun breathes */
        .wxg--clear :global(.wxg-rays) {
          animation: wxg-spin 24s linear infinite;
        }
        .wxg--clear :global(.wxg-sun) {
          animation: wxg-breathe 3.6s ease-in-out infinite;
        }
        @keyframes wxg-breathe {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.08);
            opacity: 0.92;
          }
        }

        /* BREEZE — fast rays, fast streaks, wide cloud drift */
        .wxg--breeze :global(.wxg-rays) {
          animation: wxg-spin 30s linear infinite;
        }
        .wxg--breeze :global(.wxg-streaks) {
          animation: wxg-streak 1.8s ease-in-out infinite;
        }
        @keyframes wxg-streak {
          0% {
            transform: translateX(-12px);
            opacity: 0;
          }
          25%,
          75% {
            opacity: 0.85;
          }
          100% {
            transform: translateX(16px);
            opacity: 0;
          }
        }
        .wxg--breeze :global(.wxg-clouds) {
          animation: wxg-drift-fast 3.2s ease-in-out infinite alternate;
        }
        @keyframes wxg-drift-fast {
          from {
            transform: translateX(-7px);
          }
          to {
            transform: translateX(7px);
          }
        }

        /* OVERCAST — sway with vertical bob for depth */
        .wxg--overcast :global(.wxg-clouds) {
          animation: wxg-drift-sway 4.5s ease-in-out infinite alternate;
        }
        @keyframes wxg-drift-sway {
          0% {
            transform: translate(-5px, 0);
          }
          50% {
            transform: translate(0, -2px);
          }
          100% {
            transform: translate(5px, 0);
          }
        }

        /* RAINY — sway clouds + per-drop staggered rainfall */
        .wxg--rainy :global(.wxg-clouds) {
          animation: wxg-drift-sway 4s ease-in-out infinite alternate;
        }
        .wxg--rainy :global(.wxg-rain > line) {
          animation: wxg-rainfall 0.55s linear infinite;
        }
        .wxg--rainy :global(.wxg-rain > line:nth-child(1)) {
          animation-delay: 0s;
        }
        .wxg--rainy :global(.wxg-rain > line:nth-child(2)) {
          animation-delay: -0.13s;
        }
        .wxg--rainy :global(.wxg-rain > line:nth-child(3)) {
          animation-delay: -0.26s;
        }
        .wxg--rainy :global(.wxg-rain > line:nth-child(4)) {
          animation-delay: -0.4s;
        }
        @keyframes wxg-rainfall {
          0% {
            transform: translateY(-6px);
            opacity: 0;
          }
          20%,
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(14px);
            opacity: 0;
          }
        }

        /* STORM — hard shake (with rotation), fast staggered rain,
           lightning flash with drop-shadow halo at peak */
        .wxg--storm :global(.wxg-clouds) {
          animation: wxg-shake 0.35s ease-in-out infinite;
        }
        @keyframes wxg-shake {
          0%,
          100% {
            transform: translateX(0) rotate(0deg);
          }
          20% {
            transform: translateX(-2px) rotate(-0.6deg);
          }
          50% {
            transform: translateX(2.5px) rotate(0.7deg);
          }
          80% {
            transform: translateX(-1.5px) rotate(-0.4deg);
          }
        }
        .wxg--storm :global(.wxg-rain > line) {
          animation: wxg-rainfall 0.38s linear infinite;
        }
        .wxg--storm :global(.wxg-rain > line:nth-child(odd)) {
          animation-delay: 0s;
        }
        .wxg--storm :global(.wxg-rain > line:nth-child(even)) {
          animation-delay: -0.18s;
        }
        .wxg--storm :global(.wxg-lightning) {
          animation: wxg-flash 2.1s ease-in-out infinite;
        }
        @keyframes wxg-flash {
          0%,
          7%,
          100% {
            opacity: 0;
            transform: scale(0.9);
          }
          8% {
            opacity: 1;
            transform: scale(1.15);
            filter: drop-shadow(0 0 6px var(--amber));
          }
          11% {
            opacity: 0.2;
            transform: scale(1);
          }
          14% {
            opacity: 1;
            transform: scale(1.05);
          }
          22% {
            opacity: 0;
          }
        }

        /* RADIANT — celebratory glyph for rare up days. Pulse + halo +
           4 sparkles + 12 fast rays. All the loudest motion in the suite. */
        .wxg--radiant :global(.wxg-rays) {
          animation: wxg-spin 14s linear infinite;
        }
        .wxg--radiant :global(.wxg-sun) {
          animation: wxg-pulse 1.6s ease-in-out infinite;
        }
        @keyframes wxg-pulse {
          0%,
          100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.12);
            opacity: 0.96;
          }
        }
        .wxg--radiant :global(.wxg-halo) {
          opacity: 0;
        }
        .wxg--radiant :global(.wxg-halo--a) {
          animation: wxg-halo 2.4s ease-out infinite;
        }
        .wxg--radiant :global(.wxg-halo--b) {
          animation: wxg-halo 2.4s ease-out infinite 1.2s;
        }
        @keyframes wxg-halo {
          0% {
            transform: scale(0.6);
            opacity: 0.7;
          }
          80% {
            opacity: 0.05;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .wxg--radiant :global(.wxg-sparkle) {
          animation: wxg-twinkle 1.8s ease-in-out infinite;
        }
        @keyframes wxg-twinkle {
          0%,
          100% {
            transform: scale(0);
            opacity: 0;
          }
          40% {
            transform: scale(1.2);
            opacity: 1;
          }
          60% {
            transform: scale(1);
            opacity: 0.85;
          }
          80% {
            transform: scale(0.4);
            opacity: 0;
          }
        }
      `}</style>
    </svg>
  );
}
