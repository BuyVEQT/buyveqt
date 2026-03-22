import { AssetAllocation, VeqtQuote } from "./types";

export const VEQT_TICKER = "VEQT.TO";

export const STATIC_DATA = {
  mer: 0.24,
  aum: "$11.2B",
} as const;

export const ASSET_ALLOCATION: AssetAllocation[] = [
  { name: "US", value: 40, color: "#3b82f6" },
  { name: "Canada", value: 30, color: "#22c55e" },
  { name: "International", value: 23, color: "#f59e0b" },
  { name: "Emerging Markets", value: 7, color: "#8b5cf6" },
];

export const FALLBACK_QUOTE: VeqtQuote = {
  price: 42.5,
  previousClose: 42.35,
  change: 0.15,
  changePercent: 0.35,
  dayHigh: 42.65,
  dayLow: 42.2,
  fiftyTwoWeekHigh: 45.12,
  fiftyTwoWeekLow: 36.88,
  dividendYield: 1.8,
  ytdReturn: null,
  volume: 250000,
  marketCap: 11200000000,
  currency: "CAD",
  exchange: "TSX",
  lastUpdated: new Date().toISOString(),
  isFallback: true,
};

export const CHART_PERIODS = [
  { key: "1M", label: "1M", months: 1 },
  { key: "3M", label: "3M", months: 3 },
  { key: "6M", label: "6M", months: 6 },
  { key: "YTD", label: "YTD", months: 0 },
  { key: "1Y", label: "1Y", months: 12 },
] as const;

export const DISCLAIMER =
  "This site is not affiliated with Vanguard Investments Canada Inc. Data provided for informational purposes only. Not financial advice. Past performance does not guarantee future results.";
