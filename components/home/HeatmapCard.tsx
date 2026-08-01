"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";
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

/* heatColor / isDownCell / FLAT_BAND / HATCH_KEY moved to
   lib/instrument-format.ts — /inside-veqt's InsideHeatBoard used to keep a
   verbatim copy of the ramp and drifted from this one, so the two boards now
   import the single definition (and share the hatch preference key). The
   legend gradient below is still a hand-written CSS literal and must be
   regenerated from that function whenever it changes. */

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
  const [hatch, setHatch] = useState(false);

  /* Hatch preference. SSR-safe by construction: the server and the first
     client render both paint `false`, so the markup matches on hydration,
     and the stored preference is applied on the pass after mount. Reading
     localStorage during render (or via a useState initialiser) would make
     the two disagree. The try/catch is not defensive padding — Safari's
     private mode and blocked-cookie settings throw on access, the same
     case lib/cache.ts guards. */
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
              className={`board__cell${
                hatch && isDownCell(c.pct) ? " is-hatched" : ""
              }`}
              /* backgroundColor, not the `background` shorthand — the hatch
                 class layers a background-image on top of it. */
              style={{
                gridColumn: c.col,
                gridRow: c.row,
                backgroundColor: heatColor(c.pct),
                boxShadow: i === cells.length - 1 ? TODAY_RING : undefined,
              }}
              onPointerEnter={() => setHover(i)}
              onClick={() => router.push(`/inside-veqt?date=${c.date}#heatmap`)}
            />
          ))}
        </div>
      )}

      {/* Legend + caption. Desktop shows the whole row; mobile keeps only
          the hatch toggle (see the media query) — the gradient and caption
          go, the direction control stays. */}
      <div className="board__foot">
        <div className="board__legend">
          <span className="board__legend-neg">−2%</span>
          <span className="board__legend-grad" aria-hidden />
          <span className="board__legend-pos">+2%</span>

          {/* Shape-codes direction for viewers who cannot separate the red
              ramp from the ink ramp by value alone. The cells' aria-labels
              already spell out up/down, so this is a visual aid only — no
              aria-live, nothing announced on toggle beyond the pressed
              state of the control itself. */}
          <button
            type="button"
            className={`board__hatch${hatch ? " is-on" : ""}`}
            aria-pressed={hatch}
            aria-describedby="board-hatch-note"
            onClick={toggleHatch}
          >
            <span className="board__hatch-box" aria-hidden />
            HATCH
          </button>
          <span className="board__hatch-note" id="board-hatch-note">
            Hatch marks down days
          </span>
        </div>
        <span className="board__caption">
          Each cell is one trading day · weeks as columns · hover for the date
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
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
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
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
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
          font-size: 10px;
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
        /* Hatch overlay — down days only, opt-in. 1px lines at 45° on a
           4px period, in literal paper white at low opacity so it reads as
           texture on the red rather than as a second colour. Literal, not
           var(--ins-paper): the cells themselves are literal by spec and
           stay red under the ink edition, so the marks must stay white
           there too. */
        .board__cell.is-hatched {
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.55) 0 1px,
            transparent 1px 4px
          );
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
          flex-wrap: wrap;
          gap: 10px 16px;
          /* was 14px — the hatch control now carries 17px of top padding
             of its own, so the row keeps its optical distance from the
             grid without stacking the two. */
          margin-top: 4px;
        }
        .board__legend {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .board__legend-neg,
        .board__legend-pos {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
        }
        .board__legend-neg {
          color: var(--ins-signal);
        }
        .board__legend-pos {
          color: var(--ins-ink);
        }
        /* Regenerated to read out heatColor() exactly, −2% → +2%:
             −2%  a 0.92 red   ·  −1%  a 0.71 red  ·  the 0.20 red floor
             0    the flat cell, rgba(17,17,17,0.05) over paper = #f3f3f3
             +1%  a 0.69 ink   ·  +2%  a 0.92 ink
           The hard stops either side of centre are not decoration — they
           are the floors, i.e. the step a cell takes the moment it stops
           being a flat day. The red step is the one this pass introduced. */
        .board__legend-grad {
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

        /* --- hatch toggle (Instrument checkbox grammar) -------------------- */
        /* The 44px target is padding: 11px box + 17px above and below = 45px
           tall, ~71px wide. The padding is left in flow rather than pulled
           back out with negative margins — a negative margin would put the
           tap area on top of the last row of heat cells, which are
           themselves clickable, and let the toggle steal their taps. The
           foot's top margin is reduced to pay for the height instead. */
        .board__hatch {
          appearance: none;
          background: none;
          border: 0;
          border-radius: 0;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 17px 10px;
          margin: 0 0 0 4px;
          font-family: inherit;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: var(--ins-gray-600);
          cursor: pointer;
        }
        .board__hatch.is-on {
          color: var(--ins-ink);
        }
        .board__hatch:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 2px;
        }
        .board__hatch-box {
          width: 11px;
          height: 11px;
          flex: none;
          border: 1.5px solid var(--ins-ink);
          background: var(--ins-paper);
        }
        /* The swatch prints the mark it switches on. */
        .board__hatch.is-on .board__hatch-box {
          background-color: var(--ins-ink);
          background-image: repeating-linear-gradient(
            45deg,
            rgba(255, 255, 255, 0.9) 0 1px,
            transparent 1px 3px
          );
        }
        .board__hatch-note {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0;
          text-transform: none;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }
        /* Explanatory caption since Turn 8 — a sentence, not a label. */
        .board__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
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
            font-size: 10px;
            letter-spacing: 0.14em;
          }
          .board__display {
            margin-top: 4px;
            font-size: 20px;
          }
          /* Range tabs get their own full-width row so each one can carry a
             44px target without crowding the display line out of the head. */
          .board__head {
            flex-wrap: wrap;
          }
          .board__tabs {
            width: 100%;
          }
          .board__tab {
            flex: 1 1 0;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-height: 44px;
            padding: 4px 8px;
            font-size: 10px;
          }
          .board__stats {
            display: none;
          }
          /* The foot survives on mobile for one reason — the hatch toggle
             is the direction affordance and must not be desktop-only. Its
             neighbours (gradient, ±2% labels, caption, and the duplicate
             open-link that already lives in the mobile strip) drop out. */
          .board__foot {
            margin-top: 0;
            justify-content: flex-start;
          }
          .board__legend-neg,
          .board__legend-pos,
          .board__legend-grad,
          .board__caption {
            display: none;
          }
          .board__foot :global(.board__open-link) {
            display: none;
          }
          .board__hatch {
            margin-left: 0;
          }
          .board__readout {
            margin-top: 12px;
            font-size: 10px;
            letter-spacing: 0.1em;
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
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
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
