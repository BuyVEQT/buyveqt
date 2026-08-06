"use client";

import { useArmOnView } from "../useArmOnView";

/** The heaviest bar reaches 84% of its track — the ledger's scale. */
const BAR_MAX_PCT = 84;

interface SleeveBookProps {
  ticker: string;
  topHoldings: Array<{ name: string; weight: number }>;
  sectors: Array<{ name: string; weight: number }>;
  lookthroughNote: string | null;
}

/**
 * THE BOOK — "What {ticker} holds." (dossier module).
 *
 * Left: the sleeve's top ten, weights drawn to scale, sweeping in on first
 * view. Right: the full sector book — every sector Yahoo reports, not the
 * three-bar taste the Observatory panel shows. VUN and VEE read through
 * their US-listed engines and the footnote says so.
 */
export default function SleeveBook({
  ticker,
  topHoldings,
  sectors,
  lookthroughNote,
}: SleeveBookProps) {
  const { ref, armed } = useArmOnView<HTMLElement>();

  const maxHolding =
    topHoldings.reduce((m, h) => Math.max(m, h.weight), 0) || 1;
  const maxSector = sectors.reduce((m, s) => Math.max(m, s.weight), 0) || 1;
  const ready = topHoldings.length > 0 || sectors.length > 0;

  return (
    <section
      ref={ref}
      className="sbook"
      aria-label={`What ${ticker} holds`}
      data-armed={armed && ready ? "true" : "false"}
    >
      <div className="sbook__head">
        <div>
          <div className="sbook__kicker">The book</div>
          <h2 className="sbook__display">What {ticker} holds.</h2>
        </div>
        <span className="sbook__caption">
          Top ten and every sector · via Yahoo Finance
          {lookthroughNote ? ` · ${lookthroughNote}` : ""}
        </span>
      </div>

      <div className="sbook__grid">
        <div className="sbook__col">
          <div className="sbook__label">Top of the book</div>
          <div className="sbook__rows">
            {(topHoldings.length > 0
              ? topHoldings
              : Array.from({ length: 10 }, () => null)
            ).map((h, i, arr) => (
              <div
                className={`sbook__row${i === arr.length - 1 ? " is-last" : ""}`}
                key={h ? h.name : i}
              >
                <span className="sbook__ord" aria-hidden="true">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="sbook__name">{h ? h.name : "—"}</span>
                <span className="sbook__track">
                  {h && (
                    <span
                      className="sbook__fill"
                      style={{
                        width: `${(h.weight / maxHolding) * BAR_MAX_PCT}%`,
                        animationDelay: `${0.1 + i * 0.07}s`,
                      }}
                    />
                  )}
                </span>
                <span className="sbook__weight">
                  {h ? `${h.weight.toFixed(2)}%` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="sbook__col">
          <div className="sbook__label">The sector book</div>
          <div className="sbook__rows">
            {(sectors.length > 0
              ? sectors
              : Array.from({ length: 6 }, () => null)
            ).map((s, i, arr) => (
              <div
                className={`sbook__srow${i === arr.length - 1 ? " is-last" : ""}`}
                key={s ? s.name : i}
              >
                <span className="sbook__sname">{s ? s.name : "—"}</span>
                <span className="sbook__track">
                  {s && (
                    <span
                      className="sbook__fill"
                      style={{
                        width: `${(s.weight / maxSector) * BAR_MAX_PCT}%`,
                        animationDelay: `${0.2 + i * 0.06}s`,
                      }}
                    />
                  )}
                </span>
                <span className="sbook__weight">
                  {s ? `${s.weight.toFixed(1)}%` : ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .sbook {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
          border-top: 3px solid var(--ins-rule-strong);
          padding-top: 16px;
        }
        .sbook__head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 24px;
        }
        /* TRUE LABEL — section kicker. */
        .sbook__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .sbook__display {
          margin: 8px 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        /* EXPLANATORY CAPTION — source + look-through provenance. */
        .sbook__caption {
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
          text-align: right;
          max-width: 320px;
        }

        .sbook__grid {
          display: grid;
          grid-template-columns: 1.25fr 1fr;
          gap: 48px;
          margin-top: 18px;
        }
        .sbook__col {
          min-width: 0;
        }
        /* TRUE LABEL — names its list. */
        .sbook__label {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .sbook__rows {
          margin-top: 10px;
          border-top: 1px solid var(--ins-ink);
        }

        .sbook__row {
          display: grid;
          grid-template-columns: 30px 1fr 150px 64px;
          gap: 14px;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--ins-hair-soft);
          font-size: 13.5px;
          font-weight: 600;
        }
        .sbook__srow {
          display: grid;
          grid-template-columns: minmax(0, 150px) 1fr 56px;
          gap: 14px;
          align-items: center;
          padding: 10px 0;
          border-bottom: 1px solid var(--ins-hair-soft);
          font-size: 12.5px;
          font-weight: 600;
        }
        .sbook__row.is-last,
        .sbook__srow.is-last {
          border-bottom-color: var(--ins-ink);
        }
        /* Ink value scale, 30% step — legible rank numerals. */
        .sbook__ord {
          color: rgba(17, 17, 17, 0.3);
          font-weight: 700;
        }
        .sbook__name,
        .sbook__sname {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .sbook__track {
          display: block;
          height: 8px;
          background: var(--ins-track-soft);
        }
        .sbook__fill {
          display: block;
          height: 100%;
          background: var(--ins-ink);
          transform-origin: left center;
        }
        .sbook[data-armed="true"] .sbook__fill {
          animation: ins-bookTapeIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @keyframes ins-bookTapeIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
        .sbook__weight {
          text-align: right;
          font-weight: 700;
        }

        @media (max-width: 960px) {
          .sbook__grid {
            grid-template-columns: 1fr;
            gap: 26px;
          }
        }

        @media (max-width: 640px) {
          .sbook {
            border-top-width: 2px;
            padding-top: 12px;
          }
          .sbook__display {
            margin-top: 6px;
            font-size: 24px;
          }
          .sbook__caption {
            display: block;
            margin-top: 6px;
            text-align: left;
            max-width: none;
          }
          .sbook__head {
            display: block;
          }
          .sbook__grid {
            margin-top: 12px;
          }
          .sbook__row {
            grid-template-columns: 22px 1fr 72px 52px;
            gap: 10px;
            font-size: 11.5px;
          }
          .sbook__srow {
            grid-template-columns: minmax(0, 120px) 1fr 48px;
            gap: 10px;
            font-size: 11.5px;
          }
          .sbook__track {
            height: 6px;
          }
        }
      `}</style>
    </section>
  );
}
