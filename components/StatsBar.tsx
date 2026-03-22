"use client";

import type { VeqtQuote } from "@/lib/types";
import { STATIC_DATA } from "@/lib/constants";

interface StatsBarProps {
  quote: VeqtQuote | null;
  loading: boolean;
}

interface StatItemProps {
  label: string;
  value: string | null;
  loading: boolean;
  highlight?: "positive" | "negative" | null;
}

function StatItem({ label, value, loading, highlight }: StatItemProps) {
  let valueColor = "text-[var(--color-text-primary)]";
  if (highlight === "positive") valueColor = "text-[var(--color-positive)]";
  if (highlight === "negative") valueColor = "text-[var(--color-negative)]";

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 min-w-[120px]">
      <span className="text-xs font-medium uppercase tracking-wider text-[var(--color-text-muted)]">
        {label}
      </span>
      {loading || value === null ? (
        <div className="skeleton h-6 w-16" />
      ) : (
        <span className={`text-lg font-semibold tabular-nums ${valueColor}`}>
          {value}
        </span>
      )}
    </div>
  );
}

export default function StatsBar({ quote, loading }: StatsBarProps) {
  const ytdHighlight =
    quote && quote.ytdReturn !== null
      ? quote.ytdReturn >= 0
        ? "positive"
        : "negative"
      : null;

  return (
    <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto max-w-5xl overflow-x-auto">
        <div className="flex justify-between min-w-[700px] py-2">
          <StatItem
            label="Price"
            value={quote ? `$${quote.price.toFixed(2)}` : null}
            loading={loading}
          />
          <StatItem
            label="MER"
            value={`${STATIC_DATA.mer}%`}
            loading={false}
          />
          <StatItem
            label="AUM"
            value={STATIC_DATA.aum}
            loading={false}
          />
          <StatItem
            label="Div Yield"
            value={quote ? `${quote.dividendYield.toFixed(2)}%` : null}
            loading={loading}
          />
          <StatItem
            label="YTD Return"
            value={
              quote && quote.ytdReturn !== null
                ? `${quote.ytdReturn >= 0 ? "+" : ""}${quote.ytdReturn.toFixed(2)}%`
                : null
            }
            loading={loading}
            highlight={ytdHighlight as "positive" | "negative" | null}
          />
          <StatItem
            label="52W Range"
            value={
              quote
                ? `$${quote.fiftyTwoWeekLow.toFixed(2)} – $${quote.fiftyTwoWeekHigh.toFixed(2)}`
                : null
            }
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
}
