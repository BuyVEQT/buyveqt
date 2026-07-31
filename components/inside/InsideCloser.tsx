"use client";

import Link from "next/link";
import { FUNDS } from "@/data/funds";
import { fmtShortDate } from "@/lib/instrument-format";

/** Quarter ends — Vanguard's rebalance snap dates. Anchored at NOON UTC
 *  (house convention, see parseSessionDate): a midnight-UTC anchor
 *  formats as the previous calendar day in every Americas timezone —
 *  Sep 30 printed as "SEP 29". */
function nextQuarterEnd(now: Date): Date {
  const y = now.getUTCFullYear();
  const ends = [
    Date.UTC(y, 2, 31, 12), // Mar 31
    Date.UTC(y, 5, 30, 12), // Jun 30
    Date.UTC(y, 8, 30, 12), // Sep 30
    Date.UTC(y, 11, 31, 12), // Dec 31
    Date.UTC(y + 1, 2, 31, 12),
  ];
  const t = now.getTime();
  for (const end of ends) {
    if (end >= t) return new Date(end);
  }
  return new Date(ends[ends.length - 1]);
}

/**
 * The verdict rail + the closer (artboard 6a).
 *
 * The rail is the page's one-line verdict: a 9px ink square, the claim, and
 * the next rebalance snap on the right. The closer gives permission to
 * leave — 44px display, a one-line summary of the machine, and the single
 * red CTA across to /compare.
 *
 * Both CTAs and the rail live here rather than in InsideClient so the module
 * JSX stays lexically inside one component's return (styled-jsx requirement).
 */
export default function InsideCloser() {
  // Both figures come from the factsheet snapshot rather than being restated
  // here — the closer must never drift from the ledger above it.
  const veqt = FUNDS["VEQT.TO"];
  const holdings = veqt.numberOfHoldings.toLocaleString("en-CA");
  const sleeves = veqt.underlyingETFs.length;
  const snap = fmtShortDate(nextQuarterEnd(new Date()));

  return (
    <>
      <div className="verdict" role="note">
        <span className="verdict__mark" aria-hidden />
        <span className="verdict__claim">
          <span className="verdict-desk">
            Nothing in here needs picking — the weights are the product
          </span>
          <span className="verdict-mob">Nothing in here needs picking</span>
        </span>
        <span className="verdict__snap" suppressHydrationWarning>
          <span className="verdict-desk">Next rebalance snap: {snap}</span>
          <span className="verdict-mob">Next snap · {snap}</span>
        </span>

        <style jsx>{`
          .verdict {
            font-family: var(--ins-font);
            color: var(--ins-ink);
            border: 1px solid var(--ins-ink);
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 11px 22px;
          }
          .verdict-mob {
            display: none;
          }
          .verdict__mark {
            width: 9px;
            height: 9px;
            background: var(--ins-ink);
            flex-shrink: 0;
          }
          .verdict__claim {
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
          }
          .verdict__snap {
            margin-left: auto;
            font-size: 9.5px;
            font-weight: 600;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--ins-gray-600);
            white-space: nowrap;
            font-variant-numeric: tabular-nums;
          }

          @media (max-width: 900px) {
            .verdict__claim {
              font-size: 10px;
              letter-spacing: 0.14em;
            }
          }
          @media (max-width: 640px) {
            .verdict {
              gap: 8px;
              padding: 11px 14px;
            }
            .verdict-desk {
              display: none;
            }
            .verdict-mob {
              display: inline;
            }
            .verdict__mark {
              width: 8px;
              height: 8px;
            }
            .verdict__claim {
              font-size: 9px;
              letter-spacing: 0.12em;
            }
            .verdict__snap {
              font-size: 8.5px;
              letter-spacing: 0.1em;
            }
          }
        `}</style>
      </div>

      <section className="closer" aria-label="Closing note">
        <div>
          <p className="closer__display">You&rsquo;ve seen the machine.</p>
          <p className="closer__sub">
            {sleeves} sleeves, {holdings} companies, one ticker. Vanguard does
            the rest.
          </p>
        </div>
        <Link href="/compare" className="closer__cta">
          Compare it to the field <span aria-hidden>→</span>
        </Link>

        <style jsx>{`
          .closer {
            font-family: var(--ins-font);
            color: var(--ins-ink);
            border-top: 1px solid var(--ins-ink);
            padding: 40px 0 0;
            display: grid;
            grid-template-columns: 1fr auto;
            gap: 40px;
            align-items: end;
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
            font-variant-numeric: tabular-nums;
          }

          /* styled-jsx does not tag <Link>; scope the CTA through :global. */
          .closer :global(.closer__cta) {
            justify-self: end;
            font-size: 11px;
            font-weight: 800;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: var(--ins-signal);
            text-decoration: none;
            border-bottom: 2px solid var(--ins-signal);
            padding-bottom: 5px;
            white-space: nowrap;
          }
          .closer :global(.closer__cta:hover) {
            color: var(--ins-ink);
            border-bottom-color: var(--ins-ink);
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
            .closer :global(.closer__cta) {
              display: inline-block;
              margin-top: 12px;
              font-size: 10px;
              letter-spacing: 0.14em;
              padding-bottom: 4px;
            }
          }
        `}</style>
      </section>
    </>
  );
}
