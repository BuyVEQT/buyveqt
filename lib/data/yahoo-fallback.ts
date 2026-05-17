import YahooFinance from 'yahoo-finance2';
import type { QuoteData, HistoricalData } from './types';

const yf = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey'] });

const QUOTE_TIMEOUT_MS = 8000;
const HISTORY_TIMEOUT_MS = 10000;
const SUMMARY_TIMEOUT_MS = 10000;

/**
 * Race a promise against a timeout. The timeout rejects with a descriptive
 * error and clearTimeout is always called regardless of outcome.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

/**
 * Fetch current quote from Yahoo Finance.
 * Returns null on any failure — caller handles fallback.
 */
export async function getQuoteYahoo(
  yahooSymbol: string,
  displaySymbol: string
): Promise<QuoteData | null> {
  try {
    const result = await withTimeout(
      yf.quote(yahooSymbol),
      QUOTE_TIMEOUT_MS,
      `Yahoo quote for ${yahooSymbol}`
    );

    if (!result || !result.regularMarketPrice) return null;

    return {
      symbol: displaySymbol,
      price: result.regularMarketPrice,
      change: result.regularMarketChange ?? 0,
      changePercent: result.regularMarketChangePercent ?? 0,
      volume: result.regularMarketVolume ?? 0,
      latestTradingDay: result.regularMarketTime
        ? new Date(result.regularMarketTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      fiftyTwoWeekHigh: result.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: result.fiftyTwoWeekLow ?? 0,
      dividendYield: (result.trailingAnnualDividendYield ?? 0) * 100,
      source: 'yahoo-finance',
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`[Yahoo] Quote failed for ${yahooSymbol}:`, error);
    return null;
  }
}

/**
 * Fetch historical data from Yahoo Finance.
 * Returns null on any failure.
 */
export async function getHistoryYahoo(
  yahooSymbol: string,
  displaySymbol: string,
  options?: {
    period1?: Date | string;
    period2?: Date | string;
    interval?: '1d' | '1wk' | '1mo';
  }
): Promise<HistoricalData | null> {
  try {
    const now = new Date();
    const defaultStart = new Date(now);
    defaultStart.setDate(defaultStart.getDate() - 120); // ~100 trading days

    // IMPORTANT: End at yesterday, not today. Yahoo often returns today's
    // row with close: null / adjclose: null before the data is finalized
    // (especially right after market close). The yahoo-finance2 library
    // throws on null close values, killing the entire request.
    // Yesterday's data is always complete and reliable.
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const endDate = options?.period2 ?? yesterday;

    const result = await withTimeout(
      yf.historical(yahooSymbol, {
        period1: options?.period1 ?? defaultStart,
        period2: endDate,
        interval: options?.interval ?? '1d',
      }),
      HISTORY_TIMEOUT_MS,
      `Yahoo history for ${yahooSymbol}`
    );

    if (!result || result.length === 0) return null;

    // Filter out any rows with null close as an extra safety net
    const cleanRows = result.filter(
      (row: { close: number | null }) => row.close != null && row.close > 0
    );

    if (cleanRows.length === 0) return null;

    return {
      symbol: displaySymbol,
      data: cleanRows.map((row: { date: Date; open: number; high: number; low: number; close: number; adjClose?: number; volume: number }) => ({
        date: new Date(row.date).toISOString().split('T')[0],
        open: row.open ?? 0,
        high: row.high ?? 0,
        low: row.low ?? 0,
        close: row.close ?? 0,
        adjustedClose: row.adjClose ?? row.close ?? 0,
        volume: row.volume ?? 0,
        dividendAmount: 0,
      })),
      source: 'yahoo-finance',
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`[Yahoo] History failed for ${yahooSymbol}:`, error);
    return null;
  }
}

// ─── Fund sector composition ──────────────────────────────────

/**
 * Sector weight payload from Yahoo's `topHoldings.sectorWeightings`.
 * Yahoo returns this as an array of single-key objects keyed by a
 * Morningstar-style sector slug (e.g. `realestate`, `consumer_cyclical`).
 * We normalize to a flat map of canonical display names → fractional
 * weights (0..1).
 */
const YAHOO_SECTOR_DISPLAY: Record<string, string> = {
  realestate: 'Real Estate',
  consumer_cyclical: 'Consumer Discretionary',
  basic_materials: 'Materials',
  consumer_defensive: 'Consumer Staples',
  technology: 'Technology',
  communication_services: 'Communication Services',
  financial_services: 'Financials',
  utilities: 'Utilities',
  industrials: 'Industrials',
  energy: 'Energy',
  healthcare: 'Health Care',
};

export interface SectorWeights {
  /** Display name → fractional weight (0..1). */
  weights: Record<string, number>;
  source: 'yahoo-finance';
  fetchedAt: string;
}

/**
 * Fetch sector weights for an ETF via Yahoo's quoteSummary. Returns null
 * on any failure — caller decides whether to fall back to US-equivalent
 * tickers or hardcoded data.
 */
export async function getSectorWeightsYahoo(
  yahooSymbol: string
): Promise<SectorWeights | null> {
  try {
    const result = await withTimeout(
      yf.quoteSummary(yahooSymbol, { modules: ['topHoldings'] }),
      SUMMARY_TIMEOUT_MS,
      `Yahoo quoteSummary for ${yahooSymbol}`
    );

    const raw = result?.topHoldings?.sectorWeightings;
    if (!raw || !Array.isArray(raw) || raw.length === 0) return null;

    const weights: Record<string, number> = {};
    for (const entry of raw) {
      // Each entry is a single-key object like { realestate: 0.05 }.
      const [key, value] = Object.entries(entry as Record<string, unknown>)[0] ?? [];
      if (typeof key !== 'string') continue;
      const numeric = typeof value === 'number' ? value : Number(value);
      if (!Number.isFinite(numeric) || numeric <= 0) continue;
      const display = YAHOO_SECTOR_DISPLAY[key] ?? key;
      weights[display] = (weights[display] ?? 0) + numeric;
    }

    if (Object.keys(weights).length === 0) return null;

    return {
      weights,
      source: 'yahoo-finance',
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(`[Yahoo] quoteSummary failed for ${yahooSymbol}:`, error);
    return null;
  }
}
