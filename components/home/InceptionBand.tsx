"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { HistoricalDataPoint, VeqtQuote } from "@/lib/types";
import Card from "@/components/ui/Card";

interface InceptionBandProps {
  history: readonly HistoricalDataPoint[];
  quote: VeqtQuote | null;
  loading: boolean;
}

const ILLUSTRATIVE_AMOUNT = 10000;

function fmtCAD(n: number): string {
  return `$${n.toLocaleString("en-CA", { maximumFractionDigits: 0 })}`;
}

/**
 * Almanac — dark band that answers "what if you bought $10,000 at launch?"
 *
 * Layout matches prototypes/session.jsx Almanac:
 *  - Top eyebrow: "Almanac · since {year}" left, "Entry № {n}" right
 *  - Hairline rule
 *  - "If you'd bought" italic lede
 *  - $10,000 with 2px vermilion bottom border + "at launch, {year}…"
 *  - Two tiles: Today (neutral) + Total Return (green-tinted)
 *  - Italic takeaway with 2px vermilion left border
 *  - "MORE CALCULATORS →" CTA at bottom
 */
export default function InceptionBand({
  history,
  quote,
  loading,
}: InceptionBandProps) {
  const calc = useMemo(() => {
    if (!quote || history.length < 2) return null;
    const firstClose = history[0].close;
    if (!Number.isFinite(firstClose) || firstClose <= 0) return null;
    const today = (ILLUSTRATIVE_AMOUNT * quote.price) / firstClose;
    const returnPct = ((quote.price - firstClose) / firstClose) * 100;
    const inceptionYear = new Date(history[0].date).getFullYear();
    const lastDate = history[history.length - 1].date;
    const yearsHeld = Math.max(
      0.08,
      (new Date(lastDate).getTime() - new Date(history[0].date).getTime()) /
        (1000 * 60 * 60 * 24 * 365.25)
    );
    const cagr =
      (Math.pow(quote.price / firstClose, 1 / yearsHeld) - 1) * 100;
    const monthsSinceInception = Math.round(yearsHeld * 12);
    return {
      today,
      returnPct,
      inceptionYear,
      firstClose,
      cagr,
      monthsSinceInception,
    };
  }, [history, quote]);

  return (
    <Card dark padding={0}>
      <div className="almanac">
        {/* Eyebrow */}
        <div className="almanac__top">
          <span
            className="ed-stamp"
            style={{ color: "rgba(246,239,220,0.55)" }}
          >
            Almanac · since {calc?.inceptionYear ?? "2019"}
          </span>
          <span
            className="ed-stamp"
            style={{ color: "rgba(246,239,220,0.55)" }}
          >
            Entry № {calc?.monthsSinceInception ?? ""}
          </span>
        </div>

        {/* Hairline rule */}
        <div className="almanac__rule" />

        {/* Lede */}
        <div className="ed-display-italic almanac__lede">If you&apos;d bought</div>

        {/* Amount block */}
        <div className="almanac__amount">
          <span className="almanac__currency">$</span>
          <span className="ed-display ed-numerals almanac__num">
            {ILLUSTRATIVE_AMOUNT.toLocaleString("en-CA")}
          </span>
          <span className="almanac__qualifier">
            at launch, {calc?.inceptionYear ?? "2019"}…
          </span>
        </div>

        {/* Two-tile grid */}
        <div className="almanac__grid">
          <div className="almanac__tile">
            <div
              className="ed-stamp"
              style={{ color: "rgba(246,239,220,0.55)" }}
            >
              Today
            </div>
            <div className="ed-display ed-numerals almanac__tile-val">
              {loading && !calc ? "—" : calc ? fmtCAD(calc.today) : "—"}
            </div>
            <div className="almanac__tile-cap">market value</div>
          </div>

          <div className="almanac__tile almanac__tile--accent">
            <div
              className="ed-stamp"
              style={{ color: "rgba(124,192,149,0.75)" }}
            >
              Total return
            </div>
            <div className="ed-display ed-numerals almanac__tile-val almanac__tile-val--green">
              {loading && !calc
                ? "—"
                : calc
                ? `${calc.returnPct >= 0 ? "+" : "−"}${Math.abs(
                    calc.returnPct
                  ).toFixed(1)}%`
                : "—"}
            </div>
            <div className="almanac__tile-cap">
              {calc ? `≈ ${calc.cagr.toFixed(1)}% per year, compounded` : ""}
            </div>
          </div>
        </div>

        {/* Italic takeaway */}
        <p className="ed-body almanac__takeaway">
          <em>
            Sat through one pandemic, two rate cycles, and the rumour of a
            recession that never showed.
          </em>
        </p>

        {/* CTA */}
        <Link href="/calculators?tab=lookback" className="almanac__cta">
          More calculators
          <span style={{ color: "var(--stamp)" }} aria-hidden>
            →
          </span>
        </Link>
      </div>

      <style jsx>{`
        .almanac {
          padding: 26px;
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }
        .almanac__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 12px;
          gap: 10px;
          flex-wrap: wrap;
        }
        .almanac__rule {
          height: 1px;
          background: rgba(246, 239, 220, 0.25);
          margin-bottom: 18px;
        }
        .almanac__lede {
          font-size: clamp(1.5rem, 2.6vw, 1.9rem);
          line-height: 1.05;
          color: var(--band-paper);
          margin-bottom: 14px;
        }
        .almanac__amount {
          display: flex;
          align-items: baseline;
          gap: 6px;
          margin-bottom: 22px;
          flex-wrap: wrap;
        }
        .almanac__currency {
          font-family: var(--font-display);
          font-size: 28px;
          color: rgba(246, 239, 220, 0.55);
        }
        .almanac__num {
          font-size: clamp(2.6rem, 6vw, 3.6rem);
          line-height: 0.95;
          color: var(--band-paper);
          border-bottom: 2px solid var(--stamp);
          padding-bottom: 2px;
          padding-right: 6px;
        }
        .almanac__qualifier {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 14px;
          color: rgba(246, 239, 220, 0.6);
          margin-left: 8px;
        }
        .almanac__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 18px;
        }
        .almanac__tile {
          padding: 14px 16px;
          background: rgba(246, 239, 220, 0.06);
          border-radius: 12px;
          border: 1px solid rgba(246, 239, 220, 0.08);
        }
        .almanac__tile--accent {
          background: rgba(124, 192, 149, 0.1);
          border-color: rgba(124, 192, 149, 0.18);
        }
        .almanac__tile-val {
          font-size: clamp(1.6rem, 3.6vw, 2.2rem);
          margin-top: 6px;
          color: var(--band-paper);
          letter-spacing: -0.02em;
        }
        .almanac__tile-val--green {
          color: #7cc095;
        }
        .almanac__tile-cap {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 12px;
          color: rgba(246, 239, 220, 0.55);
          margin-top: 4px;
        }
        .almanac__takeaway {
          font-size: 14px;
          line-height: 1.55;
          color: rgba(246, 239, 220, 0.72);
          padding-left: 14px;
          border-left: 2px solid var(--stamp);
          margin: 4px 0 22px;
        }
        .almanac__cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: var(--band-paper);
          font-family: var(--font-sans);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          border-bottom: 1px solid rgba(246, 239, 220, 0.35);
          padding-bottom: 5px;
          align-self: flex-start;
          margin-top: auto;
        }
      `}</style>
    </Card>
  );
}
