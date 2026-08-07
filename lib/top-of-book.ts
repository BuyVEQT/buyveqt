import type { SleevesResponse } from "@/app/api/sleeves/route";

export interface BookEntry {
  /** Display symbol — Yahoo's, any .TO suffix stripped. May be "". */
  symbol: string;
  name: string;
  /** Percent of VEQT: live sleeve weight × the holding's share of its sleeve. */
  weight: number;
  /** Source sleeve ticker (VUN / VCN / VIU / VEE). */
  sleeve: string;
  isCanada: boolean;
}

/**
 * The top of VEQT's book, by look-through: each sleeve's reported top
 * holdings (percent of sleeve) scaled by the sleeve's live weight in VEQT.
 * The four sleeves are regionally disjoint (US / Canada / developed ex-NA /
 * emerging), so a plain merge-and-sort is exact for the head of the list;
 * anything below each sleeve's reported top ten is unknowable here, which
 * is fine for a top-N strip.
 *
 * Consumers: the Observatory's holdings marquee and ledger. Data arrives
 * through the shared useSleeves store (/api/sleeves), so the computation
 * costs no extra request.
 */
export function topOfBook(
  data: SleevesResponse | null,
  n: number
): BookEntry[] {
  if (!data) return [];
  const merged: BookEntry[] = [];
  for (const s of data.sleeves) {
    const sleeveWeight = s.liveWeight ?? s.targetWeight;
    for (const h of s.topHoldings) {
      if (!h.name && !h.symbol) continue;
      merged.push({
        symbol: (h.symbol || "").replace(/\.TO$/i, "").toUpperCase(),
        name: h.name || h.symbol,
        weight: +((sleeveWeight * h.weight) / 100).toFixed(2),
        sleeve: s.ticker,
        isCanada: s.ticker === "VCN",
      });
    }
  }
  return merged.sort((a, b) => b.weight - a.weight).slice(0, n);
}
