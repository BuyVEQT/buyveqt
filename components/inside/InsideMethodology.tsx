"use client";

import Link from "next/link";
import { FUND_DATA_LAST_UPDATED } from "@/data/funds";
import { parseSessionDate } from "@/lib/instrument-format";

/**
 * "The methodology." — the ink panel (artboard 6a).
 *
 * The one inverted surface on the page: literal #111111 ground, signal-red
 * kicker, white body, and four sources named in a row so the numbers above
 * can be checked. Ink here is deliberate and edition-independent — it does
 * not follow the --ins-paper/--ins-ink flip.
 *
 * The CTA is a <Link>, which styled-jsx will not scope-tag, so its rules
 * live under :global() inside this component's scoped block.
 */
export default function InsideMethodology() {
  // "Apr 2026" — the factsheet the geography weights were last verified
  // against (data/funds.ts FUND_DATA_LAST_UPDATED), not a hardcoded quarter.
  const factsheet = parseSessionDate(FUND_DATA_LAST_UPDATED).toLocaleDateString(
    "en-CA",
    { month: "short", year: "numeric", timeZone: "UTC" }
  );

  return (
    <section className="method" aria-label="How we know">
      <div className="method__title">
        <div className="method__kicker">How we know</div>
        <h2 className="method__display">The methodology.</h2>
      </div>

      <div className="method__body">
        <p className="method__copy">
          Holdings come from Vanguard Canada&rsquo;s daily NAV file, attributed
          back to sleeves by region. Sector books follow Yahoo Finance&rsquo;s
          classifications. Nothing proprietary.
        </p>
        <div className="method__sources">
          <span>
            Vanguard NAV — <b>Holdings</b>
          </span>
          <span>
            Yahoo Finance — <b>Price & distributions</b>
          </span>
          <span>
            Yahoo Finance — <b>Sectors</b>
          </span>
          <span>
            {factsheet} factsheet — <b>Geography</b>
          </span>
        </div>
      </div>

      <Link href="/methodology" className="method__cta">
        Read methodology <span aria-hidden>→</span>
      </Link>

      <style jsx>{`
        .method {
          font-family: var(--ins-font);
          background: #111111;
          color: #ffffff;
          padding: 26px 28px;
          display: grid;
          grid-template-columns: 260px 1fr auto;
          gap: 40px;
          align-items: start;
        }

        /* TRUE LABEL — a section kicker. Caps kept, size to the floor. It
           does sit in the fixed 260px title track, but "HOW WE KNOW" at
           10px/0.2em measures 11 × (6.2 + 2.0) ≈ 90px, roughly a third of
           the track, so pulling the tracking in would cost grip and buy
           nothing. */
        .method__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-signal);
        }
        .method__display {
          margin: 8px 0 0;
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.15;
          color: #ffffff;
        }

        .method__copy {
          margin: 0;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.7;
          max-width: 58ch;
          color: rgba(255, 255, 255, 0.78);
          text-wrap: pretty;
        }
        /* EXPLANATORY CAPTION — these are source lines: they say where each
           number came from so it can be checked. Caption grammar at 12px,
           and the transform comes off so the copy prints as it is authored —
           "Vanguard NAV", "Yahoo Finance", "GICS", "Apr 2026 factsheet" keep
           their proper nouns and acronyms instead of being flattened to a
           shout.

           COLOUR IS THE EXCEPTION: this is the page's one INK panel, so the
           muted tone stays the literal 55% white step. --ins-gray-600 is the
           paper-side utility gray and would be unreadable on #111111. */
        .method__sources {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 24px;
          margin-top: 14px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: rgba(255, 255, 255, 0.55);
        }
        .method__sources b {
          font-weight: 700;
          color: #ffffff;
        }

        /* styled-jsx does not tag <Link>; scope the CTA through :global. */
        .method :global(.method__cta) {
          position: relative;
          align-self: start;
          justify-self: end;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #ffffff;
          text-decoration: none;
          border-bottom: 2px solid var(--ins-inv-border-strong);
          padding-bottom: 4px;
          white-space: nowrap;
        }
        /* ≥44px tap height. Grown as a transparent overlay rather than with
           min-height, because the 2px rule under the words IS the CTA's
           affordance and it is drawn on the box's bottom edge — a 44px box
           would leave it floating ~17px below the label. The link's own box
           is ~18px tall, so the overlay reaches 13px past it either way.
           Nothing above or below the CTA is clickable (the panel is a
           heading, a paragraph and four static source spans), so the overlay
           cannot swallow a neighbour's tap, and no negative margins are
           involved. */
        .method :global(.method__cta::after) {
          content: "";
          position: absolute;
          left: 0;
          right: 0;
          top: 50%;
          height: 44px;
          transform: translateY(-50%);
        }
        .method :global(.method__cta:hover) {
          border-bottom-color: var(--ins-signal);
          color: var(--ins-signal);
        }

        @media (max-width: 960px) {
          .method {
            grid-template-columns: 1fr;
            gap: 18px;
          }
          .method :global(.method__cta) {
            justify-self: start;
          }
        }

        @media (max-width: 640px) {
          .method {
            padding: 16px 18px;
            gap: 12px;
          }
          .method__kicker {
            font-size: 10px;
            letter-spacing: 0.18em;
          }
          .method__display {
            margin-top: 6px;
            font-size: 16px;
          }
          .method__copy {
            font-size: 12.5px;
            line-height: 1.55;
          }
          /* Caption grammar is set once on the base rule — mobile only
             tightens the wrap gaps. The 8px/0.1em override is gone: it was
             the worst floor breach on the panel, and source lines at
             12px sentence case simply wrap onto another row here. */
          .method__sources {
            gap: 6px 16px;
            margin-top: 12px;
          }
          /* TRUE LABEL — button text. To the floor; tracking held because
             the CTA is justify-self:start and content-sized, so
             "READ METHODOLOGY →" at ~135px is nowhere near the 358px it
             has. */
          .method :global(.method__cta) {
            font-size: 10px;
            letter-spacing: 0.14em;
            padding-bottom: 3px;
          }
        }
      `}</style>
    </section>
  );
}
