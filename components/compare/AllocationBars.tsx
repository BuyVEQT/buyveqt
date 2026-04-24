"use client";

import { FUNDS } from "@/data/funds";

interface AllocationBarsProps {
  selectedFunds: string[];
}

/**
 * Region opacity ramp — instead of a competing colour palette, we encode
 * regions by ink density. The reader's eye learns the order in 2 seconds:
 *   U.S. — full ink
 *   Canada — vermilion (the stamp)
 *   International — softer ink
 *   Emerging — softer still
 *   Bonds — outlined, hatched
 * This keeps the page firmly inside the broadsheet palette while still
 * letting four-region differences read at a glance.
 */
const REGION_STYLE: Record<
  string,
  {
    fill: string;
    opacity: number;
    hatched?: boolean;
  }
> = {
  "United States": { fill: "var(--ink)", opacity: 1 },
  Canada: { fill: "var(--stamp)", opacity: 1 },
  "International Developed": { fill: "var(--ink)", opacity: 0.55 },
  "Emerging Markets": { fill: "var(--ink)", opacity: 0.3 },
  Bonds: { fill: "var(--ink)", opacity: 0.18, hatched: true },
};

const HATCH_PATTERN =
  "repeating-linear-gradient(45deg, color-mix(in oklab, var(--paper) 45%, transparent) 0 1px, transparent 1px 5px)";

export default function AllocationBars({ selectedFunds }: AllocationBarsProps) {
  const allRegions = new Set<string>();
  for (const t of selectedFunds) {
    FUNDS[t]?.geographyAllocation.forEach((g) => allRegions.add(g.region));
  }

  return (
    <section
      className="border-t-2 border-[var(--ink)] pt-5"
      aria-labelledby="alloc-heading"
    >
      <header className="mb-5">
        <p id="alloc-heading" className="bs-stamp mb-1">
          The Map
        </p>
        <h2
          className="bs-display text-[1.25rem] sm:text-[1.5rem] leading-tight"
          style={{ color: "var(--ink)" }}
        >
          <em className="bs-display-italic">Where each fund</em> places its bets
        </h2>
      </header>

      <ul className="space-y-5" role="list">
        {selectedFunds.map((ticker) => {
          const fund = FUNDS[ticker];
          if (!fund) return null;
          const isVeqt = ticker === "VEQT.TO";
          return (
            <li key={ticker}>
              <div className="flex items-baseline justify-between mb-2">
                <p
                  className="bs-display text-[15px]"
                  style={{
                    color: isVeqt ? "var(--stamp)" : "var(--ink)",
                  }}
                >
                  {fund.shortName}
                  <span
                    className="bs-caption italic font-normal ml-2"
                    style={{
                      color: "var(--ink-soft)",
                      fontSize: "12px",
                    }}
                  >
                    {fund.provider}
                  </span>
                </p>
                <p
                  className="bs-caption italic text-[11px]"
                  style={{ color: "var(--ink-soft)" }}
                >
                  {fund.equityAllocation}% equity
                  {fund.fixedIncomeAllocation > 0 && (
                    <> · {fund.fixedIncomeAllocation}% bonds</>
                  )}
                </p>
              </div>

              <div
                className="flex h-7 sm:h-8 overflow-hidden"
                style={{ border: "1px solid var(--ink)" }}
                role="img"
                aria-label={`${fund.shortName} geography breakdown`}
              >
                {fund.geographyAllocation.map((g) => {
                  const style = REGION_STYLE[g.region] ?? {
                    fill: "var(--ink)",
                    opacity: 0.4,
                  };
                  const showLabel = g.weight >= 8;
                  return (
                    <div
                      key={g.region}
                      style={{
                        width: `${g.weight}%`,
                        backgroundColor: style.fill,
                        opacity: style.opacity,
                        position: "relative",
                      }}
                      className="flex items-center justify-center"
                      title={`${g.region}: ${g.weight}%`}
                    >
                      {style.hatched && (
                        <span
                          aria-hidden
                          className="absolute inset-0 pointer-events-none"
                          style={{ backgroundImage: HATCH_PATTERN }}
                        />
                      )}
                      {showLabel && (
                        <span
                          className="bs-numerals not-italic text-[10.5px] sm:text-[11px] tabular-nums relative z-[1]"
                          style={{
                            color:
                              style.opacity > 0.45
                                ? "var(--paper)"
                                : "var(--ink)",
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

      {/* Legend */}
      <div className="mt-5 pt-4 border-t border-[var(--color-border)] flex flex-wrap gap-x-5 gap-y-2">
        {Array.from(allRegions).map((region) => {
          const style = REGION_STYLE[region] ?? {
            fill: "var(--ink)",
            opacity: 0.4,
          };
          return (
            <span
              key={region}
              className="bs-caption italic flex items-center gap-2 text-[12px]"
              style={{ color: "var(--ink-soft)" }}
            >
              <span
                aria-hidden
                className="inline-block w-4 h-3 relative"
                style={{
                  backgroundColor: style.fill,
                  opacity: style.opacity,
                  border: "1px solid var(--ink)",
                }}
              >
                {style.hatched && (
                  <span
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: HATCH_PATTERN }}
                  />
                )}
              </span>
              <span className="not-italic" style={{ color: "var(--ink)" }}>
                {region}
              </span>
            </span>
          );
        })}
      </div>
    </section>
  );
}
