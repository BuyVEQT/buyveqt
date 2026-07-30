"use client";

import { useVeqtData } from "@/lib/useVeqtData";
import { fmtPrice } from "@/lib/instrument-format";

interface LiveTickerPillProps {
  /** Compact = mobile top bar (smaller dot + type). Full = desktop nav. */
  compact?: boolean;
}

/**
 * Live ticker — Instrument grammar: "51.87 LIVE" with a pulsing 7px red
 * dot. No pill chrome, no border radius, ink on paper. Single source of
 * truth for the price chrome that appears on every page.
 *
 * Reads from useVeqtData() client-side; pre-allocates space for a
 * skeleton so first-paint doesn't shift the bar layout.
 */
export default function LiveTickerPill({ compact = false }: LiveTickerPillProps) {
  const { data, loading } = useVeqtData("1Y");
  const quote = data?.quote ?? null;

  const dotSize = compact ? 6 : 7;

  if (loading || !quote) {
    return (
      <span
        aria-hidden
        className="ins-shell"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: compact ? 7 : 8,
          minWidth: compact ? 64 : 72,
          height: compact ? 14 : 15,
        }}
      >
        <span
          style={{
            width: dotSize,
            height: dotSize,
            borderRadius: 999,
            background: "var(--ins-hair)",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            flex: 1,
            height: 9,
            background: "var(--ins-track-soft)",
          }}
        />
      </span>
    );
  }

  return (
    <span
      className="ins-shell"
      aria-label={`VEQT.TO ${fmtPrice(quote.price)}, live`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: compact ? 7 : 8,
        fontFamily: "var(--ins-font)",
        fontSize: compact ? 10.5 : 11,
        fontWeight: 700,
        color: "var(--ins-ink)",
        fontVariantNumeric: "tabular-nums",
        whiteSpace: "nowrap",
      }}
    >
      <span
        aria-hidden
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: 999,
          background: "var(--ins-signal)",
          animation: "ins-pulse 2.2s ease-in-out infinite",
          flexShrink: 0,
        }}
      />
      {fmtPrice(quote.price)} LIVE
    </span>
  );
}
