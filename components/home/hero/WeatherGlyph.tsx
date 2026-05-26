"use client";

import type { SeverityZone } from "@/lib/severity";

/**
 * WeatherGlyph — illustrated weather scene with 5 conditions.
 *
 *   • clear     — bright sun, rotating rays      (Typical, either direction)
 *   • breeze    — sun + drifting wispy streaks  (Notable, up)
 *   • overcast  — clouds dominant, sun dim       (Notable down / Unusual up)
 *   • rainy     — cloud + falling rain dashes   (Unusual down)
 *   • storm     — dark cloud, lightning, heavy rain (Rare, either direction)
 *
 * Direction tints the warm accent: up → amber, down → stamp.
 * All animations are CSS keyframes — no rAF / no JS animation loop, so they
 * fire reliably under React StrictMode and on first paint.
 *
 * Ported from `design_handoff_round4/.../hero-almanac.jsx`.
 */
export type WxCondition = "clear" | "breeze" | "overcast" | "rainy" | "storm";

export const WX_CONDITIONS: readonly WxCondition[] = [
  "clear",
  "breeze",
  "overcast",
  "rainy",
  "storm",
] as const;

export function zoneToCondition(zone: SeverityZone, up: boolean): WxCondition {
  if (zone === "Typical") return "clear";
  if (zone === "Notable") return up ? "breeze" : "overcast";
  if (zone === "Unusual") return up ? "overcast" : "rainy";
  if (zone === "Rare") return "storm";
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

  // The sun sits up-left so clouds can settle beside it.
  const sunCx = cx - 10;
  const sunCy = cy - 8;
  const sunR = size * 0.2;

  const showSun =
    cond === "clear" || cond === "breeze" || cond === "overcast";
  const showRays = cond === "clear" || cond === "breeze";
  const showStreaks = cond === "breeze";
  const showClouds =
    cond === "breeze" ||
    cond === "overcast" ||
    cond === "rainy" ||
    cond === "storm";
  const showDarkCloud = cond === "rainy" || cond === "storm";
  const showRain = cond === "rainy" || cond === "storm";
  const showLightning = cond === "storm";

  const sunOpacity =
    cond === "clear"
      ? 1
      : cond === "breeze"
      ? 0.95
      : cond === "overcast"
      ? 0.55
      : 0;

  // Unique gradient id per instance + condition so multiple glyphs can
  // share the page without clashing on `<defs>`.
  const gradId = `wxc-sun-${cond}-${size}`;

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
        <radialGradient id={gradId} cx="0.4" cy="0.4" r="0.65">
          <stop offset="0%" stopColor={accent} stopOpacity="0.95" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.55" />
        </radialGradient>
      </defs>

      {/* Sun + rays */}
      {showSun && (
        <g style={{ opacity: sunOpacity, transition: "opacity 0.5s ease" }}>
          {showRays && (
            <g className="wxg-rays">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
                const a = (i / 8) * Math.PI * 2;
                const x1 = sunCx + Math.cos(a) * (size * 0.27);
                const y1 = sunCy + Math.sin(a) * (size * 0.27);
                const x2 = sunCx + Math.cos(a) * (size * 0.36);
                const y2 = sunCy + Math.sin(a) * (size * 0.36);
                return (
                  <line
                    key={i}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={accent}
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    opacity={cond === "clear" ? 0.85 : 0.55}
                  />
                );
              })}
            </g>
          )}
          <circle cx={sunCx} cy={sunCy} r={sunR} fill={`url(#${gradId})`} />
          <circle
            cx={sunCx - 4}
            cy={sunCy - 4}
            r={size * 0.06}
            fill="var(--paper-light)"
            opacity="0.4"
          />
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

      {/* Rain dashes */}
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

      {/* Per-condition CSS animations — keyframes only, no JS loop. The
          transform-origin values reference the actual SVG coords above. */}
      <style jsx>{`
        /* CLEAR — rotating rays */
        .wxg :global(.wxg-rays) {
          transform-origin: ${sunCx}px ${sunCy}px;
        }
        .wxg--clear :global(.wxg-rays) {
          animation: wxg-spin 60s linear infinite;
        }
        @keyframes wxg-spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* BREEZE — slow rays + streaks slide, clouds drift */
        .wxg--breeze :global(.wxg-rays) {
          animation: wxg-spin 80s linear infinite;
        }
        .wxg--breeze :global(.wxg-streaks) {
          animation: wxg-streak 3.2s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes wxg-streak {
          0% {
            transform: translateX(-4px);
            opacity: 0.2;
          }
          50% {
            transform: translateX(2px);
            opacity: 0.6;
          }
          100% {
            transform: translateX(8px);
            opacity: 0.2;
          }
        }
        .wxg--breeze :global(.wxg-clouds) {
          animation: wxg-drift-fast 5s ease-in-out infinite alternate;
        }
        @keyframes wxg-drift-fast {
          from {
            transform: translateX(-3px);
          }
          to {
            transform: translateX(3px);
          }
        }

        /* OVERCAST — slow cloud drift */
        .wxg--overcast :global(.wxg-clouds) {
          animation: wxg-drift-slow 8s ease-in-out infinite alternate;
        }
        @keyframes wxg-drift-slow {
          from {
            transform: translateX(-2px);
          }
          to {
            transform: translateX(2px);
          }
        }

        /* RAINY — clouds drift, rain falls */
        .wxg--rainy :global(.wxg-clouds) {
          animation: wxg-drift-slow 7s ease-in-out infinite alternate;
        }
        .wxg--rainy :global(.wxg-rain) {
          animation: wxg-rainfall 0.85s linear infinite;
        }
        @keyframes wxg-rainfall {
          0% {
            transform: translateY(-4px);
            opacity: 0;
          }
          25% {
            opacity: 0.9;
          }
          75% {
            opacity: 0.9;
          }
          100% {
            transform: translateY(8px);
            opacity: 0;
          }
        }

        /* STORM — clouds shake, rain pours faster, lightning flashes */
        .wxg--storm :global(.wxg-clouds) {
          animation: wxg-shake 0.6s ease-in-out infinite;
        }
        @keyframes wxg-shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-1px);
          }
          75% {
            transform: translateX(1px);
          }
        }
        .wxg--storm :global(.wxg-rain) {
          animation: wxg-rainfall 0.55s linear infinite;
        }
        .wxg--storm :global(.wxg-lightning) {
          animation: wxg-flash 3.4s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes wxg-flash {
          0%,
          14%,
          100% {
            opacity: 0;
            transform: scale(0.92);
          }
          15% {
            opacity: 1;
            transform: scale(1.08);
          }
          18% {
            opacity: 0.4;
          }
          22% {
            opacity: 1;
            transform: scale(1);
          }
          30% {
            opacity: 0;
          }
        }
      `}</style>
    </svg>
  );
}
