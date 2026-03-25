export type DataSource = 'alpha-vantage' | 'yahoo-finance' | 'cache';

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  latestTradingDay: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  dividendYield: number;
  source: DataSource;
  fetchedAt: string; // ISO timestamp of when this data was fetched
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjustedClose: number;
  volume: number;
  dividendAmount: number;
}

export interface HistoricalData {
  symbol: string;
  data: HistoricalDataPoint[];
  source: DataSource;
  fetchedAt: string;
}

export interface DividendRecord {
  date: string;
  amount: number;
}

export interface DataError {
  type: 'rate-limit' | 'network' | 'timeout' | 'invalid-symbol' | 'unknown';
  message: string;
  source: string;
}
