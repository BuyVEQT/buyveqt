"use client";

import { FUNDS } from "@/data/funds";
import { fundColor } from "@/lib/styles";
import { getVerdict } from "@/lib/compare-verdicts";
import type { VerdictPoint } from "@/lib/compare-verdicts";

interface ScorecardProps {
  selected: string[];
}

function WinnerBadge({
  winner,
  shortA,
  shortB,
  toneA,
  toneB,
}: {
  winner: string;
  shortA: string;
  shortB: string;
  toneA: string;
  toneB: string;
}) {
  if (winner === "Tie") {
    return (
      <span className="wb wb--tie">
        <span className="wb__dot" aria-hidden />
        Tie
      </span>
    );
  }
  const isA = winner === shortA;
  const tone = isA ? toneA : toneB;
  return (
    <span
      className={`wb wb--${isA ? "a" : "b"}`}
      style={{ borderColor: tone, color: tone }}
    >
      <span className="wb__dot" style={{ background: tone }} aria-hidden />
      {winner}
    </span>
  );
}

export default function Scorecard({ selected }: ScorecardProps) {
  if (selected.length !== 2) return null;

  const verdict = getVerdict(selected[0], selected[1]);
  if (!verdict?.points?.length) return null;

  const fundA = FUNDS[selected[0]];
  const fundB = FUNDS[selected[1]];
  if (!fundA || !fundB) return null;

  const shortA = fundA.shortName;
  const shortB = fundB.shortName;
  const colorA = fundColor(shortA);
  const colorB = fundColor(shortB);

  let winsA = 0;
  let winsB = 0;
  let ties = 0;
  for (const p of verdict.points) {
    if (p.winner === shortA) winsA++;
    else if (p.winner === shortB) winsB++;
    else ties++;
  }

  return (
    <section className="scorecard card-std">
      <div className="scorecard__head">
        <div>
          <div className="ed-stamp" style={{ color: "var(--stamp)" }}>
            The judges&apos; scorecard
          </div>
          <h2 className="ed-display scorecard__h2">
            Round <em style={{ fontStyle: "italic", fontWeight: 500 }}>by round.</em>
          </h2>
        </div>
        <div className="scorecard__tally">
          <div className="scorecard__tally-side">
            <div
              className="ed-numerals scorecard__tally-num"
              style={{ color: colorA }}
            >
              {winsA}
            </div>
            <div className="ed-label">{shortA}</div>
          </div>
          <div className="scorecard__tally-mid">
            <span className="ed-display-italic">/</span>
            <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
              {ties} ties
            </div>
          </div>
          <div className="scorecard__tally-side">
            <div
              className="ed-numerals scorecard__tally-num"
              style={{ color: colorB }}
            >
              {winsB}
            </div>
            <div className="ed-label">{shortB}</div>
          </div>
        </div>
      </div>

      <div className="rule-thick" />

      <ol className="scorecard__rounds">
        {verdict.points.map((point: VerdictPoint, i: number) => (
          <li key={i} className="scorecard__round">
            <div className="scorecard__round-head">
              <div className="scorecard__round-left">
                <span className="ed-numerals scorecard__num">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="ed-display scorecard__label">
                  {point.label}
                </span>
              </div>
              <WinnerBadge
                winner={point.winner}
                shortA={shortA}
                shortB={shortB}
                toneA={colorA}
                toneB={colorB}
              />
            </div>
            <p className="ed-body scorecard__explanation">
              {point.explanation}
            </p>
          </li>
        ))}
      </ol>

      <style jsx>{`
        .scorecard {
          padding: 24px 24px 18px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 22px;
        }
        .scorecard__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }
        .scorecard__h2 {
          font-size: clamp(1.6rem, 2.6vw, 2.1rem);
          line-height: 1.05;
          margin: 4px 0 0;
          letter-spacing: -0.02em;
        }
        .scorecard__tally {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 10px 16px;
          background: var(--paper-warm);
          border: 1px solid var(--rule-soft);
          border-radius: 10px;
        }
        .scorecard__tally-side {
          text-align: center;
        }
        .scorecard__tally-num {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 36px;
          line-height: 1;
          letter-spacing: -0.025em;
        }
        .scorecard__tally-mid {
          text-align: center;
        }
        .scorecard__rounds {
          list-style: none;
          margin: 16px 0 0;
          padding: 0;
        }
        .scorecard__round {
          padding: 18px 0;
          border-bottom: 1px solid var(--rule-soft);
        }
        .scorecard__round:last-child {
          border-bottom: none;
        }
        .scorecard__round-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 14px;
        }
        .scorecard__round-left {
          display: flex;
          align-items: baseline;
          gap: 14px;
          min-width: 0;
        }
        .scorecard__num {
          font-family: var(--font-display);
          font-weight: 500;
          font-size: 16px;
          color: var(--ink-mute);
          letter-spacing: -0.01em;
          flex-shrink: 0;
        }
        .scorecard__label {
          font-size: clamp(1.05rem, 1.7vw, 1.3rem);
          line-height: 1.15;
          letter-spacing: -0.01em;
          color: var(--ink);
        }
        .scorecard__explanation {
          margin: 8px 0 0 30px;
          font-size: 14px;
          line-height: 1.5;
          color: var(--ink-soft);
          max-width: 70ch;
        }
        @media (max-width: 540px) {
          .scorecard__explanation {
            margin-left: 0;
          }
        }

        /* WinnerBadge — scoped globally since it's a sub-component */
        :global(.wb) {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 12px;
          border-radius: 999px;
          border: 1.5px solid var(--rule);
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--ink-mute);
          background: var(--paper-light);
          flex-shrink: 0;
          white-space: nowrap;
        }
        :global(.wb--tie) {
          color: var(--ink-mute);
          border-color: var(--rule);
        }
        :global(.wb__dot) {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--rule);
          flex-shrink: 0;
        }
      `}</style>
    </section>
  );
}
