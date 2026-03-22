"use client";

import type { VeqtQuote } from "@/lib/types";
import { STATIC_DATA } from "@/lib/constants";

interface StatsStripProps {
  quote: VeqtQuote | null;
  loading: boolean;
}

interface PillProps {
  label: string;
  value: string | null;
  loading: boolean;
  color?: "positive" | "negative" | "default";
}

function Pill({ label, value, loading, color = "default" }: PillProps) {
  let valueClass = "text-[var(--color-text-primary)]";
  if (color === "positive") valueClass = "text-[var(--color-positive)]";
  if (color === "negative") valueClass = "text-[var(--color-negative)]";

  return (
    <div className="flex items-center gap-2 rounded-lg bg-[var(--color-card)] border border-[var(--color-border)] px-3 py-1.5 shrink-0">
      <span className="text-[11px] font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      {loading || value === null ? (
        <div className="skeleton h-4 w-12" />
      ) : (
        <span className={`text-sm font-semibold tabular-nums ${valueClass}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default function StatsStrip({ quote, loading }: StatsStripProps) {
  const ytdColor =
    quote && quote.ytdReturn !== null
      ? quote.ytdReturn >= 0
        ? "positive"
        : "negative"
      : "default";

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-base)]">
      <div className="mx-auto max-w-7xl px-4 py-2 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          <Pill
            label="MER"
            value={`${STATIC_DATA.mer}%`}
            loading={false}
          />
          <Pill
            label="AUM"
            value={STATIC_DATA.aum}
            loading={false}
          />
          <Pill
            label="Div Yield"
            value={quote ? `${quote.dividendYield.toFixed(2)}%` : null}
            loading={loading}
          />
          <Pill
            label="YTD"
            value={
              quote && quote.ytdReturn !== null
                ? `${quote.ytdReturn >= 0 ? "+" : ""}${quote.ytdReturn.toFixed(2)}%`
                : null
            }
            loading={loading}
            color={ytdColor as "positive" | "negative" | "default"}
          />
          <Pill
            label="52W Range"
            value={
              quote
                ? `$${quote.fiftyTwoWeekLow.toFixed(2)}–$${quote.fiftyTwoWeekHigh.toFixed(2)}`
                : null
            }
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
