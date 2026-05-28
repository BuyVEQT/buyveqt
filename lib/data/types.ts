export type DataSource = 'alpha-vantage' | 'yahoo-finance' | 'cache';

export interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  /** Yesterday's close. Used by the hero "vs $X.XX prev" caption. */
  previousClose: number;
  /** Intraday session high — 0 when the upstream didn't expose it (AV
   *  outside North-American hours, or stale-cache replays). */
  dayHigh: number;
  /** Intraday session low — same nullability semantics as dayHigh. */
  dayLow: number;
  volume: number;
  /** Market cap (Yahoo only — AV's GLOBAL_QUOTE doesn't expose it). */
  marketCap: number;
  latestTradingDay: string;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  dividendYield: number;
  source: DataSource;
  fetchedAt: string; // ISO timestamp of when this data was fetched
}

export interface RawHistoricalBar {
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
  data: RawHistoricalBar[];
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
