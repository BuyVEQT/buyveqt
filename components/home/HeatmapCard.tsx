"use client";

import Link from "next/link";
import { useMemo, useEffect, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";
import { classifyReturns } from "@/lib/volatility";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";
import Heatmap from "@/components/charts/Heatmap";

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

  const { entries, upCount, downCount } = useMemo(() => {
    const { returns } = classifyReturns([...history]);
    const slice = returns.slice(-90);
    let u = 0;
    let d = 0;
    for (const r of slice) {
      if (r.pct > 0) u += 1;
      else if (r.pct < 0) d += 1;
    }
    return { entries: slice, upCount: u, downCount: d };
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
            <span style={{ color: "var(--green)" }}>●</span> {upCount} up
          </span>
          <span>
            <span style={{ color: "var(--stamp)" }}>●</span> {downCount} down
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
            ariaLabel={`Last 90 sessions: ${upCount} up days, ${downCount} down days`}
          />
        )}
      </div>

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
          Tap any cell for that day&apos;s story
        </span>
        <span style={{ color: "var(--stamp)", fontWeight: 700 }} aria-hidden>
          →
        </span>
      </Link>
    </Card>
  );
}
