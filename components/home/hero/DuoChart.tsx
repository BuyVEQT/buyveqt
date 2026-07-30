"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
 * exposes two interactions:
 *
 *   scrub — hover/drag shows a vline + red dot + tooltip (desktop only)
 *           and live-reprices the what-if row; reverts to the period
 *           start on pointerleave.
 *   pin   — click (or a drag released on a session) pins the what-if
 *           entry so it survives the pointer leaving. Click the pinned
 *           session again, the date chip's ×, or press Esc to release.
 *           Period switches clear the pin.
 *
 * Keyboard: focus the plot, ←/→ steps one session (moves the pin when
 * pinned), Enter/Space toggles the pin, Esc clears, blur clears the
 * ephemeral scrub but keeps a pin.
 *
 * Geometry renders in true pixel space: a ResizeObserver measures the
 * plot and the path is rebuilt at 1:1 CSS pixels (no stretched viewBox),
 * with a 10% vertical pad above the high / below the low. Dense periods
 * (5Y/ALL push ~1,900 sessions into ~1,200px) are downsampled to a
 * per-bucket min/max envelope so the line stays a crisp stroke instead
 * of anti-aliased mush — H/L labels, scrub, and the what-if row always
 * read the full-resolution series. 920×220 remains only as the
 * pre-measurement fallback.
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
  const [scrub, setScrub] = useState<number | null>(null); // ephemeral hover/drag
  const [pinned, setPinned] = useState<number | null>(null); // sticky entry
  const [plotSize, setPlotSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const plotRef = useRef<HTMLDivElement | null>(null);
  // Pointer-gesture bookkeeping: where the press started and whether it
  // travelled far enough to count as a drag rather than a click.
  const downRef = useRef<{ x: number; idx: number; moved: boolean } | null>(
    null
  );

  // Measure the plot so the path renders at 1:1 CSS pixels — the
  // sharpness half of this module. Fires once on mount and on resize.
  useEffect(() => {
    const el = plotRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setPlotSize((s) =>
        s && Math.abs(s.w - r.width) < 1 && Math.abs(s.h - r.height) < 1
          ? s
          : { w: r.width, h: r.height }
      );
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

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

    // Container-relative percents for the HTML label/dot layer.
    const xPct = (i: number) => (i / n) * 100;
    const yPct = (v: number) => ((yMax - v) / yR) * 100;

    return { sliced, closes, minIdx, maxIdx, n, yMin, yR, xPct, yPct };
  }, [history, meta.sessions]);

  // The path, in measured pixel space. Dense slices are decimated to a
  // per-bucket min/max envelope (~2px per segment) — the crisp way to
  // draw more sessions than there are pixel columns. Data-facing
  // consumers (scrub, what-if, H/L labels) never read this.
  const pathD = useMemo(() => {
    if (!geom) return null;
    const W = plotSize?.w ?? VB_W;
    const H = plotSize?.h ?? VB_H;
    const { closes, n, yMin, yR } = geom;

    const maxSegments = Math.max(120, Math.floor(W / 2));
    let idxs: number[];
    if (n + 1 <= maxSegments) {
      idxs = Array.from({ length: n + 1 }, (_, i) => i);
    } else {
      const buckets = Math.max(60, Math.floor(maxSegments / 2));
      idxs = [0];
      for (let b = 0; b < buckets; b++) {
        const s = Math.max(1, Math.floor((b / buckets) * (n - 1)) + 1);
        const e = Math.min(n, Math.floor(((b + 1) / buckets) * (n - 1)) + 1);
        if (e <= s) continue;
        let lo = s;
        let hi = s;
        for (let i = s; i < e; i++) {
          if (closes[i] < closes[lo]) lo = i;
          if (closes[i] > closes[hi]) hi = i;
        }
        // Chronological order inside the bucket keeps the stroke honest.
        const first = Math.min(lo, hi);
        const second = Math.max(lo, hi);
        if (idxs[idxs.length - 1] !== first) idxs.push(first);
        if (second !== first) idxs.push(second);
      }
      if (idxs[idxs.length - 1] !== n) idxs.push(n);
    }

    const X = (i: number) => (i / n) * W;
    const Y = (v: number) => H - ((v - yMin) / yR) * H;
    let d = `M ${X(idxs[0]).toFixed(2)} ${Y(closes[idxs[0]]).toFixed(2)}`;
    for (let k = 1; k < idxs.length; k++) {
      const i = idxs[k];
      d += ` L ${X(i).toFixed(2)} ${Y(closes[i]).toFixed(2)}`;
    }
    return d;
  }, [geom, plotSize]);

  // Live scrub wins over a pin for display; clamp a stale index if the
  // slice shrank under it.
  const activeIdx = scrub ?? pinned;
  const scrubIdx =
    geom !== null && activeIdx !== null ? Math.min(activeIdx, geom.n) : null;

  const rangeStamp = geom
    ? ` · ${fmtMY(parseSessionDate(geom.sliced[0].date))} — ${fmtMY(
        parseSessionDate(geom.sliced[geom.n].date)
      )}`
    : "";

  const selectPeriod = (id: Period) => {
    setPeriod(id);
    setScrub(null);
    setPinned(null);
  };

  const idxFromEvent = (e: React.PointerEvent<HTMLDivElement>): number => {
    const r = e.currentTarget.getBoundingClientRect();
    const f = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    return Math.round(f * (geom?.n ?? 0));
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!geom) return;
    // Capture so a drag that leaves the plot keeps scrubbing and still
    // delivers its pointerup (which pins) back here. Best-effort: capture
    // can throw (InvalidPointerId) and the gesture works without it.
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      /* gesture proceeds uncaptured */
    }
    const idx = idxFromEvent(e);
    downRef.current = { x: e.clientX, idx, moved: false };
    setScrub(idx);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!geom) return;
    if (downRef.current) {
      if (Math.abs(e.clientX - downRef.current.x) > 5)
        downRef.current.moved = true;
      setScrub(idxFromEvent(e));
    } else if (pinned === null) {
      // Hover-scrub stays ephemeral; while pinned the pin holds.
      setScrub(idxFromEvent(e));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const info = downRef.current;
    downRef.current = null;
    if (!geom || !info) return;
    const idx = idxFromEvent(e);
    if (info.moved) {
      // A drag released on a session keeps it — pin there.
      setPinned(idx);
    } else {
      // A click toggles: same session releases, anywhere else pins.
      setPinned((p) => (p === idx ? null : idx));
    }
    setScrub(null);
  };

  const clearScrub = () => {
    downRef.current = null;
    setScrub(null);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!geom) return;
    const step = (delta: number) => {
      e.preventDefault();
      if (pinned !== null && scrub === null) {
        setPinned(Math.min(geom.n, Math.max(0, pinned + delta)));
      } else {
        setScrub((s) =>
          Math.min(
            geom.n,
            Math.max(0, (s ?? (delta < 0 ? geom.n + 1 : -1)) + delta)
          )
        );
      }
    };
    if (e.key === "ArrowLeft") {
      step(-1);
    } else if (e.key === "ArrowRight") {
      step(1);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      const idx = scrub ?? pinned;
      if (idx === null) return;
      setPinned(pinned === idx && scrub === null ? null : idx);
      setScrub(null);
    } else if (e.key === "Escape") {
      setScrub(null);
      setPinned(null);
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

      {/* Plot — scrubbable, click-to-pin, keyboard-steppable */}
      <div
        ref={plotRef}
        className="plot"
        tabIndex={0}
        aria-label={`VEQT closing price, ${meta.label.toLowerCase()}${rangeStamp}. Drag to inspect a session; click, Enter, or Space pins the what-if entry point; left and right arrow keys step one session; Escape clears.`}
        aria-busy={loading && !geom}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={clearScrub}
        onPointerCancel={clearScrub}
        onKeyDown={onKeyDown}
        onBlur={clearScrub}
      >
        {geom && pathD ? (
          /* Keyed by period so the draw-in restarts on every re-slice */
          <div className="geom" key={period} aria-hidden>
            <svg
              className="svg"
              viewBox={`0 0 ${plotSize?.w ?? VB_W} ${plotSize?.h ?? VB_H}`}
              preserveAspectRatio="none"
            >
              <path
                className="line"
                d={pathD}
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

      {/* What-if row — reprices live while scrubbing; the date chip
          becomes the release control while an entry is pinned */}
      {whatIf && (
        <>
          <div className="wif">
            <span className="wif-lead">WHAT IF —</span>
            <span>$10,000 PLACED</span>
            {pinned !== null ? (
              <button
                type="button"
                className="wif-chip is-pinned"
                onClick={() => setPinned(null)}
                aria-label={`Release pinned entry ${whatIf.chip}`}
                title="Release pinned entry"
              >
                {whatIf.chip} <span aria-hidden>×</span>
              </button>
            ) : (
              <span className="wif-chip">{whatIf.chip}</span>
            )}
            <span>IS</span>
            <span className="wif-val">{whatIf.value}</span>
            <span>TODAY ·</span>
            <span className={`wif-pct ${whatIf.neg ? "is-neg" : ""}`}>
              {whatIf.pct}
            </span>
            <span className="wif-hint">
              {pinned !== null
                ? "ENTRY PINNED — CLICK THE DATE CHIP OR PRESS ESC TO RELEASE"
                : "DRAG THE CHART TO RE-RUN ANY ENTRY POINT · CLICK TO PIN"}
            </span>
          </div>
          <div className="wif-m">
            <span className="wif-lead">WHAT IF —</span> $10,000 ON{" "}
            {pinned !== null ? (
              <button
                type="button"
                className="wif-chip wif-chip-sm is-pinned"
                onClick={() => setPinned(null)}
                aria-label={`Release pinned entry ${whatIf.chip}`}
              >
                {whatIf.chip} <span aria-hidden>×</span>
              </button>
            ) : (
              <span className="wif-chip wif-chip-sm">{whatIf.chip}</span>
            )}{" "}
            IS <span className="wif-m-val">{whatIf.value}</span> ·{" "}
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
          shape-rendering: geometricPrecision;
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
        /* Pinned — the chip becomes the release control. Border doubles
           (ink grammar for "active"), padding compensates so the box
           doesn't shift, and the × invites the click. */
        button.wif-chip.is-pinned {
          appearance: none;
          background: none;
          font-family: inherit;
          font-size: inherit;
          letter-spacing: inherit;
          line-height: inherit;
          border-width: 2px;
          padding: 1px 7px;
          cursor: pointer;
        }
        button.wif-chip.is-pinned:hover {
          border-color: var(--ins-signal);
          color: var(--ins-signal);
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
