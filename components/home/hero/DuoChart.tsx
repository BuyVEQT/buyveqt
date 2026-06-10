"use client";

import { useId, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";

interface DuoChartProps {
  data: readonly HistoricalDataPoint[];
  width?: number;
  height?: number;
  showExtrema?: boolean;
}

/**
 * Duotone area chart — green fill above the period's first close, stamp
 * (vermilion) fill below. A dashed ink reference line marks the start.
 *
 * Architecture
 * ────────────
 * SVG holds only the **chart geometry** (paths, fills, hover line, dots).
 * All **text labels** (year ticks, START anchor, HIGH/LOW extrema, hover
 * readout) live in an HTML overlay positioned via percent. This was the
 * fix for the round-4 text squish: when SVG uses
 * `preserveAspectRatio="none"` (so the chart line fills the container
 * crisply via `vector-effect: non-scaling-stroke`), any inline `<text>`
 * stretches with the viewBox transform and collides with the chart line
 * on both desktop and mobile. HTML overlay keeps text crisp at any size,
 * lets us back labels with `var(--paper)` for legibility over the line,
 * and gives clean off-edge clamping.
 *
 * Coords: container coords come from `(svgCoord / viewBoxSize) * 100%`.
 *
 * Ported from `design_handoff_round4/.../hero-almanac.jsx`, text-layer
 * refactor by the implementer.
 */
export default function DuoChart({
  data,
  width = 920,
  height = 220,
  showExtrema = true,
}: DuoChartProps) {
  const uid = useId().replace(/:/g, "");
  const clipUp = `duo-clip-up-${uid}`;
  const clipDown = `duo-clip-down-${uid}`;
  const gradUp = `duo-grad-up-${uid}`;
  const gradDown = `duo-grad-down-${uid}`;

  const [hover, setHover] = useState<number | null>(null);

  if (!data || data.length < 2) return null;

  const closes = data.map((d) => d.close);
  const ref = closes[0];
  const min = Math.min(...closes);
  const max = Math.max(...closes);
  const span = Math.max(max, ref) - Math.min(min, ref);
  const pad = span * 0.1 || 0.5;
  const yMin = Math.min(min, ref) - pad;
  const yMax = Math.max(max, ref) + pad;
  const yRange = yMax - yMin || 1;

  const x = (i: number) => (i / (data.length - 1)) * width;
  const y = (v: number) => height - ((v - yMin) / yRange) * height;
  const refY = y(ref);

  // Period extrema indices.
  let minIdx = 0;
  let maxIdx = 0;
  closes.forEach((c, i) => {
    if (c < closes[minIdx]) minIdx = i;
    if (c > closes[maxIdx]) maxIdx = i;
  });

  // Container-relative percentages — these are what the HTML overlay uses.
  const pctX = (svgX: number) => (svgX / width) * 100;
  const pctY = (svgY: number) => (svgY / height) * 100;

  // Main line path.
  let line = `M ${x(0)} ${y(closes[0])}`;
  for (let i = 1; i < closes.length; i++) {
    line += ` L ${x(i)} ${y(closes[i])}`;
  }
  const closedPath = line + ` L ${width} ${refY} L 0 ${refY} Z`;

  const onMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * width;
    const idx = Math.min(
      data.length - 1,
      Math.max(0, Math.round((px / width) * (data.length - 1)))
    );
    setHover(idx);
  };

  // Year ticks — only emit when the year actually crosses, and thin them
  // out below a threshold so tight slices (1M, 3M) don't get any.
  const ticks: { x: number; year: number }[] = [];
  if (data[0]?.date) {
    let prev = new Date(data[0].date).getFullYear();
    for (let i = 1; i < data.length; i++) {
      const yr = new Date(data[i].date).getFullYear();
      if (yr !== prev) {
        ticks.push({ x: x(i), year: yr });
        prev = yr;
      }
    }
  }

  // Extrema placement: stamp the label above the high, below the low.
  // Near either edge a centered label hangs past the chart (on mobile, past
  // the viewport), so flip its anchor the same way the hover readout does.
  const hiLeftPct = pctX(x(maxIdx));
  const hiTopPct = Math.max(2, pctY(y(closes[maxIdx])) - 8); // 8% above the point
  const loLeftPct = pctX(x(minIdx));
  const loTopPct = Math.min(92, pctY(y(closes[minIdx])) + 2); // sit just under the point
  const edgeClass = (pct: number) =>
    pct > 88 ? "is-edge-r" : pct < 12 ? "is-edge-l" : "";

  // START anchor: if it sits in the top quarter of the chart, render the
  // label BELOW it (otherwise above) so we never crash into a year tick.
  const refTopPct = pctY(refY);
  const startBelow = refTopPct < 25;
  const startTopPct = startBelow ? refTopPct + 3 : refTopPct - 14;

  // Hover readout horizontal placement — flip to the left of the
  // crosshair when it would otherwise overflow the right edge.
  const hoverLeftPct = hover !== null ? pctX(x(hover)) : 0;
  const hoverFlip = hoverLeftPct > 78;

  return (
    <div
      className="duo"
      onMouseMove={onMove}
      onMouseLeave={() => setHover(null)}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="duo__svg"
        role="img"
        aria-label="VEQT duotone chart"
      >
        <defs>
          <clipPath id={clipUp}>
            <rect x="0" y="0" width={width} height={refY} />
          </clipPath>
          <clipPath id={clipDown}>
            <rect x="0" y={refY} width={width} height={height - refY} />
          </clipPath>
          <linearGradient id={gradUp} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id={gradDown} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--stamp)" stopOpacity="0.02" />
            <stop offset="100%" stopColor="var(--stamp)" stopOpacity="0.28" />
          </linearGradient>
        </defs>

        {/* Reference line (period start) */}
        <line
          x1={0}
          x2={width}
          y1={refY}
          y2={refY}
          stroke="var(--ink-mute)"
          strokeWidth="0.6"
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />

        {/* Duotone fills */}
        <path d={closedPath} fill={`url(#${gradUp})`} clipPath={`url(#${clipUp})`} />
        <path d={closedPath} fill={`url(#${gradDown})`} clipPath={`url(#${clipDown})`} />

        {/* Year tick LINES (text is in HTML overlay below) */}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x}
            x2={t.x}
            y1={0}
            y2={height}
            stroke="var(--rule-soft)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {/* Main line */}
        <path
          d={line}
          fill="none"
          stroke="var(--ink)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Hover crosshair line (the dot + readout sit in the HTML overlay) */}
        {hover !== null && (
          <line
            x1={x(hover)}
            x2={x(hover)}
            y1={0}
            y2={height}
            stroke="var(--ink)"
            strokeWidth="0.6"
            opacity="0.4"
            vectorEffect="non-scaling-stroke"
            pointerEvents="none"
          />
        )}
      </svg>

      {/* HTML overlay — all text + circles that need to stay round.
          Pointer-events: none on the wrapper so the SVG below still
          receives mouse-move events. Individual labels can re-enable
          interactivity if they ever need it. */}
      <div className="duo__overlay" aria-hidden>
        {/* Year ticks */}
        {ticks.map((t, i) => (
          <span
            key={i}
            className="duo__year"
            style={{ left: `${pctX(t.x)}%` }}
          >
            {t.year}
          </span>
        ))}

        {/* START anchor: SVG ring + HTML label */}
        <span
          className="duo__start-dot"
          style={{ top: `${refTopPct}%` }}
        />
        <span
          className={`duo__start ${startBelow ? "is-below" : ""}`}
          style={{ top: `${startTopPct}%` }}
        >
          START ${ref.toFixed(2)}
        </span>

        {/* End dot */}
        <span
          className="duo__end-dot"
          style={{
            left: `${pctX(x(data.length - 1))}%`,
            top: `${pctY(y(closes[closes.length - 1]))}%`,
          }}
        />

        {/* Period extrema — only when min ≠ max */}
        {showExtrema && minIdx !== maxIdx && (
          <>
            <span
              className="duo__hi-dot"
              style={{
                left: `${pctX(x(maxIdx))}%`,
                top: `${pctY(y(closes[maxIdx]))}%`,
              }}
            />
            <span
              className={`duo__hi ${edgeClass(hiLeftPct)}`}
              style={{ left: `${hiLeftPct}%`, top: `${hiTopPct}%` }}
            >
              HIGH ${closes[maxIdx].toFixed(2)}
            </span>

            <span
              className="duo__lo-dot"
              style={{
                left: `${pctX(x(minIdx))}%`,
                top: `${pctY(y(closes[minIdx]))}%`,
              }}
            />
            <span
              className={`duo__lo ${edgeClass(loLeftPct)}`}
              style={{ left: `${loLeftPct}%`, top: `${loTopPct}%` }}
            >
              LOW ${closes[minIdx].toFixed(2)}
            </span>
          </>
        )}

        {/* Hover readout — flips left of the crosshair near the right edge */}
        {hover !== null && (
          <>
            <span
              className={`duo__hover-dot ${
                closes[hover] >= ref ? "is-up" : "is-down"
              }`}
              style={{
                left: `${pctX(x(hover))}%`,
                top: `${pctY(y(closes[hover]))}%`,
              }}
            />
            <div
              className={`duo__readout ${hoverFlip ? "is-flipped" : ""}`}
              style={{ left: `${hoverLeftPct}%` }}
            >
              <span className="duo__readout-date">{data[hover].date}</span>
              <span className="duo__readout-row">
                <span className="duo__readout-price">
                  ${closes[hover].toFixed(2)}
                </span>
                <span
                  className="duo__readout-delta"
                  style={{
                    color:
                      closes[hover] >= ref ? "var(--green)" : "var(--stamp)",
                  }}
                >
                  {closes[hover] >= ref ? "+" : "−"}
                  {Math.abs(((closes[hover] - ref) / ref) * 100).toFixed(1)}%
                </span>
              </span>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .duo {
          position: relative;
          width: 100%;
          height: 100%;
          font-family: var(--font-sans);
        }
        .duo__svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .duo__overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          /* Reserve a sliver of top/bottom space so year labels and
             extrema labels never bleed past the chart's visual edge. */
        }

        /* Year tick labels — small caps top-left of each crossover */
        .duo__year {
          position: absolute;
          top: 0;
          transform: translate(4px, 0);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: var(--ink-mute);
          line-height: 1;
          padding: 2px 3px 0;
          background: color-mix(in oklab, var(--paper) 80%, transparent);
          border-radius: 2px;
          white-space: nowrap;
        }

        /* START anchor */
        .duo__start-dot {
          position: absolute;
          left: 0;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--paper);
          border: 1.2px solid var(--ink);
          transform: translate(-50%, -50%);
        }
        .duo__start {
          position: absolute;
          left: 8px;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.16em;
          color: var(--ink-mute);
          background: color-mix(in oklab, var(--paper) 88%, transparent);
          padding: 1px 4px;
          border-radius: 2px;
          line-height: 1;
          white-space: nowrap;
        }
        .duo__start.is-below {
          /* top is already moved below the reference line by the parent,
             so no extra offset here. The class is kept as a hook for
             future tweaks (e.g. a stamp accent when sitting below). */
        }

        /* End dot */
        .duo__end-dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--ink);
          transform: translate(-50%, -50%);
        }

        /* HIGH / LOW extrema */
        .duo__hi-dot,
        .duo__lo-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          border: 1.2px solid var(--paper);
        }
        .duo__hi-dot {
          background: var(--green);
        }
        .duo__lo-dot {
          background: var(--stamp);
        }
        .duo__hi,
        .duo__lo {
          position: absolute;
          transform: translate(-50%, -100%);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          line-height: 1;
          padding: 2px 5px;
          border-radius: 3px;
          background: var(--paper);
          border: 1px solid var(--rule-hair);
          white-space: nowrap;
        }
        .duo__hi {
          color: var(--green);
        }
        .duo__lo {
          color: var(--stamp);
          transform: translate(-50%, 8px);
        }
        .duo__hi.is-edge-r {
          transform: translate(-100%, -100%);
        }
        .duo__hi.is-edge-l {
          transform: translate(0, -100%);
        }
        .duo__lo.is-edge-r {
          transform: translate(-100%, 8px);
        }
        .duo__lo.is-edge-l {
          transform: translate(0, 8px);
        }

        /* Hover crosshair dot + readout card */
        .duo__hover-dot {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          border: 1.5px solid var(--paper);
          box-shadow: 0 1px 2px rgba(15, 13, 10, 0.18);
        }
        .duo__hover-dot.is-up {
          background: var(--green);
        }
        .duo__hover-dot.is-down {
          background: var(--stamp);
        }
        .duo__readout {
          position: absolute;
          top: 4px;
          transform: translate(8px, 0);
          background: var(--paper);
          border: 0.6px solid var(--ink);
          border-radius: 4px;
          padding: 4px 8px;
          min-width: 90px;
          line-height: 1.05;
          box-shadow: 0 1px 2px rgba(15, 13, 10, 0.06);
        }
        .duo__readout.is-flipped {
          transform: translate(calc(-100% - 8px), 0);
        }
        .duo__readout-date {
          display: block;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--ink-mute);
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .duo__readout-row {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }
        .duo__readout-price {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 13px;
          color: var(--ink);
          font-variant-numeric: tabular-nums lining-nums;
        }
        .duo__readout-delta {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
          font-variant-numeric: tabular-nums;
        }

        /* Mobile — thin out crowded labels + tighten the readout card */
        @media (max-width: 640px) {
          .duo__year {
            font-size: 8px;
          }
          .duo__start {
            font-size: 8px;
            letter-spacing: 0.12em;
          }
          .duo__hi,
          .duo__lo {
            font-size: 9px;
            padding: 1px 4px;
          }
          .duo__readout {
            min-width: 78px;
            padding: 3px 6px;
          }
          .duo__readout-price {
            font-size: 12px;
          }
          .duo__readout-delta {
            font-size: 9px;
          }
        }
      `}</style>
    </div>
  );
}
