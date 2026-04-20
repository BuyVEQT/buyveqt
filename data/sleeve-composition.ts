/**
 * Top-level composition for each of VEQT's four underlying sleeves.
 *
 * Source: Vanguard Canada fund pages (VCN, VUN, VIU, VEE), most recent
 * quarterly holdings. Weights drift between rebalances; sync manually
 * each quarter. Percentages don't sum to 100 — we surface the top five
 * and lump the rest into an implicit "Other" that's rendered as the
 * remainder bar.
 *
 * The UI shows these as weighted bars underneath each regional card,
 * giving the reader a one-glance sense of what the sleeve actually
 * owns without leaving the home page.
 */

export interface CompositionItem {
  name: string;
  weight: number;
}

export interface SleeveComposition {
  ticker: "VCN" | "VUN" | "VIU" | "VEE";
  /** What the breakdown represents — sectors for CA/US, countries for Intl/EM. */
  breakdownType: "sector" | "country";
  breakdownLabel: string;
  items: CompositionItem[];
  /** Implicit remainder for anything not in the top five. */
  other: number;
  source: string;
}

export const SLEEVE_COMPOSITIONS: Record<string, SleeveComposition> = {
  VCN: {
    ticker: "VCN",
    breakdownType: "sector",
    breakdownLabel: "Top sectors",
    items: [
      { name: "Financials", weight: 33 },
      { name: "Energy", weight: 16 },
      { name: "Industrials", weight: 13 },
      { name: "Materials", weight: 11 },
      { name: "Technology", weight: 9 },
    ],
    other: 18,
    source: "Vanguard VCN · quarterly filing",
  },
  VUN: {
    ticker: "VUN",
    breakdownType: "sector",
    breakdownLabel: "Top sectors",
    items: [
      { name: "Technology", weight: 31 },
      { name: "Financials", weight: 13 },
      { name: "Consumer Discretionary", weight: 11 },
      { name: "Health Care", weight: 11 },
      { name: "Industrials", weight: 9 },
    ],
    other: 25,
    source: "Vanguard VUN · quarterly filing",
  },
  VIU: {
    ticker: "VIU",
    breakdownType: "country",
    breakdownLabel: "Top countries",
    items: [
      { name: "Japan", weight: 22 },
      { name: "United Kingdom", weight: 13 },
      { name: "France", weight: 11 },
      { name: "Switzerland", weight: 10 },
      { name: "Germany", weight: 9 },
    ],
    other: 35,
    source: "Vanguard VIU · quarterly filing",
  },
  VEE: {
    ticker: "VEE",
    breakdownType: "country",
    breakdownLabel: "Top countries",
    items: [
      { name: "China", weight: 30 },
      { name: "India", weight: 20 },
      { name: "Taiwan", weight: 17 },
      { name: "South Korea", weight: 13 },
      { name: "Brazil", weight: 5 },
    ],
    other: 15,
    source: "Vanguard VEE · quarterly filing",
  },
};

export function getComposition(ticker: string): SleeveComposition | null {
  return SLEEVE_COMPOSITIONS[ticker] ?? null;
}
