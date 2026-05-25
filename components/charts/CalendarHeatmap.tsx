"use client";

/**
 * CalendarHeatmap — M-T-W-T-F rows × week columns.
 *
 * Extracted from the SessionBoard prototype so it can be shared between
 * HeatmapCard (home) and the /inside-veqt board. Owns:
 *   - shade() — canonical cell color function (mirrors VolatilityHeatmap.tsx)
 *   - buildCalendar() — Monday-based week/col structure
 *   - DOW labels column + month labels row
 *   - Today's vermilion outline
 *   - Hover / focus callbacks
 */

export interface CalendarReturn {
  date: string; // YYYY-MM-DD
  pct: number;  // signed daily return %
}

interface CalendarCell {
  col: number;
  row: number; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri
  kind: "filled" | "empty" | "placeholder";
  iso: string;
  entry?: CalendarReturn;
}

interface CalendarData {
  cols: number;
  columnMonths: string[];
  cells: CalendarCell[];
}

interface CalendarHeatmapProps {
  returns: CalendarReturn[];
  /** Upper bound on cell width/height. Cells will be at most this size but
   *  may shrink to fit the available container width. Square via aspect-ratio.
   */
  cellSize: number;
  gap: number;
  todayISO: string;
  hover: number | null;
  onHover: (idx: number | null) => void;
}

// ---------------------------------------------------------------------------
// Helpers (same as VolatilityHeatmap.tsx + session.jsx prototype)
// ---------------------------------------------------------------------------

export function shade(pct: number): string {
  const abs = Math.abs(pct);
  const isUp = pct >= 0;
  let intensity: number;
  if (abs < 0.6) intensity = 0.05 + abs * 0.05;
  else if (abs < 1.2) intensity = 0.16 + (abs - 0.6) * 0.16;
  else if (abs < 2.0) intensity = 0.32 + (abs - 1.2) * 0.18;
  else intensity = 0.6 + Math.min(0.25, (abs - 2.0) * 0.15);
  const p = Math.round(intensity * 100);
  return isUp
    ? `color-mix(in oklab, var(--ink) ${p}%, transparent)`
    : `color-mix(in oklab, var(--stamp) ${p}%, var(--paper))`;
}

function parseISO(iso: string): Date {
  return new Date(`${iso}T12:00:00`);
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

// Mon=0 .. Sun=6
function mondayBasedDay(d: Date): number {
  const js = d.getDay();
  return js === 0 ? 6 : js - 1;
}

function floorToMonday(d: Date): Date {
  return addDays(d, -mondayBasedDay(d));
}

export function buildCalendar(returns: CalendarReturn[]): CalendarData {
  if (returns.length === 0) return { cols: 0, columnMonths: [], cells: [] };

  const sorted = [...returns].sort((a, b) => a.date.localeCompare(b.date));
  const byDate = new Map(sorted.map((e) => [e.date, e]));
  const first = parseISO(sorted[0].date);
  const last = parseISO(sorted[sorted.length - 1].date);
  const startMonday = floorToMonday(first);
  const endMonday = floorToMonday(last);
  const weekSpan =
    Math.round(
      (endMonday.getTime() - startMonday.getTime()) / 86_400_000 / 7
    ) + 1;

  const cells: CalendarCell[] = [];
  const columnMonths: string[] = [];
  const fmtMonth = new Intl.DateTimeFormat("en-CA", { month: "short" });
  let prevMonth = -1;

  for (let c = 0; c < weekSpan; c++) {
    const weekMid = addDays(startMonday, c * 7 + 2);
    const month = weekMid.getMonth();
    if (month !== prevMonth) {
      columnMonths.push(fmtMonth.format(weekMid));
      prevMonth = month;
    } else {
      columnMonths.push("");
    }
    for (let r = 0; r < 5; r++) {
      const cellDate = addDays(startMonday, c * 7 + r);
      const iso = toISO(cellDate);
      const entry = byDate.get(iso);
      const inRange =
        cellDate.getTime() >= first.getTime() &&
        cellDate.getTime() <= last.getTime();
      cells.push({
        col: c,
        row: r,
        kind: entry ? "filled" : inRange ? "empty" : "placeholder",
        iso,
        entry,
      });
    }
  }

  return { cols: weekSpan, columnMonths, cells };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ROW_LABELS = ["M", "T", "W", "T", "F"];

function fmtDayFull(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parseISO(iso));
}

function fmtPct(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;
}

export default function CalendarHeatmap({
  returns,
  cellSize,
  gap,
  todayISO,
  hover,
  onHover,
}: CalendarHeatmapProps) {
  const { cols, columnMonths, cells } = buildCalendar(returns);

  if (cols === 0) {
    return (
      <div
        className="skeleton"
        style={{ height: cellSize * 5 + gap * 4, borderRadius: 6 }}
      />
    );
  }

  // Responsive columns: cells can shrink to fit container, capped at cellSize.
  // Cells get `aspect-ratio: 1` so rows match column width automatically — no
  // need for a fixed `gridAutoRows`, and the whole grid never needs horizontal
  // scroll because columns reduce to 0 if the container becomes too narrow.
  const gridTemplate = `20px repeat(${cols}, minmax(0, ${cellSize}px))`;

  // For short ranges (few cols), center the grid inside the wrapper so it
  // doesn't drift left while leaving a wide empty band on the right.
  const justify = cols < 14 ? "center" : "start";

  return (
    <div className="calheat__wrap">
      {/* Month axis */}
      <div
        className="calheat__months"
        style={{
          gridTemplateColumns: gridTemplate,
          gap: `${gap}px`,
          justifyContent: justify,
        }}
      >
        <span />
        {columnMonths.map((m, i) => (
          <span key={i} className="calheat__month-label">
            {m}
          </span>
        ))}
      </div>

      {/* Grid */}
      <div
        className="calheat__grid"
        style={{
          gridTemplateColumns: gridTemplate,
          gap: `${gap}px`,
          justifyContent: justify,
        }}
      >
        {/* DOW labels */}
        {ROW_LABELS.map((lab, r) => (
          <span
            key={`dow-${r}`}
            className="calheat__dow"
            style={{ gridColumn: 1, gridRow: r + 1 }}
          >
            {lab}
          </span>
        ))}

        {/* Cells */}
        {cells.map((cell, i) => {
          if (cell.kind === "placeholder") {
            return (
              <span
                key={i}
                style={{ gridColumn: cell.col + 2, gridRow: cell.row + 1 }}
              />
            );
          }

          const isToday = cell.iso === todayISO;
          const bg =
            cell.kind === "filled" && cell.entry
              ? shade(cell.entry.pct)
              : "transparent";
          const isHovered = hover === i;

          return (
            <button
              key={i}
              type="button"
              className={`calheat__cell${isToday ? " is-today" : ""}${
                isHovered ? " is-hovered" : ""
              }`}
              onMouseEnter={() => onHover(i)}
              onMouseLeave={() => onHover(null)}
              onFocus={() => onHover(i)}
              onBlur={() => onHover(null)}
              style={{
                gridColumn: cell.col + 2,
                gridRow: cell.row + 1,
                background: bg,
                border:
                  cell.kind === "empty"
                    ? "1px dashed var(--rule-hair)"
                    : "1px solid transparent",
              }}
              aria-label={
                cell.entry
                  ? `${fmtDayFull(cell.iso)}: ${fmtPct(cell.entry.pct)}`
                  : "non-trading day"
              }
              tabIndex={cell.kind === "filled" ? 0 : -1}
            />
          );
        })}
      </div>

      <style jsx>{`
        .calheat__wrap {
          width: 100%;
          /* No horizontal scroll — columns shrink to fit via minmax(0, ...). */
        }
        .calheat__months {
          display: grid;
          margin-bottom: 6px;
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-mute);
        }
        .calheat__month-label {
          white-space: nowrap;
          min-width: 0;
          overflow: hidden;
        }
        .calheat__grid {
          display: grid;
        }
        .calheat__dow {
          font-family: var(--font-sans);
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: var(--ink-mute);
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .calheat__cell {
          appearance: none;
          padding: 0;
          border-radius: 2px;
          cursor: pointer;
          transition: transform 0.12s, box-shadow 0.12s;
          /* Square cells regardless of how wide the column resolves. */
          aspect-ratio: 1 / 1;
          width: 100%;
        }
        .calheat__cell:hover,
        .calheat__cell:focus-visible,
        .calheat__cell.is-hovered {
          transform: scale(1.18);
          outline: none;
          box-shadow: 0 1px 8px rgba(0, 0, 0, 0.18);
          z-index: 2;
        }
        .calheat__cell.is-today {
          box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--stamp);
        }
        .calheat__cell.is-today:hover,
        .calheat__cell.is-today:focus-visible,
        .calheat__cell.is-today.is-hovered {
          box-shadow: 0 0 0 2px var(--paper), 0 0 0 4px var(--stamp),
            0 1px 8px rgba(0, 0, 0, 0.18);
          transform: scale(1.18);
        }
      `}</style>
    </div>
  );
}
