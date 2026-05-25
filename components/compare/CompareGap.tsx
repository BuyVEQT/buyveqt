"use client";

import { useEffect, useState, useMemo } from "react";
import Card from "@/components/ui/Card";
import { FUNDS } from "@/data/funds";
import type { ComparePeriod } from "./PerformanceChart";

interface CompareGapProps {
  selected: string[];
  period: ComparePeriod;
}

interface PricePoint {
  date: string;
  close: number;
}

interface CumPoint {
  date: string;
  pct: number;
}

interface SpreadPoint {
  date: string;
  spread: number;
}

interface GapStats {
  lastSpread: number;
  avgGap: number;
  bestDayA: number;
  worstGap: number;
  daysAWon: number;
  totalDays: number;
  spreads: SpreadPoint[];
}

function toCumulative(slice: PricePoint[]): CumPoint[] {
  if (slice.length === 0) return [];
  const base = slice[0].close;
  return slice.map((p) => ({
    date: p.date,
    pct: ((p.close - base) / base) * 100,
  }));
}

function pairSeries(a: CumPoint[], b: CumPoint[]) {
  const bMap = new Map(b.map((p) => [p.date, p.pct]));
  const out: { date: string; a: number; b: number }[] = [];
  for (const p of a) {
    const bv = bMap.get(p.date);
    if (bv !== undefined) out.push({ date: p.date, a: p.pct, b: bv });
  }
  return out;
}

function fmtPct(n: number, digits = 2): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(digits)}%`;
}

function fmtPp(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  const sign = n >= 0 ? "+" : "−";
  return `${sign}${Math.abs(n).toFixed(digits)} pp`;
}

export default function CompareGap({ selected, period }: CompareGapProps) {
  const [dataA, setDataA] = useState<PricePoint[]>([]);
  const [dataB, setDataB] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const tickerA = selected[0];
  const tickerB = selected[1];
  const enabled = selected.length === 2 && !!tickerA && !!tickerB;

  useEffect(() => {
    if (!enabled) {
      setDataA([]);
      setDataB([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(false);
    Promise.all([
      fetch(`/api/funds/chart/${tickerA}?range=${period}`).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`/api/funds/chart/${tickerB}?range=${period}`).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([resA, resB]) => {
        if (cancelled) return;
        const a = (resA?.data ?? []) as PricePoint[];
        const b = (resB?.data ?? []) as PricePoint[];
        if (a.length < 2 || b.length < 2) {
          setError(true);
          setLoading(false);
          return;
        }
        setDataA(a);
        setDataB(b);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [tickerA, tickerB, period, enabled]);

  const stats: GapStats | null = useMemo(() => {
    if (dataA.length < 2 || dataB.length < 2) return null;
    const sa = toCumulative(dataA);
    const sb = toCumulative(dataB);
    const pairs = pairSeries(sa, sb);
    if (pairs.length < 2) return null;

    const spreads: SpreadPoint[] = pairs.map((p) => ({
      date: p.date,
      spread: p.a - p.b,
    }));
    const lastSpread = spreads[spreads.length - 1].spread;

    const dailyDeltas: number[] = [];
    let daysAWon = 0;
    for (let i = 1; i < spreads.length; i++) {
      const delta = spreads[i].spread - spreads[i - 1].spread;
      dailyDeltas.push(delta);
      if (delta > 0) daysAWon++;
    }
    const avgGap =
      dailyDeltas.length > 0
        ? dailyDeltas.reduce((s, x) => s + Math.abs(x), 0) / dailyDeltas.length
        : 0;
    const bestDayA = dailyDeltas.length > 0 ? Math.max(...dailyDeltas) : 0;
    const worstGap = dailyDeltas.length > 0 ? Math.min(...dailyDeltas) : 0;

    return {
      lastSpread,
      avgGap,
      bestDayA,
      worstGap,
      daysAWon,
      totalDays: dailyDeltas.length,
      spreads,
    };
  }, [dataA, dataB]);

  if (!enabled) return null;

  const fundA = FUNDS[tickerA];
  const fundB = FUNDS[tickerB];
  if (!fundA || !fundB) return null;

  const shortA = fundA.shortName;
  const shortB = fundB.shortName;

  const aLeads = (stats?.lastSpread ?? 0) >= 0;
  const winner = aLeads ? shortA : shortB;
  const loser = aLeads ? shortB : shortA;

  // Sparkline math
  const spSpreads = stats?.spreads ?? [];
  const SW = 280, SH = 64;
  const spPadL = 4, spPadR = 4, spPadT = 6, spPadB = 6;
  const spInnerW = SW - spPadL - spPadR;
  const spInnerH = SH - spPadT - spPadB;

  let spMin = Infinity, spMax = -Infinity;
  for (const s of spSpreads) {
    if (s.spread < spMin) spMin = s.spread;
    if (s.spread > spMax) spMax = s.spread;
  }
  const spPad = ((spMax - spMin) * 0.1) || 0.5;
  const spMinP = spMin - spPad;
  const spMaxP = spMax + spPad;

  const spSx = (i: number) =>
    spSpreads.length > 1
      ? spPadL + (i / (spSpreads.length - 1)) * spInnerW
      : spPadL;
  const spSy = (v: number) =>
    spPadT + ((spMaxP - v) / (spMaxP - spMinP)) * spInnerH;

  let spPath = "";
  spSpreads.forEach((s, i) => {
    spPath += `${i === 0 ? "M" : "L"} ${spSx(i).toFixed(1)} ${spSy(s.spread).toFixed(1)} `;
  });

  const zeroY = spSy(0);
  const spFill =
    spSpreads.length > 1
      ? `${spPath} L ${spSx(spSpreads.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${spSx(0).toFixed(1)} ${zeroY.toFixed(1)} Z`
      : "";

  const tiles = stats
    ? [
        { l: "Avg daily gap", v: fmtPct(stats.avgGap) },
        { l: `Best day for ${shortA}`, v: fmtPct(stats.bestDayA) },
        { l: `${shortA} beat ${shortB}`, v: `${stats.daysAWon} / ${stats.totalDays}` },
        { l: "Worst gap", v: fmtPp(stats.worstGap) },
      ]
    : [
        { l: "Avg daily gap", v: "—" },
        { l: `Best day for ${shortA}`, v: "—" },
        { l: `${shortA} beat ${shortB}`, v: "—" },
        { l: "Worst gap", v: "—" },
      ];

  return (
    <Card accent style={{ paddingLeft: 23 }}>
      <div className="ed-stamp">The gap · {period}</div>

      {loading ? (
        <div
          className="ed-display-italic gap__h"
          style={{
            fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)",
            lineHeight: 1.15,
            color: "var(--ink)",
            margin: "8px 0 0",
          }}
        >
          {shortA} vs {shortB}…
        </div>
      ) : error || !stats ? (
        <div
          className="ed-display-italic gap__h"
          style={{
            fontSize: "clamp(1.3rem, 2.4vw, 1.7rem)",
            lineHeight: 1.15,
            color: "var(--ink)",
            margin: "8px 0 0",
          }}
        >
          {shortA} × {shortB}.
        </div>
      ) : (
        <h3 className="gap__h">
          <span className="ed-display" style={{ fontWeight: 500 }}>
            {winner}
          </span>{" "}
          <em>beat</em>{" "}
          <span
            className="ed-display"
            style={{ fontWeight: 500, color: "var(--ink-mute)" }}
          >
            {loser}
          </span>{" "}
          <em>by</em>{" "}
          <span className="ed-display ed-numerals" style={{ fontWeight: 500 }}>
            {Math.abs(stats.lastSpread).toFixed(2)} pp.
          </span>
        </h3>
      )}

      <p className="gap__body">
        Cumulative spread over the period — A minus B. The line crosses zero
        whenever the lead flips.
      </p>

      {/* Inline sparkline */}
      {stats && spSpreads.length >= 2 && (
        <div className="gap__spark">
          <svg
            viewBox={`0 0 ${SW} ${SH}`}
            preserveAspectRatio="none"
            style={{ width: "100%", height: 64, display: "block" }}
          >
            {/* Zero baseline */}
            <line
              x1={spPadL} x2={SW - spPadR}
              y1={zeroY} y2={zeroY}
              stroke="var(--ink-mute)"
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
            {/* Fill */}
            {spFill && (
              <path
                d={spFill}
                fill="color-mix(in oklab, var(--stamp) 12%, transparent)"
              />
            )}
            {/* Line */}
            <path
              d={spPath}
              fill="none"
              stroke="var(--stamp)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          <div className="gap__spark-cap">
            <span className="ed-caption">
              Spread ({shortA} − {shortB})
            </span>
            <span
              className="ed-numerals gap__spark-last"
              style={{
                color: aLeads ? "var(--green)" : "var(--stamp)",
                fontWeight: 700,
              }}
            >
              {aLeads ? "+" : "−"}
              {Math.abs(stats.lastSpread).toFixed(2)} pp
            </span>
          </div>
        </div>
      )}

      <ul className="gap__tiles">
        {tiles.map((t) => (
          <li key={t.l} className="gap__tile">
            <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
              {t.l}
            </div>
            <div
              className="ed-display ed-numerals"
              style={{
                fontSize: 17,
                lineHeight: 1,
                marginTop: 4,
                letterSpacing: "-0.015em",
                color: "var(--ink)",
              }}
            >
              {t.v}
            </div>
          </li>
        ))}
      </ul>

      <style jsx>{`
        .gap__h {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: clamp(1.3rem, 2.4vw, 1.7rem);
          line-height: 1.15;
          color: var(--ink);
          margin: 8px 0 0;
        }
        .gap__body {
          font-family: var(--font-serif);
          font-size: 13.5px;
          color: var(--ink-soft);
          margin: 8px 0 0;
          line-height: 1.5;
        }
        .gap__spark {
          margin-top: 16px;
          padding: 10px 12px;
          background: var(--paper-warm);
          border-radius: 8px;
          border: 1px solid var(--rule-soft);
        }
        .gap__spark-cap {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-top: 6px;
          gap: 12px;
        }
        .gap__spark-last {
          font-family: var(--font-sans);
          font-size: 12px;
        }
        .gap__tiles {
          list-style: none;
          margin: 16px 0 0;
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .gap__tile {
          padding: 10px 12px;
          background: var(--paper-warm);
          border-radius: 8px;
        }
      `}</style>
    </Card>
  );
}
