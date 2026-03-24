import YahooFinance from 'yahoo-finance2';
import type { QuoteData, HistoricalData } from './types';

const yf = new YahooFinance({ suppressNotices: ['ripHistorical', 'yahooSurvey'] });

/**
 * Fetch current quote from Yahoo Finance.
 * Returns null on any failure — caller handles fallback.
 */
export async function getQuoteYahoo(
  yahooSymbol: string,
  displaySymbol: string
): Promise<QuoteData | null> {
  try {
    const result = await yf.quote(yahooSymbol);

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

    const result = await yf.historical(yahooSymbol, {
      period1: options?.period1 ?? defaultStart,
      period2: endDate,
      interval: options?.interval ?? '1d',
    });

    if (!result || result.length === 0) return null;

    // Filter out any rows with null close as an extra safety net
    const cleanRows = result.filter(
      (row) => row.close != null && row.close > 0
    );

    if (cleanRows.length === 0) return null;

    return {
      symbol: displaySymbol,
      data: cleanRows.map((row) => ({
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
