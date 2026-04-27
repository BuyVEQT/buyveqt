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
  kind: "filled" | "empty";
  entry?: VolatilityHeatmapEntry;
  isToday?: boolean;
  iso?: string;
}

function buildCells(
  history: VolatilityHeatmapEntry[],
  todayIndex: number,
  rows: 5 | 7
): { cells: BuiltCell[]; cols: number } {
  if (history.length === 0) return { cells: [], cols: 0 };
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

  const cells: BuiltCell[] = [];
  for (let c = 0; c < weekSpan; c++) {
    for (let r = 0; r < rows; r++) {
      const dayOffset = c * 7 + r;
      const cellDate = addDays(startMonday, dayOffset);
      const iso = toISO(cellDate);
      const found = r < 5 ? byDate.get(iso) : undefined; // weekends never carry a session
      if (found) {
        cells.push({
          kind: "filled",
          entry: found,
          isToday: todayDate !== null && iso === todayDate,
          iso,
        });
      } else {
        cells.push({ kind: "empty", iso });
      }
    }
  }
  return { cells, cols: weekSpan };
}

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
}: VolatilityHeatmapProps) {
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement | null>(null);
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
  const { cells, cols } = useMemo(
    () => buildCells(history, todayIndex, rows),
    [history, todayIndex, rows]
  );

  function handleCellClick(cell: BuiltCell) {
    if (cell.kind === "empty" || !cell.entry) return;
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
    const wrap = wrapRef.current;
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    setTip({
      index,
      x: e.clientX - rect.left + 4,
      y: e.clientY - rect.top + 4,
    });
  }

  function handlePointerLeave() {
    setTip(null);
  }

  function handleTouchStart() {
    if (dismissTimer.current) window.clearTimeout(dismissTimer.current);
    dismissTimer.current = window.setTimeout(() => setTip(null), 3000);
  }

  const tipCell = tip !== null ? cells[tip.index] : null;
  const tipEntry = tipCell?.entry ?? null;

  return (
    <div
      className={`bs-heatmap bs-heatmap--${size}`}
      ref={wrapRef}
      onPointerLeave={handlePointerLeave}
    >
      <div
        className="bs-heatmap__grid"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, var(--bs-hm-cell-h))`,
        }}
      >
        {cells.map((cell, i) => {
          if (cell.kind === "empty") {
            return (
              <span
                key={`e-${i}`}
                className="bs-heatmap__cell bs-heatmap__cell--empty"
                aria-hidden
              />
            );
          }
          const e = cell.entry!;
          const cls = ["bs-heatmap__cell"];
          if (cell.isToday) cls.push("bs-heatmap__cell--today");
          if (e.hasDispatch) cls.push("bs-heatmap__cell--dispatch");
          const sign = e.pct >= 0 ? "+" : "";
          const aria = `${e.date}: ${sign}${e.pct.toFixed(2)}% (${ZONE_LABEL[e.severity]})`;
          return (
            <button
              type="button"
              key={`c-${i}`}
              className={cls.join(" ")}
              style={{ background: shade(e.pct) }}
              aria-label={aria}
              onClick={() => handleCellClick(cell)}
              onPointerMove={(ev) => handlePointerMove(ev, i)}
              onPointerEnter={(ev) => handlePointerMove(ev, i)}
              onTouchStart={handleTouchStart}
            />
          );
        })}
      </div>

      {tip && tipEntry && (
        <div
          className="bs-heatmap__tip"
          style={{ left: tip.x, top: tip.y }}
          role="tooltip"
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
