/**
 * Sleeve-level editorial metadata for /inside-veqt — the Observatory.
 *
 * Everything here is curated from Vanguard literature, on the same quarterly
 * cadence as data/funds.ts (see FUND_DATA_LAST_UPDATED there for the as-of
 * date). Live numbers (weights, moves, yields, top holdings) come from the
 * API layer; this file carries only the facts no feed provides.
 */

export interface SleeveMeta {
  ticker: string;
  /** Room label for the floor plan, e.g. "US TOTAL MARKET". */
  roomLabel: string;
  /** Short label for tight tracks, e.g. "US". */
  shortLabel: string;
  /** Rail label for the race, e.g. "US". */
  railLabel: string;
  /**
   * Approximate company count, from the sleeve's own Vanguard factsheet.
   * Approximate on purpose: the four sleeves' counts are published on
   * different dates than VEQT's own 13,726, so they can never be made to
   * sum exactly. Rendered with a ≈ prefix.
   */
  approxCompanies: number;
  /**
   * The drift tick this sleeve is measured against, in percent.
   *
   * VCN is the only sleeve with a REAL target: Vanguard's asset-allocation
   * ETFs pin Canadian equity at 30% by design and let the other three float
   * at market cap inside the remaining 70%. So VCN's tick is the 30 pin,
   * and the others' ticks are their last factsheet weights — "drift" for
   * them means "moved since Vanguard last published", not "off design".
   */
  targetWeight: number;
  /** True only for VCN — the tick is a design pin, not a factsheet echo. */
  isPinned: boolean;
  /**
   * Ticker whose holdings/sector data stands in for this sleeve.
   *
   * VCN and VIU hold stocks directly, so Yahoo reports their real books.
   * VUN and VEE are wrappers around a US-listed engine (VTI / VWO) and
   * Yahoo reports only that wrapper at 100% — so the look-through ticker
   * is queried instead, and the UI labels the provenance.
   */
  lookthrough: { symbol: string; note: string | null };
}

/** Ordered by weight, heaviest first — the floor plan's room order. */
export const SLEEVES: SleeveMeta[] = [
  {
    ticker: "VUN",
    roomLabel: "US TOTAL MARKET",
    shortLabel: "US",
    railLabel: "US",
    approxCompanies: 3600,
    targetWeight: 44.5,
    isPinned: false,
    lookthrough: { symbol: "VTI", note: "via VTI, its US-listed engine" },
  },
  {
    ticker: "VCN",
    roomLabel: "CANADA",
    shortLabel: "CANADA",
    railLabel: "CANADA",
    approxCompanies: 170,
    targetWeight: 30.0,
    isPinned: true,
    lookthrough: { symbol: "VCN.TO", note: null },
  },
  {
    ticker: "VIU",
    roomLabel: "DEVELOPED",
    shortLabel: "DEV",
    railLabel: "DEVELOPED",
    approxCompanies: 3950,
    targetWeight: 17.7,
    isPinned: false,
    lookthrough: { symbol: "VIU.TO", note: null },
  },
  {
    ticker: "VEE",
    roomLabel: "EM",
    shortLabel: "EM",
    railLabel: "EMERGING",
    approxCompanies: 5900,
    targetWeight: 7.2,
    isPinned: false,
    lookthrough: { symbol: "VWO", note: "via VWO, its US-listed engine" },
  },
];

export const SLEEVE_TICKERS = SLEEVES.map((s) => s.ticker);

export function getSleeveMeta(ticker: string): SleeveMeta | undefined {
  return SLEEVES.find((s) => s.ticker === ticker.toUpperCase());
}
