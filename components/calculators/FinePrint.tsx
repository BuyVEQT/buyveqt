"use client";

/**
 * The /calculators outro, in three parts (artboard 6d):
 *
 *   FinePrint   — ink panel: red kicker, white display, muted body. Same
 *                 disclaimer copy as before the reskin.
 *   VerdictRail — 1px ink strip: square · verdict · source micro.
 *   CalcCloser  — "One number matters. Yours." + the signal CTA that
 *                 switches tabs (hence the handler rather than a link).
 */

export default function FinePrint() {
  return (
    <section className="finep" aria-label="The fine print">
      <div className="finep__lockup">
        <div className="finep__kicker">THE FINE PRINT</div>
        <div className="finep__display">Arithmetic, not advice.</div>
      </div>
      <div className="finep__body">
        <p>
          These calculators use simplified assumptions for illustration.
          They don&rsquo;t account for fees, taxes, inflation, or the full
          shape of market volatility &mdash; only the bones of the math.
        </p>
        <p>
          <em>Past performance is not a forecast.</em> The Lookback tells
          you what was; the other three ask you to assume a future return
          rate. Reasonable assumptions still produce wide ranges &mdash;
          change a 7% input to 5% and watch what happens.
        </p>
        <p>
          None of this is financial advice. It&rsquo;s arithmetic, run
          slowly, on one ETF. Your situation, taxes, and risk tolerance are
          your own to weigh.
        </p>
      </div>

      <style jsx>{`
        .finep {
          /* Literal ink — this panel stays ink under every edition. */
          background: #111111;
          color: #ffffff;
          font-family: var(--ins-font);
          padding: 26px 28px;
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr);
          gap: 40px;
          align-items: start;
        }
        /* "THE FINE PRINT" — a TRUE LABEL (an eyebrow naming the panel),
           so caps stay. 9px → the floor, one tracking notch back for the
           fixed 220px grid track it sits in. The body below is already
           running sentence-case prose at 13px, and its muted white stays
           put: this is an ink panel, where rgba(255,255,255,·) is the
           correct scale, not --ins-gray-600. */
        .finep__kicker {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          color: var(--ins-signal);
        }
        .finep__display {
          font-size: 22px;
          font-weight: 600;
          letter-spacing: -0.01em;
          line-height: 1.15;
          margin-top: 8px;
        }
        .finep__body {
          display: flex;
          flex-direction: column;
          gap: 12px;
          font-size: 13px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.78);
          line-height: 1.7;
          max-width: 74ch;
          text-wrap: pretty;
        }
        .finep__body p {
          margin: 0;
        }
        .finep__body em {
          font-style: normal;
          font-weight: 700;
          color: #ffffff;
        }

        @media (max-width: 820px) {
          .finep {
            grid-template-columns: 1fr;
            gap: 16px;
          }
        }
        @media (max-width: 640px) {
          .finep {
            padding: 18px 20px;
          }
          .finep__kicker {
            font-size: 10px;
            letter-spacing: 0.14em;
          }
          .finep__display {
            font-size: 16px;
            margin-top: 6px;
          }
          .finep__body {
            font-size: 11.5px;
            line-height: 1.65;
            gap: 10px;
          }
        }
      `}</style>
    </section>
  );
}

/** The verdict rail under the fine print. */
export function VerdictRail() {
  return (
    <div className="vrail">
      <span className="vrail__sq" aria-hidden />
      <span className="vrail__copy">
        THE ASSUMPTIONS ARE THE PRODUCT &mdash; CHANGE THEM AND WATCH THE RANGE
      </span>
      <span className="vrail__note">
        SOURCE: YAHOO FINANCE &middot; UPDATED DAILY
      </span>

      <style jsx>{`
        .vrail {
          border: 1px solid var(--ins-ink);
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 11px 22px;
          font-family: var(--ins-font);
          color: var(--ins-ink);
        }
        .vrail__sq {
          width: 9px;
          height: 9px;
          background: var(--ins-ink);
          flex: none;
        }
        /* The verdict copy stays a caps stamp at 11px, the same call the
           home band's rail made: a verdict is a stamp, not prose about the
           page, and it already clears the floor. Its two strings are
           pre-uppercased in the JSX — no text-transform. */
        .vrail__copy {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.18em;
        }
        /* The source note names things (a data source, an update cadence)
           with no verb, so it is a LABEL and keeps its caps: 9.5px → the
           floor. Tracking holds — the note is auto-margined in a wrapping
           rail, not seated in a fixed box. */
        .vrail__note {
          margin-left: auto;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: var(--ins-gray-600);
          text-align: right;
        }
        @media (max-width: 640px) {
          .vrail {
            padding: 11px 14px;
            gap: 8px;
          }
          .vrail__copy {
            font-size: 10px;
            letter-spacing: 0.12em;
          }
          .vrail__note {
            font-size: 10px;
            letter-spacing: 0.1em;
          }
        }
      `}</style>
    </div>
  );
}

interface CalcCloserProps {
  ctaLabel: string;
  onJump: () => void;
}

/** "One number matters. Yours." — closer with a tab-switching CTA. */
export function CalcCloser({ ctaLabel, onJump }: CalcCloserProps) {
  return (
    <section className="closer" aria-label="Closing note">
      <div>
        <p className="closer__display">One number matters. Yours.</p>
        <p className="closer__sub">
          The lookback tells you what was. The other three ask what
          you&rsquo;ll assume.
        </p>
      </div>
      <button type="button" onClick={onJump} className="closer__cta">
        {ctaLabel} <span aria-hidden>&rarr;</span>
      </button>

      <style jsx>{`
        .closer {
          border-top: 1px solid var(--ins-ink);
          padding: 40px 0 0;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 40px;
          align-items: end;
          font-family: var(--ins-font);
          color: var(--ins-ink);
        }
        .closer__display {
          margin: 0;
          font-size: 44px;
          font-weight: 600;
          letter-spacing: -0.03em;
          line-height: 1.05;
        }
        .closer__sub {
          margin: 12px 0 0;
          font-size: 15px;
          font-weight: 500;
          color: var(--ins-gray-600);
        }
        /* Tap target without moving the rule: the signal underline is the
           button's own bottom border, so a min-height with centred content
           would float it 15px below the words. Padding above the text does
           the job instead — 24 + ~13 (line box) + 5 + 2 ≈ 44px — and since
           the closer grid is align-items:end the box grows upward, leaving
           the wordmark and its rule exactly where they were. Nothing above
           it is clickable, so the extra area overlaps nothing. */
        .closer__cta {
          appearance: none;
          background: transparent;
          border: 0;
          border-bottom: 2px solid var(--ins-signal);
          border-radius: 0;
          padding: 24px 0 5px;
          font-family: var(--ins-font);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--ins-signal);
          cursor: pointer;
          white-space: nowrap;
          justify-self: end;
        }
        .closer__cta:focus-visible {
          outline: 2px solid var(--ins-signal);
          outline-offset: 4px;
        }
        @media (max-width: 640px) {
          .closer {
            display: block;
            padding-top: 18px;
          }
          .closer__display {
            font-size: 24px;
            letter-spacing: -0.02em;
            line-height: 1.1;
          }
          .closer__sub {
            margin-top: 8px;
            font-size: 12.5px;
            line-height: 1.5;
          }
          /* The base rule's top padding is the gap now — stacking a 12px
             margin on top of it would double-space the closer. min-height
             stays as the belt-and-braces 44px (border-box, so it counts
             the padding rather than adding to it). */
          .closer__cta {
            display: inline-block;
            margin-top: 0;
            min-height: 44px;
            font-size: 10px;
            letter-spacing: 0.14em;
          }
        }
      `}</style>
    </section>
  );
}
