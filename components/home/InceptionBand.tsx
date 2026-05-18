"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { HistoricalDataPoint, VeqtQuote } from "@/lib/types";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";

interface InceptionBandProps {
  /** Since-inception history, oldest first. Pass useVeqtData("ALL").data?.historical. */
  history: readonly HistoricalDataPoint[];
  quote: VeqtQuote | null;
  loading: boolean;
}

const ILLUSTRATIVE_AMOUNT = 10000;

function fmtUSD(n: number): string {
  return `$${n.toLocaleString("en-CA", { maximumFractionDigits: 0 })}`;
}

/**
 * The dark inception band. Renders "If you'd bought $10,000" + today's
 * resulting value + total return. Read-only on home — the full editable
 * calculator lives on /calculators.
 */
export default function InceptionBand({ history, quote, loading }: InceptionBandProps) {
  const calc = useMemo(() => {
    if (!quote || history.length < 2) return null;
    const firstClose = history[0].close;
    if (!Number.isFinite(firstClose) || firstClose <= 0) return null;
    const today = (ILLUSTRATIVE_AMOUNT * quote.price) / firstClose;
    const returnPct = ((quote.price - firstClose) / firstClose) * 100;
    const inceptionYear = new Date(history[0].date).getFullYear();
    return { today, returnPct, inceptionYear, firstClose };
  }, [history, quote]);

  return (
    <Card dark>
      <SectionLabel dark>Inception calculator</SectionLabel>
      <div
        className="ed-display-italic"
        style={{
          fontSize: "clamp(1.5rem, 3vw, 2rem)",
          lineHeight: 1.1,
          marginTop: 12,
          color: "var(--paper)",
        }}
      >
        If you&apos;d bought
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: 8,
          marginTop: 16,
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            color: "rgba(246, 239, 220, 0.5)",
            fontSize: 28,
            fontFamily: "var(--font-display)",
          }}
        >
          $
        </span>
        <span
          className="ed-display ed-numerals"
          style={{
            borderBottom: "2px solid var(--stamp)",
            fontSize: "clamp(2.6rem, 6vw, 3.5rem)",
            color: "var(--paper)",
            paddingBottom: 2,
            paddingRight: 6,
          }}
        >
          {ILLUSTRATIVE_AMOUNT.toLocaleString("en-CA")}
        </span>
        <span
          style={{
            color: "rgba(246, 239, 220, 0.55)",
            fontSize: 14,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            marginLeft: "auto",
          }}
        >
          {calc ? `at launch, ${calc.inceptionYear}…` : "at launch…"}
        </span>
      </div>

      <div
        style={{
          marginTop: 24,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
        }}
      >
        <div
          style={{
            background: "rgba(246, 239, 220, 0.06)",
            padding: "14px 16px",
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(246, 239, 220, 0.5)",
            }}
          >
            Today
          </div>
          <div
            className="ed-display ed-numerals"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              marginTop: 6,
              color: "var(--paper)",
            }}
          >
            {loading && !calc ? "—" : calc ? fmtUSD(calc.today) : "—"}
          </div>
        </div>
        <div
          style={{
            background: "rgba(124, 192, 149, 0.12)",
            padding: "14px 16px",
            borderRadius: 14,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(124, 192, 149, 0.7)",
            }}
          >
            Return
          </div>
          <div
            className="ed-display ed-numerals"
            style={{
              fontSize: "clamp(1.8rem, 4vw, 2.4rem)",
              marginTop: 6,
              color: "#7cc095",
            }}
          >
            {loading && !calc
              ? "—"
              : calc
              ? `${calc.returnPct >= 0 ? "+" : "−"}${Math.abs(calc.returnPct).toFixed(1)}%`
              : "—"}
          </div>
        </div>
      </div>

      <Link
        href="/calculators?tab=lookback"
        style={{
          marginTop: 22,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          color: "var(--paper)",
          fontFamily: "var(--font-sans)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          textDecoration: "none",
          borderBottom: "1px solid rgba(246, 239, 220, 0.35)",
          paddingBottom: 4,
        }}
      >
        More calculators
        <span style={{ color: "var(--stamp)" }} aria-hidden>
          →
        </span>
      </Link>
    </Card>
  );
}
