"use client";

/**
 * CalcMasthead — the top type-driven masthead for /calculators.
 *
 * Two-row composition:
 *   1. Stamp row: editorial label + sessions-of-history counter.
 *   2. Lockup row: italic display "The math." headline + lede paragraph,
 *      separated by a 3px ink top rule and a 1px ink bottom rule.
 *
 * `sessionsCount` is rendered when provided so the masthead can quote the
 * exact number of trading days in the loaded history.
 */
interface CalcMastheadProps {
  sessionsCount?: number;
}

export default function CalcMasthead({ sessionsCount }: CalcMastheadProps) {
  return (
    <header className="cm">
      <div className="cm__top">
        <span className="ed-stamp">The math &middot; Four calculators &middot; Live data</span>
        {sessionsCount !== undefined && sessionsCount > 0 && (
          <span className="ed-stamp cm__top-mute">
            Powered by {sessionsCount.toLocaleString("en-CA")} sessions of VEQT history
          </span>
        )}
      </div>
      <div className="cm__lockup">
        <h1 className="ed-display-italic cm__h1">
          The <em style={{ fontStyle: "italic", fontWeight: 500 }}>math.</em>
        </h1>
        <p className="ed-body cm__lede">
          Four calculators on the boring fund. Run a lookback on what you&rsquo;d
          have if you&rsquo;d started; project a DCA going forward; shelter the
          result in a TFSA or RRSP; or work out how many years stand between
          you and the only number that matters &mdash; your own.
        </p>
      </div>

      <style jsx>{`
        .cm {
          padding: 26px 0 12px;
        }
        .cm__top {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          flex-wrap: wrap;
          padding-bottom: 10px;
        }
        .cm__top-mute {
          color: var(--ink-mute);
        }
        .cm__lockup {
          display: grid;
          grid-template-columns: 1fr;
          gap: 18px;
          padding: 18px 0 8px;
          border-top: 3px solid var(--ink);
          border-bottom: 1px solid var(--ink);
          align-items: end;
        }
        @media (min-width: 760px) {
          .cm__lockup {
            grid-template-columns: auto 1fr;
            gap: 44px;
            padding: 22px 0 12px;
          }
        }
        .cm__h1 {
          font-size: clamp(3rem, 8vw, 6rem);
          line-height: 1;
          letter-spacing: -0.035em;
          margin: 0;
          color: var(--ink);
        }
        .cm__lede {
          font-size: clamp(15px, 1.6vw, 17.5px);
          line-height: 1.55;
          color: var(--ink-soft);
          margin: 0;
          max-width: 56ch;
          padding-bottom: 8px;
        }
      `}</style>
    </header>
  );
}
