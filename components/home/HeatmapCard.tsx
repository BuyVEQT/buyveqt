"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";
import Card from "@/components/ui/Card";
import CalendarHeatmap from "@/components/charts/CalendarHeatmap";
import type { CalendarReturn } from "@/components/charts/CalendarHeatmap";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeatmapCardProps {
  history: readonly HistoricalDataPoint[];
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SESSION_RANGES = ["30D", "90D", "YTD", "1Y"] as const;
type SessionRange = (typeof SESSION_RANGES)[number];

const RANGE_SUB: Record<SessionRange, string> = {
  "30D": "last 30 sessions",
  "90D": "last 90 sessions",
  YTD: "year-to-date",
  "1Y": "last year",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sliceByRange(
  history: readonly HistoricalDataPoint[],
  range: SessionRange
): readonly HistoricalDataPoint[] {
  if (range === "30D") return history.slice(-30);
  if (range === "90D") return history.slice(-90);
  if (range === "1Y") return history.slice(-252);
  // YTD — filter by current year
  const year = new Date(
    history[history.length - 1]?.date ?? ""
  ).getFullYear();
  return history.filter((h) => h.date.startsWith(`${year}-`));
}

function toReturns(slice: readonly HistoricalDataPoint[]): CalendarReturn[] {
  const out: CalendarReturn[] = [];
  for (let i = 0; i < slice.length; i++) {
    const c = slice[i].close;
    const prev = i === 0 ? c : slice[i - 1].close;
    const pct = ((c - prev) / prev) * 100;
    out.push({ date: slice[i].date, pct });
  }
  return out;
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function fmtDayShort(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

function fmtDayFull(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${iso}T12:00:00`));
}

// ---------------------------------------------------------------------------
// StatTile
// ---------------------------------------------------------------------------

interface StatTileProps {
  label: string;
  value: string;
  sub: string;
  tone?: "up" | "down" | "neutral";
}

function StatTile({ label, value, sub, tone = "neutral" }: StatTileProps) {
  const valueColor =
    tone === "up"
      ? "var(--green)"
      : tone === "down"
      ? "var(--stamp)"
      : "var(--ink)";
  return (
    <div className="stat">
      <div className="ed-label">{label}</div>
      <div className="ed-display ed-numerals stat__val" style={{ color: valueColor }}>
        {value}
      </div>
      <div className="ed-caption stat__sub">{sub}</div>
      <style jsx>{`
        .stat__val {
          font-size: clamp(1.4rem, 2.4vw, 1.7rem);
          line-height: 1.05;
          margin-top: 6px;
          letter-spacing: -0.015em;
        }
        .stat__sub {
          font-size: 12px;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Calendar session board — replaces the old 90-cell rectangular Heatmap.
 * Weeks as columns, M-T-W-T-F as rows. 4-up stat strip + range tabs + today
 * readout + CalendarHeatmap + legend + caption.
 */
export default function HeatmapCard({ history, loading }: HeatmapCardProps) {
  const [range, setRange] = useState<SessionRange>("90D");
  const [hover, setHover] = useState<number | null>(null);

  const slice = useMemo(
    () => sliceByRange(history, range),
    [history, range]
  );

  const returns = useMemo(() => toReturns(slice), [slice]);

  const todayEntry = returns[returns.length - 1];
  const todayISO = todayEntry?.date ?? "";

  const stats = useMemo(() => {
    let up = 0;
    let down = 0;
    let best: CalendarReturn | null = null;
    let worst: CalendarReturn | null = null;
    for (const r of returns) {
      if (r.pct > 0) up++;
      else if (r.pct < 0) down++;
      if (best === null || r.pct > best.pct) best = r;
      if (worst === null || r.pct < worst.pct) worst = r;
    }
    return { total: returns.length, up, down, best, worst };
  }, [returns]);

  // Upper bound on cell size per range. The CalendarHeatmap now uses
  // `minmax(0, cellSize)` columns + aspect-ratio cells, so this is a CAP,
  // not a fixed dimension — cells shrink to fit narrow containers.
  // For 30D/90D the cap is generous so the grid feels full in the
  // available width; for YTD/1Y the cap is smaller so cells stay
  // dense even on wide screens.
  const cellSize =
    range === "1Y" ? 14 : range === "YTD" ? 18 : range === "90D" ? 22 : 32;
  const gap = range === "1Y" ? 2 : 3;

  // Hover readout — falls back to today
  const hoverEntry = hover !== null ? returns[hover] : null;
  const readoutEntry = hoverEntry ?? todayEntry;
  const readoutIsToday = !hoverEntry;

  // Range tabs use the same handler but stopPropagation so the click
  // doesn't bubble up through the outer click-through Link and bounce
  // the user off to /inside-veqt instead of just changing the range.
  const stopRange = (r: SessionRange) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setRange(r);
  };

  return (
    <Link href="/inside-veqt#heatmap" className="session-link">
    <Card>
      <div className="session__head">
        <div>
          <div className="ed-stamp">Sessions on file</div>
          <div className="ed-display-italic session__h">The session board.</div>
        </div>
        <div className="session__tabs" role="tablist" aria-label="Range">
          {SESSION_RANGES.map((r) => {
            const active = r === range;
            return (
              <button
                key={r}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={stopRange(r)}
                className={`session__tab${active ? " is-active" : ""}`}
              >
                {r}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4-up stat strip */}
      <div className="session__stats">
        <StatTile
          label="Sessions"
          value={String(stats.total)}
          sub={RANGE_SUB[range]}
        />
        <StatTile
          label="Up days"
          value={String(stats.up)}
          sub={
            stats.total > 0
              ? `${Math.round((stats.up / stats.total) * 100)}% of sessions`
              : "—"
          }
          tone="up"
        />
        <StatTile
          label="Best day"
          value={stats.best ? fmtPct(stats.best.pct) : "—"}
          sub={stats.best ? fmtDayShort(stats.best.date) : "—"}
          tone="up"
        />
        <StatTile
          label="Worst day"
          value={stats.worst ? fmtPct(stats.worst.pct) : "—"}
          sub={stats.worst ? fmtDayShort(stats.worst.date) : "—"}
          tone="down"
        />
      </div>

      {/* Today / hover readout */}
      {!loading && returns.length > 0 && (
        <div className="session__readout">
          <span>
            {readoutIsToday ? "Today" : "Selected"} ·{" "}
            {readoutEntry ? fmtDayFull(readoutEntry.date) : "—"}
          </span>
          <span
            className="session__readout-num ed-numerals"
            style={{
              color:
                (readoutEntry?.pct ?? 0) >= 0 ? "var(--ink)" : "var(--stamp)",
            }}
          >
            {readoutEntry
              ? `${readoutEntry.pct >= 0 ? "▲ +" : "▼ "}${readoutEntry.pct.toFixed(
                  2
                )}%`
              : ""}
          </span>
        </div>
      )}

      {/* Calendar heatmap */}
      <div className="session__grid-wrap">
        {loading || returns.length === 0 ? (
          <div
            className="skeleton"
            style={{ height: cellSize * 5 + gap * 4, borderRadius: 6 }}
          />
        ) : (
          <CalendarHeatmap
            returns={returns}
            cellSize={cellSize}
            gap={gap}
            todayISO={todayISO}
            hover={hover}
            onHover={setHover}
          />
        )}
      </div>

      {/* Legend */}
      <div className="session__legend">
        <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
          −2%
        </span>
        <div className="session__legend-grad" aria-hidden />
        <span className="ed-label" style={{ color: "var(--ink-mute)" }}>
          +2%
        </span>
      </div>

      {/* Caption — outer Link wrapping turns the whole card into a
          click-through, so the inline "Open the full board →" link is
          redundant. Caption is kept as the explanatory legend copy. */}
      <p className="ed-body session__caption">
        Each cell is one trading day. Darker ink = stronger up days, darker
        vermilion = stronger down days. Hover for the date and return.{" "}
        <span className="session__link">Open the full board →</span>
      </p>

      <style jsx global>{`
        .session-link {
          display: block;
          text-decoration: none;
          color: inherit;
          border-radius: var(--radius, 18px);
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .session-link:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(15, 13, 10, 0.08);
        }
        .session-link:focus-visible {
          outline: 2px solid var(--stamp);
          outline-offset: 4px;
        }

        .session__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }
        .session__h {
          font-size: clamp(1.6rem, 2.4vw, 2rem);
          margin-top: 6px;
          color: var(--ink);
        }
        .session__tabs {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .session__tab {
          appearance: none;
          border: 1px solid var(--rule-soft);
          background: transparent;
          color: var(--ink-soft);
          padding: 6px 12px;
          border-radius: 8px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
        }
        .session__tab:not(.is-active):hover {
          background: var(--paper-warm);
        }
        .session__tab.is-active {
          background: var(--ink);
          color: var(--paper-light);
          border-color: var(--ink);
        }

        .session__stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--rule-soft);
        }
        @media (min-width: 720px) {
          .session__stats {
            grid-template-columns: repeat(4, 1fr);
            gap: 24px;
          }
        }

        .session__readout {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          margin-top: 22px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 13px;
          color: var(--ink-soft);
        }
        .session__readout-num {
          font-family: var(--font-sans);
          font-style: normal;
          font-size: 12.5px;
          font-weight: 700;
        }

        .session__grid-wrap {
          margin-top: 8px;
          padding: 14px;
          background: var(--paper);
          border: 1px solid var(--rule-soft);
          border-radius: 12px;
          /* No overflow-x: the inner CalendarHeatmap uses responsive
             minmax(0, cellSize) columns so the grid always fits. */
        }

        .session__legend {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 14px;
        }
        .session__legend-grad {
          width: 220px;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(
            to right,
            color-mix(in oklab, var(--stamp) 80%, var(--paper)),
            color-mix(in oklab, var(--stamp) 32%, var(--paper)),
            var(--paper-warm),
            color-mix(in oklab, var(--ink) 32%, transparent),
            color-mix(in oklab, var(--ink) 80%, transparent)
          );
          border: 1px solid var(--rule-soft);
        }

        .session__caption {
          margin-top: 16px;
          font-style: italic;
          font-size: 13px;
          line-height: 1.55;
          color: var(--ink-mute);
          max-width: 64ch;
        }
        .session__link {
          color: var(--stamp);
          font-style: normal;
          text-decoration: none;
          font-weight: 600;
          font-family: var(--font-sans);
          font-size: 12px;
          letter-spacing: 0.04em;
        }
      `}</style>
    </Card>
    </Link>
  );
}
