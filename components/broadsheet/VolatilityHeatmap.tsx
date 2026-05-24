"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

export type VolatilitySeverity = "typical" | "notable" | "unusual" | "rare";

export interface VolatilityHeatmapEntry {
  date: string; // YYYY-MM-DD (Toronto session date)
  pct: number; // signed daily return %, e.g. -1.24
  severity: VolatilitySeverity;
  /** Optional dispatch (Learn or Weekly) tied to this date. */
  hasDispatch?: boolean;
  /** Where the dispatch lives, used by the hero variant. */
  dispatchHref?: string;
}

export interface VolatilityHeatmapProps {
  history: VolatilityHeatmapEntry[];
  size: "compact" | "hero";
  /** Index in `history` of today's cell. Pass -1 if today is not in the slice. */
  todayIndex: number;
  /** Override default click behavior. */
  onCellClick?: (date: string) => void;
  /**
   * When the heatmap is wrapped in a parent `<Link>` (homepage), set this
   * to false so the inner cell buttons don't double-navigate alongside the
   * outer link. Tooltips on hover still work; clicking the cell falls through
   * to the wrapping link.
   */
  interactiveCells?: boolean;
}

// Match the mockup's shade() exactly so cell colors visually match cell-by-cell.
function shade(pct: number): string {
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
  // Treat date as Toronto-local noon to avoid TZ drift.
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

// Mon = 0, Tue = 1, ..., Sun = 6.
function mondayBasedDay(d: Date): number {
  const js = d.getDay(); // 0=Sun..6=Sat
  return js === 0 ? 6 : js - 1;
}

function floorToMonday(d: Date): Date {
  return addDays(d, -mondayBasedDay(d));
}

function formatTipDate(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(parseISO(iso));
}

const ZONE_LABEL: Record<VolatilitySeverity, string> = {
  typical: "Typical zone",
  notable: "Notable zone",
  unusual: "Unusual zone",
  rare: "Rare zone",
};

interface BuiltCell {
  /** filled = real session, empty = in-range gap (holiday or weekend on mobile),
   *  placeholder = out-of-range padding before first or after last session. */
  kind: "filled" | "empty" | "placeholder";
  entry?: VolatilityHeatmapEntry;
  isToday?: boolean;
  iso?: string;
}

function buildCells(
  history: VolatilityHeatmapEntry[],
  todayIndex: number,
  rows: 5 | 7
): {
  cells: BuiltCell[];
  cols: number;
  /** For each column, the short month label ('Jan', 'Feb', …) — but only
   *  populated on the column where a new month starts. Empty string on
   *  every other column. Used by the X-axis month-marker row. */
  columnMonths: string[];
} {
  if (history.length === 0) return { cells: [], cols: 0, columnMonths: [] };
  const sorted = [...history].sort((a, b) => a.date.localeCompare(b.date));
  const todayDate = todayIndex >= 0 ? history[todayIndex]?.date : null;
  const byDate = new Map<string, VolatilityHeatmapEntry>();
  for (const e of sorted) byDate.set(e.date, e);

  const first = parseISO(sorted[0].date);
  const last = parseISO(sorted[sorted.length - 1].date);
  const startMonday = floorToMonday(first);
  const endMonday = floorToMonday(last);
  const weekSpan =
    Math.round((endMonday.getTime() - startMonday.getTime()) / 86_400_000 / 7) +
    1;
  const firstMs = first.getTime();
  const lastMs = last.getTime();

  const cells: BuiltCell[] = [];
  const columnMonths: string[] = [];
  let prevMonth = -1;
  for (let c = 0; c < weekSpan; c++) {
    // Use the Wednesday (middle of the week) to attribute the column to a
    // month so weeks straddling a month boundary don't flip back and forth.
    const weekMid = addDays(startMonday, c * 7 + 2);
    const month = weekMid.getMonth();
    if (month !== prevMonth) {
      columnMonths.push(
        new Intl.DateTimeFormat("en-CA", { month: "short" }).format(weekMid)
      );
      prevMonth = month;
    } else {
      columnMonths.push("");
    }

    for (let r = 0; r < rows; r++) {
      const dayOffset = c * 7 + r;
      const cellDate = addDays(startMonday, dayOffset);
      const iso = toISO(cellDate);
      const cellMs = cellDate.getTime();
      const isWeekend = r >= 5;
      const found = isWeekend ? undefined : byDate.get(iso);
      if (found) {
        cells.push({
          kind: "filled",
          entry: found,
          isToday: todayDate !== null && iso === todayDate,
          iso,
        });
      } else if (cellMs < firstMs || cellMs > lastMs || isWeekend) {
        // Outside the data window OR a weekend on the mobile transposed grid
        // — render an invisible placeholder so the grid alignment is preserved
        // without drawing dashed boxes for days that aren't trading sessions.
        cells.push({ kind: "placeholder" });
      } else {
        cells.push({ kind: "empty", iso });
      }
    }
  }
  return { cells, cols: weekSpan, columnMonths };
}

const DOW_LABELS_DESKTOP = ["M", "T", "W", "T", "F"] as const;
const DOW_LABELS_MOBILE = ["M", "T", "W", "T", "F", "S", "S"] as const;

interface TipState {
  index: number;
  x: number;
  y: number;
}

export default function VolatilityHeatmap({
  history,
  size,
  todayIndex,
  onCellClick,
  interactiveCells = true,
}: VolatilityHeatmapProps) {
  const router = useRouter();
  const cellRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [tip, setTip] = useState<TipState | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const dismissTimer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    return () => {
      if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    };
  }, []);

  const rows: 5 | 7 = isMobile ? 7 : 5;
  const { cells, cols, columnMonths } = useMemo(
    () => buildCells(history, todayIndex, rows),
    [history, todayIndex, rows]
  );
  const dowLabels = isMobile ? DOW_LABELS_MOBILE : DOW_LABELS_DESKTOP;

  // When the underlying grid changes (resize transposes rows, range slice
  // swaps history, or 5-min refresh appends today), any pinned tooltip's
  // index is stale — clear it.
  useEffect(() => {
    setTip(null);
  }, [cells.length, rows]);

  function handleCellClick(cell: BuiltCell, index: number) {
    if (cell.kind !== "filled" || !cell.entry) return;
    // On touch devices the first tap pins the tooltip; the second tap (on the
    // same cell) navigates. This avoids the iOS pattern where tap immediately
    // navigates and the tooltip is never seen.
    if (isMobile) {
      const isPinned = tip?.index === index;
      if (!isPinned) {
        const cellRect = (
          cellRefs.current[index] as HTMLElement | undefined
        )?.getBoundingClientRect();
        if (cellRect) {
          // Viewport coords — the tooltip is position: fixed (see globals.css)
          // so it escapes the heatmap's overflow-x:auto scroll container.
          // Pinned variant uses translateX(-50%), so clamp against half-width.
          const PAD = 12;
          const TIP_MAX_W = 260;
          const TIP_EST_H = 130;
          const minX = PAD + TIP_MAX_W / 2;
          const maxX = window.innerWidth - PAD - TIP_MAX_W / 2;
          const maxY = window.innerHeight - TIP_EST_H - PAD;
          const desiredX = cellRect.left + cellRect.width / 2;
          const desiredY = cellRect.top + cellRect.height + 6;
          setTip({
            index,
            x: Math.max(minX, Math.min(desiredX, maxX)),
            y: Math.min(desiredY, maxY),
          });
        }
        if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
        dismissTimer.current = window.setTimeout(
          () => setTip(null),
          5000
        );
        return;
      }
      // Already pinned → navigate.
    }
    if (!interactiveCells) {
      // Wrapped in a parent link — let the click bubble up to the outer <a>.
      return;
    }
    if (onCellClick) {
      onCellClick(cell.entry.date);
      return;
    }
    if (size === "compact") {
      router.push(`/inside-veqt?date=${cell.entry.date}#heatmap`);
      return;
    }
    if (cell.entry.hasDispatch && cell.entry.dispatchHref) {
      router.push(cell.entry.dispatchHref);
    }
  }

  function handlePointerMove(
    e: React.PointerEvent<HTMLButtonElement>,
    index: number
  ) {
    if (e.pointerType !== "mouse") return; // touch handled in handleCellClick
    // Viewport coords — tooltip is position: fixed (see globals.css). Clamp
    // to keep the tooltip on-screen near the viewport edges. Constants below
    // mirror the CSS: translateX(-12px), max-width 260px. Estimated tip
    // height of 130px covers the dispatch-link variant.
    const PAD = 12;
    const TIP_MAX_W = 260;
    const TIP_EST_H = 130;
    const minX = PAD + 12; // 12 cancels translateX(-12px) shift
    const maxX = window.innerWidth - TIP_MAX_W - PAD + 12;
    const maxY = window.innerHeight - TIP_EST_H - PAD;
    setTip({
      index,
      x: Math.max(minX, Math.min(e.clientX + 4, maxX)),
      y: Math.min(e.clientY + 4, maxY),
    });
  }

  function handlePointerLeave(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return; // don't dismiss touch-pinned tip on pointer-leave
    setTip(null);
  }

  const tipCell = tip !== null ? cells[tip.index] : null;
  const tipEntry = tipCell?.entry ?? null;

  return (
    <div
      className={`bs-heatmap bs-heatmap--${size}`}
      onPointerLeave={handlePointerLeave}
    >
      {/* Month-marker row sits above the grid; the day-of-week column sits
          to the left. Both use the same gap + cell metrics so labels line
          up perfectly with the cells they describe. */}
      <div className="bs-heatmap__axes">
        <span className="bs-heatmap__axes-corner" aria-hidden />
        <div
          className="bs-heatmap__months"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          aria-hidden
        >
          {columnMonths.map((m, i) => (
            <span key={`m-${i}`} className="bs-heatmap__month-label">
              {m}
            </span>
          ))}
        </div>
      </div>
      <div className="bs-heatmap__body">
        <div
          className="bs-heatmap__dow"
          style={{ gridTemplateRows: `repeat(${rows}, var(--bs-hm-cell-h))` }}
          aria-hidden
        >
          {dowLabels.map((d, i) => (
            <span key={`d-${i}`} className="bs-heatmap__dow-label">
              {d}
            </span>
          ))}
        </div>
        <div
          className="bs-heatmap__grid"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, var(--bs-hm-cell-h))`,
          }}
        >
        {cells.map((cell, i) => {
          // Stable key per grid slot. When a cell at index i changes kind
          // (e.g. range slice swaps a placeholder for a real session), the
          // key stays the same so React diffs in place instead of remounting.
          const key = `${i}`;
          if (cell.kind === "placeholder") {
            return (
              <span
                key={key}
                className="bs-heatmap__cell bs-heatmap__cell--placeholder"
                aria-hidden
              />
            );
          }
          if (cell.kind === "empty") {
            return (
              <span
                key={key}
                className="bs-heatmap__cell bs-heatmap__cell--empty"
                aria-hidden
              />
            );
          }
          const e = cell.entry!;
          const cls = ["bs-heatmap__cell"];
          if (cell.isToday) cls.push("bs-heatmap__cell--today");
          if (e.hasDispatch) cls.push("bs-heatmap__cell--dispatch");
          if (tip?.index === i) cls.push("bs-heatmap__cell--pinned");
          const sign = e.pct >= 0 ? "+" : "";
          const aria = `${e.date}: ${sign}${e.pct.toFixed(2)}% (${ZONE_LABEL[e.severity]})`;
          return (
            <button
              type="button"
              key={key}
              ref={(el) => {
                cellRefs.current[i] = el;
              }}
              className={cls.join(" ")}
              style={{ background: shade(e.pct) }}
              aria-label={aria}
              onClick={() => handleCellClick(cell, i)}
              onPointerMove={(ev) => handlePointerMove(ev, i)}
              onPointerEnter={(ev) => handlePointerMove(ev, i)}
            />
          );
        })}
        </div>
      </div>

      {tip && tipEntry && (
        <div
          className={`bs-heatmap__tip ${isMobile ? "bs-heatmap__tip--pinned" : ""}`}
          style={{ left: tip.x, top: tip.y }}
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bs-heatmap__tip-date">{formatTipDate(tipEntry.date)}</div>
          <div
            className={`bs-heatmap__tip-pct ${tipEntry.pct >= 0 ? "is-up" : "is-dn"}`}
          >
            {tipEntry.pct >= 0 ? "▲" : "▼"} {tipEntry.pct >= 0 ? "+" : ""}
            {tipEntry.pct.toFixed(2)}%
          </div>
          <div className="bs-heatmap__tip-meta">
            {ZONE_LABEL[tipEntry.severity]}
          </div>
          {tipEntry.hasDispatch && tipEntry.dispatchHref && (
            <Link
              href={tipEntry.dispatchHref}
              className="bs-heatmap__tip-link"
            >
              Read the dispatch →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
