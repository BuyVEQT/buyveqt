"use client";

import { FUNDS } from "@/data/funds";

interface AllocationBarsProps {
  selectedFunds: string[];
}

const REGION_COLORS: Record<string, string> = {
  "United States": "#2563eb",
  Canada: "#dc2626",
  "International Developed": "#16a34a",
  "Emerging Markets": "#f59e0b",
  Bonds: "#6b7280",
};

export default function AllocationBars({ selectedFunds }: AllocationBarsProps) {
  const allRegions = new Set<string>();
  for (const t of selectedFunds) {
    FUNDS[t]?.geographyAllocation.forEach((g) => allRegions.add(g.region));
  }

  return (
    <div className="card-editorial p-5 sm:p-6">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-5">
        Geographic Allocation Comparison
      </h2>

      <div className="space-y-5">
        {selectedFunds.map((ticker) => {
          const fund = FUNDS[ticker];
          if (!fund) return null;
          return (
            <div key={ticker}>
              <div className="flex items-baseline justify-between mb-2">
                <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                  {fund.shortName}
                </p>
                <p className="text-[10px] text-[var(--color-text-muted)]">
                  {fund.provider}
                </p>
              </div>
              <div className="flex rounded-lg overflow-hidden h-8">
                {fund.geographyAllocation.map((g) => (
                  <div
                    key={g.region}
                    style={{
                      width: `${g.weight}%`,
                      backgroundColor: REGION_COLORS[g.region] || g.color,
                    }}
                    className="flex items-center justify-center first:rounded-l-lg last:rounded-r-lg transition-all hover:brightness-110 cursor-default"
                    title={`${g.region}: ${g.weight}%`}
                  >
                    {g.weight >= 8 && (
                      <span className="text-[11px] font-semibold text-white drop-shadow-sm">
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
      <div className="flex flex-wrap gap-x-5 gap-y-2 mt-5 pt-4 border-t border-[var(--color-border)]">
        {Array.from(allRegions).map((region) => (
          <div key={region} className="flex items-center gap-2 text-xs text-[var(--color-text-muted)]">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: REGION_COLORS[region] || "#6b7280" }}
            />
            {region}
          </div>
        ))}
      </div>
    </div>
  );
}
