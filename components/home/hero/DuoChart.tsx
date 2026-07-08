"use client";

import { useMemo, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";
import {
  fmtChipDate,
  fmtMoney,
  fmtPrice,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";

/**
 * The Instrument — ink-line chart + drag-to-scrub + $10,000 what-if row.
 *
 * Self-contained chart module per handoff §1.4: owns its period state
 * (1M/3M/1Y/5Y/ALL, default 1Y), slices the full since-2019 series, draws a
 * single ink line (var(--ins-chart-line) so editions can repaint it), and
 * exposes one interaction — scrub. Scrubbing shows a vline + red dot +
 * tooltip (desktop only) and live-reprices the what-if row; entry reverts
 * to the period start on pointerleave. Keyboard: focus the plot, ←/→ steps
 * one session, Esc/blur clears.
 *
 * Geometry mirrors the prototype: viewBox 920×220 with
 * `preserveAspectRatio="none"` + `vector-effect: non-scaling-stroke`, and
 * a 10% vertical pad above the high / below the low. All in-plot text is
 * HTML positioned by percent so it never stretches with the viewBox.
 */

type Period = "1M" | "3M" | "1Y" | "5Y" | "ALL";

const PERIODS: readonly {
  id: Period;
  sessions: number | null; // trading sessions to slice; null = all
  label: string; // desktop header, joined with " · MM.YYYY — MM.YYYY"
  short: string; // mobile header (no date range, per the mobile artboard)
}[] = [
  { id: "1M", sessions: 21, label: "TRAILING MONTH", short: "TRAILING 1M" },
  { id: "3M", sessions: 63, label: "TRAILING QUARTER", short: "TRAILING 3M" },
  {
    id: "1Y",
    sessions: 252,
    label: "TRAILING TWELVE MONTHS",
    short: "TRAILING 12M",
  },
  { id: "5Y", sessions: 1260, label: "FIVE YEARS", short: "FIVE YEARS" },
  { id: "ALL", sessions: null, label: "SINCE LAUNCH", short: "SINCE LAUNCH" },
];

const VB_W = 920;
const VB_H = 220;

/** "06.2025" — header range stamp. */
function fmtMY(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${mm}.${date.getFullYear()}`;
}

/** Flip a centered in-plot label inward when it sits near either edge. */
function edgeClass(leftPct: number): string {
  if (leftPct > 88) return "is-edge-r";
  if (leftPct < 12) return "is-edge-l";
  return "";
}

export default function DuoChart({
  history,
  loading,
}: {
  history: HistoricalDataPoint[];
  loading: boolean;
}) {
  const [period, setPeriod] = useState<Period>("1Y");
  const [scrub, setScrub] = useState<number | null>(null);

  const meta = PERIODS.find((p) => p.id === period) ?? PERIODS[2];

  const geom = useMemo(() => {
    const sliced =
      meta.sessions === null
        ? history
        : history.slice(Math.max(0, history.length - meta.sessions));
    if (sliced.length < 2) return null;

    const closes = sliced.map((d) => d.close);
    let minIdx = 0;
    let maxIdx = 0;
    closes.forEach((c, i) => {
      if (c < closes[minIdx]) minIdx = i;
      if (c > closes[maxIdx]) maxIdx = i;
    });
    const min = closes[minIdx];
    const max = closes[maxIdx];
    const pad = (max - min) * 0.1 || 0.5; // flat-series guard
    const yMin = min - pad;
    const yMax = max + pad;
    const yR = yMax - yMin;
    const n = closes.length - 1;

    const X = (i: number) => (i / n) * VB_W;
    const Y = (v: number) => VB_H - ((v - yMin) / yR) * VB_H;
    let path = `M ${X(0).toFixed(1)} ${Y(closes[0]).toFixed(1)}`;
    for (let i = 1; i <= n; i++) {
      path += ` L ${X(i).toFixed(1)} ${Y(closes[i]).toFixed(1)}`;
    }

    // Container-relative percents for the HTML label/dot layer.
    const xPct = (i: number) => (i / n) * 100;
    const yPct = (v: number) => ((yMax - v) / yR) * 100;

    return { sliced, closes, minIdx, maxIdx, n, path, xPct, yPct };
  }, [history, meta.sessions]);

  // Clamp a stale scrub index if the slice shrank under it.
  const scrubIdx =
    geom !== null && scrub !== null ? Math.min(scrub, geom.n) : null;

  const rangeStamp = geom
    ? ` · ${fmtMY(parseSessionDate(geom.sliced[0].date))} — ${fmtMY(
        parseSessionDate(geom.sliced[geom.n].date)
      )}`
    : "";

  const selectPeriod = (id: Period) => {
    setPeriod(id);
    setScrub(null);
  };

  const onScrub = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!geom) return;
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    setScrub(Math.round(f * geom.n));
  };

  const clearScrub = () => setScrub(null);

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!geom) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      setScrub((s) => Math.max(0, (s ?? geom.n + 1) - 1));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setScrub((s) => Math.min(geom.n, (s ?? -1) + 1));
    } else if (e.key === "Escape") {
      setScrub(null);
    }
  };

  // ── Derived render values ────────────────────────────────────────────
  // NOTE: plot labels + scrub overlay are rendered inline in the return —
  // styled-jsx does not add its scope class to JSX stored in variables,
  // which left them unstyled (unpositioned) in an earlier cut.
  let whatIf: {
    chip: string;
    value: string;
    pct: string;
    neg: boolean;
  } | null = null;

  if (geom) {
    const { sliced, closes, n } = geom;
    const entryIdx = scrubIdx ?? 0;
    const last = closes[n];
    const entry = closes[entryIdx];
    const wiPct = (last / entry - 1) * 100;
    whatIf = {
      chip: fmtChipDate(parseSessionDate(sliced[entryIdx].date)),
      value: fmtMoney((10000 * last) / entry),
      pct: fmtSignedPct(wiPct, 1),
      neg: wiPct < 0,
    };
  }

  return (
    <section className="chart">
      {/* Header: period stamp · drag hint · period tabs */}
      <div className="hd">
        <span className="hd-label">
          <span className="hd-full">
            {meta.label}
            {rangeStamp}
          </span>
          <span className="hd-short">{meta.short}</span>
        </span>
        <div className="hd-right">
          <span className="hint" aria-hidden>
            ◂ DRAG ▸
          </span>
          <div className="tabs" role="group" aria-label="Chart period">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tab ${p.id === period ? "is-active" : ""}`}
                aria-pressed={p.id === period}
                onClick={() => selectPeriod(p.id)}
              >
                {p.id}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Plot — scrubbable, keyboard-steppable */}
      <div
        className="plot"
        tabIndex={0}
        aria-label={`VEQT closing price, ${meta.label.toLowerCase()}${rangeStamp}. Drag to inspect a session; left and right arrow keys step one session; Escape clears.`}
        aria-busy={loading && !geom}
        onPointerDown={onScrub}
        onPointerMove={onScrub}
        onPointerLeave={clearScrub}
        onPointerCancel={clearScrub}
        onKeyDown={onKeyDown}
        onBlur={clearScrub}
      >
        {geom ? (
          /* Keyed by period so the draw-in restarts on every re-slice */
          <div className="geom" key={period} aria-hidden>
            <svg
              className="svg"
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              preserveAspectRatio="none"
            >
              <path
                className="line"
                d={geom.path}
                pathLength={1}
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <span
              className={`lbl lbl-start ${
                geom.yPct(geom.closes[0]) < 10 ? "is-flip" : ""
              }`}
              style={{ top: `${geom.yPct(geom.closes[0])}%` }}
            >
              {fmtPrice(geom.closes[0])}
            </span>
            {geom.maxIdx !== geom.minIdx && (
              <>
                <span
                  className={`lbl lbl-h ${edgeClass(geom.xPct(geom.maxIdx))}`}
                  style={{
                    left: `${geom.xPct(geom.maxIdx)}%`,
                    top: `${geom.yPct(geom.closes[geom.maxIdx])}%`,
                  }}
                >
                  H {fmtPrice(geom.closes[geom.maxIdx])}
                </span>
                <span
                  className={`lbl lbl-l ${edgeClass(geom.xPct(geom.minIdx))}`}
                  style={{
                    left: `${geom.xPct(geom.minIdx)}%`,
                    top: `${geom.yPct(geom.closes[geom.minIdx])}%`,
                  }}
                >
                  L {fmtPrice(geom.closes[geom.minIdx])}
                </span>
              </>
            )}
            <span
              className="edot"
              style={{ top: `${geom.yPct(geom.closes[geom.n])}%` }}
            />
          </div>
        ) : (
          <div className="skeleton" aria-hidden />
        )}
        {geom && scrubIdx !== null && (
          <div className="scrub" aria-hidden>
            <div
              className="vline"
              style={{ left: `${geom.xPct(scrubIdx)}%` }}
            />
            <div
              className="sdot"
              style={{
                left: `${geom.xPct(scrubIdx)}%`,
                top: `${geom.yPct(geom.closes[scrubIdx])}%`,
              }}
            />
            <div
              className="tip"
              style={{
                left: `${Math.min(84, Math.max(16, geom.xPct(scrubIdx)))}%`,
              }}
            >
              <span className="tip-date">
                {fmtChipDate(parseSessionDate(geom.sliced[scrubIdx].date))}
              </span>
              <span className="tip-price">
                ${fmtPrice(geom.closes[scrubIdx])}
              </span>
              <span
                className={`tip-delta ${
                  geom.closes[scrubIdx] < geom.closes[0] ? "is-neg" : ""
                }`}
              >
                {fmtSignedPct(
                  (geom.closes[scrubIdx] / geom.closes[0] - 1) * 100,
                  1
                )}{" "}
                vs. start
              </span>
            </div>
          </div>
        )}
      </div>

      {/* What-if row — reprices live while scrubbing */}
      {whatIf && (
        <>
          <div className="wif">
            <span className="wif-lead">WHAT IF —</span>
            <span>$10,000 PLACED</span>
            <span className="wif-chip">{whatIf.chip}</span>
            <span>IS</span>
            <span className="wif-val">{whatIf.value}</span>
            <span>TODAY ·</span>
            <span className={`wif-pct ${whatIf.neg ? "is-neg" : ""}`}>
              {whatIf.pct}
            </span>
            <span className="wif-hint">
              DRAG THE CHART TO RE-RUN ANY ENTRY POINT
            </span>
          </div>
          <div className="wif-m">
            <span className="wif-lead">WHAT IF —</span> $10,000 ON{" "}
            <span className="wif-chip wif-chip-sm">{whatIf.chip}</span> IS{" "}
            <span className="wif-m-val">{whatIf.value}</span> ·{" "}
            <span className={`wif-m-pct ${whatIf.neg ? "is-neg" : ""}`}>
              {whatIf.pct}
            </span>
          </div>
        </>
      )}

      <style jsx>{`
        .chart {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }

        /* ── Header ─────────────────────────────────────────────── */
        .hd {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px 18px;
          padding-bottom: 10px;
        }
        .hd-label {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          color: var(--ins-gray-600);
          text-transform: uppercase;
        }
        .hd-short {
          display: none;
        }
        .hd-right {
          display: flex;
          align-items: center;
          gap: 18px;
          margin-left: auto;
        }
        .hint {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          color: var(--ins-gray-600);
          animation: ins-hintShimmer 2.6s ease-in-out infinite;
        }
        .tabs {
          display: flex;
          gap: 2px;
        }
        .tab {
          appearance: none;
          background: none;
          border: 1px solid transparent;
          border-radius: 0;
          padding: 5px 11px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--ins-gray-600);
          cursor: pointer;
          font-variant-numeric: tabular-nums;
        }
        .tab:hover {
          border-color: var(--ins-hair);
        }
        .tab.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
          border-color: var(--ins-ink);
        }

        /* ── Plot ───────────────────────────────────────────────── */
        .plot {
          position: relative;
          height: 210px;
          border-bottom: 1px solid var(--ins-ink);
          touch-action: none;
          cursor: crosshair;
          user-select: none;
          -webkit-user-select: none;
        }
        .plot:focus-visible {
          outline: 1px dashed var(--ins-hair);
          outline-offset: 3px;
        }
        .geom {
          position: absolute;
          inset: 0 0 1px;
          pointer-events: none;
        }
        .svg {
          width: 100%;
          height: 100%;
          display: block;
        }
        .line {
          fill: none;
          stroke: var(--ins-chart-line);
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: ins-drawIn 1.8s cubic-bezier(0.45, 0, 0.25, 1) 0.3s
            forwards;
        }
        /* The global .ins-root reduced-motion rule kills the animation,
           which would strand the line at dashoffset 1 (invisible) — pin
           the end state here. */
        @media (prefers-reduced-motion: reduce) {
          .line {
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
        }

        /* In-plot labels: start price, H, L */
        .lbl {
          position: absolute;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
          line-height: 1;
          white-space: nowrap;
        }
        .lbl-start {
          left: 0;
          transform: translateY(-140%);
        }
        .lbl-start.is-flip {
          transform: translateY(30%);
        }
        .lbl-h {
          transform: translate(-50%, -140%);
        }
        .lbl-h.is-edge-r {
          transform: translate(-104%, -140%);
        }
        .lbl-h.is-edge-l {
          transform: translate(4px, -140%);
        }
        .lbl-l {
          transform: translate(-50%, 6px);
        }
        .lbl-l.is-edge-r {
          transform: translate(-104%, 6px);
        }
        .lbl-l.is-edge-l {
          transform: translate(4px, 6px);
        }

        /* End dot — the only ambient red on the plot */
        .edot {
          position: absolute;
          left: 100%;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--ins-signal);
          transform: translate(-50%, -50%);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }

        /* Scrub: vline + red dot on the line + tooltip */
        .scrub {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        .vline {
          position: absolute;
          top: 0;
          bottom: 0;
          width: 1px;
          background: var(--ins-ink);
        }
        .sdot {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: var(--ins-signal);
          border: 2px solid var(--ins-paper);
          box-shadow: 0 0 0 1px var(--ins-ink);
          transform: translate(-50%, -50%);
        }
        .tip {
          position: absolute;
          top: 6px;
          transform: translateX(-50%);
          background: var(--ins-paper);
          border: 1px solid var(--ins-ink);
          padding: 5px 10px;
          white-space: nowrap;
          line-height: 1;
        }
        .tip-date {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
          text-transform: uppercase;
        }
        .tip-price {
          font-size: 13px;
          font-weight: 700;
          margin-left: 8px;
        }
        .tip-delta {
          font-size: 10.5px;
          font-weight: 700;
          margin-left: 6px;
        }
        .tip-delta.is-neg {
          color: var(--ins-signal);
        }

        /* Loading — ink-tint skeleton, no spinner */
        .skeleton {
          position: absolute;
          inset: 0 0 1px;
          background: color-mix(in srgb, var(--ins-ink) 6%, transparent);
        }

        /* ── What-if row ────────────────────────────────────────── */
        .wif {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding-top: 14px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
        }
        .wif-lead {
          font-weight: 800;
          color: var(--ins-ink);
        }
        .wif-chip {
          border: 1px solid var(--ins-ink);
          padding: 2px 8px;
          font-weight: 700;
          color: var(--ins-ink);
          text-transform: uppercase;
          font-variant-numeric: tabular-nums;
        }
        .wif-val {
          font-size: 20px;
          font-weight: 700;
          color: var(--ins-ink);
          letter-spacing: 0;
        }
        .wif-pct {
          font-size: 15px;
          font-weight: 700;
          letter-spacing: 0;
          color: var(--ins-ink);
        }
        .wif-pct.is-neg {
          color: var(--ins-signal);
        }
        .wif-hint {
          margin-left: auto;
          font-weight: 600;
        }

        /* Mobile what-if — flowing text block (per the mobile artboard) */
        .wif-m {
          display: none;
          padding-top: 12px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          line-height: 1.8;
        }
        .wif-chip-sm {
          padding: 1px 6px;
        }
        .wif-m-val {
          font-size: 15px;
          font-weight: 700;
          color: var(--ins-ink);
          letter-spacing: 0;
        }
        .wif-m-pct {
          font-weight: 700;
          letter-spacing: 0;
          color: var(--ins-ink);
        }
        .wif-m-pct.is-neg {
          color: var(--ins-signal);
        }

        /* ── Mobile deltas (handoff §2) ─────────────────────────── */
        @media (max-width: 640px) {
          .hd {
            gap: 8px 12px;
          }
          .hd-full {
            display: none;
          }
          .hd-short {
            display: inline;
          }
          .hd-label {
            font-size: 8.5px;
            letter-spacing: 0.18em;
          }
          .hint {
            font-size: 8.5px;
            letter-spacing: 0.16em;
          }
          .hd-right {
            gap: 12px;
          }
          .tab {
            padding: 5px 9px;
          }
          .plot {
            height: 140px;
          }
          .line {
            stroke-width: 1.5;
          }
          .lbl {
            display: none; /* mobile plot carries the line + dots only */
          }
          .edot {
            width: 8px;
            height: 8px;
          }
          .sdot {
            width: 9px;
            height: 9px;
          }
          .tip {
            display: none; /* scrub keeps working — dot + vline only */
          }
          .wif {
            display: none;
          }
          .wif-m {
            display: block;
          }
        }
      `}</style>
    </section>
  );
}
