"use client";

import type { CSSProperties, ReactNode } from "react";
import Card from "@/components/ui/Card";
import { useFundInfo } from "@/lib/useFundInfo";

interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  /** Hide on mobile (the spec keeps only 3 tiles below the lg breakpoint). */
  desktopOnly?: boolean;
  /** Hide the right divider — used for the last tile. */
  noDivider?: boolean;
  title?: string;
}

function StatTile({
  label,
  value,
  sub,
  desktopOnly = false,
  noDivider = false,
  title,
}: StatTileProps) {
  const wrapStyle: CSSProperties = {
    flex: 1,
    minWidth: 0,
    padding: "14px 16px",
    borderRight: noDivider ? "none" : "1px solid var(--rule-soft)",
  };
  return (
    <div
      className={`inside-stat-tile${desktopOnly ? " inside-stat-tile--desktop" : ""}`}
      style={wrapStyle}
      title={title}
    >
      <div className="ed-label" style={{ color: "var(--ink-mute)" }}>
        {label}
      </div>
      <div
        className="ed-numerals"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: 22,
          lineHeight: 1,
          marginTop: 8,
          letterSpacing: "-0.015em",
          color: "var(--ink)",
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 12,
            color: "var(--ink-mute)",
            marginTop: 4,
          }}
        >
          {sub}
        </div>
      )}
      <style jsx>{`
        :global(.inside-stat-tile--desktop) {
          display: none;
        }
        @media (min-width: 1024px) {
          :global(.inside-stat-tile--desktop) {
            display: block;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Single zero-padded Card with 4 (desktop) / 3 (mobile) stat tiles, divided
 * by hairlines. Holdings / AUM / MER show on every screen; Inception only
 * on desktop.
 *
 * MER value cites the effective post-Nov-2025 rate; the tooltip carries the
 * full MER_FOOTNOTE so curious readers can see the methodology.
 */
function fmtPctMer(decimal: number | null): string {
  // Yahoo reports the annual report expense ratio as a decimal (0.0024).
  // Snapshot stores it as a percent (0.2 for 0.20%). When live data is
  // missing we surface the snapshot's "~0.20%" effective rate.
  if (decimal === null || !Number.isFinite(decimal)) return "~0.20%";
  return `${(decimal * 100).toFixed(2)}%`;
}

function srcSub(
  source: "yahoo-finance" | "cache" | "snapshot",
  snapshotAsOf: string,
  liveLabel: string
): string {
  if (source === "yahoo-finance") return liveLabel;
  if (source === "cache") return `${liveLabel} (cached)`;
  // snapshot fallback shows the verification date so readers know how
  // recent the underlying number is.
  return `as of ${snapshotAsOf}`;
}

export default function InsideStats() {
  const { data, loading } = useFundInfo("VEQT.TO");

  // Holdings: Yahoo doesn't expose a count for ETFs, so this stays
  // snapshot-sourced — but at least the value flows through the same
  // pipeline and shows the "as of" date.
  const holdingsValue = data?.holdingCount.toLocaleString("en-CA") ?? "13,726";
  const holdingsSub = data
    ? srcSub(data.sources.holdingCount, data.snapshotAsOf, "across 4 ETFs")
    : "across 4 ETFs";

  // AUM: prefer Yahoo's netAssets when available; the route formats it for us.
  const aumValue = data?.aumDisplay ?? "$13.4B";
  const aumSub = data
    ? srcSub(data.sources.netAssets, data.snapshotAsOf, "Vanguard Canada")
    : "Vanguard Canada";

  // MER: Yahoo's annualReportExpenseRatio is the official MER (0.24% for
  // VEQT right now). The "effective" rate after Vanguard's November 2025
  // fee cut is closer to 0.20%; we show whichever the upstream provides.
  const merValue = data && data.expenseRatio !== null
    ? fmtPctMer(data.expenseRatio)
    : "~0.20%";
  const merSub = data
    ? srcSub(data.sources.expenseRatio, data.snapshotAsOf, "effective rate")
    : "reduced Nov 2025";

  return (
    <Card padding={0}>
      <div style={{ display: "flex" }} aria-busy={loading}>
        <StatTile label="Holdings" value={holdingsValue} sub={holdingsSub} />
        <StatTile label="AUM" value={aumValue} sub={aumSub} />
        <StatTile
          label="MER"
          value={merValue}
          sub={merSub}
          title="Vanguard reduced VEQT's management fee from 0.22% to 0.17% in November 2025. The official MER (which includes operating expenses and taxes) is still reported as 0.24% pending fiscal year-end recalculation."
          noDivider={false}
        />
        <StatTile
          label="Inception"
          value="Jan 29, 2019"
          sub="7+ years"
          desktopOnly
          noDivider
        />
      </div>
    </Card>
  );
}
