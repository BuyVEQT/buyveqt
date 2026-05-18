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
 * The hero card on /. Big Fraunces price + change pill + sparkline + range
 * tabs. Background paper-light, rounded 22px. Sparkline auto-scales over
 * the active period's window from useVeqtData.
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

  return (
    <Card padding={0}>
      <div style={{ padding: "26px 24px 22px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
            VEQT.TO · Vanguard All‑Equity ETF
          </div>
          <button
            type="button"
            disabled
            title="Watchlist — coming soon"
            style={{
              background: "transparent",
              border: "1px solid var(--rule-soft)",
              padding: "5px 10px",
              borderRadius: 10,
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "var(--ink-soft)",
              cursor: "not-allowed",
              opacity: 0.85,
              fontFamily: "var(--font-sans)",
            }}
          >
            ★ Watch
          </button>
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
          {loading && !quote ? <span className="skeleton" style={{ display: "inline-block", width: "4ch", height: "1em" }} /> : priceFmt}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
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
              </span>
            </>
          ) : (
            <span className="skeleton" style={{ width: 120, height: 22 }} />
          )}
        </div>

        <div style={{ marginTop: 22, position: "relative", width: "100%" }}>
          {history.length >= 2 ? (
            <Sparkline
              data={history}
              width={920}
              height={92}
              stroke="var(--ink)"
              fill="color-mix(in oklab, var(--ink) 6%, transparent)"
              strokeWidth={1.6}
              style={{ width: "100%", height: 92 }}
              ariaLabel={`VEQT price chart, ${period} period`}
            />
          ) : (
            <div className="skeleton" style={{ height: 92, width: "100%", borderRadius: 8 }} />
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${RANGES.length}, 1fr)`,
            gap: 6,
            marginTop: 16,
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
