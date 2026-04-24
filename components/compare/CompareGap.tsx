"use client";

import { useEffect, useMemo, useState } from "react";
import { FUNDS } from "@/data/funds";
import type { ChartPeriod } from "@/lib/types";

interface CompareGapProps {
  /** Two tickers; if more or fewer, the component renders nothing. */
  selectedFunds: string[];
  /** Period must match what PerformanceChart shows; defaults to 1Y. */
  period?: ChartPeriod;
}

interface GapPoint {
  date: string;
  spread: number; // % return of fund A minus % return of fund B
}

/**
 * "The Gap" — when exactly two funds are head-to-head, this strip plots the
 * cumulative-return spread (fund A minus fund B) over the selected period.
 *
 * The line is the same fund A's lead in percentage points over fund B at
 * that date. A vermilion area-fill shows when fund A leads; an ink area-fill
 * shows when fund B leads. The dashed zero-line is the tie. The headline
 * caption tells the story in one numeral: "VEQT leads by +1.8 pp" or
 * "VEQT trails by 0.4 pp".
 *
 * Fund A is whichever ticker appears first in selectedFunds (we keep VEQT
 * pinned to slot 0, so this almost always reads as "VEQT vs other").
 */
export default function CompareGap({
  selectedFunds,
  period = "1Y",
}: CompareGapProps) {
  const [gap, setGap] = useState<GapPoint[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const tickerA = selectedFunds[0];
  const tickerB = selectedFunds[1];
  const enabled = selectedFunds.length === 2 && !!tickerA && !!tickerB;

  useEffect(() => {
    if (!enabled) {
      setGap(null);
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
        const a = (resA?.data ?? []) as { date: string; close: number }[];
        const b = (resB?.data ?? []) as { date: string; close: number }[];
        if (a.length < 2 || b.length < 2) {
          setError(true);
          setLoading(false);
          return;
        }
        const aBase = a[0].close;
        const bBase = b[0].close;
        const bByDate = new Map(b.map((p) => [p.date, p.close]));
        const points: GapPoint[] = [];
        for (const p of a) {
          const bClose = bByDate.get(p.date);
          if (bClose === undefined) continue;
          const aRet = ((p.close - aBase) / aBase) * 100;
          const bRet = ((bClose - bBase) / bBase) * 100;
          points.push({ date: p.date, spread: aRet - bRet });
        }
        if (points.length < 2) {
          setError(true);
          setLoading(false);
          return;
        }
        setGap(points);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError(true);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tickerA, tickerB, period, enabled]);

  // Geometry — recomputed on every render is fine; the data set is small.
  const geometry = useMemo(() => {
    if (!gap || gap.length < 2) return null;
    const W = 800;
    const H = 140;
    const PAD_X = 0;
    const PAD_Y = 14;

    const spreads = gap.map((p) => p.spread);
    const dataMin = Math.min(...spreads, 0);
    const dataMax = Math.max(...spreads, 0);
    // Pad ranges symmetrically so zero stays meaningful
    const halfRange = Math.max(Math.abs(dataMin), Math.abs(dataMax)) * 1.1 || 1;
    const min = -halfRange;
    const max = halfRange;

    const drawableH = H - PAD_Y * 2;
    const stepX = (W - PAD_X * 2) / (gap.length - 1);

    const yFor = (val: number) =>
      PAD_Y + (1 - (val - min) / (max - min)) * drawableH;
    const xFor = (i: number) => PAD_X + i * stepX;
    const zeroY = yFor(0);

    const coords = gap.map((p, i) => ({ x: xFor(i), y: yFor(p.spread) }));

    // Two area fills: above-zero (A leads, vermilion) and below-zero
    // (B leads, ink). We draw them as separate paths clipped at the zero
    // line so the colour swap is crisp.
    const linePath = coords
      .map(
        (c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)} ${c.y.toFixed(1)}`
      )
      .join(" ");

    const areaAbove = `M${coords[0].x.toFixed(1)} ${zeroY.toFixed(1)} ${coords
      .map((c) => `L${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
      .join(" ")} L${coords[coords.length - 1].x.toFixed(1)} ${zeroY.toFixed(1)} Z`;

    const lastSpread = spreads[spreads.length - 1];
    const lastCoord = coords[coords.length - 1];

    return {
      W,
      H,
      linePath,
      areaAbove,
      zeroY,
      lastSpread,
      lastCoord,
    };
  }, [gap]);

  if (!enabled) return null;

  const fundA = FUNDS[tickerA];
  const fundB = FUNDS[tickerB];
  if (!fundA || !fundB) return null;

  const periodLabel =
    period === "ALL"
      ? "since the youngest fund's inception"
      : period === "YTD"
      ? "year-to-date"
      : `over the past ${period.toLowerCase()}`;

  return (
    <section
      className="border-t-2 border-[var(--ink)] pt-5 pb-6"
      aria-labelledby="gap-heading"
    >
      <header className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
        <div>
          <p id="gap-heading" className="bs-stamp mb-1">
            The Gap
          </p>
          <h3
            className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-tight"
            style={{ color: "var(--ink)" }}
          >
            {fundA.shortName}
            <span className="opacity-50 mx-2">·</span>
            <em className="bs-display-italic">{fundB.shortName}</em>
            <span
              className="bs-caption italic font-normal not-italic ml-2"
              style={{ color: "var(--ink-soft)", fontSize: "0.7em" }}
            >
              spread, {periodLabel}
            </span>
          </h3>
        </div>

        {geometry && !loading && (
          <p
            className="bs-numerals not-italic text-[1.25rem] sm:text-[1.5rem] tabular-nums"
            style={{
              color:
                geometry.lastSpread >= 0
                  ? "var(--stamp)"
                  : "var(--ink)",
            }}
          >
            {geometry.lastSpread >= 0 ? "+" : "−"}
            {Math.abs(geometry.lastSpread).toFixed(2)}
            <span
              className="bs-label text-[10.5px] ml-1"
              style={{ color: "var(--ink-soft)", letterSpacing: "0.12em" }}
            >
              pp
            </span>
          </p>
        )}
      </header>

      {loading ? (
        <div className="skeleton h-[140px] w-full" />
      ) : error || !geometry || !gap ? (
        <p
          className="bs-caption italic"
          style={{ color: "var(--ink-soft)" }}
        >
          Spread data unavailable for this matchup.
        </p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${geometry.W} ${geometry.H}`}
            preserveAspectRatio="none"
            width="100%"
            height={140}
            role="img"
            aria-label={`${fundA.shortName} minus ${fundB.shortName} cumulative return spread`}
            style={{ display: "block" }}
          >
            <defs>
              {/* Clip the vermilion fill to above-zero only */}
              <clipPath id="clip-above">
                <rect x={0} y={0} width={geometry.W} height={geometry.zeroY} />
              </clipPath>
              {/* Clip the ink fill to below-zero only */}
              <clipPath id="clip-below">
                <rect
                  x={0}
                  y={geometry.zeroY}
                  width={geometry.W}
                  height={geometry.H - geometry.zeroY}
                />
              </clipPath>
            </defs>

            {/* Vermilion area for the segments where A leads */}
            <path
              d={geometry.areaAbove}
              fill="var(--stamp)"
              opacity={0.18}
              clipPath="url(#clip-above)"
            />
            {/* Ink area for segments where B leads */}
            <path
              d={geometry.areaAbove}
              fill="var(--ink)"
              opacity={0.1}
              clipPath="url(#clip-below)"
            />

            {/* Zero line — the tie */}
            <line
              x1={0}
              x2={geometry.W}
              y1={geometry.zeroY}
              y2={geometry.zeroY}
              stroke="var(--ink)"
              strokeWidth={0.8}
              strokeDasharray="4 4"
              opacity={0.45}
            />

            {/* Spread line itself */}
            <path
              d={geometry.linePath}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.92}
              vectorEffect="non-scaling-stroke"
            />

            {/* Vermilion dot on today's spread */}
            <circle
              cx={geometry.lastCoord.x}
              cy={geometry.lastCoord.y}
              r={6}
              fill="var(--stamp)"
              opacity={0.18}
            />
            <circle
              cx={geometry.lastCoord.x}
              cy={geometry.lastCoord.y}
              r={3}
              fill="var(--stamp)"
            />
          </svg>

          {/* Caption strip — narrative summary */}
          <p
            className="bs-caption italic mt-3 text-[12px] sm:text-[12.5px]"
            style={{ color: "var(--ink-soft)" }}
          >
            {geometry.lastSpread >= 0 ? (
              <>
                <span
                  className="bs-numerals not-italic"
                  style={{ color: "var(--stamp)" }}
                >
                  {fundA.shortName}
                </span>{" "}
                leads {fundB.shortName} by{" "}
                <span className="bs-numerals not-italic text-[var(--ink)]">
                  {Math.abs(geometry.lastSpread).toFixed(2)} pp
                </span>{" "}
                {periodLabel}.
              </>
            ) : (
              <>
                <span className="bs-numerals not-italic text-[var(--ink)]">
                  {fundA.shortName}
                </span>{" "}
                trails {fundB.shortName} by{" "}
                <span className="bs-numerals not-italic text-[var(--ink)]">
                  {Math.abs(geometry.lastSpread).toFixed(2)} pp
                </span>{" "}
                {periodLabel}.
              </>
            )}
          </p>
        </>
      )}
    </section>
  );
}
