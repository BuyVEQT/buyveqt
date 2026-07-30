"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { HistoricalDataPoint, VeqtQuote } from "@/lib/types";
import {
  fmtMoney,
  fmtSignedPct,
  parseSessionDate,
} from "@/lib/instrument-format";

interface InceptionBandProps {
  history: HistoricalDataPoint[];
  quote: VeqtQuote | null;
  loading: boolean;
}

const AMOUNT = 10_000;
const LAUNCH_YEAR = 2019;
const LAUNCH_MONTH_INDEX = 0; // January

/**
 * The Almanac — ink panel (stays literal #111111 under editions).
 * "If you'd bought $10,000 at launch, January 2019…" → today's market value,
 * total return + CAGR, takeaway, MORE CALCULATORS CTA pinned to the bottom.
 */
export default function InceptionBand({
  history,
  quote, // eslint-disable-line @typescript-eslint/no-unused-vars -- contract prop; values derive from history per spec
  loading,
}: InceptionBandProps) {
  const calc = useMemo(() => {
    if (history.length < 2) return null;
    const firstClose = history[0].close;
    const lastClose = history[history.length - 1].close;
    if (
      !Number.isFinite(firstClose) ||
      firstClose <= 0 ||
      !Number.isFinite(lastClose) ||
      lastClose <= 0
    ) {
      return null;
    }
    const today = (AMOUNT * lastClose) / firstClose;
    const totalPct = (lastClose / firstClose - 1) * 100;
    const years = Math.max(
      0.08,
      (parseSessionDate(history[history.length - 1].date).getTime() -
        parseSessionDate(history[0].date).getTime()) /
        (365.25 * 86_400_000)
    );
    const cagr = (Math.pow(lastClose / firstClose, 1 / years) - 1) * 100;
    return { today, totalPct, cagr };
  }, [history]);

  // Entry № — months since January 2019 (June 2026 → 89), from the clock.
  const entryNo = useMemo(() => {
    const now = new Date();
    return (
      (now.getFullYear() - LAUNCH_YEAR) * 12 +
      (now.getMonth() - LAUNCH_MONTH_INDEX)
    );
  }, []);

  const showSkeleton = loading && !calc;

  return (
    <section className="almanac" aria-label="Almanac">
      {/* Top row */}
      <div className="almanac__top">
        <span>ALMANAC · SINCE 2019</span>
        <span>
          <span className="almanac__no-word">ENTRY </span>№ {entryNo}
        </span>
      </div>
      <div className="almanac__rule" aria-hidden />

      {showSkeleton ? (
        <div aria-hidden>
          <div className="almanac__bar" style={{ width: "38%", height: 22 }} />
          <div
            className="almanac__bar"
            style={{ width: "64%", height: 58, marginTop: 12 }}
          />
          <div className="almanac__bar-pair">
            <div className="almanac__bar" style={{ height: 84 }} />
            <div className="almanac__bar" style={{ height: 84 }} />
          </div>
          <div
            className="almanac__bar"
            style={{ width: "88%", height: 40, marginTop: 22 }}
          />
        </div>
      ) : (
        <>
          <div className="almanac__lede">If you&rsquo;d bought</div>
          <div className="almanac__amount">
            <span className="almanac__sum">$10,000</span>
            <span className="almanac__qualifier">
              AT LAUNCH, JANUARY 2019…
            </span>
          </div>

          {/* Two tiles */}
          <div className="almanac__tiles">
            <div className="almanac__tile">
              <div className="almanac__tile-label">TODAY</div>
              <div className="almanac__tile-value">
                {calc ? fmtMoney(calc.today) : "—"}
              </div>
              <div className="almanac__tile-sub">MARKET VALUE</div>
            </div>
            <div className="almanac__tile">
              <div className="almanac__tile-label">
                <span className="almanac__tile-label-full">TOTAL RETURN</span>
                <span className="almanac__tile-label-short">RETURN</span>
              </div>
              <div className="almanac__tile-value">
                {calc ? fmtSignedPct(calc.totalPct, 1) : "—"}
              </div>
              <div className="almanac__tile-sub">
                {calc ? `≈ ${calc.cagr.toFixed(1)}% / YR COMPOUNDED` : "—"}
              </div>
            </div>
          </div>

          {/* Takeaway */}
          <p className="almanac__takeaway">
            Sat through one pandemic, two rate cycles, and the rumour of a
            recession that never showed.
          </p>
        </>
      )}

      {/* Bottom CTA — pinned */}
      <div className="almanac__cta-row">
        <Link href="/calculators?tab=lookback" className="almanac__cta">
          MORE CALCULATORS →
        </Link>
      </div>

      <style jsx>{`
        .almanac {
          background: #111111; /* literal ink — stays ink under editions */
          color: var(--ins-inv-text);
          padding: 26px 28px;
          display: flex;
          flex-direction: column;
          height: 100%;
          font-family: var(--ins-font);
          font-variant-numeric: tabular-nums;
        }

        .almanac__top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-inv-mute);
        }
        .almanac__rule {
          height: 1px;
          background: rgba(255, 255, 255, 0.25);
          margin: 14px 0 20px;
        }

        .almanac__lede {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
          color: var(--ins-inv-text);
        }
        .almanac__amount {
          display: flex;
          align-items: baseline;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 10px;
        }
        .almanac__sum {
          display: inline-block;
          font-size: 58px;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 0.9;
          color: var(--ins-inv-text);
          border-bottom: 3px solid var(--ins-signal);
          padding-bottom: 6px;
        }
        .almanac__qualifier {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-inv-mute);
        }

        .almanac__tiles {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 24px;
        }
        .almanac__tile {
          border: 1px solid var(--ins-inv-border);
          background: none;
          padding: 14px 16px;
          min-width: 0;
        }
        .almanac__tile-label {
          font-size: 8.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-inv-mute);
        }
        .almanac__tile-label-short {
          display: none;
        }
        .almanac__tile-value {
          margin-top: 5px;
          font-size: 27px;
          font-weight: 700;
          line-height: 1.1;
          color: var(--ins-inv-text);
        }
        .almanac__tile-sub {
          margin-top: 3px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ins-inv-mute);
        }

        .almanac__takeaway {
          margin: 22px 0 0;
          border-left: 3px solid var(--ins-signal);
          padding-left: 14px;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.55;
          color: rgba(255, 255, 255, 0.78);
        }

        .almanac__cta-row {
          margin-top: auto;
          padding-top: 22px;
        }
        .almanac :global(.almanac__cta) {
          display: inline-block;
          font-size: 10.5px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          text-decoration: none;
          color: var(--ins-inv-text);
          border-bottom: 2px solid rgba(255, 255, 255, 0.4);
          padding-bottom: 4px;
        }
        .almanac :global(.almanac__cta:hover) {
          border-bottom-color: var(--ins-inv-text);
        }

        /* loading — white-tint skeleton bars */
        .almanac__bar {
          background: rgba(255, 255, 255, 0.08);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }
        .almanac__bar-pair {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-top: 24px;
        }

        /* --- mobile (09-ref) ------------------------------------------------ */
        @media (max-width: 640px) {
          .almanac {
            padding: 20px;
          }
          .almanac__top {
            letter-spacing: 0.2em;
            font-size: 8.5px;
          }
          .almanac__no-word {
            display: none;
          }
          .almanac__lede {
            font-size: 17px;
          }
          .almanac__amount {
            display: block;
            margin-top: 8px;
          }
          .almanac__sum {
            font-size: 44px;
            padding-bottom: 5px;
          }
          .almanac__qualifier {
            display: block;
            margin-top: 8px;
            font-size: 9.5px;
          }
          .almanac__tiles {
            gap: 10px;
            margin-top: 16px;
          }
          .almanac__tile {
            padding: 12px;
          }
          .almanac__tile-label {
            font-size: 8px;
          }
          .almanac__tile-label-full {
            display: none;
          }
          .almanac__tile-label-short {
            display: inline;
          }
          .almanac__tile-value {
            margin-top: 4px;
            font-size: 21px;
          }
          .almanac__tile-sub {
            display: none;
          }
          .almanac__takeaway {
            margin-top: 16px;
            padding-left: 12px;
            font-size: 11.5px;
            line-height: 1.5;
          }
          .almanac__cta-row {
            padding-top: 18px;
          }
        }
      `}</style>
    </section>
  );
}
