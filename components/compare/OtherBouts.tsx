"use client";

import Link from "next/link";
import { getComparison } from "@/data/comparisons";
import { FUNDS } from "@/data/funds";
import { MINUS } from "@/lib/instrument-format";
import { BOUTS, type Bout } from "./bouts";
import type { PairMetrics } from "./compare-math";

const css = `
.ins-cmp-others {
  border-top: 3px solid var(--ins-rule-strong, #111111);
  padding-top: 16px;
  font-family: var(--ins-font);
  color: var(--ins-ink, #111111);
}
.ins-cmp-others__head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 24px;
}
/* Eyebrow — LABEL, caps at the 10px floor. Free half of a
   space-between header, so tracking stands. */
.ins-cmp-others__eyebrow {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-others__display {
  margin: 8px 0 0;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
}
/* Header stamp — "Same arithmetic · Same rail", two verbless noun
   phrases naming the module's terms. LABEL, caps at the floor;
   drops out below 900px, so the nowrap never fights for room. */
.ins-cmp-others__note {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  white-space: nowrap;
}
.ins-cmp-others__grid {
  margin-top: 14px;
  border-top: 1px solid var(--ins-ink);
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 56px;
}
.ins-cmp-others__col > *:not(:last-child) {
  border-bottom: 1px solid var(--ins-hair);
}

/* Trimmed 12px → 4px: the permalink's new 44px tap box already
   carries ~16px of clear space under its text, so the old padding
   would have stacked on top of it. The 4px stays as a floor for the
   case where a bout has no write-up and renders no permalink. */
.ins-cmp-bout-row {
  padding-bottom: 4px;
}
.ins-cmp-bout {
  appearance: none;
  background: transparent;
  border: none;
  border-radius: 0;
  width: 100%;
  text-align: left;
  cursor: pointer;
  color: var(--ins-ink);
  font-family: inherit;
  display: grid;
  grid-template-columns: 52px 1fr auto auto;
  gap: 18px;
  align-items: end;
  padding: 14px 0 6px;
  transition: padding-left 0.18s ease;
}
.ins-cmp-bout:hover {
  padding-left: 8px;
}
.ins-cmp-bout__ordinal {
  font-size: 36px;
  font-weight: 700;
  line-height: 0.85;
  color: var(--ins-ordinal);
  font-variant-numeric: tabular-nums;
}
.ins-cmp-bout__body {
  min-width: 0;
}
/* Row kicker — sleeve · provider. Names two things, explains
   neither: LABEL, caps at the floor. Tracking held at 0.18em; the
   body sits in the 1fr track (~440px per column at full width) and
   the longest pairing, "US total market · Vanguard", measures
   ~190px there. */
.ins-cmp-bout__kicker {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-bout__title {
  display: block;
  margin-top: 4px;
  font-size: 19px;
  font-weight: 600;
  letter-spacing: -0.01em;
  line-height: 1.2;
}
.ins-cmp-bout__spread {
  text-align: right;
  align-self: center;
}
/* Stat label over the value — LABEL, caps. 8px → 10px with tracking
   dialled 0.14em → 0.12em for the 'auto' track it shares with the
   value: "Spread" lands at ~44px, still narrower than the 14px value
   beneath it, so the track's width is unchanged. */
.ins-cmp-bout__spread-label {
  display: block;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
}
.ins-cmp-bout__spread-val {
  display: block;
  margin-top: 2px;
  font-size: 14px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.ins-cmp-bout__spread-val--down {
  color: var(--ins-signal);
}
.ins-cmp-bout__arrow {
  font-size: 18px;
  font-weight: 700;
  align-self: center;
  transition: color 0.18s ease;
}
.ins-cmp-bout:hover .ins-cmp-bout__arrow {
  color: var(--ins-signal);
}

/* Secondary action — the row still swaps the bout in place; this is the
   deep link to the written-up page, offset under the row title.

   LABEL (link text), caps at the floor. The 44px tap height is new: at
   9px with no padding the hit area was ~11px tall, which is not a
   target. inline-flex + centred content grows the box, not the type,
   and no negative margin is involved — the row's own bottom padding is
   trimmed instead, so the button above keeps its full, non-overlapping
   hit area. */
.ins-cmp-bout__permalink {
  display: inline-flex;
  align-items: center;
  /* The label and its arrow become separate flex items the moment the
     box turns flex, and flex drops the word space between them — this
     gap is that space, tracking included, not decoration. */
  column-gap: 0.4em;
  min-height: 44px;
  margin-left: 70px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--ins-gray-600);
  text-decoration: none;
}
.ins-cmp-bout__permalink:hover,
.ins-cmp-bout__permalink:focus-visible {
  color: var(--ins-ink);
}

/* Top padding moves onto the link, which now owns a 44px tap box. */
.ins-cmp-others__request {
  padding: 0 0 14px;
  display: flex;
  align-items: center;
}
/* LABEL (link text), caps at the floor. align-items: flex-end rather
   than center is load-bearing: the 2px rule under this link is a
   border on the link box itself, so centring the text would leave the
   underline floating ~18px beneath it. Bottom-aligning keeps the rule
   3px under the type and puts the whole 29px of added hit area above
   the text, where it overlaps nothing clickable. */
.ins-cmp-others__request-link {
  display: inline-flex;
  align-items: flex-end;
  /* Replaces the word space flex drops between the label and its
     arrow. */
  column-gap: 0.4em;
  min-height: 44px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--ins-ink);
  text-decoration: none;
  border-bottom: 2px solid var(--ins-ink);
  padding-bottom: 3px;
}
.ins-cmp-others__request-link:hover {
  color: var(--ins-signal);
  border-bottom-color: var(--ins-signal);
}

@media (prefers-reduced-motion: reduce) {
  .ins-cmp-bout,
  .ins-cmp-bout__arrow { transition: none; }
}

@media (max-width: 900px) {
  .ins-cmp-others__grid {
    grid-template-columns: 1fr;
    column-gap: 0;
  }
  .ins-cmp-others__col:first-child > *:last-child {
    border-bottom: 1px solid var(--ins-hair);
  }
  .ins-cmp-others__note { display: none; }
}

@media (max-width: 640px) {
  .ins-cmp-others { padding-top: 12px; }
  .ins-cmp-others__eyebrow { font-size: 10px; letter-spacing: 0.18em; }
  .ins-cmp-others__display { margin-top: 6px; font-size: 20px; }
  .ins-cmp-others__grid { margin-top: 8px; }
  /* Phones lean hardest on the permalink's 44px box, so the row's own
     bottom padding goes to zero here. */
  .ins-cmp-bout-row { padding-bottom: 0; }
  .ins-cmp-bout {
    grid-template-columns: 34px 1fr auto auto;
    gap: 12px;
    padding: 12px 0 6px;
    min-height: 44px;
  }
  .ins-cmp-bout__permalink {
    margin-left: 46px;
    font-size: 10px;
    letter-spacing: 0.1em;
  }
  .ins-cmp-bout__ordinal { font-size: 26px; }
  /* Floor plus a dial-back 0.14em → 0.12em: the body's 1fr track is
     ~200px on a 375px phone once the ordinal, the spread value and
     the arrow have taken their share, and the longest kicker pairing
     lands at ~175px there. */
  .ins-cmp-bout__kicker { font-size: 10px; letter-spacing: 0.12em; }
  .ins-cmp-bout__title { margin-top: 3px; font-size: 14px; }
  .ins-cmp-bout__house { display: none; }
  .ins-cmp-bout__spread-label { display: none; }
  .ins-cmp-bout__spread-val { margin-top: 0; font-size: 12px; }
  .ins-cmp-bout__arrow { font-size: 15px; }
}
`;

const DASH = "—";

function providerLabel(ticker: string): string {
  return (FUNDS[ticker]?.provider ?? "").replace(/\s*\([^)]*\)\s*/g, "").trim();
}

function spreadLabel(spread: number | null | undefined): string {
  if (spread == null || !Number.isFinite(spread)) return DASH;
  const sign = spread < 0 ? MINUS : "+";
  return `${sign}${Math.abs(spread).toFixed(1)} PP`;
}

/**
 * Deep link for a bout, when the pair has a written-up page. The card and
 * `data/comparisons.ts` are keyed independently, so a bout with no entry
 * simply gets no permalink rather than a 404.
 */
function permalinkFor(bout: Bout): string | null {
  const slug = `veqt-vs-${bout.short.toLowerCase()}`;
  return getComparison(slug) ? `/compare/${slug}` : null;
}

/**
 * The other bouts (artboard 6b) — the five contenders not currently on
 * the scoreboard, numbered 02–06 in card order, each carrying its own
 * common-tape spread. A negative spread (VEQT behind) is the only red on
 * the module.
 *
 * Clicking a row swaps the bout in place — that stays the primary action.
 * Beneath it sits a secondary PERMALINK deep link to `/compare/{slug}`
 * for the bouts that have a written-up page, so the slug pages finally
 * have a navigational inbound instead of MDX body links alone.
 */
export default function OtherBouts({
  contender,
  metricsByBout,
  onSelect,
}: {
  contender: string;
  metricsByBout: Record<string, PairMetrics>;
  onSelect: (ticker: string) => void;
}) {
  const others = BOUTS.filter((b) => b.ticker !== contender);

  const renderRow = (bout: Bout, index: number) => {
    const spread = metricsByBout[bout.ticker]?.spreadPp ?? null;
    const down = spread != null && spread < 0;
    const permalink = permalinkFor(bout);
    return (
      <div key={bout.ticker} className="ins-cmp-bout-row">
        <button
          type="button"
          className="ins-cmp-bout"
          onClick={() => onSelect(bout.ticker)}
        >
          <span className="ins-cmp-bout__ordinal" aria-hidden>
            {String(index + 2).padStart(2, "0")}
          </span>
          <span className="ins-cmp-bout__body">
            <span className="ins-cmp-bout__kicker">
              {bout.category} · {providerLabel(bout.ticker)}
            </span>
            <span className="ins-cmp-bout__title">
              <span className="ins-cmp-bout__house">VEQT </span>&times;{" "}
              {bout.short} &mdash; {bout.tagline}
            </span>
          </span>
          <span className="ins-cmp-bout__spread">
            <span className="ins-cmp-bout__spread-label">Spread</span>
            <span
              className={`ins-cmp-bout__spread-val${
                down ? " ins-cmp-bout__spread-val--down" : ""
              }`}
            >
              {spreadLabel(spread)}
            </span>
          </span>
          <span className="ins-cmp-bout__arrow" aria-hidden>
            &rarr;
          </span>
        </button>
        {permalink && (
          <Link
            href={permalink}
            className="ins-cmp-bout__permalink"
            aria-label={`Permalink — the VEQT versus ${bout.short} write-up`}
          >
            Permalink <span aria-hidden>&rarr;</span>
          </Link>
        )}
      </div>
    );
  };

  return (
    <section className="ins-cmp-others" aria-labelledby="ins-cmp-others-display">
      <header className="ins-cmp-others__head">
        <div>
          <div className="ins-cmp-others__eyebrow">The other bouts</div>
          <h2 id="ins-cmp-others-display" className="ins-cmp-others__display">
            Five more on the card.
          </h2>
        </div>
        <span className="ins-cmp-others__note">
          Same arithmetic · Same rail
        </span>
      </header>

      <div className="ins-cmp-others__grid">
        <div className="ins-cmp-others__col">
          {others.slice(0, 3).map((bout, i) => renderRow(bout, i))}
        </div>
        <div className="ins-cmp-others__col">
          {others.slice(3).map((bout, i) => renderRow(bout, i + 3))}
          <div className="ins-cmp-others__request">
            <Link href="/community" className="ins-cmp-others__request-link">
              Request a bout <span aria-hidden>&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </section>
  );
}
