"use client";

import type { VeqtApiResponse, ChartPeriod } from "@/lib/types";
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
              interactive
              ariaLabel={`VEQT price chart, ${period} period`}
            />
          ) : (
            <div className="skeleton" style={{ height: 108, width: "100%", borderRadius: 8 }} />
          )}
        </div>

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
    </Card>
  );
}
