"use client";

import { useFundInfo } from "@/lib/useFundInfo";
import SpecRow from "./SpecRow";

type FundInfoSource = "yahoo-finance" | "cache" | "snapshot";

/** Format a decimal expense ratio (0.002 → "0.20%"). Falls back to "~0.20%". */
function fmtPctMer(decimal: number | null): string {
  if (decimal === null || !Number.isFinite(decimal)) return "~0.20%";
  return `${(decimal * 100).toFixed(2)}%`;
}

/** Build a human-readable data-freshness sub-caption. */
function srcSub(
  source: FundInfoSource,
  snapshotAsOf: string,
  liveLabel: string
): string {
  if (source === "yahoo-finance") return liveLabel;
  if (source === "cache") return `${liveLabel} (cached)`;
  return `as of ${snapshotAsOf}`;
}

/**
 * V2 InsideHero — single-column type-driven lockup.
 *
 * eyebrow → huge italic h1 → drop-cap lede → 4-cell SpecRow (Holdings / AUM / MER / Inception)
 *
 * Replaces the v1 two-column hero + TiltBar card. GeographyPanel is now its
 * own module rendered directly below this in InsideClient.
 */
export default function InsideHero() {
  const { data } = useFundInfo("VEQT.TO");

  const holdingsValue = data?.holdingCount != null
    ? data.holdingCount.toLocaleString("en-CA")
    : "13,726";
  const holdingsSub = data
    ? srcSub(data.sources.holdingCount, data.snapshotAsOf, "across 4 ETFs")
    : "across 4 ETFs";

  const aumValue = data?.aumDisplay ?? "$13.4B";
  const aumSub = data
    ? srcSub(data.sources.netAssets, data.snapshotAsOf, "Vanguard Canada · Apr 30")
    : "Vanguard Canada · Apr 30";

  const merValue = data && data.expenseRatio !== null
    ? fmtPctMer(data.expenseRatio)
    : "~0.20%";
  const merSub = data
    ? srcSub(data.sources.expenseRatio, data.snapshotAsOf, "effective rate")
    : "reduced Nov 2025";

  const specs = [
    { label: "Holdings",  value: holdingsValue, sub: holdingsSub },
    { label: "AUM",       value: aumValue,       sub: aumSub },
    { label: "MER",       value: merValue,       sub: merSub },
    { label: "Inception", value: "Jan 29, 2019", sub: "7+ years on tape" },
  ];

  return (
    <section className="inside-hero">
      <div className="ed-stamp inside-hero__eyebrow">
        Inside VEQT · Inception Jan 2019 · Updated quarterly
      </div>
      <h1 className="ed-display-italic inside-hero__h1">
        What you own when you own{" "}
        <em style={{ fontStyle: "italic", fontWeight: 500 }}>VEQT.</em>
      </h1>
      <p className="ed-body inside-hero__lede">
        <span className="inside-hero__dropcap">T</span>hirteen thousand seven
        hundred and twenty-six companies in a single ticker, sorted into four
        index ETFs by region and rebalanced by Vanguard. Every quarter the
        weights drift; every quarter the fund snaps them back. Your only job
        is to keep buying.
      </p>

      <SpecRow items={specs} />

      <style jsx>{`
        .inside-hero {
          padding: 30px 0 18px;
        }
        .inside-hero__eyebrow {
          margin-bottom: 16px;
        }
        .inside-hero__h1 {
          font-size: clamp(2.6rem, 6vw, 4.6rem);
          line-height: 1;
          letter-spacing: -0.03em;
          color: var(--ink);
          margin: 0;
          max-width: 18ch;
        }
        .inside-hero__lede {
          margin: 22px 0 0;
          font-size: clamp(15px, 1.6vw, 18px);
          line-height: 1.55;
          color: var(--ink-soft);
          max-width: 62ch;
        }
        .inside-hero__dropcap {
          float: left;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 3.6em;
          line-height: 0.86;
          color: var(--ink);
          padding: 0.06em 0.12em 0 0;
          margin-top: 0.05em;
          font-feature-settings: "ss01";
          shape-outside: margin-box;
        }
      `}</style>
    </section>
  );
}
