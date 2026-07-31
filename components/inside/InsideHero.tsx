"use client";

import { useMemo } from "react";
import { useFundInfo } from "@/lib/useFundInfo";
import { FUNDS } from "@/data/funds";
import { fmtChipDate, fmtShortDate, parseSessionDate } from "@/lib/instrument-format";

type FundInfoSource = "yahoo-finance" | "cache" | "snapshot";

const YEAR_MS = 365.25 * 86_400_000;

/** Provenance caption for a spec cell — live vs. cached vs. factsheet. */
function provenance(
  source: FundInfoSource,
  snapshotAsOf: string,
  snapshotLabel: string
): string {
  if (source === "yahoo-finance") return "YAHOO FINANCE · LIVE";
  if (source === "cache") return "YAHOO FINANCE · CACHED";
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
  const holdingsValue = holdingCount.toLocaleString("en-CA");
  const holdingsSub = data
    ? provenance(data.sources.holdingCount, data.snapshotAsOf, "ACROSS 4 ETFS")
    : "ACROSS 4 ETFS";

  const aumValue = data?.aumDisplay ?? veqt.aum;
  const aumSub = data
    ? provenance(data.sources.netAssets, data.snapshotAsOf, "VANGUARD CANADA")
    : "VANGUARD CANADA";

  // Vanguard cut VEQT's management fee to 0.17% on Nov 18 2025. The official
  // MER still reflects the prior fiscal year; merFootnote carries that nuance
  // as the cell's tooltip. managementFee is already in PERCENT units.
  const mgmtFeeValue = `${veqt.managementFee.toFixed(2)}%`;
  const merSub = `REDUCED NOV 2025 · MER ${veqt.mer.toFixed(2)}%`;

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
  const tapeSub = `SINCE ${fmtChipDate(inception)}`;

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
          <div className="ihero__value">{holdingsValue}</div>
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
        .ihero__label {
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.22em;
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
        .ihero__sub {
          margin-top: 4px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
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
          .ihero__kicker {
            font-size: 9px;
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
          .ihero__label {
            font-size: 8.5px;
            letter-spacing: 0.18em;
          }
          .ihero__value {
            margin-top: 4px;
            font-size: 22px;
          }
          .ihero__sub {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}
