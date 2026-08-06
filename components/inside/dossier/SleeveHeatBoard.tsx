"use client";

import { useEffect, useMemo, useState } from "react";
import {
  UP,
  DOWN,
  HATCH_KEY,
  fmtSignedPct,
  fmtChipDate,
  heatColor,
  isDownCell,
  parseSessionDate,
} from "@/lib/instrument-format";
import { useArmOnView } from "../useArmOnView";

const RANGES = ["1Y", "ALL"] as const;
type BoardRange = (typeof RANGES)[number];

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const YEAR_SESSIONS = 252;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

/** White gap + ink ring — the pinned/latest cell marker. */
const PIN_RING = "0 0 0 1.5px #ffffff, 0 0 0 3px #111111";

/* Fill sweep — same caps as the VEQT board: flat 2ms per cell, total
   stagger capped so ALL (~1,650 sessions) wipes rather than drags. */
const CELL_STEP_MS = 2;
const SWEEP_CAP_MS = 1500;
const RING_BEAT_MS = 180;

interface ChartPoint {
  date: string;
  close: number;
}

interface DayCell {
  date: string;
  pct: number;
  col: number;
  row: number;
}

function mondayOf(d: Date): number {
  const back = (d.getUTCDay() + 6) % 7;
  return d.getTime() - back * DAY_MS;
}

function cellLabel(iso: string, pct: number): string {
  const d = parseSessionDate(iso);
  const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  return `${WEEKDAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} — ${dir} ${Math.abs(pct).toFixed(1)}%`;
}

/**
 * The sleeve's own session board (dossier module) — the year-on-tape
 * grammar read for one sleeve instead of the whole fund.
 *
 * Same instrument as the VEQT board at the same zoom levels (1Y / ALL,
 * where ALL = since Jan 2019, the chart API's VEQT frame), same heat
 * ramp and red-blind hatch (shared preference key, so the reader's
 * direction setting follows them across every board on the site).
 * Simpler by intent: the pin is local state — no ?date= deep link, the
 * dossier page is itself the shareable unit.
 */
export default function SleeveHeatBoard({
  ticker,
  points,
  loading,
}: {
  ticker: string;
  points: ChartPoint[];
  loading: boolean;
}) {
  const [range, setRange] = useState<BoardRange>("1Y");
  const [hover, setHover] = useState<number | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const [hatch, setHatch] = useState(false);

  /* Same SSR-safe hatch read as the other two boards (see InsideHeatBoard). */
  useEffect(() => {
    try {
      if (window.localStorage.getItem(HATCH_KEY) === "1") setHatch(true);
    } catch {
      /* storage unavailable — the default (off) stands */
    }
  }, []);

  const toggleHatch = () => {
    const next = !hatch;
    setHatch(next);
    try {
      window.localStorage.setItem(HATCH_KEY, next ? "1" : "0");
    } catch {
      /* storage unavailable — the toggle still works for this session */
    }
  };

  const cells = useMemo<DayCell[]>(() => {
    if (points.length < 2) return [];
    const start =
      range === "1Y" ? Math.max(1, points.length - YEAR_SESSIONS) : 1;
    const firstMonday = mondayOf(parseSessionDate(points[start].date));
    const out: DayCell[] = [];
    for (let i = start; i < points.length; i++) {
      const prev = points[i - 1].close;
      const pct = prev > 0 ? ((points[i].close - prev) / prev) * 100 : 0;
      const d = parseSessionDate(points[i].date);
      const row = Math.min(Math.max(d.getUTCDay(), 1), 5);
      const col = Math.round((mondayOf(d) - firstMonday) / WEEK_MS) + 1;
      out.push({ date: points[i].date, pct, col, row });
    }
    return out;
  }, [points, range]);

  const stats = useMemo(() => {
    let up = 0;
    let best: DayCell | null = null;
    let worst: DayCell | null = null;
    for (const c of cells) {
      if (c.pct > 0) up++;
      if (best === null || c.pct > best.pct) best = c;
      if (worst === null || c.pct < worst.pct) worst = c;
    }
    return { total: cells.length, up, best, worst };
  }, [cells]);

  const pinnedIdx = useMemo(() => {
    if (pinned) {
      const i = cells.findIndex((c) => c.date === pinned);
      if (i >= 0) return i;
    }
    return cells.length - 1;
  }, [cells, pinned]);

  const readIdx = hover ?? pinnedIdx;
  const readCell = readIdx >= 0 ? (cells[readIdx] ?? null) : null;
  const readNegative = (readCell?.pct ?? 0) < 0;

  const showSkeleton = loading || cells.length === 0;
  const { ref: gridRef, armed } = useArmOnView<HTMLDivElement>(!showSkeleton);

  const sweep = useMemo(() => {
    const n = cells.length;
    const stepMs = n > 0 ? Math.min(CELL_STEP_MS, SWEEP_CAP_MS / n) : CELL_STEP_MS;
    return { stepMs, ringMs: Math.max(0, n - 1) * stepMs + RING_BEAT_MS };
  }, [cells.length]);

  return (
    <section className="stape" aria-label={`${ticker} sessions on file`}>
      <div className="stape__head">
        <div>
          <div className="stape__kicker">Sessions on file</div>
          <h2 className="stape__display">{ticker}, on tape.</h2>
        </div>
        <div className="stape__tabs" role="tablist" aria-label="Session range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === range}
              className={`stape__tab${r === range ? " is-active" : ""}`}
              onClick={() => {
                setRange(r);
                setHover(null);
                setPinned(null);
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="stape__stats">
        <div className="stape__stat">
          <div className="stape__stat-label">Sessions</div>
          <div className="stape__stat-value">
            {stats.total > 0 ? stats.total : "—"}
          </div>
          <div className="stape__stat-sub">
            {stats.total > 0
              ? range === "1Y"
                ? "Last trading year"
                : "Since Jan 2019"
              : "—"}
          </div>
        </div>
        <div className="stape__stat">
          <div className="stape__stat-label">Up days</div>
          <div className="stape__stat-value">
            {stats.total > 0 ? stats.up : "—"}
          </div>
          <div className="stape__stat-sub">
            {stats.total > 0
              ? `${Math.round((stats.up / stats.total) * 100)}% of sessions`
              : "—"}
          </div>
        </div>
        <div className="stape__stat">
          <div className="stape__stat-label">Best day</div>
          <div className="stape__stat-value">
            {stats.best ? fmtSignedPct(stats.best.pct) : "—"}
          </div>
          <div className="stape__stat-sub">
            {stats.best ? fmtChipDate(parseSessionDate(stats.best.date)) : "—"}
          </div>
        </div>
        <div className="stape__stat">
          <div className="stape__stat-label">Worst day</div>
          <div className="stape__stat-value is-signal">
            {stats.worst ? fmtSignedPct(stats.worst.pct) : "—"}
          </div>
          <div className="stape__stat-sub">
            {stats.worst
              ? fmtChipDate(parseSessionDate(stats.worst.date))
              : "—"}
          </div>
        </div>
      </div>

      {readCell && (
        <div className="stape__readout">
          <span className="stape__read-left">
            {hover !== null ? "Selected" : pinned ? "Pinned" : "Latest"} ·{" "}
            <span className="stape__read-date">
              {fmtChipDate(parseSessionDate(readCell.date))}
            </span>
          </span>
          <span className={`stape__read-pct${readNegative ? " is-neg" : ""}`}>
            {readNegative ? DOWN : UP} {fmtSignedPct(readCell.pct)}
          </span>
        </div>
      )}

      {showSkeleton ? (
        <div className="stape__skeleton" aria-hidden />
      ) : (
        <div
          className="stape__scroll"
          ref={gridRef}
          data-armed={armed ? "true" : "false"}
        >
          {/* Keyed by range so a tab switch replays the wipe; pinning is
              local state and never re-runs it. */}
          <div
            className="stape__grid"
            key={range}
            onPointerLeave={() => setHover(null)}
          >
            {cells.map((c, i) => (
              <button
                key={c.date}
                type="button"
                aria-label={cellLabel(c.date, c.pct)}
                title={cellLabel(c.date, c.pct)}
                className={`stape__cell${
                  hatch && isDownCell(c.pct) ? " is-hatched" : ""
                }`}
                /* backgroundColor, not the shorthand — hatch layers an image. */
                style={
                  {
                    gridColumn: c.col,
                    gridRow: c.row,
                    backgroundColor: heatColor(c.pct),
                    boxShadow: i === pinnedIdx ? PIN_RING : undefined,
                    "--d": `${(i === pinnedIdx ? sweep.ringMs : i * sweep.stepMs).toFixed(1)}ms`,
                  } as React.CSSProperties
                }
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => setPinned(c.date)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="stape__foot">
        <div className="stape__legend">
          <span className="stape__legend-neg">−2%</span>
          <span className="stape__legend-grad" aria-hidden />
          <span className="stape__legend-pos">+2%</span>
          <button
            type="button"
            className={`stape__hatch${hatch ? " is-on" : ""}`}
            aria-pressed={hatch}
            aria-describedby="stape-hatch-note"
            onClick={toggleHatch}
          >
            <span className="stape__hatch-box" aria-hidden />
            Hatch
          </button>
          <span id="stape-hatch-note" className="stape__hatch-note">
            Hatch marks down days
          </span>
        </div>
        <span className="stape__caption">
          One cell per trading day · weeks as columns · click to pin
        </span>
      </div>

      <style jsx>{`
        .stape {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .stape__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .stape__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .stape__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .stape__tabs {
          display: inline-flex;
          border: 1px solid var(--ins-ink);
        }
        /* TRUE LABEL — a tab names a window. */
        .stape__tab {
          appearance: none;
          background: var(--ins-paper);
          border: none;
          border-right: 1px solid var(--ins-ink);
          padding: 6px 14px;
          font-family: var(--ins-font);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--ins-ink);
          cursor: pointer;
        }
        .stape__tab:last-child {
          border-right: none;
        }
        .stape__tab:hover {
          background: var(--ins-track-soft);
        }
        .stape__tab.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }
        .stape__tab:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: -2px;
        }

        /* ── Facts strip ────────────────────────────────────────── */
        .stape__stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
          margin-top: 14px;
          border-top: 1px solid var(--ins-ink);
        }
        .stape__stat {
          padding-top: 12px;
          min-width: 0;
        }
        .stape__stat + .stape__stat {
          border-left: 1px solid var(--ins-hair-soft);
          padding-left: 20px;
        }
        /* TRUE LABEL. */
        .stape__stat-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .stape__stat-value {
          margin-top: 5px;
          font-size: 22px;
          font-weight: 700;
        }
        .stape__stat-value.is-signal {
          color: var(--ins-signal);
        }
        /* EXPLANATORY CAPTION. */
        .stape__stat-sub {
          margin-top: 3px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        /* ── Readout ────────────────────────────────────────────── */
        .stape__readout {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 16px;
          margin-top: 14px;
          border-top: 1px solid var(--ins-hair);
          padding-top: 9px;
        }
        .stape__read-left {
          font-size: 12px;
          font-weight: 500;
          color: var(--ins-gray-600);
        }
        .stape__read-date {
          font-weight: 700;
          color: var(--ins-ink);
        }
        .stape__read-pct {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .stape__read-pct.is-neg {
          color: var(--ins-signal);
        }

        /* ── Grid ───────────────────────────────────────────────── */
        .stape__scroll {
          margin-top: 12px;
          overflow-x: auto;
        }
        .stape__grid {
          display: grid;
          grid-template-rows: repeat(5, 16px);
          grid-auto-flow: column;
          grid-auto-columns: minmax(6px, 1fr);
          gap: 2px;
          min-width: 100%;
        }
        .stape__cell {
          appearance: none;
          border: none;
          padding: 0;
          border-radius: 2px;
          cursor: pointer;
        }
        .stape__cell:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 1px;
        }
        /* Hatch overlay — identical rule to the other boards (literal white:
           the cells are literal by spec). */
        .stape__cell.is-hatched {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.55) 0 1px,
            transparent 1px 4px
          );
        }
        /* Fill sweep only under [data-armed] — un-armed is the finished board. */
        .stape__scroll[data-armed="true"] .stape__cell {
          animation: ins-sleeveCellIn 260ms ease-out both;
          animation-delay: var(--d, 0ms);
        }
        @keyframes ins-sleeveCellIn {
          from {
            opacity: 0;
            transform: scale(0.55);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .stape__skeleton {
          height: 88px;
          margin-top: 12px;
          background: rgba(17, 17, 17, 0.06);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }

        /* ── Legend + hatch ─────────────────────────────────────── */
        .stape__foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 10px;
        }
        .stape__legend {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .stape__legend-neg,
        .stape__legend-pos {
          font-size: 10px;
          font-weight: 700;
        }
        .stape__legend-neg {
          color: var(--ins-signal);
        }
        /* Hand-written literal of lib/instrument-format's heat ramp —
           regenerate by hand if the ramp changes (same note as the other
           boards). */
        .stape__legend-grad {
          width: 180px;
          height: 7px;
          border: 1px solid var(--ins-hair);
          background: linear-gradient(
            90deg,
            rgba(232, 68, 46, 0.92) 0%,
            rgba(232, 68, 46, 0.71) 25%,
            rgba(232, 68, 46, 0.2) 49%,
            #f3f3f3 49%,
            #f3f3f3 51%,
            rgba(17, 17, 17, 0.1) 51%,
            rgba(17, 17, 17, 0.69) 75%,
            rgba(17, 17, 17, 0.92) 100%
          );
        }
        /* Instrument checkbox grammar — 44px target via padding. */
        .stape__hatch {
          appearance: none;
          background: none;
          border: none;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 15px 8px;
          font-family: var(--ins-font);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          cursor: pointer;
        }
        .stape__hatch-box {
          width: 12px;
          height: 12px;
          border: 1px solid var(--ins-ink);
          background: transparent;
        }
        .stape__hatch.is-on {
          color: var(--ins-ink);
        }
        .stape__hatch.is-on .stape__hatch-box {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(17, 17, 17, 0.85) 0 1px,
            transparent 1px 3px
          );
        }
        .stape__hatch:focus-visible {
          outline: 2px solid var(--ins-signal);
        }
        /* EXPLANATORY CAPTION. */
        .stape__hatch-note,
        .stape__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        @media (max-width: 640px) {
          .stape {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .stape__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .stape__stats {
            grid-template-columns: 1fr 1fr;
            gap: 0 20px;
            border-top: none;
          }
          .stape__stat {
            padding: 10px 0;
            border-top: 1px solid var(--ins-ink);
          }
          .stape__stat:nth-child(-n + 2) {
            border-top-width: 2px;
          }
          .stape__stat + .stape__stat {
            border-left: none;
            padding-left: 0;
          }
          .stape__stat-value {
            font-size: 18px;
          }
          .stape__grid {
            grid-template-rows: repeat(5, 13px);
            grid-auto-columns: minmax(9px, 1fr);
          }
          .stape__skeleton {
            height: 73px;
          }
          .stape__foot {
            display: block;
          }
          .stape__legend-neg,
          .stape__legend-pos,
          .stape__legend-grad {
            display: none;
          }
          .stape__hatch {
            padding-left: 0;
          }
          .stape__caption {
            display: block;
            margin-top: 2px;
          }
        }
      `}</style>
    </section>
  );
}
