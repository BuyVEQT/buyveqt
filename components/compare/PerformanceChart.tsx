"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Card from "@/components/ui/Card";
import { FUNDS } from "@/data/funds";
import { fundColor } from "@/lib/styles";
import { getCached, setCache } from "@/lib/cache";

export type ComparePeriod = "3M" | "6M" | "1Y" | "5Y" | "ALL";
const PERIOD_KEYS: ComparePeriod[] = ["3M", "6M", "1Y", "5Y", "ALL"];

const PERF_PERIOD_SUB: Record<ComparePeriod, string> = {
  "3M": "Past 3 months, total return",
  "6M": "Past 6 months, total return",
  "1Y": "Past 12 months, total return",
  "5Y": "Past 5 years, total return",
  ALL: "Since the youngest fund's inception",
};

interface PerformanceChartProps {
  selected: string[];
  period: ComparePeriod;
  onPeriodChange: (p: ComparePeriod) => void;
}

interface PricePoint {
  date: string;
  close: number;
}

interface CumPoint {
  date: string;
  pct: number;
}

interface SeriesData {
  ticker: string;
  shortName: string;
  color: string;
  points: CumPoint[];
}

interface PairedPoint {
  date: string;
  a: number;
  b: number;
}

function toCumulative(slice: PricePoint[]): CumPoint[] {
  if (slice.length === 0) return [];
  const base = slice[0].close;
  return slice.map((p) => ({
    date: p.date,
    pct: ((p.close - base) / base) * 100,
  }));
}

function pairSeries(a: CumPoint[], b: CumPoint[]): PairedPoint[] {
  const bMap = new Map(b.map((p) => [p.date, p.pct]));
  const out: PairedPoint[] = [];
  for (const p of a) {
    const bv = bMap.get(p.date);
    if (bv !== undefined) out.push({ date: p.date, a: p.pct, b: bv });
  }
  return out;
}

export default function PerformanceChart({
  selected,
  period,
  onPeriodChange,
}: PerformanceChartProps) {
  const [rawData, setRawData] = useState<Record<string, PricePoint[]>>({});
  const [loading, setLoading] = useState(true);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const fetchChartData = useCallback(async () => {
    setLoading(true);
    try {
      const results = await Promise.all(
        selected.map(async (ticker) => {
          const cacheKey = `chart:${ticker}:${period}`;
          try {
            const res = await fetch(`/api/funds/chart/${ticker}?range=${period}`);
            if (!res.ok) throw new Error("API error");
            const json = await res.json();
            const arr = json.data as PricePoint[];
            setCache(cacheKey, arr);
            return { ticker, data: arr };
          } catch {
            const cached = getCached<PricePoint[]>(cacheKey);
            return { ticker, data: cached ?? [] };
          }
        })
      );
      const map: Record<string, PricePoint[]> = {};
      for (const { ticker, data } of results) {
        map[ticker] = data;
      }
      setRawData(map);
    } catch {
      // keep stale data
    } finally {
      setLoading(false);
    }
  }, [selected, period]);

  useEffect(() => {
    fetchChartData();
  }, [fetchChartData]);

  // Build series from raw data, normalized to 0% at slice start
  const series: SeriesData[] = useMemo(() => {
    return selected
      .map((ticker) => {
        const data = rawData[ticker] ?? [];
        const fund = FUNDS[ticker];
        if (!fund || data.length < 2) return null;
        const points = toCumulative(data);
        return {
          ticker,
          shortName: fund.shortName,
          color: fundColor(fund.shortName),
          points,
        };
      })
      .filter((s): s is SeriesData => s !== null);
  }, [selected, rawData]);

  // For ALL: trim all to the latest start date and re-base
  const trimmed: SeriesData[] = useMemo(() => {
    if (period !== "ALL" || series.length === 0) return series;
    const latestStart = series
      .map((s) => s.points[0]?.date)
      .filter(Boolean)
      .sort()
      .pop();
    if (!latestStart) return series;
    return series.map((s) => {
      const startIdx = s.points.findIndex((p) => p.date >= latestStart);
      if (startIdx <= 0) return s;
      const trimmedPts = s.points.slice(startIdx);
      const base = trimmedPts[0]?.pct ?? 0;
      return {
        ...s,
        points: trimmedPts.map((p) => ({ ...p, pct: p.pct - base })),
      };
    });
  }, [period, series]);

  const allPts = trimmed.flatMap((s) => s.points);

  // SVG dimensions
  const W = 820, H = 280, padL = 50, padR = 14, padT = 18, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;

  const xMin =
    allPts.length > 0
      ? new Date(allPts[0].date).getTime()
      : 0;
  const xMax =
    allPts.length > 0
      ? new Date(allPts[allPts.length - 1].date).getTime()
      : 1;

  let yMinRaw = Infinity, yMaxRaw = -Infinity;
  for (const p of allPts) {
    if (p.pct < yMinRaw) yMinRaw = p.pct;
    if (p.pct > yMaxRaw) yMaxRaw = p.pct;
  }
  const yPad = ((yMaxRaw - yMinRaw) * 0.1) || 4;
  const yMin = yMinRaw - yPad;
  const yMax = yMaxRaw + yPad;

  const sx = (date: string) =>
    padL + ((new Date(date).getTime() - xMin) / (xMax - xMin)) * innerW;
  const sy = (pct: number) =>
    padT + ((yMax - pct) / (yMax - yMin)) * innerH;
  const yZero = sy(0);

  // Per-series SVG paths
  const paths = trimmed.map((s) => {
    let d = "";
    s.points.forEach((p, i) => {
      d += `${i === 0 ? "M" : "L"} ${sx(p.date).toFixed(1)} ${sy(p.pct).toFixed(1)} `;
    });
    return d;
  });

  // Divergence area polygon when 2 funds
  let divergenceArea: string | null = null;
  if (trimmed.length === 2) {
    const pairs = pairSeries(trimmed[0].points, trimmed[1].points);
    if (pairs.length > 1) {
      const aPath = pairs
        .map(
          (p, i) =>
            `${i === 0 ? "M" : "L"} ${sx(p.date).toFixed(1)} ${sy(p.a).toFixed(1)}`
        )
        .join(" ");
      const bPathRev = pairs
        .slice()
        .reverse()
        .map((p) => `L ${sx(p.date).toFixed(1)} ${sy(p.b).toFixed(1)}`)
        .join(" ");
      divergenceArea = `${aPath} ${bPathRev} Z`;
    }
  }

  // Year ticks
  const yearTicks: { year: number; x: number }[] = [];
  let lastYear = -1;
  for (const p of allPts) {
    const yr = new Date(p.date).getFullYear();
    if (yr !== lastYear) {
      yearTicks.push({ year: yr, x: sx(p.date) });
      lastYear = yr;
    }
  }

  // Hover handling — shared between mouse and touch
  const updateHoverFromClientX = (
    svg: SVGSVGElement,
    clientX: number
  ) => {
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    if (px < padL || px > W - padR) {
      setHoverX(null);
      return;
    }
    setHoverX(px);
  };
  const onMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    updateHoverFromClientX(e.currentTarget, e.clientX);
  };
  const onMouseLeave = () => setHoverX(null);

  // Touch handlers mirror the mouse behavior so phone users see the
  // same hover readout when they drag a finger across the chart.
  const onTouchStart = (e: React.TouchEvent<SVGSVGElement>) => {
    const t = e.touches[0];
    if (!t) return;
    updateHoverFromClientX(e.currentTarget, t.clientX);
  };
  const onTouchMove = (e: React.TouchEvent<SVGSVGElement>) => {
    const t = e.touches[0];
    if (!t) return;
    updateHoverFromClientX(e.currentTarget, t.clientX);
  };
  const onTouchEnd = () => setHoverX(null);

  // Hover snapshot — nearest point on each series
  const hoverSnap = useMemo(() => {
    if (hoverX === null || xMax === xMin) return null;
    const ratio = (hoverX - padL) / innerW;
    const targetMs = xMin + ratio * (xMax - xMin);
    return trimmed
      .map((s) => {
        if (s.points.length === 0) return null;
        let best = s.points[0];
        let bestDiff = Infinity;
        for (const p of s.points) {
          const diff = Math.abs(new Date(p.date).getTime() - targetMs);
          if (diff < bestDiff) {
            bestDiff = diff;
            best = p;
          }
        }
        return { ticker: s.ticker, shortName: s.shortName, color: s.color, pt: best };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
  }, [hoverX, trimmed, padL, innerW, xMin, xMax]);

  // Finals for legend
  const finals = trimmed.map((s) => ({
    ticker: s.ticker,
    shortName: s.shortName,
    color: s.color,
    finalPct: s.points[s.points.length - 1]?.pct ?? 0,
  }));

  const hasData = allPts.length >= 2;

  return (
    <Card>
      <div className="perf__head">
        <div>
          <div className="ed-stamp">The chart</div>
          <h2 className="ed-display-italic perf__h2">Side by side, normalised.</h2>
        </div>
        <div className="perf__tabs" role="tablist">
          {PERIOD_KEYS.map((r) => (
            <button
              key={r}
              type="button"
              role="tab"
              aria-selected={r === period}
              onClick={() => onPeriodChange(r)}
              className={`perf__tab${r === period ? " is-active" : ""}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <p className="ed-caption perf__sub">{PERF_PERIOD_SUB[period]}</p>

      <div className="perf__chart-wrap">
        {loading ? (
          <div
            className="skeleton"
            style={{ height: 240, borderRadius: 8 }}
            aria-label="Loading performance chart…"
          />
        ) : !hasData ? (
          <div
            style={{
              height: 240,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-serif)",
              fontStyle: "italic",
              color: "var(--ink-mute)",
            }}
          >
            Chart data unavailable for the selected funds.
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="perf__chart"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Y gridlines */}
            {[yMin, (yMin + yMax) / 2, yMax].map((v, i) => (
              <g key={i}>
                <line
                  x1={padL} x2={W - padR}
                  y1={sy(v)} y2={sy(v)}
                  stroke="var(--rule-hair)"
                  strokeWidth="0.6"
                  strokeDasharray={i === 1 ? "0" : "2 4"}
                />
                <text
                  x={padL - 6} y={sy(v) + 3}
                  fontSize="9"
                  fill="var(--ink-mute)"
                  textAnchor="end"
                  fontFamily="var(--font-sans)"
                  fontWeight="600"
                >
                  {v >= 0 ? "+" : ""}{v.toFixed(0)}%
                </text>
              </g>
            ))}

            {/* Zero baseline */}
            {yMin < 0 && yMax > 0 && (
              <line
                x1={padL} x2={W - padR}
                y1={yZero} y2={yZero}
                stroke="var(--ink)"
                strokeWidth="0.7"
                opacity="0.4"
              />
            )}

            {/* Divergence area */}
            {divergenceArea && (
              <path
                d={divergenceArea}
                fill="color-mix(in oklab, var(--stamp) 14%, transparent)"
                opacity="0.6"
              />
            )}

            {/* Year ticks */}
            {yearTicks.map((t, i) => (
              <g key={i}>
                <line
                  x1={t.x} x2={t.x}
                  y1={H - padB} y2={H - padB + 4}
                  stroke="var(--ink-mute)"
                  strokeWidth="0.7"
                />
                <text
                  x={t.x} y={H - padB + 16}
                  fontSize="9.5"
                  fill="var(--ink-mute)"
                  textAnchor="middle"
                  fontFamily="var(--font-sans)"
                  fontWeight="600"
                  letterSpacing="0.08em"
                >
                  {t.year}
                </text>
              </g>
            ))}

            {/* Lines */}
            {paths.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke={trimmed[i].color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            ))}

            {/* End-dots */}
            {trimmed.map((s, i) => {
              const last = s.points[s.points.length - 1];
              if (!last) return null;
              return (
                <circle
                  key={i}
                  cx={sx(last.date)}
                  cy={sy(last.pct)}
                  r="3.5"
                  fill={s.color}
                />
              );
            })}

            {/* Hover crosshair */}
            {hoverX !== null && (
              <g pointerEvents="none">
                <line
                  x1={hoverX} x2={hoverX}
                  y1={padT} y2={H - padB}
                  stroke="var(--ink)"
                  strokeWidth="0.6"
                  opacity="0.4"
                />
                {hoverSnap?.map((h, i) => (
                  <circle
                    key={i}
                    cx={sx(h.pt.date)}
                    cy={sy(h.pt.pct)}
                    r="4"
                    fill={h.color}
                    stroke="var(--paper)"
                    strokeWidth="1.5"
                  />
                ))}
              </g>
            )}
          </svg>
        )}

        {/* Hover readout */}
        {hasData && (
          <div className="perf__readout" aria-live="polite">
            {hoverSnap && hoverSnap.length > 0 ? (
              <>
                <span
                  className="ed-caption"
                  style={{ color: "var(--ink-mute)" }}
                >
                  {new Date(hoverSnap[0].pt.date).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {hoverSnap.map((h) => (
                  <span key={h.ticker} className="perf__readout-item">
                    <span
                      className="perf__readout-sw"
                      style={{ background: h.color }}
                    />
                    <strong>{h.shortName}</strong>
                    <span
                      className="ed-numerals"
                      style={{
                        color:
                          h.pt.pct >= 0 ? "var(--green)" : "var(--stamp)",
                        fontWeight: 700,
                      }}
                    >
                      {h.pt.pct >= 0 ? "+" : ""}
                      {h.pt.pct.toFixed(2)}%
                    </span>
                  </span>
                ))}
                {hoverSnap.length === 2 && (
                  <span className="perf__readout-spread">
                    <span className="ed-caption">spread</span>
                    <span
                      className="ed-numerals"
                      style={{ color: "var(--ink)", fontWeight: 700 }}
                    >
                      {hoverSnap[0].pt.pct - hoverSnap[1].pt.pct >= 0 ? "+" : "−"}
                      {Math.abs(
                        hoverSnap[0].pt.pct - hoverSnap[1].pt.pct
                      ).toFixed(2)}{" "}
                      pp
                    </span>
                  </span>
                )}
              </>
            ) : (
              <span
                className="ed-caption"
                style={{ color: "var(--ink-mute)" }}
              >
                Hover the chart to see values
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {hasData && (
        <ul className="perf__legend">
          {finals.map(({ ticker, shortName, color, finalPct }) => (
            <li key={ticker} className="perf__legend-item">
              <span className="perf__legend-sw" style={{ background: color }} />
              <span className="perf__legend-name">{shortName}</span>
              <span
                className="ed-numerals perf__legend-pct"
                style={{
                  color: finalPct >= 0 ? "var(--green)" : "var(--stamp)",
                }}
              >
                {finalPct >= 0 ? "+" : "−"}
                {Math.abs(finalPct).toFixed(2)}%
              </span>
            </li>
          ))}
        </ul>
      )}

      <style jsx>{`
        .perf__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          flex-wrap: wrap;
        }
        .perf__h2 {
          font-size: clamp(1.5rem, 2.4vw, 1.9rem);
          line-height: 1.15;
          margin: 4px 0 0;
          color: var(--ink);
        }
        .perf__sub {
          margin: 14px 0 12px;
          font-size: 13px;
        }
        .perf__tabs {
          display: flex;
          gap: 4px;
        }
        .perf__tab {
          appearance: none;
          border: 1px solid var(--rule-soft);
          background: transparent;
          color: var(--ink-soft);
          padding: 6px 12px;
          border-radius: 8px;
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          cursor: pointer;
        }
        .perf__tab:not(.is-active):hover {
          background: var(--paper-warm);
        }
        .perf__tab.is-active {
          background: var(--ink);
          color: var(--paper-light);
          border-color: var(--ink);
        }
        .perf__chart-wrap {
          margin-top: 8px;
          padding: 14px 0 6px;
          border-top: 1px solid var(--rule-soft);
        }
        .perf__chart {
          width: 100%;
          height: auto;
          display: block;
          cursor: crosshair;
        }
        .perf__readout {
          display: flex;
          flex-wrap: wrap;
          align-items: baseline;
          gap: 16px;
          padding: 12px 0 4px;
          font-family: var(--font-sans);
          font-size: 12px;
          color: var(--ink);
          min-height: 36px;
        }
        .perf__readout-item {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
        }
        .perf__readout-item strong {
          font-weight: 700;
        }
        .perf__readout-sw {
          width: 10px;
          height: 10px;
          border-radius: 2px;
          align-self: center;
          flex-shrink: 0;
        }
        .perf__readout-spread {
          display: inline-flex;
          align-items: baseline;
          gap: 6px;
          margin-left: auto;
        }
        .perf__legend {
          list-style: none;
          margin: 14px 0 0;
          padding: 14px 0 0;
          border-top: 1px solid var(--rule-soft);
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
        }
        .perf__legend-item {
          display: inline-flex;
          align-items: baseline;
          gap: 8px;
          font-family: var(--font-sans);
          font-size: 12.5px;
          color: var(--ink-soft);
        }
        .perf__legend-sw {
          width: 14px;
          height: 3px;
          border-radius: 2px;
          align-self: center;
          flex-shrink: 0;
        }
        .perf__legend-name {
          font-weight: 600;
          color: var(--ink);
        }
        .perf__legend-pct {
          font-weight: 700;
        }
      `}</style>
    </Card>
  );
}
