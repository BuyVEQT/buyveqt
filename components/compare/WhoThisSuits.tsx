"use client";

import { FUNDS } from "@/data/funds";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";

interface WhoThisSuitsProps {
  selected: string[];
}

/**
 * Suitability card — Round 4 D2 version. One numbered row per selected
 * fund: ordinal number (vermilion if VEQT, ink otherwise), Fraunces
 * ticker + name, Newsreader-italic issuer/holdings/distributions, body
 * paragraph from `fund.whoThisSuits`.
 */
export default function WhoThisSuits({ selected }: WhoThisSuitsProps) {
  return (
    <Card>
      <SectionLabel>The suitability</SectionLabel>
      <div
        className="ed-display-italic"
        style={{
          fontSize: "clamp(1.5rem, 2.5vw, 1.875rem)",
          lineHeight: 1.1,
          color: "var(--ink)",
          marginTop: 6,
          marginBottom: 22,
        }}
      >
        Who each fund is for.
      </div>

      <ol
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 0,
        }}
      >
        {selected.map((ticker, idx) => {
          const fund = FUNDS[ticker];
          if (!fund) return null;
          const isVeqt = ticker === "VEQT.TO";
          const ord = String(idx + 1).padStart(2, "0");
          return (
            <li
              key={ticker}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "18px 22px",
                padding: "20px 0",
                borderTop:
                  idx === 0 ? "1px solid var(--rule-soft)" : "1px solid var(--rule-soft)",
                alignItems: "start",
              }}
            >
              <span
                className="ed-display ed-numerals"
                style={{
                  fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                  lineHeight: 1,
                  paddingTop: 2,
                  color: isVeqt ? "var(--stamp)" : "var(--ink-mute)",
                  letterSpacing: "-0.02em",
                }}
              >
                {ord}
              </span>
              <div style={{ minWidth: 0 }}>
                <h3
                  className="ed-display"
                  style={{
                    fontSize: "clamp(1.25rem, 2vw, 1.5rem)",
                    lineHeight: 1.15,
                    color: isVeqt ? "var(--stamp)" : "var(--ink)",
                    letterSpacing: "-0.012em",
                    margin: 0,
                  }}
                >
                  {fund.shortName}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontStyle: "italic",
                    fontSize: 13,
                    color: "var(--ink-mute)",
                    margin: "4px 0 0",
                  }}
                >
                  {fund.provider}
                  <span style={{ opacity: 0.5, margin: "0 8px" }}>·</span>
                  {fund.numberOfHoldings.toLocaleString("en-CA")} holdings
                  <span style={{ opacity: 0.5, margin: "0 8px" }}>·</span>
                  {fund.distributionFrequency.toLowerCase()} distributions
                </p>
                <p
                  className="ed-body"
                  style={{
                    marginTop: 12,
                    fontSize: 14.5,
                    lineHeight: 1.6,
                    color: "var(--ink-soft)",
                    maxWidth: "60ch",
                  }}
                >
                  {fund.whoThisSuits}
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
