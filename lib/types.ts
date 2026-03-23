export interface VeqtQuote {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  dividendYield: number;
  ytdReturn: number | null;
  volume: number;
  marketCap: number;
  currency: string;
  exchange: string;
  lastUpdated: string;
  isFallback?: boolean;
}

export interface HistoricalDataPoint {
  date: string;
  close: number;
}

export interface VeqtApiResponse {
  quote: VeqtQuote;
  historical: HistoricalDataPoint[];
  isFallback: boolean;
}

export interface AssetAllocation {
  name: string;
  value: number;
  color: string;
}

export type ChartPeriod = "1M" | "3M" | "6M" | "YTD" | "1Y" | "3Y" | "5Y";
