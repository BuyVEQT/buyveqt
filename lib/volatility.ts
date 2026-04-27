import type {
  VolatilityHeatmapEntry,
  VolatilitySeverity,
} from "@/components/broadsheet/VolatilityHeatmap";

export interface ClassifiedReturn {
  date: string;
  pct: number;
  severity: VolatilitySeverity;
}

/**
 * Compute classified daily returns from a sorted-ascending close series.
 * Severity is sigma-banded (≤1σ typical, 1–2σ notable, 2–3σ unusual, >3σ rare)
 * against the full input window, so the same classification is consistent
 * whether you slice 30 days or 252 from the result.
 */
export function classifyReturns(
  historical: { date: string; close: number }[]
): { returns: ClassifiedReturn[]; sigma: number } {
  const raw: { date: string; pct: number }[] = [];
  for (let i = 1; i < historical.length; i += 1) {
    const prev = historical[i - 1].close;
    const curr = historical[i].close;
    if (prev > 0 && Number.isFinite(prev) && Number.isFinite(curr)) {
      raw.push({
        date: historical[i].date,
        pct: ((curr - prev) / prev) * 100,
      });
    }
  }
  if (raw.length === 0) return { returns: [], sigma: 0 };
  const mean = raw.reduce((s, r) => s + r.pct, 0) / raw.length;
  const variance =
    raw.reduce((s, r) => s + (r.pct - mean) ** 2, 0) / raw.length;
  const sigma = Math.sqrt(variance);

  const classified: ClassifiedReturn[] = raw.map((r) => {
    const z = sigma > 0 ? Math.abs(r.pct) / sigma : 0;
    const severity: VolatilitySeverity =
      z < 1 ? "typical" : z < 2 ? "notable" : z < 3 ? "unusual" : "rare";
    return { date: r.date, pct: r.pct, severity };
  });
  return { returns: classified, sigma };
}

export function toHeatmapHistory(
  classified: readonly ClassifiedReturn[]
): VolatilityHeatmapEntry[] {
  return classified.map((r) => ({
    date: r.date,
    pct: r.pct,
    severity: r.severity,
  }));
}
