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
          back to sleeves by region. Sector tags follow GICS. Nothing
          proprietary.
        </p>
        <div className="method__sources">
          <span>
            Vanguard NAV — <b>Holdings</b>
          </span>
          <span>
            Yahoo Finance — <b>Price</b>
          </span>
          <span>
            GICS — <b>Sectors</b>
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

        .method__kicker {
          font-size: 9px;
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
        .method__sources {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 24px;
          margin-top: 14px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.55);
        }
        .method__sources b {
          font-weight: 700;
          color: #ffffff;
        }

        /* styled-jsx does not tag <Link>; scope the CTA through :global. */
        .method :global(.method__cta) {
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
            font-size: 9px;
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
          .method__sources {
            gap: 6px 16px;
            margin-top: 12px;
            font-size: 8px;
            letter-spacing: 0.1em;
          }
          .method :global(.method__cta) {
            font-size: 9.5px;
            letter-spacing: 0.14em;
            padding-bottom: 3px;
          }
        }
      `}</style>
    </section>
  );
}
