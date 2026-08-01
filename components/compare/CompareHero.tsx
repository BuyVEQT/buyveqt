"use client";

import { BOUTS } from "./bouts";

const css = `
.ins-cmp-hero {
  padding-top: 34px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 48px;
  align-items: end;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-hero__kicker {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-hero__display {
  margin: 16px 0 0;
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}
.ins-cmp-hero__dek {
  margin: 16px 0 0;
  font-size: 15px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--ins-gray-700);
  max-width: 62ch;
  text-wrap: pretty;
}
.ins-cmp-hero__picker {
  padding-bottom: 6px;
}
/* Names the tab group — LABEL, caps at the 10px floor. Tracking
   dialled 0.2em → 0.18em: it sits over the picker's 'auto' grid
   track, whose width is set by the six tabs (~350px), and
   "Tonight's bout" lands at ~108px there. */
.ins-cmp-hero__picker-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-align: right;
}
.ins-cmp-hero__tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.ins-cmp-tab {
  appearance: none;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 6px 12px;
  border: 1px solid var(--ins-hair);
  border-radius: 0;
  background: transparent;
  color: var(--ins-ink);
  cursor: pointer;
  font-variant-numeric: tabular-nums;
  transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
}
.ins-cmp-tab:hover {
  border-color: var(--ins-ink);
}
.ins-cmp-tab[aria-pressed="true"] {
  background: var(--ins-ink);
  border-color: var(--ins-ink);
  color: var(--ins-paper);
}

@media (prefers-reduced-motion: reduce) {
  .ins-cmp-tab { transition: none; }
}

@media (max-width: 960px) {
  .ins-cmp-hero {
    grid-template-columns: 1fr;
    gap: 18px;
    align-items: start;
  }
  .ins-cmp-hero__display { font-size: 48px; }
  .ins-cmp-hero__picker-label { text-align: left; }
  .ins-cmp-hero__picker { padding-bottom: 0; }
}

@media (max-width: 640px) {
  .ins-cmp-hero {
    padding-top: 24px;
    gap: 16px;
  }
  /* Kicker is a LABEL strip (section · count · cadence, no verb), so
     it stays caps; 9px → 10px at the floor. Tracking eased 0.24em →
     0.22em: it is not in a box, but the strip already ran to two
     lines on a phone before the bump and the notch buys some of that
     back without changing the rhythm at the top of the page. */
  .ins-cmp-hero__kicker {
    font-size: 10px;
    letter-spacing: 0.22em;
  }
  .ins-cmp-hero__display {
    margin-top: 12px;
    font-size: 40px;
    letter-spacing: -0.035em;
    line-height: 1.02;
  }
  .ins-cmp-hero__dek {
    margin-top: 10px;
    font-size: 12.5px;
    line-height: 1.5;
  }
  .ins-cmp-hero__tabs { gap: 6px; }
  .ins-cmp-tab {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 62px;
    font-size: 10px;
    padding: 7px 12px;
  }
}
`;

/**
 * Compare hero (artboard 6b) — the scoreboard kicker, the page display
 * line, the dek, and TONIGHT'S BOUT: six tabs, active one inked.
 *
 * The tabs are the page's only selector; picking one swaps the whole
 * scoreboard and rewrites `?funds=VEQT.TO,{ticker}` upstream.
 */
export default function CompareHero({
  contender,
  onSelect,
}: {
  contender: string;
  onSelect: (ticker: string) => void;
}) {
  return (
    <section className="ins-cmp-hero">
      <div>
        <div className="ins-cmp-hero__kicker">
          The scoreboard · Six bouts on file · Updated daily
        </div>
        <h1 className="ins-cmp-hero__display">VEQT × the field.</h1>
        <p className="ins-cmp-hero__dek">
          Side-by-side bouts against Canada&rsquo;s lineup — performance
          spreads, the editor&rsquo;s verdict, and the data behind it. No
          winner declared that the math doesn&rsquo;t back.
        </p>
      </div>

      <div className="ins-cmp-hero__picker">
        <div className="ins-cmp-hero__picker-label" id="ins-cmp-bout-label">
          Tonight&rsquo;s bout
        </div>
        <div
          className="ins-cmp-hero__tabs"
          role="group"
          aria-labelledby="ins-cmp-bout-label"
        >
          {BOUTS.map((bout) => (
            <button
              key={bout.ticker}
              type="button"
              className="ins-cmp-tab"
              aria-pressed={bout.ticker === contender}
              onClick={() => onSelect(bout.ticker)}
            >
              {bout.short}
            </button>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
