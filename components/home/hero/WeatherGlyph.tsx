"use client";

import type { CSSProperties } from "react";
import type { WeatherState } from "@/lib/severity";

/**
 * WeatherGlyph — the Instrument's seven-state weather mark.
 *
 * Escalation grammar (README §3): up days escalate by *filling* the sun
 * (8% → 22% → 50% → solid red) while down days escalate by weather
 * (cloud → rain → bolt). One glyph per state, all inline SVG,
 * stroke-based, `stroke-linecap: round`:
 *
 *   calm    outline sun, 12 rays          raySpin 90s
 *   bright  sun r28, fill 0.22            raySpin 60s + ray shimmer 3.2s
 *   breezy  cloud before a small sun      cloud drift 7s
 *   surge   sun, longer rays, fill 0.50,
 *           white inner dashed ring       raySpin 34s + shimmer 2.2s
 *   squall  cloud + red rain              rainFall 1.1s (2 groups, ½-phase)
 *   rally   solid red disc, red flame-
 *           wedge rays, twin red halo     raySpin 16s + shimmer 1.8s
 *                                         + ringPulse 2.2s ×2 (½-phase)
 *   gale    cloud + red bolt + heavy rain boltFlash 3.8s + rainFall 0.9s
 *
 * Geometry is ground truth from the "5a — seven-state weather system"
 * state cards in `Home Refresh Directions.dc.html`. Sun states use
 * viewBox 120; cloud states keep the prototype's 32/40-unit canvases.
 *
 * Ink/paper are tokens, so the gale glyph (designed to sit on ink)
 * renders white-stroked automatically under the Ink Edition
 * (`[data-ins-edition="ink"]` flips --ins-ink/--ins-paper).
 *
 * `animated={false}` renders identical geometry with no animation —
 * used at 16–19px in the Conditions band week strip. Stroke widths get
 * a rendered-pixel floor so the mark stays legible at those sizes.
 */

interface WeatherGlyphProps {
  state: WeatherState;
  size: number;
  animated?: boolean;
}

const RAY_ANGLES = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

/**
 * Rally rays are sharp flame wedges — filled paths, not the shared ink
 * lines — alternating long (0/60/120/…) and short (30/90/150/…) about
 * (60, 60). Being fills, they need no MIN_STROKE_PX floor at mini sizes.
 */
const RALLY_WEDGE_LONG = "M56.9 16 L60 2 L63.1 16 Z";
const RALLY_WEDGE_SHORT = "M57.5 16 L60 7 L62.5 16 Z";

interface SunSpec {
  /** ins-raySpin duration, seconds. */
  spin: number;
  /** ins-hintShimmer duration on the ray group, seconds (null = none). */
  shimmer: number | null;
  /** Line-ray geometry — ignored by rally, which draws flame wedges. */
  rayW: number;
  longY1: number;
  shortY1: number;
  rayY2: number;
  r: number;
  circleW: number;
  fill: string;
}

const SUN_SPECS: Partial<Record<WeatherState, SunSpec>> = {
  calm: {
    spin: 90,
    shimmer: null,
    rayW: 2.6,
    longY1: 6,
    shortY1: 10,
    rayY2: 17,
    r: 27,
    circleW: 2.8,
    fill: "rgba(232, 68, 46, 0.08)",
  },
  bright: {
    spin: 60,
    shimmer: 3.2,
    rayW: 2.8,
    longY1: 5,
    shortY1: 9,
    rayY2: 16,
    r: 28,
    circleW: 2.8,
    fill: "rgba(232, 68, 46, 0.22)",
  },
  surge: {
    spin: 34,
    shimmer: 2.2,
    rayW: 3,
    longY1: 3,
    shortY1: 8,
    rayY2: 16,
    r: 28,
    circleW: 3,
    fill: "rgba(232, 68, 46, 0.5)",
  },
  rally: {
    spin: 16,
    shimmer: 1.8,
    // Line-ray fields unused — rally rays are RALLY_WEDGE_* fill paths.
    rayW: 0,
    longY1: 0,
    shortY1: 0,
    rayY2: 0,
    r: 28,
    circleW: 0, // solid disc, no outline
    fill: "var(--ins-signal)",
  },
};

/**
 * Keep every stroke ≥ ~1px on screen. At the spec sizes (84/64/56px)
 * this is a no-op; at week-strip sizes (16–19px) it thickens strokes
 * to roughly the proportions the prototype's simplified minis used.
 */
const MIN_STROKE_PX = 1.05;

export default function WeatherGlyph({
  state,
  size,
  animated = true,
}: WeatherGlyphProps) {
  const sun = SUN_SPECS[state];

  // Largest viewBox dimension — the square render box scales by it.
  const vb = sun ? 120 : state === "breezy" ? 40 : 32;
  const sw = (spec: number) => Math.max(spec, (MIN_STROKE_PX * vb) / size);

  const anim = (value: string): CSSProperties | undefined =>
    animated ? { animation: value } : undefined;

  /* ── Sun family: calm / bright / surge / rally ─────────────────── */
  if (sun) {
    const spinStyle: CSSProperties | undefined = animated
      ? {
          transformOrigin: "60px 60px",
          animation: `ins-raySpin ${sun.spin}s linear infinite`,
        }
      : undefined;
    const shimmerStyle: CSSProperties | undefined =
      animated && sun.shimmer !== null
        ? { animation: `ins-hintShimmer ${sun.shimmer}s ease-in-out infinite` }
        : undefined;

    return (
      <svg
        className="wg"
        viewBox="0 0 120 120"
        width={size}
        height={size}
        fill="none"
        role="img"
        aria-label={`Weather: ${state}`}
      >
        {state === "rally" && (
          <>
            {/* Twin halo, half a phase apart. */}
            <circle
              cx={60}
              cy={60}
              r={34}
              stroke="var(--ins-signal)"
              strokeWidth={sw(1.5)}
              fill="none"
              style={
                animated
                  ? {
                      transformOrigin: "60px 60px",
                      animation: "ins-ringPulse 2.2s ease-out infinite",
                    }
                  : undefined
              }
            />
            <circle
              cx={60}
              cy={60}
              r={34}
              stroke="var(--ins-signal)"
              /* Spec is 1.5 / 1 — derive the thin ring from the thick one
                 so the asymmetry survives sw()'s small-size floor (a plain
                 sw(1) clamps to 1.5 at the 84px hero size). */
              strokeWidth={(sw(1.5) * 2) / 3}
              fill="none"
              style={
                animated
                  ? {
                      transformOrigin: "60px 60px",
                      animation: "ins-ringPulse 2.2s ease-out infinite",
                      animationDelay: "-1.1s",
                    }
                  : undefined
              }
            />
          </>
        )}
        <g style={spinStyle}>
          {state === "rally" ? (
            <g fill="var(--ins-signal)" stroke="none" style={shimmerStyle}>
              {RAY_ANGLES.map((angle, i) => (
                <path
                  key={angle}
                  d={i % 2 === 0 ? RALLY_WEDGE_LONG : RALLY_WEDGE_SHORT}
                  transform={`rotate(${angle} 60 60)`}
                />
              ))}
            </g>
          ) : (
            <g
              stroke="var(--ins-ink)"
              strokeWidth={sw(sun.rayW)}
              strokeLinecap="round"
              style={shimmerStyle}
            >
              {RAY_ANGLES.map((angle, i) => (
                <line
                  key={angle}
                  x1={60}
                  y1={i % 2 === 0 ? sun.longY1 : sun.shortY1}
                  x2={60}
                  y2={sun.rayY2}
                  transform={`rotate(${angle} 60 60)`}
                />
              ))}
            </g>
          )}
        </g>
        {state === "rally" ? (
          <circle cx={60} cy={60} r={sun.r} fill={sun.fill} />
        ) : (
          <circle
            cx={60}
            cy={60}
            r={sun.r}
            stroke="var(--ins-ink)"
            strokeWidth={sw(sun.circleW)}
            fill={sun.fill}
          />
        )}
        {state === "surge" && (
          <circle
            cx={60}
            cy={60}
            r={20}
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth={sw(1.2)}
            fill="none"
            strokeDasharray="2 4"
          />
        )}
        <style jsx>{`
          @media (prefers-reduced-motion: reduce) {
            .wg,
            .wg :global(*) {
              animation: none !important;
            }
          }
        `}</style>
      </svg>
    );
  }

  /* ── Breezy: cloud drifting before a small sun ─────────────────── */
  if (state === "breezy") {
    return (
      <svg
        className="wg"
        viewBox="0 0 40 30"
        width={size}
        height={size}
        fill="none"
        role="img"
        aria-label="Weather: breezy"
      >
        <g stroke="var(--ins-ink)" strokeWidth={sw(1.5)} strokeLinecap="round">
          <circle
            cx={28}
            cy={9}
            r={4}
            fill="rgba(232, 68, 46, 0.06)"
            strokeWidth={sw(1.7)}
          />
          <line x1={28} y1={1.5} x2={28} y2={3.6} />
          <line x1={35.4} y1={9} x2={33.3} y2={9} />
          <line x1={33.2} y1={3.8} x2={31.7} y2={5.3} />
          <line x1={33.2} y1={14.2} x2={31.7} y2={12.7} />
        </g>
        <g style={anim("ins-drift 7s ease-in-out infinite")}>
          <path
            d="M10 24 h15 a4.6 4.6 0 0 0 0 -9.2 a7.2 7.2 0 0 0 -13.9 -1.9 A5.6 5.6 0 0 0 10 24 Z"
            stroke="var(--ins-ink)"
            strokeWidth={sw(1.9)}
            fill="var(--ins-paper)"
            strokeLinejoin="round"
          />
        </g>
        <style jsx>{`
          @media (prefers-reduced-motion: reduce) {
            .wg,
            .wg :global(*) {
              animation: none !important;
            }
          }
        `}</style>
      </svg>
    );
  }

  /* ── Squall: cloud + red rain, two groups phase-offset by ½ ────── */
  if (state === "squall") {
    return (
      <svg
        className="wg"
        viewBox="0 0 32 30"
        width={size}
        height={size}
        fill="none"
        role="img"
        aria-label="Weather: squall"
      >
        <path
          d="M9 16 h14 a4.5 4.5 0 0 0 0 -9 a7 7 0 0 0 -13.5 -1.8 A5.4 5.4 0 0 0 9 16 Z"
          stroke="var(--ins-ink)"
          strokeWidth={sw(1.9)}
          fill="var(--ins-paper)"
          strokeLinejoin="round"
        />
        <g
          stroke="var(--ins-signal)"
          strokeWidth={sw(1.7)}
          strokeLinecap="round"
          style={anim("ins-rainFall 1.1s linear infinite")}
        >
          <line x1={12} y1={19} x2={10.9} y2={22.4} />
          <line x1={17} y1={19} x2={15.9} y2={22.4} />
          <line x1={22} y1={19} x2={20.9} y2={22.4} />
        </g>
        <g
          stroke="var(--ins-signal)"
          strokeWidth={sw(1.7)}
          strokeLinecap="round"
          style={anim("ins-rainFall 1.1s linear 0.55s infinite")}
        >
          <line x1={14.5} y1={21} x2={13.4} y2={24.4} />
          <line x1={19.5} y1={21} x2={18.4} y2={24.4} />
        </g>
        <style jsx>{`
          @media (prefers-reduced-motion: reduce) {
            .wg,
            .wg :global(*) {
              animation: none !important;
            }
          }
        `}</style>
      </svg>
    );
  }

  /* ── Gale: cloud + red bolt + heavy rain — designed to sit on ink.
     Stroke/fill are tokens, so the Ink Edition renders it white-stroked
     exactly like the prototype's Gale card. ─────────────────────────── */
  return (
    <svg
      className="wg"
      viewBox="0 0 32 30"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="Weather: gale"
    >
      <path
        d="M9 15 h14 a4.5 4.5 0 0 0 0 -9 a7 7 0 0 0 -13.5 -1.8 A5.4 5.4 0 0 0 9 15 Z"
        stroke="var(--ins-ink)"
        strokeWidth={sw(1.9)}
        fill="var(--ins-paper)"
        strokeLinejoin="round"
      />
      <path
        d="M17 15.5 L13.5 21.5 L16.3 21.5 L14.3 27 L20.8 19.8 L17.8 19.8 L20.3 15.5 Z"
        fill="var(--ins-signal)"
        style={anim("ins-boltFlash 3.8s linear infinite")}
      />
      <g
        stroke="var(--ins-signal)"
        strokeWidth={sw(1.7)}
        strokeLinecap="round"
        style={anim("ins-rainFall 0.9s linear infinite")}
      >
        <line x1={10.5} y1={18} x2={9.4} y2={21.4} />
        <line x1={24} y1={18} x2={22.9} y2={21.4} />
      </g>
      <g
        stroke="var(--ins-signal)"
        strokeWidth={sw(1.7)}
        strokeLinecap="round"
        style={anim("ins-rainFall 0.9s linear 0.45s infinite")}
      >
        <line x1={12} y1={20.5} x2={10.9} y2={23.9} />
        <line x1={25.5} y1={20.5} x2={24.4} y2={23.9} />
      </g>
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .wg,
          .wg :global(*) {
            animation: none !important;
          }
        }
      `}</style>
    </svg>
  );
}
