"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";
import { classifyReturns } from "@/lib/volatility";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import Heatmap from "@/components/charts/Heatmap";
import HeatmapLegend from "@/components/charts/HeatmapLegend";

interface HeatmapCardProps {
  history: readonly HistoricalDataPoint[];
  loading: boolean;
}

/**
 * "The session board" — last 90 trading days as a tappable grid.
 * Counts up/down days inline in the eyebrow. Footer hints that tapping
 * a cell jumps to Inside VEQT's day detail.
 */
export default function HeatmapCard({ history, loading }: HeatmapCardProps) {
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 640px)");
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { entries, upCount, downCount, fromLabel, toLabel, todayLabel, todayPct } = useMemo(() => {
    const { returns } = classifyReturns([...history]);
    const slice = returns.slice(-90);
    let u = 0;
    let d = 0;
    for (const r of slice) {
      if (r.pct > 0) u += 1;
      else if (r.pct < 0) d += 1;
    }
    const fmt = (iso?: string): string => {
      if (!iso) return "";
      return new Intl.DateTimeFormat("en-CA", {
        month: "short",
        day: "numeric",
      }).format(new Date(`${iso}T12:00:00`));
    };
    const fmtWeekday = (iso?: string): string => {
      if (!iso) return "";
      return new Intl.DateTimeFormat("en-CA", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date(`${iso}T12:00:00`));
    };
    const today = slice[slice.length - 1];
    return {
      entries: slice,
      upCount: u,
      downCount: d,
      fromLabel: fmt(slice[0]?.date),
      toLabel: fmt(today?.date),
      todayLabel: today ? fmtWeekday(today.date) : "",
      todayPct: today?.pct ?? null,
    };
  }, [history]);

  const cols = mobile ? 10 : 15;
  const cell = mobile ? 22 : 36;

  return (
    <Card>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <SectionLabel>Last 90 sessions</SectionLabel>
          <div className="ed-display" style={{ fontSize: 24, marginTop: 6 }}>
            The session board
          </div>
        </div>
        <div
          className="ed-numerals"
          style={{
            display: "flex",
            gap: 18,
            fontFamily: "var(--font-sans)",
            fontSize: 12,
            color: "var(--ink-mute)",
            fontWeight: 600,
          }}
        >
          <span>
            {/* Up day swatch — ink at the same intensity the heatmap uses
                for a moderate up day, matching the body of the grid. */}
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "color-mix(in oklab, var(--ink) 65%, transparent)",
                borderRadius: 2,
                marginRight: 4,
                verticalAlign: "middle",
              }}
              aria-hidden
            />
            {upCount} up
          </span>
          <span>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                background: "color-mix(in oklab, var(--stamp) 65%, var(--paper))",
                borderRadius: 2,
                marginRight: 4,
                verticalAlign: "middle",
              }}
              aria-hidden
            />
            {downCount} down
          </span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: 20,
          minHeight: cell * Math.ceil(90 / cols),
        }}
      >
        {loading || entries.length === 0 ? (
          <div
            className="skeleton"
            style={{
              width: cols * cell + (cols - 1) * 2,
              height: cell * Math.ceil(90 / cols) + Math.ceil(90 / cols - 1) * 2,
              borderRadius: 6,
            }}
          />
        ) : (
          <Heatmap
            data={entries}
            cols={cols}
            cell={cell}
            gap={mobile ? 2 : 4}
            todayIndex={entries.length - 1}
            linkPrefix="/inside-veqt?date="
            ariaLabel={`Last 90 sessions: ${upCount} up days, ${downCount} down days`}
          />
        )}
      </div>

      {/* Date range caption — anchors the leftmost cell to a calendar
          date and the rightmost to "today", so the timeline reads
          left-to-right without hovering every cell. */}
      {!loading && entries.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 10,
            fontFamily: "var(--font-sans)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--ink-mute)",
          }}
          aria-hidden
        >
          <span>{fromLabel}</span>
          <span>{toLabel} · today</span>
        </div>
      )}

      {/* Today call-out — small italic line that names today's session and
          its move, anchored to the right edge so it reads as "the cell on
          the right is this date / this number". */}
      {!loading && todayLabel && todayPct !== null && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "baseline",
            gap: 8,
            marginTop: 6,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--ink-soft)",
          }}
        >
          <span>Today &middot; {todayLabel}</span>
          <span
            className="tabular-nums"
            style={{
              fontFamily: "var(--font-sans)",
              fontStyle: "normal",
              fontSize: 12,
              fontWeight: 700,
              color: todayPct >= 0 ? "var(--ink)" : "var(--stamp)",
            }}
          >
            {todayPct >= 0 ? "▲" : "▼"} {todayPct >= 0 ? "+" : ""}
            {todayPct.toFixed(2)}%
          </span>
        </div>
      )}

      {/* Color legend — gradient bar mapping intensity to daily return.
          Matches the cell palette: vermilion for down, ink for up. */}
      <HeatmapLegend />

      <Link
        href="/inside-veqt#heatmap"
        style={{
          marginTop: 18,
          padding: "12px 16px",
          background: "var(--paper-warm)",
          borderRadius: 12,
          color: "var(--ink-soft)",
          textDecoration: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          Hover any cell for the day&apos;s number, tap to see it in
          context.
        </span>
        <span style={{ color: "var(--stamp)", fontWeight: 700 }} aria-hidden>
          The session board →
        </span>
      </Link>
    </Card>
  );
}
