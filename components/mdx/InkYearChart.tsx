"use client";

import { useState } from "react";
import { formatDollars } from "@/lib/chart-utils";

/**
 * InkYearChart — the article calculators' chart primitive, hand-rolled in
 * the Instrument grammar. This is what replaced recharts inside
 * FeeCalculator, WithdrawalSimulator and CoveredCallGrowthChart.
 *
 * Grammar (per the Instrument spec, same one DuoChart draws in):
 *   - ink lines on white paper, red spent ONLY on the cautionary series
 *   - 1px ink baseline, hairline dashed rules above it
 *   - Archivo micro-labels via var(--ins-font), tabular-nums, radius 0
 *   - no shadows, no gradients, no fills under the lines
 *
 * Architecture is DuoChart's: the path lives in a 0–100 × 0–100 viewBox
 * with preserveAspectRatio="none" + non-scaling-stroke, and every label,
 * rule, dot and crosshair is an absolutely positioned HTML element at a
 * percentage offset. That means the type is real CSS type at real sizes on
 * every viewport — a fixed pixel viewBox would shrink 9.5px labels to 4px
 * on a phone — and no ResizeObserver is needed for a 36-point series.
 *
 * The readout row under the plot doubles as the legend: it is always
 * visible (so the prerendered, no-JS frame still carries the numbers) and
 * it re-reads as you scrub. That is the tooltip, honestly placed.
 */

export type InkTone = "ink" | "muted" | "signal";

export interface InkYearSeries {
  id: string;
  /** Short label for the readout row — it is the legend. */
  label: string;
  /** One value per entry in `years`. */
  values: number[];
  /** `signal` is the red one. Exactly one series should carry it. */
  tone: InkTone;
}

const TONE: Record<InkTone, { stroke: string; width: number }> = {
  ink: { stroke: "var(--ins-ink)", width: 1.8 },
  muted: { stroke: "var(--ins-gray-600)", width: 1.1 },
  signal: { stroke: "var(--ins-signal)", width: 1.8 },
};

/**
 * Round axis stops strictly inside [min, max] on the classic 1/2/2.5/5
 * ladder. Deliberately does NOT round the domain outward — the series
 * should fill the plot; the top gridline just lands wherever the last
 * round value does.
 */
function niceTicks(min: number, max: number, count = 5): number[] {
  if (!(max > min)) return [min];
  const step0 = (max - min) / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step =
    (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) *
    mag;
  const out: number[] = [];
  for (
    let v = Math.ceil(min / step - 1e-9) * step;
    v <= max + step * 1e-9;
    v += step
  ) {
    out.push(Math.abs(v) < step * 1e-9 ? 0 : v);
  }
  return out.length > 0 ? out : [min];
}

/** Axis micro-label — compact so the gutter stays narrow. */
function fmtAxis(v: number): string {
  const a = Math.abs(v);
  if (a >= 1_000_000) {
    const m = v / 1_000_000;
    return `$${Number.isInteger(m) ? m : m.toFixed(1)}M`;
  }
  if (a >= 1_000) {
    const k = v / 1_000;
    return `$${Number.isInteger(k) ? k : k.toFixed(1)}K`;
  }
  return `$${Math.round(v)}`;
}

interface InkYearChartProps {
  /** X values — one per point, in years. */
  years: number[];
  series: InkYearSeries[];
  /** Leading phrase in the readout row, e.g. "AT YEAR". */
  readoutLead?: string;
  /** Plot height in CSS px (desktop; mobile clamps to 150). */
  height?: number;
  ariaLabel: string;
}

export default function InkYearChart({
  years,
  series,
  readoutLead = "AT YEAR",
  height = 210,
  ariaLabel,
}: InkYearChartProps) {
  const [scrub, setScrub] = useState<number | null>(null);

  const n = years.length;
  const last = Math.max(0, n - 1);

  // Domain — anchored at zero, exactly like the recharts YAxis default it
  // replaces, so the shape of every one of these charts is unchanged.
  let dataMin = 0;
  let dataMax = 0;
  for (const s of series) {
    for (const v of s.values) {
      if (v < dataMin) dataMin = v;
      if (v > dataMax) dataMax = v;
    }
  }
  const yMin = dataMin;
  // 3% headroom so the top of the highest line — and its 7px end dot —
  // clears the frame.
  const yMax = dataMax + (dataMax - dataMin) * 0.03 || 1;
  const yR = yMax - yMin || 1;
  const yTicks = niceTicks(yMin, yMax);

  const px = (i: number) => (last === 0 ? 0 : (i / last) * 100);
  const py = (v: number) => ((yMax - v) / yR) * 100;

  const tickCount = Math.min(6, Math.max(2, n));
  const xTicks = Array.from(
    new Set(
      Array.from({ length: tickCount }, (_, k) =>
        Math.round((k / (tickCount - 1)) * last)
      )
    )
  );

  const activeIdx = Math.min(scrub ?? last, last);

  const idxFromEvent = (e: React.PointerEvent<HTMLDivElement>): number => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    return Math.round(f * last);
  };

  return (
    <div className="iyc">
      <div
        className="iyc__frame"
        style={{ height }}
        tabIndex={0}
        aria-label={`${ariaLabel} Left and right arrow keys step one year; the readout below the plot updates.`}
        onPointerMove={(e) => setScrub(idxFromEvent(e))}
        onPointerDown={(e) => setScrub(idxFromEvent(e))}
        onPointerLeave={() => setScrub(null)}
        onPointerCancel={() => setScrub(null)}
        onBlur={() => setScrub(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const d = e.key === "ArrowLeft" ? -1 : 1;
            setScrub((s) => Math.min(last, Math.max(0, (s ?? last) + d)));
          } else if (e.key === "Escape") {
            setScrub(null);
          }
        }}
      >
        {yTicks.map((t) => (
          <div
            key={t}
            className={`iyc__rule${t === 0 ? " is-base" : ""}`}
            style={{ top: `${py(t)}%` }}
            aria-hidden
          />
        ))}

        {yTicks.map((t) => (
          <span key={t} className="iyc__ylbl" style={{ top: `${py(t)}%` }}>
            {fmtAxis(t)}
          </span>
        ))}

        <svg
          className="iyc__svg"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {series.map((s) => (
            <path
              key={s.id}
              d={s.values
                .map(
                  (v, i) =>
                    `${i === 0 ? "M" : "L"} ${px(i).toFixed(3)} ${py(v).toFixed(3)}`
                )
                .join(" ")}
              fill="none"
              stroke={TONE[s.tone].stroke}
              strokeWidth={TONE[s.tone].width}
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              shapeRendering="geometricPrecision"
            />
          ))}
        </svg>

        {scrub !== null && (
          <div
            className="iyc__vline"
            style={{ left: `${px(activeIdx)}%` }}
            aria-hidden
          />
        )}

        {series.map((s) => (
          <span
            key={s.id}
            className="iyc__dot"
            style={{
              left: `${px(activeIdx)}%`,
              top: `${py(s.values[activeIdx] ?? 0)}%`,
              background: TONE[s.tone].stroke,
            }}
            aria-hidden
          />
        ))}
      </div>

      <div className="iyc__xaxis" aria-hidden>
        {xTicks.map((i) => (
          <span
            key={i}
            className={`iyc__xlbl${
              px(i) < 4 ? " is-first" : px(i) > 96 ? " is-last" : ""
            }`}
            style={{ left: `${px(i)}%` }}
          >
            Y{years[i]}
          </span>
        ))}
      </div>

      <p className="iyc__readout">
        <span className="iyc__lead">
          {readoutLead} {years[activeIdx]}
        </span>
        {series.map((s) => (
          <span key={s.id} className="iyc__item">
            <span
              className="iyc__key"
              style={{ background: TONE[s.tone].stroke }}
              aria-hidden
            />
            <span className="iyc__label">{s.label}</span>
            <span className="iyc__val" style={{ color: TONE[s.tone].stroke }}>
              {formatDollars(s.values[activeIdx] ?? 0)}
            </span>
          </span>
        ))}
      </p>

      <style jsx>{`
        .iyc {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          margin-top: 4px;
        }

        /* ── Plot ─────────────────────────────────────────────────── */
        .iyc__frame {
          position: relative;
          margin-left: 46px;
          touch-action: pan-y;
          cursor: crosshair;
        }
        .iyc__frame:focus-visible {
          outline: 1px dashed var(--ins-hair);
          outline-offset: 4px;
        }
        .iyc__rule {
          position: absolute;
          left: 0;
          right: 0;
          height: 0;
          border-top: 1px dashed var(--ins-hair);
        }
        /* The zero line is the one solid ink rule on the plot. */
        .iyc__rule.is-base {
          border-top: 1px solid var(--ins-ink);
        }
        .iyc__ylbl {
          position: absolute;
          left: -8px;
          transform: translate(-100%, -50%);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.08em;
          line-height: 1;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }
        .iyc__svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          overflow: visible;
        }
        .iyc__vline {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--ins-ink);
          pointer-events: none;
        }
        .iyc__dot {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 999px;
          transform: translate(-50%, -50%);
          pointer-events: none;
        }

        /* ── X axis ───────────────────────────────────────────────── */
        .iyc__xaxis {
          position: relative;
          margin-left: 46px;
          height: 16px;
          margin-top: 6px;
        }
        .iyc__xlbl {
          position: absolute;
          top: 0;
          transform: translateX(-50%);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          line-height: 1;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }
        .iyc__xlbl.is-first {
          transform: translateX(0);
        }
        .iyc__xlbl.is-last {
          transform: translateX(-100%);
        }

        /* ── Readout — the legend and the tooltip in one row ──────── */
        .iyc__readout {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 6px 16px;
          margin: 8px 0 0;
          padding-top: 9px;
          border-top: 1px solid var(--ins-hair-soft);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
        }
        .iyc__lead {
          font-weight: 800;
          color: var(--ins-ink);
          text-transform: uppercase;
        }
        .iyc__item {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
        }
        .iyc__key {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          transform: translateY(-1px);
          flex: none;
        }
        .iyc__label {
          text-transform: uppercase;
        }
        .iyc__val {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0;
        }

        @media (max-width: 640px) {
          .iyc__frame {
            height: 150px !important;
            margin-left: 40px;
          }
          .iyc__xaxis {
            margin-left: 40px;
          }
          .iyc__ylbl,
          .iyc__xlbl {
            font-size: 8.5px;
          }
          .iyc__readout {
            gap: 5px 12px;
            font-size: 9px;
            letter-spacing: 0.1em;
          }
          .iyc__val {
            font-size: 12px;
          }
        }
      `}</style>
    </div>
  );
}
