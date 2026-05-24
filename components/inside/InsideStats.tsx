"use client";

import type { CSSProperties, ReactNode } from "react";
import Card from "@/components/ui/Card";

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
export default function InsideStats() {
  return (
    <Card padding={0}>
      <div style={{ display: "flex" }}>
        <StatTile label="Holdings" value="13,726" sub="across 4 ETFs" />
        <StatTile label="AUM" value="$13.4B" sub="Vanguard Canada" />
        <StatTile
          label="MER (effective)"
          value="~0.20%"
          sub="reduced Nov 2025"
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
