"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useVeqtData } from "@/lib/useVeqtData";
import type { HistoricalDataPoint } from "@/lib/types";
import {
  UP,
  DOWN,
  fmtSignedPct,
  fmtChipDate,
  parseSessionDate,
} from "@/lib/instrument-format";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const RANGES = ["90D", "1Y", "ALL"] as const;
type BoardRange = (typeof RANGES)[number];

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const YEAR_SESSIONS = 252;

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

/** White gap + ink ring — the pinned/today cell marker. */
const PIN_RING = "0 0 0 1.5px #ffffff, 0 0 0 3px #111111";

interface DayCell {
  date: string;
  pct: number;
  /** 1-based grid column (calendar week) */
  col: number;
  /** 1-based grid row (Mon=1 … Fri=5) */
  row: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sliceStart(history: HistoricalDataPoint[], range: BoardRange): number {
  if (range === "90D") return Math.max(0, history.length - 90);
  if (range === "1Y") return Math.max(0, history.length - YEAR_SESSIONS);
  return 0;
}

/** Timestamp of the Monday of the week containing d. */
function mondayOf(d: Date): number {
  const back = (d.getUTCDay() + 6) % 7; // Mon=0 … Sun=6
  return d.getTime() - back * DAY_MS;
}

/**
 * The Instrument heat function — mirrored from components/home/HeatmapCard
 * so the home card and this board read as one instrument. Literal colors by
 * spec: ink for up days, signal red for down days, both ramping opacity to
 * ±1.4%. Deliberately fixed under editions.
 */
function heatColor(pct: number): string {
  if (Math.abs(pct) < 0.03) return "rgba(17,17,17,0.05)";
  const a = Math.min(0.92, 0.1 + (Math.abs(pct) / 1.4) * 0.82).toFixed(2);
  return pct >= 0 ? `rgba(17,17,17,${a})` : `rgba(232,68,46,${a})`;
}

/** "Mon Jun 29 — down 0.4%" — a11y label + native title. */
function cellLabel(iso: string, pct: number): string {
  const d = parseSessionDate(iso);
  const dir = pct > 0 ? "up" : pct < 0 ? "down" : "flat";
  return `${WEEKDAYS[d.getUTCDay()]} ${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()} — ${dir} ${Math.abs(pct).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Component — "The year on tape."
// ---------------------------------------------------------------------------

/**
 * The deep session board (artboard 6a).
 *
 * Range tabs (90D / 1Y / ALL, 1Y default) · a four-cell facts strip
 * (sessions / up days / best / worst, worst in signal red) · the heat grid
 * with calendar weeks as columns and Mon–Fri as rows.
 *
 * Integration points preserved from the previous board:
 *   - `id="heatmap"` anchor, so `/inside-veqt#heatmap` lands here.
 *   - `?date=YYYY-MM-DD` pins that session in the readout and rings its cell;
 *     the range auto-promotes to ALL when the linked day predates the window.
 *   - Clicking a cell rewrites `?date=` (replace, no scroll) so every session
 *     is a shareable URL — the same contract the home card links into.
 */
export default function InsideHeatBoard() {
  const { data, loading } = useVeqtData("ALL");
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const dateParam = params.get("date");

  // `null` means "nobody has picked a tab yet", so the deep link still gets
  // to choose the window. Once the reader picks, their choice sticks.
  const [pickedRange, setPickedRange] = useState<BoardRange | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);

  const history = useMemo<HistoricalDataPoint[]>(
    () => data?.historical ?? [],
    [data]
  );

  // A deep-linked day older than the default 1Y window would otherwise land
  // off the board — widen to ALL. Derived, not an effect, so there is no
  // second render pass.
  const defaultRange = useMemo<BoardRange>(() => {
    if (!dateParam || history.length === 0) return "1Y";
    const windowStart = history[Math.max(0, history.length - YEAR_SESSIONS)].date;
    return dateParam < windowStart ? "ALL" : "1Y";
  }, [dateParam, history]);

  const range = pickedRange ?? defaultRange;

  // `#heatmap` landing — scroll once the board actually has content, so the
  // anchor isn't chasing a collapsed section on first paint.
  useEffect(() => {
    if (scrolledRef.current) return;
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#heatmap") return;
    if (history.length === 0) return;
    scrolledRef.current = true;
    anchorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [history]);

  // Clicking a cell updates ?date= so the pin follows selection and each cell
  // is a shareable URL. Replace (not push) so we don't pollute history;
  // scroll:false because the board is already in view.
  const handleCellClick = useCallback(
    (date: string) => {
      const sp = new URLSearchParams(window.location.search);
      sp.set("date", date);
      router.replace(`${pathname}?${sp.toString()}#heatmap`, { scroll: false });
    },
    [pathname, router]
  );

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

  // Pinned cell: the ?date= day when it's on the board, otherwise the last
  // session. Hover wins for the readout but never moves the ring.
  const pinnedIdx = useMemo(() => {
    if (dateParam) {
      const i = cells.findIndex((c) => c.date === dateParam);
      if (i >= 0) return i;
    }
    return cells.length - 1;
  }, [cells, dateParam]);

  const readIdx = hover ?? pinnedIdx;
  const readCell = readIdx >= 0 ? cells[readIdx] ?? null : null;
  const readPinned = hover === null && dateParam != null && pinnedIdx >= 0;
  const readNegative = (readCell?.pct ?? 0) < 0;

  const sessionsSub =
    range === "ALL"
      ? "SINCE INCEPTION"
      : range === "1Y"
        ? "LAST TRADING YEAR"
        : "LAST 90 SESSIONS";

  const showSkeleton = loading || cells.length === 0;

  return (
    <section className="tape" aria-label="The year on tape">
      <div ref={anchorRef} id="heatmap" className="tape__anchor" />

      <div className="tape__head">
        <div>
          <div className="tape__kicker">Sessions on file</div>
          <h2 className="tape__display">The year on tape.</h2>
        </div>
        <div className="tape__tabs" role="tablist" aria-label="Session range">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === range}
              className={`tape__tab${r === range ? " is-active" : ""}`}
              onClick={() => {
                setPickedRange(r);
                setHover(null);
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="tape__stats">
        <div className="tape__stat">
          <div className="tape__stat-label">Sessions</div>
          <div className="tape__stat-value">
            {stats.total > 0 ? stats.total : "—"}
          </div>
          <div className="tape__stat-sub">
            {stats.total > 0 ? sessionsSub : "—"}
          </div>
        </div>
        <div className="tape__stat">
          <div className="tape__stat-label">Up days</div>
          <div className="tape__stat-value">
            {stats.total > 0 ? stats.up : "—"}
          </div>
          <div className="tape__stat-sub">
            {stats.total > 0
              ? `${Math.round((stats.up / stats.total) * 100)}% of sessions`
              : "—"}
          </div>
        </div>
        <div className="tape__stat">
          <div className="tape__stat-label">Best day</div>
          <div className="tape__stat-value">
            {stats.best ? fmtSignedPct(stats.best.pct) : "—"}
          </div>
          <div className="tape__stat-sub">
            {stats.best ? fmtChipDate(parseSessionDate(stats.best.date)) : "—"}
          </div>
        </div>
        <div className="tape__stat">
          <div className="tape__stat-label">Worst day</div>
          <div className="tape__stat-value is-signal">
            {stats.worst ? fmtSignedPct(stats.worst.pct) : "—"}
          </div>
          <div className="tape__stat-sub">
            {stats.worst ? fmtChipDate(parseSessionDate(stats.worst.date)) : "—"}
          </div>
        </div>
      </div>

      {readCell && (
        <div className="tape__readout">
          <span className="tape__read-left">
            {hover !== null ? "Selected" : readPinned ? "Pinned" : "Latest"} ·{" "}
            <span className="tape__read-date">
              {fmtChipDate(parseSessionDate(readCell.date))}
            </span>
          </span>
          <span className={`tape__read-pct${readNegative ? " is-neg" : ""}`}>
            {readNegative ? DOWN : UP} {fmtSignedPct(readCell.pct)}
          </span>
        </div>
      )}

      {showSkeleton ? (
        <div className="tape__skeleton" aria-hidden />
      ) : (
        <div className="tape__scroll">
          <div className="tape__grid" onPointerLeave={() => setHover(null)}>
            {cells.map((c, i) => (
              <button
                key={c.date}
                type="button"
                aria-label={cellLabel(c.date, c.pct)}
                title={cellLabel(c.date, c.pct)}
                className="tape__cell"
                style={{
                  gridColumn: c.col,
                  gridRow: c.row,
                  background: heatColor(c.pct),
                  boxShadow: i === pinnedIdx ? PIN_RING : undefined,
                }}
                onPointerEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => handleCellClick(c.date)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="tape__foot">
        <div className="tape__legend">
          <span className="tape__legend-neg">−2%</span>
          <span className="tape__legend-grad" aria-hidden />
          <span className="tape__legend-pos">+2%</span>
        </div>
        <span className="tape__caption">
          One cell per trading day · weeks as columns · click to pin
        </span>
      </div>

      <style jsx>{`
        .tape {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .tape__anchor {
          scroll-margin-top: 110px;
        }

        /* ── Head ───────────────────────────────────────────────── */
        .tape__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 20px;
        }
        .tape__kicker {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .tape__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .tape__tabs {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .tape__tab {
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
        }
        .tape__tab:not(.is-active):hover {
          border-color: var(--ins-hair);
        }
        .tape__tab.is-active {
          background: var(--ins-ink);
          color: var(--ins-paper);
        }

        /* ── Facts strip ────────────────────────────────────────── */
        .tape__stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          margin-top: 14px;
          border-top: 1px solid var(--ins-hair);
          border-bottom: 1px solid var(--ins-hair);
        }
        .tape__stat {
          padding: 12px 0 12px 20px;
          border-left: 1px solid var(--ins-hair);
          min-width: 0;
        }
        .tape__stat:first-child {
          padding-left: 0;
          border-left: none;
        }
        .tape__stat-label {
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .tape__stat-value {
          margin-top: 4px;
          font-size: 22px;
          font-weight: 700;
          line-height: 1.1;
        }
        .tape__stat-value.is-signal {
          color: var(--ins-signal);
        }
        .tape__stat-sub {
          margin-top: 2px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }

        /* ── Readout ────────────────────────────────────────────── */
        .tape__readout {
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
        .tape__read-left {
          color: var(--ins-gray-600);
        }
        .tape__read-date {
          color: var(--ins-ink);
        }
        .tape__read-pct {
          color: var(--ins-ink);
        }
        .tape__read-pct.is-neg {
          color: var(--ins-signal);
        }

        /* ── Heat grid ──────────────────────────────────────────── */
        .tape__scroll {
          margin-top: 12px;
          overflow-x: auto;
          padding: 3px 3px 4px;
        }
        .tape__grid {
          display: grid;
          grid-template-rows: repeat(5, 16px);
          grid-auto-flow: column;
          grid-auto-columns: minmax(6px, 1fr);
          gap: 2px;
          min-width: 100%;
        }
        .tape__cell {
          appearance: none;
          border: none;
          padding: 0;
          border-radius: 2px;
          cursor: pointer;
        }
        .tape__cell:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 1px;
        }
        .tape__skeleton {
          height: 88px; /* 5 × 16px rows + 4 × 2px gaps */
          margin-top: 12px;
          background: rgba(17, 17, 17, 0.06);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }

        /* ── Legend + caption ───────────────────────────────────── */
        .tape__foot {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
        }
        .tape__legend {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 8.5px;
          font-weight: 700;
        }
        .tape__legend-neg {
          color: var(--ins-signal);
        }
        .tape__legend-pos {
          color: var(--ins-ink);
        }
        .tape__legend-grad {
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
        .tape__caption {
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          text-align: right;
        }

        /* ── Mobile 390 ─────────────────────────────────────────── */
        @media (max-width: 640px) {
          .tape {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .tape__head {
            display: block;
          }
          .tape__kicker {
            font-size: 9px;
            letter-spacing: 0.18em;
          }
          .tape__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .tape__tabs {
            margin-top: 10px;
          }
          .tape__tab {
            padding: 4px 9px;
            font-size: 9px;
          }
          .tape__stats {
            grid-template-columns: 1fr 1fr;
            margin-top: 12px;
          }
          .tape__stat {
            padding: 10px 0 10px 14px;
          }
          .tape__stat:nth-child(odd) {
            padding-left: 0;
            border-left: none;
          }
          .tape__stat:nth-child(n + 3) {
            border-top: 1px solid var(--ins-hair);
          }
          .tape__stat-value {
            font-size: 18px;
          }
          .tape__stat-sub {
            font-size: 8px;
            letter-spacing: 0.08em;
          }
          .tape__readout {
            margin-top: 12px;
            font-size: 9px;
            letter-spacing: 0.12em;
          }
          .tape__scroll {
            margin-top: 10px;
          }
          .tape__grid {
            grid-template-rows: repeat(5, 13px);
            grid-auto-columns: minmax(9px, 1fr);
          }
          .tape__skeleton {
            height: 73px; /* 5 × 13px rows + 4 × 2px gaps */
            margin-top: 10px;
          }
          .tape__foot {
            display: block;
            margin-top: 10px;
          }
          .tape__legend {
            display: none;
          }
          .tape__caption {
            text-align: left;
            font-size: 8.5px;
            letter-spacing: 0.12em;
          }
        }
      `}</style>
    </section>
  );
}
