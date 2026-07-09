"use client";

import { useMemo, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";

interface TileStreakProps {
  historical: readonly HistoricalDataPoint[];
}

interface StreakData {
  streak: number;
  dir: "up" | "down" | null;
  ups: number;
  total: number;
  avgLen: number;
  longest: { len: number; dir: "up" | "down" };
  dots: { date: string; pct: number; isUp: boolean }[];
}

/**
 * Streak — consecutive up/down sessions from the tail of the series,
 * with a 30-dot mini strip you can hover (or tap, on mobile) for the
 * day's date and Δ%. The hover-reveal detail panel shows avg streak
 * length and the longest streak ever (across the full series).
 */
export default function TileStreak({ historical }: TileStreakProps) {
  const data = useMemo<StreakData>(() => {
    if (historical.length < 2) {
      return {
        streak: 0,
        dir: null,
        ups: 0,
        total: 0,
        avgLen: 0,
        longest: { len: 0, dir: "up" },
        dots: [],
      };
    }

    // Current streak (walking backward from the end).
    let streak = 0;
    let dir: "up" | "down" | null = null;
    for (let i = historical.length - 1; i > 0; i--) {
      const d: "up" | "down" =
        historical[i].close >= historical[i - 1].close ? "up" : "down";
      if (dir === null) {
        dir = d;
        streak = 1;
        continue;
      }
      if (d === dir) streak += 1;
      else break;
    }

    // All-history streak distribution → avg + longest.
    const streaks: { len: number; dir: "up" | "down" }[] = [];
    let run = 1;
    let curDir: "up" | "down" =
      historical[1].close >= historical[0].close ? "up" : "down";
    for (let i = 2; i < historical.length; i++) {
      const d: "up" | "down" =
        historical[i].close >= historical[i - 1].close ? "up" : "down";
      if (d === curDir) run += 1;
      else {
        streaks.push({ len: run, dir: curDir });
        run = 1;
        curDir = d;
      }
    }
    streaks.push({ len: run, dir: curDir });
    const avgLen =
      streaks.reduce((s, r) => s + r.len, 0) / Math.max(1, streaks.length);
    const longest = streaks.reduce<{ len: number; dir: "up" | "down" }>(
      (m, r) => (r.len > m.len ? r : m),
      { len: 0, dir: "up" }
    );

    // 30-day window — ups / total + the dot strip.
    const last30 = historical.slice(-30);
    let ups = 0;
    for (let i = 1; i < last30.length; i++) {
      if (last30[i].close >= last30[i - 1].close) ups += 1;
    }
    const window30 = historical.slice(-31);
    const dots = window30.slice(1).map((d, i) => {
      const prev = window30[i].close;
      const pct = ((d.close - prev) / prev) * 100;
      return { date: d.date, pct, isUp: pct >= 0 };
    });

    return {
      streak,
      dir,
      ups,
      total: Math.max(0, last30.length - 1),
      avgLen,
      longest,
      dots,
    };
  }, [historical]);

  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="almTile almTile--streak">
      <div className="ed-label">Streak</div>
      <div className="almTile__big ed-numerals">
        <span
          className="almTile__streak-n"
          style={{
            color: data.dir === "up" ? "var(--green)" : "var(--stamp)",
          }}
        >
          {data.streak}
        </span>
        <span className="almTile__big-sub">
          {data.streak === 1 ? "day" : "days"} {data.dir ?? "—"}
        </span>
      </div>

      <div
        className="almTile__streak-strip"
        onMouseLeave={() => setHovered(null)}
      >
        {data.dots.map((d, i) => (
          <button
            key={i}
            type="button"
            className={`almTile__streak-dot ${d.isUp ? "is-up" : "is-down"} ${
              hovered === i ? "is-hover" : ""
            }`}
            style={{ animationDelay: `${i * 18}ms` }}
            onMouseEnter={() => setHovered(i)}
            onFocus={() => setHovered(i)}
            onClick={() => setHovered(hovered === i ? null : i)}
            aria-label={`${d.date}: ${d.isUp ? "+" : "−"}${Math.abs(d.pct).toFixed(
              2
            )}%`}
          />
        ))}
      </div>

      <div className="almTile__dot-readout">
        {hovered !== null && data.dots[hovered] ? (
          <>
            <span
              className="ed-numerals"
              style={{ color: "var(--ink)", fontWeight: 700 }}
            >
              {data.dots[hovered].date}
            </span>
            <span
              className="ed-numerals"
              style={{
                fontWeight: 700,
                color: data.dots[hovered].isUp ? "var(--green)" : "var(--stamp)",
              }}
            >
              {data.dots[hovered].isUp ? "+" : "−"}
              {Math.abs(data.dots[hovered].pct).toFixed(2)}%
            </span>
          </>
        ) : (
          <span style={{ color: "var(--ink-mute)" }}>
            30 sessions · hover for detail
          </span>
        )}
      </div>

      <div className="almTile__row">
        <span>Last 30</span>
        <span className="ed-numerals">
          {data.ups} up · {data.total - data.ups} down
        </span>
      </div>

      <div className="almTile__detail">
        <div className="almTile__row">
          <span>Avg streak</span>
          <span className="ed-numerals">{data.avgLen.toFixed(1)} days</span>
        </div>
        <div className="almTile__row">
          <span>Longest ever</span>
          <span className="ed-numerals">
            {data.longest.len} days{" "}
            <span
              style={{
                color:
                  data.longest.dir === "up" ? "var(--green)" : "var(--stamp)",
              }}
            >
              {data.longest.dir}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
