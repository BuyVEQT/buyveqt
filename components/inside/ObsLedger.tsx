"use client";

import { FUNDS } from "@/data/funds";
import { fmtInt } from "@/lib/instrument-format";
import { useSleeves } from "@/lib/useSleeves";
import { topOfBook } from "@/lib/top-of-book";
import { useArmOnView } from "./useArmOnView";
import DriftBlock from "./DriftBlock";

const TOP_N = 5;

/** The heaviest name's bar reaches 84% of its track — the 10b scale. */
const BAR_MAX_PCT = 84;

/**
 * THE LEDGER, ALIVE — "Every number arrives." (artboard 10b).
 *
 * Left: the top five of the book — per-sleeve top holdings from the shared
 * /api/sleeves store, scaled by live sleeve weights (lib/top-of-book) —
 * drawn as bars to scale, sweeping in staggered the first time the section
 * scrolls into view (the same [data-armed] contract as the rest of the
 * site). Before the store resolves, five fixed-height placeholder rows hold
 * the geometry so nothing shifts. Right: the drift lines, one per sleeve,
 * no dials. On phones the drift block detaches and reappears after the
 * engine — the 390 artboard's order — so here it renders desktop-only.
 */
export default function ObsLedger() {
  const { ref, armed } = useArmOnView<HTMLElement>();
  const { data } = useSleeves();
  const universe = FUNDS["VEQT.TO"]?.numberOfHoldings;

  const rows = topOfBook(data, TOP_N);
  const live = rows.length > 0;
  const maxWeight = rows.reduce((m, h) => Math.max(m, h.weight), 0) || 1;

  return (
    <section
      ref={ref}
      className="ledger"
      aria-label="The ledger — top of the book and drift"
      data-armed={armed ? "true" : "false"}
    >
      <div className="ledger__head">
        <div>
          <div className="ledger__kicker">The ledger, alive</div>
          <h2 className="ledger__display">Every number arrives.</h2>
        </div>
        <span className="ledger__caption">
          Weights to scale · live mix via Yahoo Finance
        </span>
      </div>

      <div className="ledger__grid">
        <div className="ledger__book">
          <div className="ledger__label">
            Top of the book — weights to scale
          </div>
          <div className="ledger__rows">
            {Array.from({ length: TOP_N }, (_, i) => {
              const h = live ? rows[i] : null;
              return (
                <div
                  className={`ledger__row${i === TOP_N - 1 ? " is-last" : ""}`}
                  key={h ? h.name : `pending-${i}`}
                >
                  <span className="ledger__ord" aria-hidden="true">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="ledger__name">{h ? h.name : "—"}</span>
                  <span className="ledger__track">
                    {h && (
                      <span
                        className="ledger__fill"
                        style={{
                          width: `${(h.weight / maxWeight) * BAR_MAX_PCT}%`,
                        }}
                      />
                    )}
                  </span>
                  <span className="ledger__weight">
                    {h ? (
                      <>
                        {h.weight.toFixed(2)}
                        <span className="ledger-desk">%</span>
                      </>
                    ) : (
                      "—"
                    )}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="ledger__note">
            The five biggest of {universe ? fmtInt(universe) : "the book"} —
            every list on this page draws itself to scale.
          </p>
        </div>

        <div className="ledger__drift">
          <DriftBlock variant="desktop" />
        </div>
      </div>

      <style jsx>{`
        .ledger {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .ledger-desk {
          display: inline;
        }

        .ledger__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .ledger__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .ledger__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--ins-ink);
        }
        /* EXPLANATORY CAPTION — how the numbers are drawn and sourced. */
        .ledger__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
          white-space: nowrap;
        }

        .ledger__grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 48px;
          margin-top: 18px;
        }
        .ledger__book,
        .ledger__drift {
          min-width: 0;
        }

        /* TRUE LABEL — names the list. */
        .ledger__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .ledger__rows {
          margin-top: 10px;
          border-top: 1px solid var(--ins-ink);
        }
        .ledger__row {
          display: grid;
          grid-template-columns: 30px 1fr 170px 60px;
          gap: 14px;
          align-items: center;
          padding: 11px 0;
          border-bottom: 1px solid var(--ins-hair-soft);
          font-size: 13.5px;
          font-weight: 600;
        }
        .ledger__row.is-last {
          border-bottom-color: var(--ins-ink);
        }
        /* Ink value scale, 30% step — the same rank-ordinal tone the old
           book used; a numeral that still has to read at 13.5px. */
        .ledger__ord {
          color: rgba(17, 17, 17, 0.3);
          font-weight: 700;
        }
        .ledger__name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .ledger__track {
          display: block;
          height: 8px;
          background: var(--ins-track-soft);
        }
        .ledger__fill {
          display: block;
          height: 100%;
          background: var(--ins-ink);
          transform-origin: left center;
        }
        .ledger__weight {
          text-align: right;
          font-weight: 700;
        }

        /* Bars sweep in once, on first view — un-armed frame is finished. */
        .ledger[data-armed="true"] .ledger__fill {
          animation: ins-ledgerTapeIn 1.1s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .ledger[data-armed="true"] .ledger__row:nth-child(1) .ledger__fill {
          animation-delay: 0.1s;
        }
        .ledger[data-armed="true"] .ledger__row:nth-child(2) .ledger__fill {
          animation-delay: 0.2s;
        }
        .ledger[data-armed="true"] .ledger__row:nth-child(3) .ledger__fill {
          animation-delay: 0.3s;
        }
        .ledger[data-armed="true"] .ledger__row:nth-child(4) .ledger__fill {
          animation-delay: 0.4s;
        }
        .ledger[data-armed="true"] .ledger__row:nth-child(5) .ledger__fill {
          animation-delay: 0.5s;
        }
        /* Scoped on purpose — globals.css carries no tapeIn (styled-jsx
           hashes the name, so this cannot collide with the ins-* set). */
        @keyframes ins-ledgerTapeIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }

        /* EXPLANATORY CAPTION. */
        .ledger__note {
          margin: 8px 0 0;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        @media (max-width: 960px) {
          .ledger__grid {
            grid-template-columns: 1fr;
            gap: 28px;
          }
          .ledger__row {
            grid-template-columns: 30px 1fr 120px 60px;
          }
        }

        @media (max-width: 640px) {
          .ledger {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .ledger-desk {
            display: none;
          }
          .ledger__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .ledger__caption {
            display: none;
          }
          .ledger__grid {
            margin-top: 12px;
            gap: 0;
          }
          /* The drift block detaches on phones — it re-enters after the
             engine as its own module (the 390 artboard's order). */
          .ledger__drift {
            display: none;
          }
          .ledger__row {
            grid-template-columns: 22px 1fr 78px 44px;
            gap: 10px;
            padding: 10px 0;
            font-size: 11.5px;
          }
          /* Four rows on the 390 board — the fifth returns at desktop. */
          .ledger__row.is-last {
            display: none;
          }
          .ledger__row:nth-child(4) {
            border-bottom-color: var(--ins-ink);
          }
          .ledger__track {
            height: 6px;
          }
        }
      `}</style>
    </section>
  );
}
