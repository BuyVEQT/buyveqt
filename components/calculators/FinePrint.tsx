"use client";

/**
 * FinePrint — cream Card with disclaimer paragraphs + italic source line.
 * Sits at the bottom of /calculators, just before the page padding.
 */
export default function FinePrint() {
  return (
    <section className="finep">
      <div className="ed-stamp">The fine print</div>
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
      <p className="finep__source ed-caption">
        Source: VEQT historical price data via Yahoo Finance &middot; Updated daily
      </p>

      <style jsx>{`
        .finep {
          padding: 26px;
          margin-top: 28px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 14px;
        }
        .finep__body {
          margin-top: 14px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          font-family: var(--font-serif);
          font-size: 15px;
          line-height: 1.65;
          color: var(--ink-soft);
          max-width: 64ch;
        }
        .finep__body p {
          margin: 0;
        }
        .finep__body em {
          font-style: italic;
          color: var(--ink);
        }
        .finep__source {
          margin-top: 18px;
          padding-top: 14px;
          border-top: 1px solid var(--rule-soft);
          font-style: italic;
          font-size: 11.5px;
        }
      `}</style>
    </section>
  );
}
