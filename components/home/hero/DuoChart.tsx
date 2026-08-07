"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { HistoricalDataPoint } from "@/lib/types";
import { weatherStateFor } from "@/lib/severity";
import {
  fmtChipDate,
  fmtMoney,
  fmtPrice,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";
import { useOnScreen } from "../useOnScreen";

/**
 * The Instrument — ink-line chart + two-point what-if + the tape's memory.
 *
 * Self-contained chart module per handoff §1.4: owns its period state
 * (1M/3M/1Y/5Y/ALL, default 1Y), slices the full since-2019 series, draws a
 * single ink line (var(--ins-chart-line) so editions can repaint it), and
 * exposes three interactions:
 *
 *   scrub — hover/drag shows a vline + red dot + tooltip (desktop only)
 *           and live-reprices the what-if row; reverts on pointerleave.
 *   range — click pins the what-if ENTRY. With an entry pinned, hovering
 *           previews the EXIT and a second click locks it — the row then
 *           prices the round trip (placed → sold, %, per-year when the
 *           hold is long enough to annualize honestly). Chips grow ×
 *           controls; releasing the only remaining pin clears the trade;
 *           releasing one of two promotes the other to entry. Esc clears
 *           one stage at a time. Period switches clear everything.
 *   pins  — the P98+ sessions (the almanac's rallies and gales) sit ON
 *           the line as 6px squares, ink for rallies, red for gales.
 *           Hovering one folds its state word into the scrub tooltip;
 *           clicking opens that day's almanac dispatch.
 *
 * Keyboard: focus the plot, ←/→ steps one session (moves the newest
 * handle when pinned), Enter/Space pins/advances the trade, Esc clears
 * stage by stage, blur clears the ephemeral scrub but keeps pins.
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
  const [exitPin, setExitPin] = useState<number | null>(null); // sticky exit
  const [plotSize, setPlotSize] = useState<{ w: number; h: number } | null>(
    null
  );
  const plotRef = useRef<HTMLDivElement | null>(null);
  // Parks the drag-hint shimmer and the end-dot pulse once the chart is
  // scrolled past — the draw-in is a one-shot and keeps running.
  const { ref: chartRef, onScreen } = useOnScreen<HTMLElement>();
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

  // The exit side of the trade: a locked exit pin, else — while an entry
  // is pinned — the live scrub previews it.
  const exitIdx =
    geom === null
      ? null
      : exitPin !== null
        ? Math.min(exitPin, geom.n)
        : pinned !== null && scrub !== null
          ? Math.min(scrub, geom.n)
          : null;

  // ── The tape's memory: P98+ sessions (almanac editions) ─────────────
  // Threshold from the FULL history so a pin means the same thing on
  // every zoom level; positions map into the current slice below.
  const editionDays = useMemo(() => {
    if (history.length < 60) return [];
    const rets: { histIdx: number; r: number }[] = [];
    const abs: number[] = [];
    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1].close;
      if (prev <= 0) continue;
      const r = (history[i].close / prev - 1) * 100;
      rets.push({ histIdx: i, r });
      abs.push(Math.abs(r));
    }
    const sorted = [...abs].sort((a, b) => a - b);
    const thr = sorted[Math.max(0, Math.ceil(sorted.length * 0.98) - 1)];
    return rets
      .filter(({ r }) => Math.abs(r) >= thr)
      .map(({ histIdx, r }) => ({
        histIdx,
        r,
        state: weatherStateFor(98, r), // ≥P98 by construction: rally | gale
      }));
  }, [history]);

  const slicePins = useMemo(() => {
    if (!geom) return [];
    const offset = history.length - (geom.n + 1);
    return editionDays
      .map((p) => ({ ...p, idx: p.histIdx - offset }))
      .filter((p) => p.idx >= 0 && p.idx <= geom.n);
  }, [editionDays, geom, history.length]);

  const pinAtScrub =
    scrubIdx !== null ? slicePins.find((p) => p.idx === scrubIdx) ?? null : null;

  const rangeStamp = geom
    ? ` · ${fmtMY(parseSessionDate(geom.sliced[0].date))} — ${fmtMY(
        parseSessionDate(geom.sliced[geom.n].date)
      )}`
    : "";

  const selectPeriod = (id: Period) => {
    setPeriod(id);
    setScrub(null);
    setPinned(null);
    setExitPin(null);
  };

  /** Release whichever handle sits at `idx`; a surviving exit becomes the
   *  entry so the trade never exists exit-first. */
  const releasePinAt = (idx: number) => {
    if (pinned === idx) {
      setPinned(exitPin);
      setExitPin(null);
    } else if (exitPin === idx) {
      setExitPin(null);
    }
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
    } else if (exitPin === null) {
      // Hover stays ephemeral: with nothing pinned it scrubs the entry;
      // with an entry pinned it previews the exit. A locked trade holds.
      setScrub(idxFromEvent(e));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const info = downRef.current;
    downRef.current = null;
    if (!geom || !info) return;
    const idx = idxFromEvent(e);
    if (info.moved) {
      // A drag released on a session keeps it — as the entry, or as the
      // exit once an entry exists.
      if (pinned === null) setPinned(idx);
      else if (idx !== pinned) setExitPin(idx);
    } else if (pinned === null) {
      // First click pins the entry.
      setPinned(idx);
    } else if (idx === pinned || idx === exitPin) {
      // Clicking a handle releases it.
      releasePinAt(idx);
    } else if (exitPin === null) {
      // Second click closes the trade.
      setExitPin(idx);
    } else {
      // Trade locked: a click elsewhere moves the exit.
      setExitPin(idx);
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
      if (scrub === null && exitPin !== null) {
        // The newest handle moves — a locked trade steps its exit.
        setExitPin(Math.min(geom.n, Math.max(0, exitPin + delta)));
      } else if (scrub === null && pinned !== null) {
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
      const idx = scrub ?? exitPin ?? pinned;
      if (idx === null) return;
      if (pinned === null) {
        setPinned(idx);
      } else if (idx === pinned || idx === exitPin) {
        releasePinAt(idx);
      } else {
        setExitPin(idx);
      }
      setScrub(null);
    } else if (e.key === "Escape") {
      // Stage by stage: live scrub, then the exit, then the entry.
      if (scrub !== null) setScrub(null);
      else if (exitPin !== null) setExitPin(null);
      else setPinned(null);
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
    /** Round-trip mode: the exit chip, else null (exit = today). */
    soldChip: string | null;
    /** "+28.1%/YR" once the hold is a quarter or longer, else null. */
    perYear: string | null;
    sessions: number;
    /** Slice index each chip releases (lo may be the exit pin after a
     *  leftward second click — releasePinAt sorts it out). */
    loIdx: number;
    hiIdx: number;
  } | null = null;

  if (geom) {
    const { sliced, closes, n } = geom;
    // Two live points price a round trip, chronologically — a second
    // click left of the entry simply becomes the entry.
    const hasRange = pinned !== null && exitIdx !== null && exitIdx !== pinned;
    const loIdx = hasRange ? Math.min(pinned!, exitIdx!) : (scrubIdx ?? 0);
    const hiIdx = hasRange ? Math.max(pinned!, exitIdx!) : n;
    const entry = closes[loIdx];
    const exit = closes[hiIdx];
    const wiPct = (exit / entry - 1) * 100;
    const sessions = hiIdx - loIdx;
    const perYearPct =
      sessions >= 63 ? (Math.pow(exit / entry, 252 / sessions) - 1) * 100 : null;
    whatIf = {
      chip: fmtChipDate(parseSessionDate(sliced[loIdx].date)),
      value: fmtMoney((10000 * exit) / entry),
      pct: fmtSignedPct(wiPct, 1),
      neg: wiPct < 0,
      soldChip:
        hasRange && hiIdx !== n
          ? fmtChipDate(parseSessionDate(sliced[hiIdx].date))
          : hasRange
            ? "TODAY"
            : null,
      perYear:
        hasRange && perYearPct !== null
          ? `${fmtSignedPct(perYearPct, 1)}/YR`
          : null,
      sessions,
      loIdx,
      hiIdx,
    };
  }

  return (
    <section
      className="chart"
      ref={chartRef}
      data-run={onScreen ? "true" : "false"}
    >
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
        aria-label={`VEQT closing price, ${meta.label.toLowerCase()}${rangeStamp}. Drag to inspect a session. Click, Enter, or Space pins the what-if entry; a second click sets the exit and prices the round trip. Left and right arrow keys step one session; Escape clears one stage at a time. Marked squares are extreme sessions that open the almanac.`}
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
        {geom && (scrubIdx !== null || pinned !== null) && (
          <div className="scrub" aria-hidden>
            {/* The held range — a whisper of tint between the two points */}
            {pinned !== null && exitIdx !== null && exitIdx !== pinned && (
              <div
                className="band"
                style={{
                  left: `${geom.xPct(Math.min(pinned, exitIdx))}%`,
                  width: `${
                    geom.xPct(Math.max(pinned, exitIdx)) -
                    geom.xPct(Math.min(pinned, exitIdx))
                  }%`,
                }}
              />
            )}
            {/* Locked handles — ink dots; the moving point stays the red */}
            {pinned !== null && (
              <>
                <div
                  className="vline is-held"
                  style={{ left: `${geom.xPct(pinned)}%` }}
                />
                <div
                  className="pdot"
                  style={{
                    left: `${geom.xPct(pinned)}%`,
                    top: `${geom.yPct(geom.closes[pinned])}%`,
                  }}
                />
              </>
            )}
            {exitPin !== null && geom && exitPin <= geom.n && (
              <>
                <div
                  className="vline is-held"
                  style={{ left: `${geom.xPct(exitPin)}%` }}
                />
                <div
                  className="pdot"
                  style={{
                    left: `${geom.xPct(exitPin)}%`,
                    top: `${geom.yPct(geom.closes[exitPin])}%`,
                  }}
                />
              </>
            )}
            {scrubIdx !== null && (
              <>
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
                  {pinAtScrub && (
                    <span
                      className={`tip-state ${
                        pinAtScrub.state === "gale" ? "is-neg" : ""
                      }`}
                    >
                      {pinAtScrub.state === "gale" ? "GALE" : "RALLY"} ·{" "}
                    </span>
                  )}
                  <span className="tip-date">
                    {fmtChipDate(parseSessionDate(geom.sliced[scrubIdx].date))}
                  </span>
                  <span className="tip-price">
                    ${fmtPrice(geom.closes[scrubIdx])}
                  </span>
                  <span
                    className={`tip-delta ${
                      geom.closes[scrubIdx] <
                      geom.closes[pinned !== null ? pinned : 0]
                        ? "is-neg"
                        : ""
                    }`}
                  >
                    {fmtSignedPct(
                      (geom.closes[scrubIdx] /
                        geom.closes[pinned !== null ? pinned : 0] -
                        1) *
                        100,
                      1
                    )}{" "}
                    {pinned !== null ? "vs. entry" : "vs. start"}
                  </span>
                </div>
              </>
            )}
          </div>
        )}
        {/* The tape's memory — P98+ sessions, clickable into the almanac.
            pointerdown/up stop here so reading a pin never moves the
            what-if; hover still scrubs, which is what folds the state
            word into the tooltip. */}
        {geom && slicePins.length > 0 && (
          <div className="pinlayer">
            {slicePins.map((p) => (
              <Link
                key={p.idx}
                href={`/almanac/${geom.sliced[p.idx].date}`}
                className={`wpin ${p.state === "gale" ? "is-gale" : ""}`}
                style={{
                  left: `${geom.xPct(p.idx)}%`,
                  top: `${geom.yPct(geom.closes[p.idx])}%`,
                }}
                aria-label={`${p.state === "gale" ? "Gale" : "Rally"} — ${
                  p.r < 0 ? "down" : "up"
                } ${Math.abs(p.r).toFixed(1)}% on ${fmtChipDate(
                  parseSessionDate(geom.sliced[p.idx].date)
                )} — read the almanac dispatch`}
                onPointerDown={(e) => e.stopPropagation()}
                onPointerUp={(e) => e.stopPropagation()}
              />
            ))}
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
            {whatIf.loIdx === pinned || whatIf.loIdx === exitPin ? (
              <button
                type="button"
                className="wif-chip is-pinned"
                onClick={() => releasePinAt(whatIf!.loIdx)}
                aria-label={`Release pinned entry ${whatIf.chip}`}
                title="Release pinned entry"
              >
                {whatIf.chip} <span aria-hidden>×</span>
              </button>
            ) : (
              <span className="wif-chip">{whatIf.chip}</span>
            )}
            {whatIf.soldChip !== null && (
              <>
                <span>SOLD</span>
                {whatIf.hiIdx === pinned || whatIf.hiIdx === exitPin ? (
                  <button
                    type="button"
                    className="wif-chip is-pinned"
                    onClick={() => releasePinAt(whatIf!.hiIdx)}
                    aria-label={`Release pinned exit ${whatIf.soldChip}`}
                    title="Release pinned exit"
                  >
                    {whatIf.soldChip} <span aria-hidden>×</span>
                  </button>
                ) : (
                  <span className="wif-chip">{whatIf.soldChip}</span>
                )}
              </>
            )}
            <span>IS</span>
            <span className="wif-val">{whatIf.value}</span>
            {whatIf.soldChip === null ? <span>TODAY ·</span> : <span>·</span>}
            <span className={`wif-pct ${whatIf.neg ? "is-neg" : ""}`}>
              {whatIf.pct}
            </span>
            {whatIf.perYear !== null && (
              <span className={`wif-ann ${whatIf.neg ? "is-neg" : ""}`}>
                · {whatIf.perYear}
              </span>
            )}
            {whatIf.soldChip !== null && (
              <span className="wif-sess">· {whatIf.sessions} SESSIONS</span>
            )}
            {/* Instructions are explanatory captions, not labels — sentence
                case since Turn 8 (they were pre-uppercased constants). */}
            <span className="wif-hint">
              {pinned === null
                ? "Drag the chart to re-run any entry point · click to pin"
                : exitPin === null
                  ? "Entry pinned — click a second date to close the trade"
                  : "Round trip locked — × a chip or press Esc"}
            </span>
          </div>
          <div className="wif-m">
            <span className="wif-lead">WHAT IF —</span> $10,000 ON{" "}
            {pinned !== null ? (
              <button
                type="button"
                className="wif-chip wif-chip-sm is-pinned"
                onClick={() => {
                  setPinned(null);
                  setExitPin(null);
                }}
                aria-label={`Release pinned entry ${whatIf.chip}`}
              >
                {whatIf.chip} <span aria-hidden>×</span>
              </button>
            ) : (
              <span className="wif-chip wif-chip-sm">{whatIf.chip}</span>
            )}{" "}
            {whatIf.soldChip !== null && (
              <>
                → <span className="wif-chip wif-chip-sm">{whatIf.soldChip}</span>{" "}
              </>
            )}
            IS <span className="wif-m-val">{whatIf.value}</span> ·{" "}
            <span className={`wif-m-pct ${whatIf.neg ? "is-neg" : ""}`}>
              {whatIf.pct}
            </span>
            {whatIf.perYear !== null && (
              <span className={`wif-m-pct ${whatIf.neg ? "is-neg" : ""}`}>
                {" "}
                · {whatIf.perYear}
              </span>
            )}
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
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
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
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
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
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.12em;
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

        /* Off-screen parking (see components/home/useOnScreen): the two
           infinite loops on this module stop repainting once the chart
           scrolls away. Deliberately not listed: .line's ins-drawIn is a
           one-shot entrance, and .sdot/.vline are transient — they only
           exist while a pointer is on the plot. */
        .chart[data-run="false"] .hint,
        .chart[data-run="false"] .edot {
          animation-play-state: paused;
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
        /* A held handle's line whispers; the live line stays full ink. */
        .vline.is-held {
          background: var(--ins-hair);
        }
        /* The held range — tint quiet enough to sit under the line. */
        .band {
          position: absolute;
          top: 0;
          bottom: 0;
          background: color-mix(in srgb, var(--ins-ink) 4.5%, transparent);
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
        /* Locked handles — ink dots; red stays with the moving point. */
        .pdot {
          position: absolute;
          width: 9px;
          height: 9px;
          border-radius: 999px;
          background: var(--ins-ink);
          border: 2px solid var(--ins-paper);
          box-shadow: 0 0 0 1px var(--ins-ink);
          transform: translate(-50%, -50%);
        }

        /* ── The tape's memory — almanac pins ───────────────────── */
        .pinlayer {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }
        /* styled-jsx does not tag <Link>; scope the pins via :global.
           6px squares (radius 0 — the grammar reserves circles for live
           dots): rallies in ink, gales in the signal red, both ringed in
           paper so they read against the line. The ::after overlay grows
           the touch target without growing the mark. */
        .pinlayer :global(.wpin) {
          position: absolute;
          width: 6px;
          height: 6px;
          transform: translate(-50%, -50%);
          background: var(--ins-ink);
          box-shadow: 0 0 0 1.5px var(--ins-paper);
          pointer-events: auto;
          transition: transform 0.12s ease;
        }
        .pinlayer :global(.wpin.is-gale) {
          background: var(--ins-signal);
        }
        .pinlayer :global(.wpin:hover),
        .pinlayer :global(.wpin:focus-visible) {
          transform: translate(-50%, -50%) scale(1.5);
        }
        .pinlayer :global(.wpin:focus-visible) {
          outline: 2px solid var(--ins-signal);
          outline-offset: 3px;
        }
        .pinlayer :global(.wpin::after) {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 26px;
          height: 26px;
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
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          text-transform: uppercase;
        }
        /* The state word a pin folds into the tooltip — rally in ink,
           gale in the red that already means down. */
        .tip-state {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.12em;
          color: var(--ins-ink);
        }
        .tip-state.is-neg {
          color: var(--ins-signal);
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

        /* Loading — ink-tint skeleton, no spinner.
           The "animation: none" matters: this class name collides with the
           global .skeleton in globals.css, which runs an infinite
           background-position shimmer. That gradient is fully painted over
           by the flat ink tint below, so the animation was invisible — but
           still repainting this element every frame for as long as the
           chart was loading. */
        .skeleton {
          position: absolute;
          inset: 0 0 1px;
          background: color-mix(in srgb, var(--ins-ink) 6%, transparent);
          animation: none;
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
        /* Round-trip extras: the per-year figure carries near-value
           weight; the session count stays a micro-label. */
        .wif-ann {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0;
          color: var(--ins-ink);
        }
        .wif-ann.is-neg {
          color: var(--ins-signal);
        }
        .wif-sess {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
        }
        /* The row's one caption: sentence case, 12px, tracking off. It sits
           1px larger than the caps copy beside it and still reads quieter —
           caps + 0.14em tracking + w800 is what carries weight here, not
           the point size. */
        .wif-hint {
          margin-left: auto;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
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
            font-size: 10px;
            letter-spacing: 0.14em;
          }
          .hint {
            font-size: 10px;
            letter-spacing: 0.1em;
          }
          .hd-right {
            gap: 12px;
          }
          /* One notch of padding buys back the width the 10px floor
             cost the header row, so the label + hint + five tabs still
             fit one line at 390. */
          .tab {
            padding: 5px 8px;
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
