"use client";

/**
 * CalcMasthead — the /calculators hero (artboard 6d).
 *
 * Kicker with the real session count, the poster display "The math.", and
 * a right-hand dek. Two columns on desktop (display left, dek right,
 * baselines aligned); stacked on phones.
 */
interface CalcMastheadProps {
  sessionsCount?: number;
}

export default function CalcMasthead({ sessionsCount }: CalcMastheadProps) {
  const hasCount = sessionsCount !== undefined && sessionsCount > 0;

  return (
    <header className="cm">
      <div className="cm__kicker">
        FOUR CALCULATORS
        {hasCount
          ? ` · ${sessionsCount.toLocaleString("en-CA")} SESSIONS OF TAPE`
          : ""}
      </div>
      <div className="cm__lockup">
        <h1 className="cm__display">The math.</h1>
        <p className="cm__dek">
          Run a lookback on what was. Project a DCA going forward. Shelter the
          result. Or count the years to the only number that matters &mdash;
          your own.
        </p>
      </div>

      <style jsx>{`
        .cm {
          font-family: var(--ins-font);
          color: var(--ins-ink);
          padding-top: 34px;
        }
        .cm__kicker {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          color: var(--ins-gray-600);
          /* Pre-uppercased copy — no text-transform. */
        }
        .cm__lockup {
          display: grid;
          grid-template-columns: auto minmax(0, 1fr);
          gap: 56px;
          align-items: end;
        }
        .cm__display {
          font-size: 96px;
          font-weight: 700;
          letter-spacing: -0.05em;
          line-height: 0.85;
          margin: 14px 0 0;
        }
        .cm__dek {
          font-size: 15px;
          font-weight: 500;
          color: var(--ins-gray-700);
          line-height: 1.6;
          max-width: 48ch;
          margin: 0;
          padding-bottom: 8px;
          text-wrap: pretty;
        }

        @media (max-width: 1000px) {
          .cm__display {
            font-size: 72px;
          }
          .cm__lockup {
            gap: 32px;
          }
        }
        @media (max-width: 840px) {
          .cm__lockup {
            grid-template-columns: 1fr;
            gap: 14px;
            align-items: start;
          }
        }
        @media (max-width: 640px) {
          .cm {
            padding-top: 24px;
          }
          .cm__kicker {
            font-size: 9px;
            letter-spacing: 0.24em;
          }
          .cm__display {
            font-size: 56px;
            letter-spacing: -0.045em;
            line-height: 0.9;
            margin-top: 12px;
          }
          .cm__dek {
            font-size: 12.5px;
            line-height: 1.5;
            padding-bottom: 0;
          }
        }
      `}</style>
    </header>
  );
}
