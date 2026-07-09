"use client";

import { useVeqtData } from "@/lib/useVeqtData";
import Pill from "@/components/ui/Pill";

interface LiveTickerPillProps {
  /** Compact = mobile (no ticker label, single line). Full = desktop. */
  compact?: boolean;
}

/**
 * Sticky live ticker pill: red dot + (optional ticker label) + price + change% badge.
 * Single source of truth for the price chrome that appears on every page.
 * Reads from useVeqtData() client-side; pre-allocates space for a skeleton
 * so first-paint doesn't shift the bar layout.
 */
export default function LiveTickerPill({ compact = false }: LiveTickerPillProps) {
  const { data, loading } = useVeqtData("1Y");
  const quote = data?.quote ?? null;
  const up = (quote?.changePercent ?? 0) >= 0;

  if (loading || !quote) {
    return (
      <span
        aria-hidden
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: compact ? "4px 10px" : "6px 12px",
          borderRadius: 999,
          background: "var(--paper-light)",
          border: "1px solid var(--rule-soft)",
          minWidth: compact ? 110 : 200,
          height: compact ? 26 : 32,
        }}
      >
        <span
          style={{
            width: compact ? 5 : 7,
            height: compact ? 5 : 7,
            borderRadius: "50%",
            background: "var(--rule-soft)",
          }}
        />
        <span className="skeleton" style={{ flex: 1, height: 10, borderRadius: 4 }} />
      </span>
    );
  }

  const priceFmt = `$${quote.price.toFixed(2)}`;
  const pctFmt = `${up ? "↑" : "↓"} ${up ? "+" : "−"}${Math.abs(quote.changePercent).toFixed(2)}%`;

  if (compact) {
    return (
      <span
        className="ed-numerals"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "4px 10px",
          borderRadius: 999,
          background: "var(--paper-light)",
          border: "1px solid var(--rule-soft)",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "var(--stamp)",
          }}
        />
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: "var(--ink)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {priceFmt}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: up ? "var(--green)" : "var(--stamp)",
            fontFamily: "var(--font-sans)",
          }}
        >
          {pctFmt}
        </span>
      </span>
    );
  }

  return (
    <span
      className="ed-numerals"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontFamily: "var(--font-sans)",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: "var(--stamp)",
          boxShadow: "0 0 0 4px var(--stamp-soft)",
        }}
      />
      <span
        style={{
          fontSize: 12,
          color: "var(--ink-mute)",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
      >
        VEQT.TO
      </span>
      <span style={{ fontWeight: 700, fontSize: 16, color: "var(--ink)" }}>{priceFmt}</span>
      <Pill tone={up ? "up" : "down"}>{pctFmt}</Pill>
    </span>
  );
}
