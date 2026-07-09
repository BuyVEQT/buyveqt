"use client";

import { useMemo, useState } from "react";
import type { HistoricalDataPoint, VeqtQuote } from "@/lib/types";
import type { SeverityReading } from "@/lib/severity";

interface TileDistributionProps {
  historical: readonly HistoricalDataPoint[];
  severity: SeverityReading;
  quote: VeqtQuote;
}

interface DistributionShape {
  bins: number[];
  todayBin: number;
  lastComparable: { date: string; pct: number } | null;
  totalSessions: number;
}

/**
 * Distribution — 12-bucket histogram of |daily Δ%| (each bin = 0.25%
 * wide, capped at 3%). Today's bin is stamp-coloured at full opacity;
 * all other bars are ink at 0.18 opacity. Hover any bar for the bin
 * range, count, and share of all sessions.
 *
 * Hover-reveal detail panel shows today's exact Δ% and the most recent
 * comparable session (closest |Δ%| within 0.15% in the same direction
 * frequency band).
 */
export default function TileDistribution({
  historical,
  severity,
  quote,
}: TileDistributionProps) {
  const { bins, todayBin, lastComparable, totalSessions } =
    useMemo<DistributionShape>(() => {
      const arr: { idx: number; date: string; abs: number; pct: number }[] = [];
      for (let i = 1; i < historical.length; i++) {
        const pct =
          ((historical[i].close - historical[i - 1].close) /
            historical[i - 1].close) *
          100;
        arr.push({ idx: i, date: historical[i].date, abs: Math.abs(pct), pct });
      }
      const buckets = new Array(12).fill(0);
      arr.forEach((v) => {
        const b = Math.min(11, Math.floor((v.abs / 3) * 12));
        buckets[b] += 1;
      });
      const tBin = Math.min(
        11,
        Math.floor((Math.abs(quote.changePercent) / 3) * 12)
      );
      const todayAbs = Math.abs(quote.changePercent);
      let last: { date: string; pct: number } | null = null;
      for (let i = arr.length - 2; i >= 0; i--) {
        if (Math.abs(arr[i].abs - todayAbs) < 0.15) {
          last = { date: arr[i].date, pct: arr[i].pct };
          break;
        }
      }
      return {
        bins: buckets,
        todayBin: tBin,
        lastComparable: last,
        totalSessions: arr.length,
      };
    }, [historical, quote]);

  const maxBucket = Math.max(...bins, 1);
  const [hovered, setHovered] = useState<number | null>(null);

  const binLabel = (i: number) => {
    const lo = (i / 12) * 3;
    const hi = ((i + 1) / 12) * 3;
    return `±${lo.toFixed(2)}–${hi.toFixed(2)}%`;
  };

  const fmtDate = (s: string) => {
    if (!s) return "";
    const d = new Date(s);
    return d.toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="almTile almTile--distribution">
      <div className="ed-label">Distribution</div>
      <div className="almTile__big ed-numerals">
        {Math.round(severity.percentileRank * 100)}
        <span className="almTile__big-sub">th pct.</span>
      </div>

      <div className="almTile__histo" onMouseLeave={() => setHovered(null)}>
        {bins.map((b, i) => {
          const h = (b / maxBucket) * 100;
          const isToday = i === todayBin;
          return (
            <button
              key={i}
              type="button"
              className={`almTile__bar ${isToday ? "is-today" : ""} ${
                hovered === i ? "is-hover" : ""
              }`}
              style={
                {
                  "--bar-h": `${Math.max(4, h)}%`,
                  animationDelay: `${i * 35}ms`,
                } as React.CSSProperties
              }
              onMouseEnter={() => setHovered(i)}
              onFocus={() => setHovered(i)}
              onClick={() => setHovered(hovered === i ? null : i)}
              aria-label={`${binLabel(i)}: ${b} sessions`}
            />
          );
        })}
      </div>

      <div className="almTile__dot-readout">
        {hovered !== null ? (
          <>
            <span style={{ color: "var(--ink)", fontWeight: 600 }}>
              {binLabel(hovered)}
            </span>
            <span className="ed-numerals" style={{ color: "var(--ink-soft)" }}>
              {bins[hovered]} sessions ·{" "}
              {((bins[hovered] / totalSessions) * 100).toFixed(0)}%
            </span>
          </>
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>
            {severity.zone} · σ {Math.abs(severity.sigmaRatio).toFixed(2)}
          </span>
        )}
      </div>

      <div className="almTile__detail">
        <div className="almTile__row">
          <span>Today</span>
          <span className="ed-numerals">
            ±{Math.abs(quote.changePercent).toFixed(2)}%
          </span>
        </div>
        <div className="almTile__row">
          <span>Last comparable</span>
          <span className="ed-numerals">
            {lastComparable ? (
              <>
                {fmtDate(lastComparable.date)}{" "}
                <span
                  style={{
                    color:
                      lastComparable.pct >= 0
                        ? "var(--green)"
                        : "var(--stamp)",
                  }}
                >
                  {lastComparable.pct >= 0 ? "+" : "−"}
                  {Math.abs(lastComparable.pct).toFixed(2)}%
                </span>
              </>
            ) : (
              "—"
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
