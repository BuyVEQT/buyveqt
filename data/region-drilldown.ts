/**
 * Reference sector / country breakdowns per VEQT sleeve.
 *
 * Weights are taken from each underlying fund's most recent fact sheet
 * (Vanguard Canada quarterly snapshots). The per-row daily % values are
 * representative figures from the round-2 design comp — the live
 * sector / country attribution feed isn't shipped yet, so RegionDrilldown
 * surfaces these as illustrative reference data alongside the live
 * region-level totals from /api/regions.
 */

export interface DrillRow {
  name: string;
  weight: number; // % of the sleeve
  pct: number; // representative daily return %
}

export interface RegionDrillReference {
  /** Matches Region.ticker from useRegions, e.g. "VUN" (without .TO). */
  ticker: string;
  /** Anchor id slug, e.g. "vun" for #regions-vun. */
  slug: string;
  /** Title for the drill section ("Sector returns" / "Country returns"). */
  drillLabel: string;
  /** Right-aligned annotation in the drill header. */
  drillNote: string;
  /** Eight rows. */
  rows: DrillRow[];
}

export const REGION_DRILL: RegionDrillReference[] = [
  {
    ticker: "VUN",
    slug: "vun",
    drillLabel: "Sector returns",
    drillNote: "~3,800 holdings",
    rows: [
      { name: "Tech", weight: 31, pct: -1.72 },
      { name: "Comm. Svc.", weight: 9, pct: -1.1 },
      { name: "Cons. Disc.", weight: 11, pct: -0.92 },
      { name: "Industrials", weight: 9, pct: -0.41 },
      { name: "Financials", weight: 13, pct: -0.18 },
      { name: "Health", weight: 11, pct: 0.48 },
      { name: "Energy", weight: 4, pct: 0.86 },
      { name: "Real Estate", weight: 3, pct: 0.12 },
    ],
  },
  {
    ticker: "VCN",
    slug: "vcn",
    drillLabel: "Sector returns",
    drillNote: "~180 holdings",
    rows: [
      { name: "Energy", weight: 17, pct: 1.34 },
      { name: "Materials", weight: 11, pct: 0.94 },
      { name: "Financials", weight: 35, pct: 0.18 },
      { name: "Industrials", weight: 13, pct: 0.06 },
      { name: "Tech", weight: 8, pct: -0.22 },
      { name: "Cons. Staples", weight: 4, pct: -0.1 },
      { name: "Telecom", weight: 4, pct: -0.41 },
      { name: "Utilities", weight: 4, pct: -0.62 },
    ],
  },
  {
    ticker: "VIU",
    slug: "viu",
    drillLabel: "Country returns",
    drillNote: "~3,800 holdings",
    rows: [
      { name: "Netherlands", weight: 4, pct: 1.51 },
      { name: "Germany", weight: 7, pct: 1.03 },
      { name: "Switzerland", weight: 8, pct: 0.66 },
      { name: "France", weight: 10, pct: 0.4 },
      { name: "Japan", weight: 21, pct: 0.29 },
      { name: "U.K.", weight: 14, pct: 0.31 },
      { name: "Australia", weight: 7, pct: -0.34 },
      { name: "Hong Kong", weight: 2, pct: 0.43 },
    ],
  },
  {
    ticker: "VEE",
    slug: "vee",
    drillLabel: "Country returns",
    drillNote: "~5,400 holdings",
    rows: [
      { name: "Taiwan", weight: 22, pct: 2.41 },
      { name: "China", weight: 24, pct: 1.62 },
      { name: "India", weight: 17, pct: 0.94 },
      { name: "S. Korea", weight: 11, pct: 1.22 },
      { name: "Brazil", weight: 5, pct: -0.37 },
      { name: "S. Africa", weight: 3, pct: 1.26 },
      { name: "Mexico", weight: 2, pct: 1.11 },
      { name: "Saudi", weight: 4, pct: 0.55 },
    ],
  },
];

export function getDrillForTicker(ticker: string): RegionDrillReference | null {
  return REGION_DRILL.find((r) => r.ticker === ticker) ?? null;
}
