"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFundInfo } from "@/lib/useFundInfo";
import { FUNDS } from "@/data/funds";
import { fmtChipDate, fmtShortDate, parseSessionDate } from "@/lib/instrument-format";

type FundInfoSource = "yahoo-finance" | "cache" | "snapshot";

const YEAR_MS = 365.25 * 86_400_000;

/** Holdings count-up: 0 → the real number, ease-out, once on load. */
const COUNT_MS = 1200;

/**
 * The one holdings formatter. SSR markup and every animated frame go through
 * it, so the number never changes shape mid-flight — and, with tabular-nums
 * on the hero, never jitters as digits roll.
 */
function fmtHoldings(n: number): string {
  return n.toLocaleString("en-CA");
}

/**
 * Provenance caption for a spec cell — live vs. cached vs. factsheet.
 *
 * These are EXPLANATORY CAPTIONS, not labels: each one says where the number
 * above it came from. Turn 8 took them out of 9px caps, so the strings are
 * authored in sentence case here rather than being shouted by a transform.
 * "Yahoo Finance" is a proper noun; the date comes from the shared
 * fmtShortDate and prints as that formatter prints it.
 */
function provenance(
  source: FundInfoSource,
  snapshotAsOf: string,
  snapshotLabel: string
): string {
  if (source === "yahoo-finance") return "Yahoo Finance · live";
  if (source === "cache") return "Yahoo Finance · cached";
  return `${snapshotLabel} · ${fmtShortDate(parseSessionDate(snapshotAsOf))}`;
}

/**
 * The Instrument hero for /inside-veqt (artboard 6a).
 *
 * Dateline kicker → 64px poster headline with "VEQT." in signal red → dek →
 * a 3px-ruled four-cell spec strip (HOLDINGS / AUM / MGMT FEE / ON TAPE),
 * each cell carrying a provenance sub-caption. Mobile drops to a 2×2 strip
 * with the sub-captions suppressed, per the 390 artboard.
 *
 * Numbers are real: holdings + AUM come from /api/fund-info (three-tier
 * resolved), the management fee from data/funds.ts — where it is stored in
 * PERCENT units already (0.17 means 0.17%), so it is never multiplied.
 */
export default function InsideHero() {
  const { data } = useFundInfo("VEQT.TO");
  const veqt = FUNDS["VEQT.TO"];

  const holdingCount = data?.holdingCount ?? veqt.numberOfHoldings;
  const holdingsValue = fmtHoldings(holdingCount);
  // Sentence case, with the ETF acronym and the Vanguard Canada proper noun
  // left standing — see the note on provenance() above.
  const holdingsSub = data
    ? provenance(data.sources.holdingCount, data.snapshotAsOf, "Across 4 ETFs")
    : "Across 4 ETFs";

  const aumValue = data?.aumDisplay ?? veqt.aum;
  const aumSub = data
    ? provenance(data.sources.netAssets, data.snapshotAsOf, "Vanguard Canada")
    : "Vanguard Canada";

  // Vanguard cut VEQT's management fee to 0.17% on Nov 18 2025. The official
  // MER still reflects the prior fiscal year; merFootnote carries that nuance
  // as the cell's tooltip. managementFee is already in PERCENT units.
  const mgmtFeeValue = `${veqt.managementFee.toFixed(2)}%`;
  // Caption, so sentence case — MER stays an acronym and the figures are
  // untouched.
  const merSub = `Reduced Nov 2025 · MER ${veqt.mer.toFixed(2)}%`;

  // Years on tape reads the clock, so it lives in a memo (same shape as the
  // home almanac's entry №) rather than the render body.
  const inception = useMemo(
    () => parseSessionDate(veqt.inceptionDate),
    [veqt.inceptionDate]
  );
  const tapeValue = useMemo(() => {
    const years = (new Date().getTime() - inception.getTime()) / YEAR_MS;
    return `${years.toFixed(1)} YRS`;
  }, [inception]);
  const tapeSub = `Since ${fmtChipDate(inception)}`;

  // ── Holdings count-up ────────────────────────────────────────────────
  // Progressive enhancement, deliberately: the SSR markup already carries
  // the final number, so there is no hydration mismatch and nothing reflows
  // on hydration. Only after mount do we swap the text back to 0 and drive
  // it up — through textContent on a ref, so ~70 frames never re-render the
  // hero. No JS and reduced motion both land on the number that is already
  // in the markup.
  const holdingsRef = useRef<HTMLSpanElement>(null);
  const countedRef = useRef(false);

  useEffect(() => {
    const el = holdingsRef.current;
    if (!el) return;

    // The strip counts up once, on load. A later value swap — live
    // /api/fund-info replacing the factsheet snapshot — lands as plain text.
    if (countedRef.current) {
      el.textContent = fmtHoldings(holdingCount);
      return;
    }
    countedRef.current = true;

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const target = holdingCount;
    let raf = 0;
    let start = 0;
    const step = (now: number) => {
      if (start === 0) start = now;
      const t = Math.min(1, (now - start) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      el.textContent = fmtHoldings(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    el.textContent = fmtHoldings(0);
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [holdingCount]);

  return (
    <section className="ihero">
      <div className="ihero__kicker">
        <span className="ihero-desk">
          INSIDE VEQT · INCEPTION JAN 2019 · UPDATED QUARTERLY
        </span>
        <span className="ihero-mob">INSIDE VEQT · UPDATED QUARTERLY</span>
      </div>

      <h1 className="ihero__display">
        What you own when you own{" "}
        <span className="ihero__signal">VEQT.</span>
      </h1>

      <p className="ihero__dek">
        <span className="ihero-desk">
          {holdingsValue} companies in a single ticker, sorted into four index
          ETFs by region. Every quarter the weights drift; every quarter
          Vanguard snaps them back. Your only job is to keep buying.
        </span>
        <span className="ihero-mob">
          {holdingsValue} companies in one ticker, sorted into four index ETFs
          by region. Vanguard rebalances; you keep buying.
        </span>
      </p>

      <div className="ihero__spec">
        <div className="ihero__cell">
          <div className="ihero__label">Holdings</div>
          <div className="ihero__value ihero__value--live">
            <span ref={holdingsRef}>{holdingsValue}</span>
            <span className="ihero__dot" aria-hidden="true" />
          </div>
          <div className="ihero__sub">{holdingsSub}</div>
        </div>
        <div className="ihero__cell">
          <div className="ihero__label">AUM</div>
          <div className="ihero__value">{aumValue}</div>
          <div className="ihero__sub">{aumSub}</div>
        </div>
        <div className="ihero__cell" title={veqt.merFootnote}>
          <div className="ihero__label">Mgmt fee</div>
          <div className="ihero__value">{mgmtFeeValue}</div>
          <div className="ihero__sub">{merSub}</div>
        </div>
        <div className="ihero__cell">
          <div className="ihero__label">On tape</div>
          <div className="ihero__value" suppressHydrationWarning>
            {tapeValue}
          </div>
          <div className="ihero__sub">{tapeSub}</div>
        </div>
      </div>

      <style jsx>{`
        .ihero {
          padding-top: 34px;
          font-family: var(--ins-font);
          color: var(--ins-ink);
          font-variant-numeric: tabular-nums;
        }
        .ihero-mob {
          display: none;
        }

        .ihero__kicker {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .ihero__display {
          margin: 16px 0 0;
          font-size: 64px;
          font-weight: 700;
          letter-spacing: -0.04em;
          line-height: 1;
          max-width: 15ch;
          color: var(--ins-ink);
        }
        .ihero__signal {
          color: var(--ins-signal);
        }
        .ihero__dek {
          margin: 16px 0 0;
          font-size: 15px;
          font-weight: 500;
          line-height: 1.6;
          max-width: 66ch;
          color: var(--ins-gray-700);
          text-wrap: pretty;
        }

        /* ── Spec strip ─────────────────────────────────────────── */
        .ihero__spec {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 28px;
          margin-top: 26px;
          border-top: 3px solid var(--ins-rule-strong);
        }
        .ihero__cell {
          padding-top: 14px;
          min-width: 0;
        }
        .ihero__cell + .ihero__cell {
          border-left: 1px solid var(--ins-hair);
          padding-left: 24px;
        }
        /* TRUE LABEL — a stat label names its cell ("Holdings", "AUM",
           "Mgmt fee", "On tape"). Caps kept, size to the floor, and the
           tracking comes back a notch (0.22em → 0.2em) because the label
           sits in a fixed spec-strip track. Longest string "MGMT FEE" is
           8 × (10 × 0.62 + 2.0) ≈ 66px inside a ~285px track. */
        .ihero__label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--ins-gray-600);
        }
        .ihero__value {
          margin-top: 6px;
          font-size: 30px;
          font-weight: 600;
          letter-spacing: -0.02em;
          line-height: 1.1;
          color: var(--ins-ink);
        }
        /* Holdings cell — the counted number and its live dot. The dot rides
           the number's right edge as it counts, then settles; baseline
           alignment keeps it sitting on the figure's foot, as in the mock. */
        .ihero__value--live {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .ihero__dot {
          width: 7px;
          height: 7px;
          flex: 0 0 auto;
          border-radius: 50%;
          background: var(--ins-signal);
          animation: ins-pulse 2.2s ease-in-out infinite;
        }
        /* EXPLANATORY CAPTION — the sub line under each figure is a source
           or as-of note ("Yahoo Finance · live", "Since JAN 30, 2019"), not
           a name. Caption grammar, and the transform comes off because the
           strings are authored in sentence case up in the component. Longest
           real string, "Reduced Nov 2025 · MER 0.17%", measures ~171px in a
           ~285px track, so no cell wraps. */
        .ihero__sub {
          margin-top: 4px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: var(--ins-gray-600);
        }

        @media (max-width: 1100px) {
          .ihero__display {
            font-size: 52px;
          }
        }

        @media (max-width: 640px) {
          .ihero {
            padding-top: 24px;
          }
          .ihero-desk {
            display: none;
          }
          .ihero-mob {
            display: inline;
          }
          /* TRUE LABEL — the dateline names the page and its cadence. Caps
             and tracking kept: it is a full-width block, and the mobile
             string "INSIDE VEQT · UPDATED QUARTERLY" at 10px/0.24em is
             31 × (6.2 + 2.4) ≈ 267px against ~350px of paper. */
          .ihero__kicker {
            font-size: 10px;
            letter-spacing: 0.24em;
          }
          .ihero__display {
            margin-top: 12px;
            font-size: 40px;
            letter-spacing: -0.035em;
            line-height: 1.02;
            max-width: none;
          }
          .ihero__dek {
            margin-top: 12px;
            font-size: 12.5px;
            line-height: 1.55;
          }
          .ihero__spec {
            grid-template-columns: 1fr 1fr;
            gap: 0 20px;
            margin-top: 18px;
            border-top: none;
          }
          .ihero__cell {
            padding: 10px 0;
            border-top: 1px solid var(--ins-ink);
          }
          .ihero__cell:nth-child(-n + 2) {
            border-top-width: 2px;
          }
          .ihero__cell + .ihero__cell {
            border-left: none;
            padding-left: 0;
          }
          /* Floor again, and a notch off the tracking (0.18em → 0.14em) for
             the tighter 2-column strip: "MGMT FEE" lands at 8 × (6.2 + 1.4)
             ≈ 61px inside a ~165px track at 390px. */
          .ihero__label {
            font-size: 10px;
            letter-spacing: 0.14em;
          }
          .ihero__value {
            margin-top: 4px;
            font-size: 22px;
          }
          .ihero__value--live {
            gap: 6px;
          }
          .ihero__dot {
            width: 6px;
            height: 6px;
          }
          .ihero__sub {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
