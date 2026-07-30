"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";
import {
  UP,
  DOWN,
  fmtSignedPct,
  fmtChipDate,
  parseSessionDate,
} from "@/lib/instrument-format";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeatmapCardProps {
  history: HistoricalDataPoint[];
  loading: boolean;
  todayChangePercent: number | null;
}

interface DayCell {
  date: string;
  pct: number;
  /** 1-based grid column (calendar week) */
  col: number;
  /** 1-based grid row (Mon=1 … Fri=5) */
  row: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RANGES = ["30D", "90D", "YTD", "1Y"] as const;
type SessionRange = (typeof RANGES)[number];

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const TODAY_RING = "0 0 0 1.5px #ffffff, 0 0 0 3px #111111";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Start index of the slice for a range (same slicing behavior as before). */
function sliceStart(history: HistoricalDataPoint[], range: SessionRange): number {
  if (range === "30D") return Math.max(0, history.length - 30);
  if (range === "90D") return Math.max(0, history.length - 90);
  if (range === "1Y") return Math.max(0, history.length - 252);
  // YTD — first session of the last point's calendar year
  const year = parseSessionDate(
    history[history.length - 1]?.date ?? ""
  ).getUTCFullYear();
  const idx = history.findIndex((h) => h.date.startsWith(`${year}-`));
  return Math.max(0, idx);
}

/** Timestamp of the Monday (00:00-ish UTC anchor) of the week containing d. */
function mondayOf(d: Date): number {
  const back = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  return d.getTime() - back * DAY_MS;
}

/** Handoff heat function — literal colors by spec (stays fixed under editions). */
function heatColor(pct: number): string {
  if (Math.abs(pct) < 0.03) return "rgba(17,17,17,0.05)";
  const a = Math.min(0.92, 0.1 + (Math.abs(pct) / 1.4) * 0.82).toFixed(2);
  return pct >= 0 ? `rgba(17,17,17,${a})` : `rgba(232,68,46,${a})`;
}

/** "Mon Jun 29 — down 0.4%" (a11y label + title, per pre-flight #4). */
function cellLabel(iso: string, pct: number): string {
  const d = parseSessionDate(iso);
  const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  return `${WEEKDAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} — ${dir} ${Math.abs(pct).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Component — "The session board."
// ---------------------------------------------------------------------------

export default function HeatmapCard({
  history,
  loading,
  todayChangePercent,
}: HeatmapCardProps) {
  const router = useRouter();
  const [range, setRange] = useState<SessionRange>("90D");
  const [hover, setHover] = useState<number | null>(null);

  // Day cells: pct vs. previous close (uses the close before the slice when
  // available), placed on real calendar weeks — columns = weeks, rows = Mon–Fri.
  const cells = useMemo<DayCell[]>(() => {
    if (history.length === 0) return [];
    const start = sliceStart(history, range);
    const firstMonday = mondayOf(parseSessionDate(history[start].date));
    const out: DayCell[] = [];
    for (let i = start; i < history.length; i++) {
      const close = history[i].close;
      const prev = i > 0 ? history[i - 1].close : close;
      const pct = prev > 0 ? ((close - prev) / prev) * 100 : 0;
      const d = parseSessionDate(history[i].date);
      const row = Math.min(Math.max(d.getUTCDay(), 1), 5); // clamp to Mon–Fri
      const col = Math.round((mondayOf(d) - firstMonday) / WEEK_MS) + 1;
      out.push({ date: history[i].date, pct, col, row });
    }
    return out;
  }, [history, range]);

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

  const sessionsSub =
    range === "YTD" ? "YEAR TO DATE" : `LAST ${stats.total} TRADING DAYS`;

  // Readout — hover a cell → SELECTED · date · that day's move; grid
  // pointerleave reverts to TODAY + live todayChangePercent.
  const lastCell = cells.length > 0 ? cells[cells.length - 1] : null;
  const hovered = hover !== null ? cells[hover] ?? null : null;
  const readCell = hovered ?? lastCell;
  const readPct = hovered
    ? hovered.pct
    : todayChangePercent ?? lastCell?.pct ?? 0;
  const readUpish = readPct >= 0;

  const pickRange = (r: SessionRange) => {
    setRange(r);
    setHover(null);
  };

  const showSkeleton = loading || cells.length === 0;

  return (
    <section className="board" aria-label="The session board">
      {/* Head: eyebrow + display + range tabs */}
      <div className="board__head">
        <div>
          <div className="board__eyebrow">SESSIONS ON FILE</div>
          <h2 className="board__display">The session board.</h2>
        </div>
        <div className="board__tabs" role="tablist" aria-label="Session range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === range}
              className={`board__tab${r === range ? " is-active" : ""}`}
              onClick={() => pickRange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Stat strip — desktop: 4 equal columns between hairline rules */}
      <div className="board__stats">
        <div className="board__stat">
          <div className="board__stat-label">SESSIONS</div>
          <div className="board__stat-value">
            {stats.total > 0 ? stats.total : "—"}
          </div>
          <div className="board__stat-sub">
            {stats.total > 0 ? sessionsSub : "—"}
          </div>
        </div>
        <div className="board__stat">
          <div className="board__stat-label">UP DAYS</div>
          <div className="board__stat-value">
            {stats.total > 0 ? stats.up : "—"}
          </div>
          <div className="board__stat-sub">
            {stats.total > 0
              ? `${Math.round((stats.up / stats.total) * 100)}% OF SESSIONS`
              : "—"}
          </div>
        </div>
        <div className="board__stat">
          <div className="board__stat-label">BEST DAY</div>
          <div className="board__stat-value">
            {stats.best ? fmtSignedPct(stats.best.pct) : "—"}
          </div>
          <div className="board__stat-sub">
            {stats.best ? fmtChipDate(parseSessionDate(stats.best.date)) : "—"}
          </div>
        </div>
        <div className="board__stat">
          <div className="board__stat-label">WORST DAY</div>
          <div className="board__stat-value board__stat-value--signal">
            {stats.worst ? fmtSignedPct(stats.worst.pct) : "—"}
          </div>
          <div className="board__stat-sub">
            {stats.worst
              ? fmtChipDate(parseSessionDate(stats.worst.date))
              : "—"}
          </div>
        </div>
      </div>

      {/* Readout row */}
      {readCell && (
        <div className="board__readout">
          <span className="board__read-left">
            {hovered ? "SELECTED" : "TODAY"} ·{" "}
            <span className="board__read-date">
              {fmtChipDate(parseSessionDate(readCell.date))}
            </span>
          </span>
          <span
            className={`board__read-pct${readUpish ? "" : " is-down"}`}
          >
            {readUpish ? UP : DOWN} {fmtSignedPct(readPct)}
          </span>
        </div>
      )}

      {/* Heat grid — weeks as columns, Mon–Fri as rows */}
      {showSkeleton ? (
        <div className="board__skeleton" aria-hidden />
      ) : (
        <div className="board__grid" onPointerLeave={() => setHover(null)}>
          {cells.map((c, i) => (
            <div
              key={c.date}
              role="img"
              aria-label={cellLabel(c.date, c.pct)}
              title={cellLabel(c.date, c.pct)}
              className="board__cell"
              style={{
                gridColumn: c.col,
                gridRow: c.row,
                background: heatColor(c.pct),
                boxShadow: i === cells.length - 1 ? TODAY_RING : undefined,
              }}
              onPointerEnter={() => setHover(i)}
              onClick={() => router.push(`/inside-veqt?date=${c.date}#heatmap`)}
            />
          ))}
        </div>
      )}

      {/* Legend + caption — desktop only */}
      <div className="board__foot">
        <div className="board__legend">
          <span className="board__legend-neg">−2%</span>
          <span className="board__legend-grad" aria-hidden />
          <span className="board__legend-pos">+2%</span>
        </div>
        <span className="board__caption">
          EACH CELL IS ONE TRADING DAY · WEEKS AS COLUMNS · HOVER FOR THE DATE
        </span>
        <Link href="/inside-veqt#heatmap" className="board__open-link">
          OPEN THE FULL BOARD <span aria-hidden>→</span>
        </Link>
      </div>

      {/* Mobile 2×2 stat strip — below the grid (08/09-ref) */}
      <div className="board__stats-m">
        <span>
          UP DAYS{" "}
          <b>
            {stats.total > 0 ? `${stats.up} / ${stats.total}` : "—"}
          </b>
        </span>
        <span>
          BEST <b>{stats.best ? fmtSignedPct(stats.best.pct) : "—"}</b>
        </span>
        <span>
          WORST{" "}
          <b className="is-signal">
            {stats.worst ? fmtSignedPct(stats.worst.pct) : "—"}
          </b>
        </span>
        <span>EACH CELL = ONE DAY</span>
        <Link href="/inside-veqt#heatmap" className="board__open-link">
          OPEN THE FULL BOARD <span aria-hidden>→</span>
        </Link>
      </div>

      <style jsx>{`
        .board {
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 12px;
          font-family: var(--ins-font);
          font-variant-numeric: tabular-nums;
          color: var(--ins-ink);
        }

        /* --- head ------------------------------------------------------- */
        .board__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 16px;
        }
        .board__eyebrow {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .board__display {
          margin: 6px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--ins-ink);
        }
        .board__tabs {
          display: flex;
          gap: 2px;
        }
        .board__tab {
          appearance: none;
          background: none;
          border: 1px solid transparent;
          border-radius: 0;
          padding: 4px 9px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          color: var(--ins-gray-600);
          cursor: pointer;
        }
        .board__tab:not(.is-active):hover {
          border-color: var(--ins-hair);
        }
        .board__tab.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }

        /* --- stat strip (desktop) ---------------------------------------- */
        .board__stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 16px;
          padding: 14px 0;
          border-top: 1px solid var(--ins-hair);
          border-bottom: 1px solid var(--ins-hair);
        }
        .board__stat {
          padding: 0 20px;
          border-left: 1px solid var(--ins-hair);
          min-width: 0;
        }
        .board__stat:first-child {
          padding-left: 0;
          border-left: 0;
        }
        .board__stat-label {
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .board__stat-value {
          margin-top: 3px;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.1;
          color: var(--ins-ink);
        }
        .board__stat-value--signal {
          color: var(--ins-signal);
        }
        .board__stat-sub {
          margin-top: 2px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }

        /* --- readout ------------------------------------------------------ */
        .board__readout {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-top: 14px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }
        .board__read-left {
          color: var(--ins-gray-600);
        }
        .board__read-date {
          color: var(--ins-ink);
        }
        .board__read-pct {
          color: var(--ins-ink);
        }
        .board__read-pct.is-down {
          color: var(--ins-signal);
        }

        /* --- heat grid ---------------------------------------------------- */
        .board__grid {
          display: grid;
          grid-template-rows: repeat(5, 20px);
          grid-auto-flow: column;
          grid-auto-columns: 1fr;
          gap: 3px;
          margin-top: 10px;
        }
        .board__cell {
          border-radius: 2px;
          cursor: pointer;
        }
        .board__skeleton {
          height: 112px; /* 5 × 20px rows + 4 × 3px gaps */
          margin-top: 10px;
          background: rgba(17, 17, 17, 0.06);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }

        /* --- legend + caption --------------------------------------------- */
        .board__foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: 14px;
        }
        .board__legend {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .board__legend-neg,
        .board__legend-pos {
          font-size: 8.5px;
          font-weight: 700;
          letter-spacing: 0.14em;
        }
        .board__legend-neg {
          color: var(--ins-signal);
        }
        .board__legend-pos {
          color: var(--ins-ink);
        }
        .board__legend-grad {
          width: 180px;
          height: 7px;
          border: 1px solid var(--ins-hair);
          background: linear-gradient(
            90deg,
            rgba(232, 68, 46, 0.88),
            rgba(232, 68, 46, 0.3),
            #f2f2f2,
            rgba(17, 17, 17, 0.3),
            rgba(17, 17, 17, 0.88)
          );
        }
        .board__caption {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
          text-align: right;
        }

        /* --- cross-link (styled-jsx skips <Link>, so :global under .board) -- */
        .board :global(.board__open-link) {
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-ink);
          text-decoration: none;
          border-bottom: 2px solid var(--ins-ink);
          padding-bottom: 4px;
          white-space: nowrap;
        }
        .board :global(.board__open-link:hover) {
          color: var(--ins-signal);
          border-bottom-color: var(--ins-signal);
        }

        /* --- mobile stat strip --------------------------------------------- */
        .board__stats-m {
          display: none;
        }

        /* --- mobile deltas -------------------------------------------------- */
        @media (max-width: 640px) {
          .board {
            border-top-width: 2px;
          }
          .board__eyebrow {
            font-size: 8.5px;
            letter-spacing: 0.2em;
          }
          .board__display {
            margin-top: 4px;
            font-size: 20px;
          }
          .board__tab {
            padding: 4px 8px;
            font-size: 8.5px;
          }
          .board__stats,
          .board__foot {
            display: none;
          }
          .board__readout {
            margin-top: 12px;
            font-size: 9px;
            letter-spacing: 0.12em;
          }
          .board__grid {
            grid-template-rows: repeat(5, 13px);
            gap: 2px;
            margin-top: 8px;
          }
          .board__skeleton {
            height: 73px; /* 5 × 13px rows + 4 × 2px gaps */
            margin-top: 8px;
          }
          .board__stats-m {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px 20px;
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px solid var(--ins-hair);
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.12em;
            color: var(--ins-gray-600);
          }
          .board__stats-m b {
            font-weight: 700;
            color: var(--ins-ink);
          }
          .board__stats-m b.is-signal {
            color: var(--ins-signal);
          }
          .board__stats-m :global(.board__open-link) {
            grid-column: 1 / -1;
            justify-self: end;
          }
        }
      `}</style>
    </section>
  );
}
