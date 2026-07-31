"use client";

import { useMemo } from "react";
import { useRegions } from "@/lib/useRegions";
import { FUNDS } from "@/data/funds";
import { UP, DOWN, fmtSignedPct } from "@/lib/instrument-format";

/** Micro-label under each sleeve ticker. */
const SLEEVE_DESC: Record<string, string> = {
  VUN: "US Total Market",
  VCN: "Canada",
  VIU: "Developed ex-North America",
  VEE: "Emerging Markets",
};

/** Shorter micro-label for the 390 artboard. */
const SLEEVE_DESC_MOB: Record<string, string> = {
  VUN: "US Total Market",
  VCN: "Canada",
  VIU: "Developed ex-NA",
  VEE: "Emerging Markets",
};

const TICKER_ORDER = ["VUN", "VCN", "VIU", "VEE"];

interface SleeveRow {
  ticker: string;
  weight: number;
  changePercent: number | null;
}

/**
 * "Where the dollars sit." — the geography ledger (artboard 6a).
 *
 * Four ruled sleeve rows: an oversized ordinal in signal red at 40%, the
 * ticker + micro-label, an ink weight bar on a soft track, the weight, and
 * today's move (red only when negative, always paired with ▲/▼).
 *
 * Owns the `#sleeves` anchor — the home page's sleeve rows deep-link here.
 *
 * Weights come from /api/regions when it has answered, otherwise from the
 * Vanguard factsheet snapshot in data/funds.ts so the bars never render empty.
 */
export default function GeographyPanel() {
  const { payload } = useRegions();

  const rows = useMemo<SleeveRow[]>(() => {
    const live = payload?.regions ?? [];
    if (live.length > 0) {
      const mapped = live
        .filter((r) => TICKER_ORDER.includes(r.ticker))
        .map((r) => ({
          ticker: r.ticker,
          weight: r.weight,
          changePercent: r.changePercent,
        }));
      if (mapped.length === TICKER_ORDER.length) {
        return mapped.sort((a, b) => b.weight - a.weight);
      }
    }

    const fallback = (FUNDS["VEQT.TO"]?.underlyingETFs ?? []).map((e) => ({
      ticker: e.ticker,
      weight: e.weight,
      changePercent: null,
    }));
    return fallback.sort((a, b) => b.weight - a.weight);
  }, [payload]);

  const max = rows.reduce((m, r) => Math.max(m, r.weight), 0) || 100;

  return (
    <section className="geo" aria-label="Where the dollars sit">
      <div id="sleeves" className="geo__anchor" />

      <div className="geo__head">
        <div>
          <div className="geo__kicker">The geography</div>
          <h2 className="geo__display">Where the dollars sit.</h2>
        </div>
        <span className="geo__caption">
          Daily NAV attribution · rebalanced quarterly by Vanguard
        </span>
      </div>

      <div className="geo__rows">
        {rows.map((r, i) => {
          const pct = r.changePercent;
          const negative = pct != null && pct < 0;
          return (
            <div className="geo__row" key={r.ticker}>
              <span className="geo__ord" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>

              <div className="geo__name">
                <div className="geo__ticker">{r.ticker}</div>
                <div className="geo__desc geo-desk">
                  {SLEEVE_DESC[r.ticker] ?? r.ticker}
                </div>
                <div className="geo__desc geo-mob">
                  {SLEEVE_DESC_MOB[r.ticker] ?? r.ticker}
                </div>
              </div>

              <div className="geo__track">
                <div
                  className="geo__fill"
                  style={{ width: `${Math.min(100, (r.weight / max) * 100)}%` }}
                />
              </div>

              <span className="geo__weight">{r.weight.toFixed(1)}%</span>

              <span className={`geo__move${negative ? " is-neg" : ""}`}>
                {pct == null ? (
                  "—"
                ) : (
                  <>
                    {negative ? DOWN : UP} {fmtSignedPct(pct)}{" "}
                    <span className="geo__move-word">today</span>
                  </>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .geo {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .geo__anchor {
          scroll-margin-top: 110px;
        }
        .geo-mob {
          display: none;
        }

        /* ── Head ───────────────────────────────────────────────── */
        .geo__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        .geo__kicker {
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .geo__display {
          margin: 8px 0 0;
          font-size: 40px;
          font-weight: 700;
          letter-spacing: -0.03em;
          line-height: 1.05;
          color: var(--ins-ink);
        }
        .geo__caption {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
          text-align: right;
          white-space: nowrap;
        }

        /* ── Rows ───────────────────────────────────────────────── */
        .geo__rows {
          margin-top: 20px;
          border-top: 1px solid var(--ins-ink);
        }
        .geo__row {
          display: grid;
          grid-template-columns: 56px 230px 1fr 130px 150px;
          gap: 24px;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--ins-hair);
        }
        .geo__row:last-child {
          border-bottom-color: var(--ins-ink);
        }
        .geo__ord {
          font-size: 44px;
          font-weight: 700;
          line-height: 0.85;
          color: rgba(232, 68, 46, 0.4);
        }
        .geo__ticker {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.04em;
        }
        .geo__desc {
          margin-top: 3px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .geo__track {
          height: 8px;
          background: var(--ins-track-soft);
        }
        .geo__fill {
          height: 100%;
          background: var(--ins-ink);
        }
        .geo__weight {
          font-size: 30px;
          font-weight: 600;
          text-align: right;
        }
        .geo__move {
          font-size: 12px;
          font-weight: 700;
          text-align: right;
          white-space: nowrap;
          color: var(--ins-ink);
        }
        .geo__move.is-neg {
          color: var(--ins-signal);
        }
        .geo__move-word {
          text-transform: uppercase;
        }

        @media (max-width: 1100px) {
          .geo__row {
            grid-template-columns: 44px 180px 1fr 92px 132px;
            gap: 16px;
          }
          .geo__ord {
            font-size: 34px;
          }
          .geo__weight {
            font-size: 24px;
          }
          .geo__display {
            font-size: 32px;
          }
          .geo__caption {
            white-space: normal;
            max-width: 220px;
          }
        }

        /* ── Mobile 390 ─────────────────────────────────────────── */
        @media (max-width: 640px) {
          .geo {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .geo-mob {
            display: block;
          }
          .geo-desk {
            display: none;
          }
          .geo__head {
            display: block;
          }
          .geo__kicker {
            font-size: 9px;
            letter-spacing: 0.18em;
          }
          .geo__display {
            margin-top: 6px;
            font-size: 24px;
            letter-spacing: -0.02em;
          }
          .geo__caption {
            display: none;
          }
          .geo__rows {
            margin-top: 12px;
          }
          .geo__row {
            grid-template-columns: 1fr auto;
            grid-template-areas:
              "name weight"
              "track move";
            gap: 8px 12px;
            padding: 12px 0;
            align-items: baseline;
          }
          .geo__ord {
            display: none;
          }
          .geo__name {
            grid-area: name;
            display: flex;
            align-items: baseline;
            gap: 8px;
            min-width: 0;
          }
          .geo__ticker {
            font-size: 13px;
          }
          .geo__desc {
            margin-top: 0;
            font-size: 9px;
            letter-spacing: 0.12em;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .geo__track {
            grid-area: track;
            height: 6px;
            align-self: center;
          }
          .geo__weight {
            grid-area: weight;
            font-size: 20px;
          }
          .geo__move {
            grid-area: move;
            font-size: 9px;
            letter-spacing: 0.08em;
          }
          .geo__move-word {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
