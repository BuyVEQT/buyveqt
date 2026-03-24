import { SYMBOLS, type SymbolConfig, type FetchSource } from './symbols';
import {
  getQuoteAV,
  getDailyHistoryAV,
  getMonthlyHistoryAV,
} from './alpha-vantage';
import { getQuoteYahoo, getHistoryYahoo } from './yahoo-fallback';
import { readCache, writeCache, getCacheKey } from './cache';
import { logDataFetch } from './logger';
import { shouldUseAlphaVantage } from './market-hours';
import type { QuoteData, HistoricalData } from './types';

// ─── Quote fetching ───────────────────────────────────────────

async function fetchQuoteFromSource(
  source: FetchSource,
  config: SymbolConfig
): Promise<QuoteData | null> {
  const start = Date.now();

  if (source === 'alpha-vantage') {
    // Skip AV outside market hours to conserve 25/day budget
    if (!shouldUseAlphaVantage()) {
      logDataFetch('alpha-vantage', config.displayName, false, 0, 'skipped — market closed');
      return null;
    }
    try {
      const data = await getQuoteAV(config.alphaVantage);
      logDataFetch('alpha-vantage', config.displayName, true, Date.now() - start);
      return data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message) : 'unknown error';
      logDataFetch('alpha-vantage', config.displayName, false, Date.now() - start, msg);
      return null;
    }
  }

  if (source === 'yahoo') {
    const data = await getQuoteYahoo(config.yahoo, config.displayName);
    logDataFetch(
      'yahoo',
      config.displayName,
      data !== null,
      Date.now() - start,
      data ? undefined : 'returned null'
    );
    return data;
  }

  return null;
}

export async function getQuote(symbol: string): Promise<QuoteData> {
  const config = SYMBOLS[symbol.toUpperCase()];
  if (!config) throw new Error(`Unknown symbol: ${symbol}`);

  const cacheKey = getCacheKey('quote', config.displayName);
  const [primarySource, secondarySource] = config.priority;

  // 1. Try primary source (Yahoo)
  const primaryResult = await fetchQuoteFromSource(primarySource, config);
  if (primaryResult) {
    await writeCache(cacheKey, primaryResult);
    return primaryResult;
  }

  // 2. Try secondary source (AV — only during market hours)
  const secondaryResult = await fetchQuoteFromSource(secondarySource, config);
  if (secondaryResult) {
    await writeCache(cacheKey, secondaryResult);
    return secondaryResult;
  }

  // 3. Try local cache (last known good data)
  const cached = await readCache<QuoteData>(cacheKey);
  if (cached) {
    console.log(
      `[MarketData] Serving cached quote for ${symbol} (fetched at ${cached.fetchedAt})`
    );
    return { ...cached, source: 'cache' };
  }

  // 4. Nothing available
  throw new Error(`All data sources unavailable for ${symbol}`);
}

// ─── Daily history fetching ───────────────────────────────────

async function fetchDailyHistoryFromSource(
  source: FetchSource,
  config: SymbolConfig,
  outputsize: 'compact' | 'full'
): Promise<HistoricalData | null> {
  const start = Date.now();

  if (source === 'alpha-vantage') {
    if (!shouldUseAlphaVantage()) {
      logDataFetch('alpha-vantage', config.displayName, false, 0, 'skipped — market closed');
      return null;
    }
    try {
      const data = await getDailyHistoryAV(config.alphaVantage, outputsize);
      logDataFetch('alpha-vantage', config.displayName, true, Date.now() - start);
      return data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message) : 'unknown error';
      logDataFetch('alpha-vantage', config.displayName, false, Date.now() - start, msg);
      return null;
    }
  }

  if (source === 'yahoo') {
    const period1 = new Date();
    if (outputsize === 'full') {
      period1.setFullYear(period1.getFullYear() - 20);
    } else {
      period1.setDate(period1.getDate() - 120);
    }
    const data = await getHistoryYahoo(config.yahoo, config.displayName, {
      period1,
      interval: '1d',
    });
    logDataFetch('yahoo', config.displayName, data !== null, Date.now() - start);
    return data;
  }

  return null;
}

export async function getDailyHistory(
  symbol: string,
  outputsize: 'compact' | 'full' = 'compact'
): Promise<HistoricalData> {
  const config = SYMBOLS[symbol.toUpperCase()];
  if (!config) throw new Error(`Unknown symbol: ${symbol}`);

  const cacheKey = getCacheKey('history-daily', config.displayName, outputsize);
  const [primarySource, secondarySource] = config.priority;

  const primaryResult = await fetchDailyHistoryFromSource(
    primarySource,
    config,
    outputsize
  );
  if (primaryResult) {
    await writeCache(cacheKey, primaryResult);
    return primaryResult;
  }

  const secondaryResult = await fetchDailyHistoryFromSource(
    secondarySource,
    config,
    outputsize
  );
  if (secondaryResult) {
    await writeCache(cacheKey, secondaryResult);
    return secondaryResult;
  }

  const cached = await readCache<HistoricalData>(cacheKey);
  if (cached) {
    console.log(`[MarketData] Serving cached daily history for ${symbol}`);
    return { ...cached, source: 'cache' };
  }

  throw new Error(`All data sources unavailable for ${symbol} daily history`);
}

// ─── Monthly history fetching ─────────────────────────────────

async function fetchMonthlyHistoryFromSource(
  source: FetchSource,
  config: SymbolConfig
): Promise<HistoricalData | null> {
  const start = Date.now();

  if (source === 'alpha-vantage') {
    if (!shouldUseAlphaVantage()) {
      logDataFetch('alpha-vantage', config.displayName, false, 0, 'skipped — market closed');
      return null;
    }
    try {
      const data = await getMonthlyHistoryAV(config.alphaVantage);
      logDataFetch('alpha-vantage', config.displayName, true, Date.now() - start);
      return data;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : typeof error === 'object' && error !== null && 'message' in error ? String((error as { message: unknown }).message) : 'unknown error';
      logDataFetch('alpha-vantage', config.displayName, false, Date.now() - start, msg);
      return null;
    }
  }

  if (source === 'yahoo') {
    const period1 = new Date();
    period1.setFullYear(period1.getFullYear() - 20);
    const data = await getHistoryYahoo(config.yahoo, config.displayName, {
      period1,
      interval: '1mo',
    });
    logDataFetch('yahoo', config.displayName, data !== null, Date.now() - start);
    return data;
  }

  return null;
}

export async function getMonthlyHistory(
  symbol: string
): Promise<HistoricalData> {
  const config = SYMBOLS[symbol.toUpperCase()];
  if (!config) throw new Error(`Unknown symbol: ${symbol}`);

  const cacheKey = getCacheKey('history-monthly', config.displayName);
  const [primarySource, secondarySource] = config.priority;

  const primaryResult = await fetchMonthlyHistoryFromSource(
    primarySource,
    config
  );
  if (primaryResult) {
    await writeCache(cacheKey, primaryResult);
    return primaryResult;
  }

  const secondaryResult = await fetchMonthlyHistoryFromSource(
    secondarySource,
    config
  );
  if (secondaryResult) {
    await writeCache(cacheKey, secondaryResult);
    return secondaryResult;
  }

  const cached = await readCache<HistoricalData>(cacheKey);
  if (cached) {
    console.log(`[MarketData] Serving cached monthly history for ${symbol}`);
    return { ...cached, source: 'cache' };
  }

  throw new Error(
    `All data sources unavailable for ${symbol} monthly history`
  );
}

// ─── Compare page helper ─────────────────────────────────────

export async function getCompareData(symbols: string[]): Promise<{
  quotes: Record<string, QuoteData | null>;
  history: Record<string, HistoricalData | null>;
}> {
  const results = await Promise.allSettled(
    symbols.map(async (sym) => ({
      symbol: sym,
      quote: await getQuote(sym).catch(() => null),
      history: await getMonthlyHistory(sym).catch(() => null),
    }))
  );

  const quotes: Record<string, QuoteData | null> = {};
  const history: Record<string, HistoricalData | null> = {};

  for (const result of results) {
    if (result.status === 'fulfilled') {
      quotes[result.value.symbol] = result.value.quote;
      history[result.value.symbol] = result.value.history;
    }
  }

  return { quotes, history };
}

// ─── Convenience aliases ──────────────────────────────────────

export const getVEQTQuote = () => getQuote('VEQT');
export const getVEQTHistory = (outputsize?: 'compact' | 'full') =>
  getDailyHistory('VEQT', outputsize);
export const getVEQTMonthlyHistory = () => getMonthlyHistory('VEQT');
