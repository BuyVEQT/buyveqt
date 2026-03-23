export interface Holding {
  name: string;
  ticker: string;
  weight: number;
  country: string;
}

export interface SectorAllocation {
  sector: string;
  weight: number;
}

export const VEQT_TOP_HOLDINGS: Holding[] = [
  { name: "Apple Inc.", ticker: "AAPL", weight: 4.2, country: "US" },
  { name: "Microsoft Corp.", ticker: "MSFT", weight: 3.8, country: "US" },
  { name: "NVIDIA Corp.", ticker: "NVDA", weight: 3.1, country: "US" },
  { name: "Amazon.com Inc.", ticker: "AMZN", weight: 2.3, country: "US" },
  { name: "Royal Bank of Canada", ticker: "RY", weight: 1.8, country: "Canada" },
  { name: "Toronto-Dominion Bank", ticker: "TD", weight: 1.4, country: "Canada" },
  { name: "Alphabet Inc.", ticker: "GOOGL", weight: 1.3, country: "US" },
  { name: "Meta Platforms Inc.", ticker: "META", weight: 1.2, country: "US" },
  { name: "Broadcom Inc.", ticker: "AVGO", weight: 1.1, country: "US" },
  { name: "Tesla Inc.", ticker: "TSLA", weight: 0.9, country: "US" },
  { name: "Shopify Inc.", ticker: "SHOP", weight: 0.9, country: "Canada" },
  { name: "Berkshire Hathaway", ticker: "BRK.B", weight: 0.8, country: "US" },
  { name: "JPMorgan Chase & Co.", ticker: "JPM", weight: 0.8, country: "US" },
  { name: "Enbridge Inc.", ticker: "ENB", weight: 0.7, country: "Canada" },
  { name: "Bank of Nova Scotia", ticker: "BNS", weight: 0.6, country: "Canada" },
];

export const VEQT_SECTOR_ALLOCATION: SectorAllocation[] = [
  { sector: "Technology", weight: 25 },
  { sector: "Financials", weight: 20 },
  { sector: "Healthcare", weight: 10 },
  { sector: "Consumer Discretionary", weight: 10 },
  { sector: "Industrials", weight: 10 },
  { sector: "Energy", weight: 6 },
  { sector: "Consumer Staples", weight: 5 },
  { sector: "Materials", weight: 4 },
  { sector: "Communications", weight: 4 },
  { sector: "Utilities", weight: 3 },
  { sector: "Real Estate", weight: 3 },
];

export const TOP_HOLDINGS_TOTAL_WEIGHT = VEQT_TOP_HOLDINGS.reduce(
  (sum, h) => sum + h.weight,
  0
);
