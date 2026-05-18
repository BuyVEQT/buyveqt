"use client";

import { FUNDS } from "@/data/funds";
import Card from "@/components/ui/Card";
import SectionLabel from "@/components/ui/SectionLabel";

interface AllocationBarsProps {
  selected: string[];
}

/**
 * Round 4 D2 — region color ramp by ink density on cream, plus vermilion
 * for Canada and amber for International. Reads at a glance without
 * competing with the page palette. Bonds get a hatch overlay.
 */
const REGION_STYLE: Record<
  string,
  { fill: string; hatched?: boolean }
> = {
  "United States": { fill: "var(--ink)" },
  Canada: { fill: "var(--stamp)" },
  "International Developed": { fill: "var(--amber)" },
  "Emerging Markets": { fill: "var(--rule)" },
  Bonds: { fill: "var(--ink-mute)", hatched: true },
};

const HATCH =
  "repeating-linear-gradient(45deg, color-mix(in oklab, var(--paper) 45%, transparent) 0 1px, transparent 1px 4px)";

function styleFor(region: string) {
  return REGION_STYLE[region] ?? { fill: "var(--ink-mute)" };
}

/**
 * Geography card — Round 4 D2 version. One row per selected fund:
 * Fraunces name + provider caption | weight chips legend on the right.
 * Below: a stacked horizontal tilt bar (US/CA/Dev/EM/Bonds) with
 * inline weight labels inside large segments. Below the rows: a
 * paper-warm summary chip describing the biggest tilt difference
 * when exactly two funds are selected.
 */
export default function AllocationBars({ selected }: AllocationBarsProps) {
  // Compute the biggest single-region delta when 2 funds selected.
  let summaryLine = "";
  if (selected.length === 2) {
    const a = FUNDS[selected[0]];
    const b = FUNDS[selected[1]];
    if (a && b) {
      const aMap = new Map(a.geographyAllocation.map((g) => [g.region, g.weight]));
      const bMap = new Map(b.geographyAllocation.map((g) => [g.region, g.weight]));
      const regions = new Set([...aMap.keys(), ...bMap.keys()]);
      let biggestRegion = "";
      let biggestDelta = 0;
      for (const r of regions) {
        const d = (aMap.get(r) ?? 0) - (bMap.get(r) ?? 0);
        if (Math.abs(d) > Math.abs(biggestDelta)) {
          biggestDelta = d;
          biggestRegion = r;
        }
      }
      if (biggestRegion && Math.abs(biggestDelta) >= 1) {
        const leader = biggestDelta > 0 ? a.shortName : b.shortName;
        summaryLine = `${leader} leans ${Math.abs(biggestDelta)} pp heavier on ${biggestRegion}.`;
      }
    }
  }

  return (
    <Card>
      <SectionLabel>The geography</SectionLabel>
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
        Where the dollars sit.
      </div>

      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 18,
        }}
      >
        {selected.map((ticker) => {
          const fund = FUNDS[ticker];
          if (!fund) return null;
          const isVeqt = ticker === "VEQT.TO";
          return (
            <li key={ticker}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 8,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <span
                    className="ed-display"
                    style={{
                      fontSize: 16,
                      color: isVeqt ? "var(--stamp)" : "var(--ink)",
                      letterSpacing: "-0.012em",
                    }}
                  >
                    {fund.shortName}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontStyle: "italic",
                      fontSize: 12.5,
                      color: "var(--ink-mute)",
                      marginLeft: 10,
                    }}
                  >
                    {fund.provider}
                  </span>
                </div>
                <span
                  className="ed-numerals"
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    color: "var(--ink-mute)",
                    letterSpacing: "0.04em",
                  }}
                >
                  {fund.equityAllocation}% equity
                  {fund.fixedIncomeAllocation > 0 && (
                    <> · {fund.fixedIncomeAllocation}% bonds</>
                  )}
                </span>
              </div>
              <div
                role="img"
                aria-label={`${fund.shortName} geography breakdown`}
                style={{
                  display: "flex",
                  height: 18,
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid var(--rule-soft)",
                }}
              >
                {fund.geographyAllocation.map((g) => {
                  const s = styleFor(g.region);
                  const showLabel = g.weight >= 10;
                  return (
                    <div
                      key={g.region}
                      title={`${g.region}: ${g.weight}%`}
                      style={{
                        width: `${g.weight}%`,
                        background: s.fill,
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {s.hatched && (
                        <span
                          aria-hidden
                          style={{
                            position: "absolute",
                            inset: 0,
                            backgroundImage: HATCH,
                          }}
                        />
                      )}
                      {showLabel && (
                        <span
                          className="ed-numerals"
                          style={{
                            position: "relative",
                            fontFamily: "var(--font-sans)",
                            fontSize: 10,
                            fontWeight: 700,
                            color: "var(--paper)",
                            letterSpacing: "0.04em",
                          }}
                        >
                          {g.weight}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      {summaryLine && (
        <div
          style={{
            marginTop: 22,
            padding: "12px 16px",
            background: "var(--paper-warm)",
            borderRadius: 10,
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13.5,
            color: "var(--ink-soft)",
            border: "1px solid var(--rule-soft)",
          }}
        >
          {summaryLine}
        </div>
      )}

      {/* Compact legend strip — keys to the bar segments above */}
      <div
        style={{
          marginTop: 18,
          paddingTop: 14,
          borderTop: "1px solid var(--rule-soft)",
          display: "flex",
          flexWrap: "wrap",
          gap: "8px 18px",
          fontFamily: "var(--font-sans)",
          fontSize: 11,
          color: "var(--ink-mute)",
        }}
      >
        {Object.entries(REGION_STYLE).map(([region, s]) => (
          <span
            key={region}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span
              aria-hidden
              style={{
                width: 10,
                height: 10,
                background: s.fill,
                borderRadius: 2,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {s.hatched && (
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: HATCH,
                  }}
                />
              )}
            </span>
            <span style={{ color: "var(--ink-soft)" }}>{region}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}
