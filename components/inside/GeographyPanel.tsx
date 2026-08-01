"use client";

import { useMemo } from "react";
import { useRegions } from "@/lib/useRegions";
import { FUNDS } from "@/data/funds";
import { UP, DOWN, fmtSignedPct } from "@/lib/instrument-format";
import { useArmOnView } from "./useArmOnView";

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
 * This is the page's ONE warm band (#faf8f4): every other module sits on
 * white paper, and the methodology panel is the ink counterweight.
 *
 * Weights come from /api/regions when it has answered, otherwise from the
 * Vanguard factsheet snapshot in data/funds.ts so the bars never render empty.
 */
export default function GeographyPanel() {
  const { payload } = useRegions();
  const { ref, armed } = useArmOnView<HTMLElement>();

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
    <section
      ref={ref}
      className="geo"
      aria-label="Where the dollars sit"
      data-armed={armed ? "true" : "false"}
    >
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
                  className={`geo__fill${r.ticker === "VEE" ? " is-signal" : ""}`}
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
          /* The page's one warm band — full-bleed inside the module, with the
             rows inset off its edges. Literal rather than a token because the
             Instrument's warm paper exists nowhere else on this page. */
          background: #faf8f4;
          padding: 16px 28px 28px;
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
        /* TRUE LABEL — a section kicker names the band, it does not explain
           it. Caps + tracking kept; only the size moves to the 10px floor.
           It sits in an auto-width flex cell, not a fixed track, so the
           tracking needs no dial-back. */
        .geo__kicker {
          font-size: 10px;
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
        /* EXPLANATORY CAPTION — "Daily NAV attribution · rebalanced quarterly
           by Vanguard" is a qualifier line about how the weights are struck,
           not a name for anything. Out of 9.5px caps and into caption
           grammar; the JSX copy is authored in sentence case, so there is no
           transform left to shout it. NAV and Vanguard keep their case.
           Sentence case at 12px measures ~305px against the old ~400px, so
           nowrap costs the flex head less room than it did before. */
        .geo__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
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
        /* The ghost ordinal is SIGNAL RED at 40%, not ink — it is the band's
           only tinted numeral and the ink value scale governs inks. Snapping
           it to --ins-ordinal would repaint it gray, so it stays literal. */
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
          transform-origin: left center;
        }
        /* Emerging markets is the colour moment in this band — the other three
           sleeves stay ink. */
        .geo__fill.is-signal {
          background: var(--ins-signal);
        }

        /* Bars sweep in the first time the band scrolls into view, top row
           first. Declared ONLY under [data-armed], so the un-armed frame — no
           JS, reduced motion, before first scroll — is the finished diagram at
           full width. Fill mode "both" holds scaleX(0) through the delay. */
        .geo[data-armed="true"] .geo__fill {
          animation: ins-tapeIn 1.1s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .geo[data-armed="true"] .geo__row:nth-child(1) .geo__fill {
          animation-delay: 0.1s;
        }
        .geo[data-armed="true"] .geo__row:nth-child(2) .geo__fill {
          animation-delay: 0.25s;
        }
        .geo[data-armed="true"] .geo__row:nth-child(3) .geo__fill {
          animation-delay: 0.4s;
        }
        .geo[data-armed="true"] .geo__row:nth-child(4) .geo__fill {
          animation-delay: 0.55s;
        }
        /* Scoped on purpose: globals.css has no ins-tapeIn, and the handoff
           says not to add one there. styled-jsx hashes the name, so this
           cannot collide with the global ins-* set. */
        @keyframes ins-tapeIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
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
            padding: 12px 16px 18px;
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
            font-size: 10px;
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
          /* TRUE LABEL — the sleeve descriptor names a region, so it stays
             caps at the floor. Bumped 9px → 10px inside the truncating name
             cell, so the tracking comes back a notch (0.12em → 0.1em). The
             longest real string, "EMERGING MARKETS" (16 chars), measures
             16 × (10 × 0.62 + 1.0) ≈ 115px against the ~257px the cell has
             left once the 20px weight and the ticker are placed — the
             ellipsis stays unused. */
          .geo__desc {
            margin-top: 0;
            font-size: 10px;
            letter-spacing: 0.1em;
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
          /* A signed figure, not a label — it takes the floor and keeps its
             tracking. ".geo__move-word" ("today") is dropped below, so the
             cell only ever carries "▼ −0.42%". */
          .geo__move {
            grid-area: move;
            font-size: 10px;
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
