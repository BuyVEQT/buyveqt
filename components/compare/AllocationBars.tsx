"use client";

import { FUNDS } from "@/data/funds";

interface AllocationBarsProps {
  selectedFunds: string[];
}

// Shared legend colors
const REGION_COLORS: Record<string, string> = {
  "United States": "#2563eb",
  Canada: "#dc2626",
  "International Developed": "#16a34a",
  "Emerging Markets": "#f59e0b",
  Bonds: "#6b7280",
};

export default function AllocationBars({ selectedFunds }: AllocationBarsProps) {
  // Collect all unique regions across selected funds
  const allRegions = new Set<string>();
  for (const t of selectedFunds) {
    FUNDS[t]?.geographyAllocation.forEach((g) => allRegions.add(g.region));
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-white p-4 sm:p-5">
      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] mb-4">
        Geographic Allocation Comparison
      </h2>

      <div className="space-y-4">
        {selectedFunds.map((ticker) => {
          const fund = FUNDS[ticker];
          if (!fund) return null;
          return (
            <div key={ticker}>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
                {fund.shortName}
              </p>
              <div className="flex rounded-full overflow-hidden h-5">
                {fund.geographyAllocation.map((g) => (
                  <div
                    key={g.region}
                    style={{
                      width: `${g.weight}%`,
                      backgroundColor: REGION_COLORS[g.region] || g.color,
                    }}
                    className="flex items-center justify-center first:rounded-l-full last:rounded-r-full"
                    title={`${g.region}: ${g.weight}%`}
                  >
                    {g.weight >= 10 && (
                      <span className="text-[10px] font-medium text-white">
                        {g.weight}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Shared legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-4 pt-3 border-t border-[var(--color-border)]">
        {Array.from(allRegions).map((region) => (
          <div key={region} className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: REGION_COLORS[region] || "#6b7280" }}
            />
            {region}
          </div>
        ))}
      </div>
    </div>
  );
}
