"use client";

import { FUNDS } from "@/data/funds";
import { fmtInt } from "@/lib/instrument-format";
import { useSleeves } from "@/lib/useSleeves";
import { topOfBook } from "@/lib/top-of-book";

/** Names on the reel before the "+ N more" tail. */
const TICKER_N = 14;

const css = `
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
}
.tick[data-live="true"] .tick__reel {
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
/* TRUE LABEL - ticker symbols name companies; the strip stays caps at the
   floor with the mock's 0.14em grip. Copy is pre-uppercased in the strings
   (SVG-adjacent habit, and text-transform would trip on nothing here). */
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
  .tick[data-live="true"] .tick__reel {
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
`;

/**
 * The endless holdings ticker (artboard 10b) — the strip under the masthead
 * rule that parades the top of the book before the hero makes its claim.
 *
 * The reel is the real top of the book: per-sleeve top holdings from the
 * shared /api/sleeves store, scaled by live sleeve weights (lib/top-of-book).
 * Every figure prints with a % sign — in tape grammar a bare number reads
 * as a price, which these are not. Canadian names' weights print in signal
 * red — the same one red the rest of the page budgets.
 *
 * Two copies of the same sequence ride a −50% translateX loop (30s desktop,
 * 24s mobile), each copy carrying a trailing pad equal to the gap so the
 * seam is invisible. Pauses on hover; under reduced motion globals.css
 * kills the animation and the first copy stands still. Before data arrives
 * (or if the store degrades to nothing) the strip holds its height with a
 * static label — no scroll, no invented numbers.
 *
 * Styles are injected as a plain string, not styled-jsx — the first build
 * of this strip assembled its items in a helper closure, which styled-jsx
 * does not scope, and the marquee shipped unstyled.
 */
export default function HoldingsTicker() {
  const { data } = useSleeves();

  const entries = topOfBook(data, TICKER_N).filter((e) => e.symbol);
  const universe = FUNDS["VEQT.TO"]?.numberOfHoldings ?? 0;
  const rest = Math.max(0, universe - entries.length);
  const live = entries.length > 0;

  return (
    <div
      className="tick"
      data-live={live ? "true" : "false"}
      aria-label={
        live
          ? `Largest holdings by share of fund, plus ${fmtInt(rest)} more`
          : `VEQT holds ${fmtInt(universe)} companies`
      }
    >
      <div className="tick__reel">
        {live ? (
          [false, true].map((hidden) => (
            <span
              className="tick__set"
              aria-hidden={hidden || undefined}
              key={hidden ? "copy" : "lead"}
            >
              <span className="tick__item">TOP OF THE BOOK · % OF VEQT</span>
              {entries.map((e) => (
                <span className="tick__item" key={e.symbol}>
                  {e.symbol}{" "}
                  <b className={e.isCanada ? "is-ca" : undefined}>
                    {e.weight.toFixed(2)}%
                  </b>
                </span>
              ))}
              <span className="tick__item">+ {fmtInt(rest)} MORE</span>
            </span>
          ))
        ) : (
          <span className="tick__set">
            <span className="tick__item">TOP OF THE BOOK</span>
            <span className="tick__item">
              {fmtInt(universe)} <b>COMPANIES</b>
            </span>
          </span>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </div>
  );
}
