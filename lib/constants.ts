import type { VeqtQuote } from "./types";

// Sleeve weights from the April 30, 2026 Vanguard VEQT factsheet.
// `data/funds.ts` is the canonical source for /inside-veqt; this one is
// used by /api/regions which returns the live data.
export const UNDERLYING_ETFS = [
  { ticker: "VUN", name: "US Total Market", region: "US", weight: 44.5 },
  { ticker: "VCN", name: "Canada All Cap", region: "Canada", weight: 30.6 },
  { ticker: "VIU", name: "Developed ex-NA", region: "International", weight: 17.7 },
  { ticker: "VEE", name: "Emerging Markets", region: "Emerging Markets", weight: 7.2 },
];

/**
 * Last-resort fallback when ALL data sources AND cache fail.
 * Updated manually — this should reflect a reasonably recent price.
 * The timestamp is intentionally fixed (not new Date()) so the UI
 * honestly shows "data from Mar 24" rather than lying "updated just now."
 */
export const FALLBACK_QUOTE: VeqtQuote = {
  price: 53.19,
  previousClose: 53.25,
  change: -0.06,
  changePercent: -0.11,
  dayHigh: 53.45,
  dayLow: 52.95,
  fiftyTwoWeekHigh: 53.91,
  fiftyTwoWeekLow: 43.53,
  dividendYield: 1.8, // factsheet 2026-04-30: equity yield 1.8%
  ytdReturn: null,
  volume: 0,
  marketCap: 0,
  currency: "CAD",
  exchange: "TSX",
  lastUpdated: "2026-03-24T20:00:00.000Z", // Fixed date — never new Date()
  isFallback: true,
};
