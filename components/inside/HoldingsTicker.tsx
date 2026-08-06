"use client";

import { VEQT_TOP_HOLDINGS } from "@/data/holdings";
import { FUNDS } from "@/data/funds";
import { fmtInt } from "@/lib/instrument-format";

/**
 * The endless holdings ticker (artboard 10b) — the strip under the masthead
 * rule that parades the top of the book before the hero makes its claim.
 *
 * Two copies of the same sequence ride a −50% translateX loop (30s desktop,
 * 24s mobile), each copy carrying a trailing pad equal to the gap so the
 * seam is invisible. Canadian names' weights print in signal red — the same
 * one red the rest of the page budgets. Pauses on hover; under reduced
 * motion globals.css kills the animation and the first copy stands still.
 */
export default function HoldingsTicker() {
  const rest =
    (FUNDS["VEQT.TO"]?.numberOfHoldings ?? 0) - VEQT_TOP_HOLDINGS.length;

  const items = VEQT_TOP_HOLDINGS.map((h) => ({
    ticker: h.ticker,
    weight: h.weight.toFixed(2),
    isCa: h.country === "Canada",
  }));

  const sequence = (ariaHidden: boolean) => (
    <span className="tick__set" aria-hidden={ariaHidden || undefined}>
      {items.map((it) => (
        <span className="tick__item" key={it.ticker}>
          {it.ticker}{" "}
          <b className={it.isCa ? "is-ca" : undefined}>{it.weight}</b>
        </span>
      ))}
      <span className="tick__item">+ {fmtInt(rest)} MORE</span>
    </span>
  );

  return (
    <div
      className="tick"
      aria-label={`Largest holdings by weight, plus ${fmtInt(rest)} more`}
    >
      <div className="tick__reel">
        {sequence(false)}
        {sequence(true)}
      </div>

      <style jsx>{`
        .tick {
          font-family: var(--ins-font);
          border-bottom: 1px solid var(--ins-hair);
          overflow: hidden;
          padding: 10px 0;
          font-variant-numeric: tabular-nums;
        }
        .tick__reel {
          display: flex;
          width: max-content;
          animation: ins-tickerScroll 30s linear infinite;
        }
        .tick:hover .tick__reel {
          animation-play-state: paused;
        }
        .tick__set {
          display: flex;
          gap: 36px;
          padding-right: 36px;
        }
        /* TRUE LABEL — ticker symbols name companies; the strip stays caps
           at the floor with the mock's 0.14em grip. */
        .tick__item {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          color: var(--ins-gray-600);
          white-space: nowrap;
        }
        .tick__item b {
          font-weight: 700;
          color: var(--ins-ink);
        }
        .tick__item b.is-ca {
          color: var(--ins-signal);
        }
        @keyframes ins-tickerScroll {
          to {
            transform: translateX(-50%);
          }
        }

        @media (max-width: 640px) {
          .tick {
            padding: 8px 0;
          }
          .tick__reel {
            animation-duration: 24s;
          }
          .tick__set {
            gap: 26px;
            padding-right: 26px;
          }
          .tick__item {
            letter-spacing: 0.12em;
          }
        }
      `}</style>
    </div>
  );
}
