"use client";

import { useMemo } from "react";
import type { VeqtApiResponse, ChartPeriod, HistoricalDataPoint } from "@/lib/types";
import Card from "@/components/ui/Card";
import Pill from "@/components/ui/Pill";
import Sparkline from "@/components/charts/Sparkline";

interface HeroPriceCardProps {
  data: VeqtApiResponse | null;
  loading: boolean;
  period: ChartPeriod;
  onPeriodChange: (p: ChartPeriod) => void;
}

const RANGES: ChartPeriod[] = ["1M", "3M", "1Y", "5Y", "ALL"];

const PERIOD_LABEL: Record<ChartPeriod, string> = {
  "1M": "1 month",
  "3M": "3 months",
  "6M": "6 months",
  YTD: "YTD",
  "1Y": "1 year",
  "3Y": "3 years",
  "5Y": "5 years",
  ALL: "since inception",
};

interface PeriodStats {
  startClose: number;
  endClose: number;
  high: number;
  low: number;
  /** Compounded period return as a percent, e.g. +2.41 */
  returnPct: number;
  /** Mean of |daily close-to-close % moves| over the period. */
  typicalDailyPct: number;
}

function computePeriodStats(history: readonly HistoricalDataPoint[]): PeriodStats | null {
  if (history.length < 2) return null;
  const startClose = history[0].close;
  const endClose = history[history.length - 1].close;
  let high = -Infinity;
  let low = Infinity;
  let absSum = 0;
  let absCount = 0;
  for (let i = 0; i < history.length; i++) {
    const c = history[i].close;
    if (c > high) high = c;
    if (c < low) low = c;
    if (i > 0) {
      const prev = history[i - 1].close;
      if (prev > 0) {
        absSum += Math.abs((c - prev) / prev) * 100;
        absCount += 1;
      }
    }
  }
  const returnPct = startClose > 0 ? ((endClose - startClose) / startClose) * 100 : 0;
  const typicalDailyPct = absCount > 0 ? absSum / absCount : 0;
  return { startClose, endClose, high, low, returnPct, typicalDailyPct };
}

/**
 * The hero card on /. Big Fraunces price + change pill + 52w hi/lo +
 * prev-close caption + rich sparkline + range tabs. The sparkline
 * supports hover scrub (date + price readout), gradient area fill,
 * year tick rhythm (visible on multi-year ranges), and min/max markers
 * with inline value labels.
 */
export default function HeroPriceCard({
  data,
  loading,
  period,
  onPeriodChange,
}: HeroPriceCardProps) {
  const quote = data?.quote ?? null;
  const history = data?.historical ?? [];
  const up = (quote?.changePercent ?? 0) >= 0;
  const priceFmt = quote ? `$${quote.price.toFixed(2)}` : "—";
  const changeAbs = quote ? Math.abs(quote.change).toFixed(2) : "—";
  const pctFmt = quote
    ? `${up ? "↑" : "↓"} ${up ? "+" : "−"}${Math.abs(quote.changePercent).toFixed(2)}%`
    : "—";
  // Year ticks are useful only on long ranges.
  const showYearTicks = period === "ALL" || period === "5Y" || period === "3Y";
  // Min/max markers crowd short ranges; show on 3M+.
  const showExtrema = period !== "1M";

  const periodStats = useMemo(() => computePeriodStats(history), [history]);
  const periodUp = (periodStats?.returnPct ?? 0) >= 0;

  return (
    <Card padding={0}>
      <div style={{ padding: "26px 24px 22px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
            VEQT.TO · Vanguard All‑Equity ETF · TSX
          </div>
          {quote && quote.fiftyTwoWeekHigh > 0 && quote.fiftyTwoWeekLow > 0 && (
            <div
              className="ed-numerals"
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                color: "var(--ink-mute)",
                letterSpacing: "0.04em",
              }}
            >
              52w&nbsp;hi&nbsp;
              <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>
                ${quote.fiftyTwoWeekHigh.toFixed(2)}
              </span>{" "}
              · lo&nbsp;
              <span style={{ color: "var(--ink-soft)", fontWeight: 600 }}>
                ${quote.fiftyTwoWeekLow.toFixed(2)}
              </span>
            </div>
          )}
        </div>

        <div
          className="ed-display ed-numerals"
          style={{
            fontSize: "clamp(3.2rem, 8vw, 6.5rem)",
            lineHeight: 0.95,
            letterSpacing: "-0.03em",
            color: "var(--ink)",
            marginTop: 14,
          }}
        >
          {loading && !quote ? (
            <span
              className="skeleton"
              style={{ display: "inline-block", width: "4ch", height: "1em" }}
            />
          ) : (
            priceFmt
          )}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
            flexWrap: "wrap",
          }}
        >
          {quote ? (
            <>
              <Pill tone={up ? "up" : "down"} style={{ fontSize: 13, padding: "4px 12px" }}>
                {pctFmt}
              </Pill>
              <span
                className="ed-numerals"
                style={{
                  fontFamily: "var(--font-sans)",
                  color: "var(--ink-mute)",
                  fontSize: 13,
                }}
              >
                {up ? "+" : "−"}${changeAbs} today
                {quote.previousClose > 0 && (
                  <> · vs. ${quote.previousClose.toFixed(2)} prev</>
                )}
              </span>
            </>
          ) : (
            <span className="skeleton" style={{ width: 120, height: 22 }} />
          )}
        </div>

        <div
          style={{
            marginTop: 28,
            position: "relative",
            width: "100%",
            color: "var(--ink)",
          }}
        >
          {history.length >= 2 ? (
            <Sparkline
              data={history}
              width={920}
              height={108}
              stroke="var(--ink)"
              gradient
              dot
              strokeWidth={1.6}
              showExtrema={showExtrema}
              yearTicks={showYearTicks}
              referencePrice={periodStats?.startClose ?? null}
              interactive
              dragSelect
              ariaLabel={`VEQT price chart, ${period} period`}
            />
          ) : (
            <div className="skeleton" style={{ height: 108, width: "100%", borderRadius: 8 }} />
          )}
        </div>
        <div
          style={{
            marginTop: 8,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 12,
            color: "var(--ink-mute)",
            textAlign: "right",
          }}
        >
          Drag any two points on the chart to compare →
        </div>

        {/* Period stats strip — three quiet metrics scoped to the selected
            range. Sits below the chart so it reads as the chart's caption,
            not as a competing headline. Updates when the user clicks tabs. */}
        {periodStats && (
          <div className="hero-period-stats">
            <div className="hero-period-stat">
              <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
                {period} return
              </div>
              <div
                className="ed-numerals"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 22,
                  lineHeight: 1.05,
                  marginTop: 6,
                  color: periodUp ? "var(--green)" : "var(--stamp)",
                  letterSpacing: "-0.01em",
                }}
              >
                {periodUp ? "+" : "−"}
                {Math.abs(periodStats.returnPct).toFixed(2)}%
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "var(--ink-mute)",
                  marginTop: 2,
                }}
              >
                {PERIOD_LABEL[period]}
              </div>
            </div>

            <div className="hero-period-stat">
              <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
                Range
              </div>
              <div
                className="ed-numerals"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 22,
                  lineHeight: 1.05,
                  marginTop: 6,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                ${periodStats.low.toFixed(2)}
                <span style={{ color: "var(--ink-mute)", margin: "0 4px" }}>–</span>
                ${periodStats.high.toFixed(2)}
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "var(--ink-mute)",
                  marginTop: 2,
                }}
              >
                low to high
              </div>
            </div>

            <div className="hero-period-stat">
              <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
                Typical day
              </div>
              <div
                className="ed-numerals"
                style={{
                  fontFamily: "var(--font-display)",
                  fontWeight: 500,
                  fontSize: 22,
                  lineHeight: 1.05,
                  marginTop: 6,
                  color: "var(--ink)",
                  letterSpacing: "-0.01em",
                }}
              >
                ±{periodStats.typicalDailyPct.toFixed(2)}%
              </div>
              <div
                style={{
                  fontFamily: "var(--font-serif)",
                  fontStyle: "italic",
                  fontSize: 12,
                  color: "var(--ink-mute)",
                  marginTop: 2,
                }}
              >
                avg close-to-close move
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${RANGES.length}, 1fr)`,
            gap: 6,
            marginTop: 28,
          }}
        >
          {RANGES.map((p) => {
            const active = p === period;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodChange(p)}
                aria-pressed={active}
                style={{
                  appearance: "none",
                  border: "none",
                  padding: "9px 0",
                  borderRadius: 10,
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper-light)" : "var(--ink-soft)",
                  fontFamily: "var(--font-sans)",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.04em",
                  cursor: "pointer",
                  transition: "background 0.15s, color 0.15s",
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        .hero-period-stats {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px 20px;
          margin-top: 22px;
          padding-top: 18px;
          border-top: 1px solid var(--rule-soft);
        }
        @media (min-width: 560px) {
          .hero-period-stats {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        .hero-period-stat {
          min-width: 0;
        }
      `}</style>
    </Card>
  );
}
