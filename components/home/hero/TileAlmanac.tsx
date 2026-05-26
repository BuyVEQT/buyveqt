"use client";

import { useMemo, useState } from "react";
import type { HistoricalDataPoint } from "@/lib/types";

interface TileAlmanacProps {
  historical: readonly HistoricalDataPoint[];
}

type PillKey = "1y" | "3y" | "5y" | "max";

interface Fact {
  key: PillKey;
  label: string;
  fact: { date: Date; pct: number } | null;
}

/**
 * On this day — flips between four anniversary picks via year-pills:
 *
 *   1Y / 3Y / 5Y / WILDEST
 *
 * For the year-back keys we find the trading session closest to today's
 * calendar date in that year. For WILDEST we find the largest |Δ%| ever
 * on this calendar date across all years. The wildest is the default.
 * Clicking a pill re-keys the year + sentence so their entry animations
 * retrigger (cleaner than a `useEffect` cascade).
 */
export default function TileAlmanac({ historical }: TileAlmanacProps) {
  const facts = useMemo<Fact[]>(() => {
    if (historical.length < 2) {
      return [
        { key: "1y", label: "1Y ago", fact: null },
        { key: "3y", label: "3Y ago", fact: null },
        { key: "5y", label: "5Y ago", fact: null },
        { key: "max", label: "Wildest", fact: null },
      ];
    }

    const today = new Date();
    const m = today.getMonth();
    const d = today.getDate();
    const ty = today.getFullYear();

    const factForYear = (year: number) => {
      let best: { date: Date; pct: number; gap: number } | null = null;
      let bestGap = Infinity;
      for (let i = 1; i < historical.length; i++) {
        const dt = new Date(historical[i].date);
        if (dt.getFullYear() !== year) continue;
        const gap =
          Math.abs(dt.getTime() - new Date(year, m, d).getTime()) /
          (1000 * 60 * 60 * 24);
        if (gap < bestGap) {
          bestGap = gap;
          const pct =
            ((historical[i].close - historical[i - 1].close) /
              historical[i - 1].close) *
            100;
          best = { date: dt, pct, gap };
        }
      }
      return best ? { date: best.date, pct: best.pct } : null;
    };

    const out: Fact[] = [
      { key: "1y", label: "1Y ago", fact: factForYear(ty - 1) },
      { key: "3y", label: "3Y ago", fact: factForYear(ty - 3) },
      { key: "5y", label: "5Y ago", fact: factForYear(ty - 5) },
    ];

    let biggest: { date: Date; pct: number } | null = null;
    for (let i = 1; i < historical.length; i++) {
      const dt = new Date(historical[i].date);
      if (dt.getMonth() === m && dt.getDate() === d) {
        const pct =
          ((historical[i].close - historical[i - 1].close) /
            historical[i - 1].close) *
          100;
        if (!biggest || Math.abs(pct) > Math.abs(biggest.pct)) {
          biggest = { date: dt, pct };
        }
      }
    }
    out.push({ key: "max", label: "Wildest", fact: biggest });
    return out;
  }, [historical]);

  // Default to the most dramatic fact with real data; otherwise the
  // first one available; otherwise the literal first entry.
  const [pick, setPick] = useState<PillKey>(() => {
    const withFact = facts.filter((f) => f.fact);
    if (!withFact.length) return facts[0].key;
    const wildest = withFact.reduce((m, c) =>
      Math.abs((c.fact as { pct: number }).pct) >
      Math.abs((m.fact as { pct: number }).pct)
        ? c
        : m
    );
    return wildest.key;
  });

  const current = facts.find((f) => f.key === pick);
  const fmtMonthDay = (d: Date) =>
    d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });

  if (!current?.fact) {
    return (
      <div className="almTile almTile--almanac">
        <div className="almTile__almanac-head">
          <div className="ed-label">On this day</div>
          <div className="almTile__yr-pills">
            {facts.map((f) => (
              <button
                key={f.key}
                type="button"
                disabled={!f.fact}
                onClick={() => setPick(f.key)}
                className={`almTile__yr-pill ${
                  pick === f.key ? "is-active" : ""
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="almTile__almanac">
          <span className="almTile__almanac-y ed-numerals">—</span>
          <p>No matching prior session on file.</p>
        </div>
      </div>
    );
  }

  const fact = current.fact;
  const up = fact.pct >= 0;

  return (
    <div className="almTile almTile--almanac">
      <div className="almTile__almanac-head">
        <div className="ed-label">On this day</div>
        <div className="almTile__yr-pills">
          {facts.map((f) => (
            <button
              key={f.key}
              type="button"
              disabled={!f.fact}
              onClick={() => setPick(f.key)}
              className={`almTile__yr-pill ${
                pick === f.key ? "is-active" : ""
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <div className="almTile__almanac">
        {/* `key={pick}` re-triggers the entry animation on year change */}
        <span key={pick} className="almTile__almanac-y ed-numerals">
          {fact.date.getFullYear()}
        </span>
        <p key={pick + "-p"}>
          On{" "}
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>
            {fmtMonthDay(fact.date)}
          </span>{" "}
          VEQT
          <span
            className="ed-numerals"
            style={{
              fontWeight: 700,
              margin: "0 4px",
              color: up ? "var(--green)" : "var(--stamp)",
            }}
          >
            {up ? "rose" : "fell"} {Math.abs(fact.pct).toFixed(2)}%
          </span>
          — {Math.abs(fact.pct) > 1 ? "a notable" : "a quiet"} session.
        </p>
      </div>
    </div>
  );
}
