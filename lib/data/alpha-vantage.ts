import type { QuoteData, HistoricalData, DataError } from './types';

const AV_BASE_URL = 'https://www.alphavantage.co/query';
const FETCH_TIMEOUT_MS = 8000;

async function fetchAlphaVantage<T>(params: Record<string, string>): Promise<T> {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    throw {
      type: 'unknown',
      message: 'Alpha Vantage API key not configured',
      source: 'alpha-vantage',
    } satisfies DataError;
  }

  const url = new URL(AV_BASE_URL);
  Object.entries({ ...params, apikey: apiKey }).forEach(([k, v]) =>
    url.searchParams.set(k, v)
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url.toString(), { signal: controller.signal });
    const json = await response.json();

    // Alpha Vantage returns 200 even on errors — check for error keys in the body
    if (json['Note'] || json['Information']) {
      throw {
        type: 'rate-limit',
        message: json['Note'] || json['Information'],
        source: 'alpha-vantage',
      } satisfies DataError;
    }
    if (json['Error Message']) {
      throw {
        type: 'invalid-symbol',
        message: json['Error Message'],
        source: 'alpha-vantage',
      } satisfies DataError;
    }

    return json as T;
  } catch (error: unknown) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw {
        type: 'timeout',
        message: 'Alpha Vantage request timed out',
        source: 'alpha-vantage',
      } satisfies DataError;
    }
    if (typeof error === 'object' && error !== null && 'type' in error) {
      throw error; // re-throw our typed errors
    }
    const msg =
      error instanceof Error ? error.message : 'Network error';
    throw {
      type: 'network',
      message: msg,
      source: 'alpha-vantage',
    } satisfies DataError;
  } finally {
    clearTimeout(timeout);
  }
}

// ─── Quote ────────────────────────────────────────────────────

interface AVGlobalQuote {
  'Global Quote': Record<string, string>;
}

export async function getQuoteAV(avSymbol: string): Promise<QuoteData> {
  const json = await fetchAlphaVantage<AVGlobalQuote>({
    function: 'GLOBAL_QUOTE',
    symbol: avSymbol,
  });

  const q = json['Global Quote'];
  if (!q || !q['05. price']) {
    throw {
      type: 'unknown',
      message: 'Empty Global Quote response',
      source: 'alpha-vantage',
    } satisfies DataError;
  }

  // Derive display symbol: VEQT.TRT → VEQT
  const displaySymbol = avSymbol.replace(/\.TRT$/, '');

  return {
    symbol: displaySymbol,
    price: parseFloat(q['05. price']),
    change: parseFloat(q['09. change']),
    changePercent: parseFloat((q['10. change percent'] || '0').replace('%', '')),
    volume: parseInt(q['06. volume'], 10),
    latestTradingDay: q['07. latest trading day'],
    source: 'alpha-vantage',
    fetchedAt: new Date().toISOString(),
  };
}

// ─── Daily History ────────────────────────────────────────────

interface AVTimeSeriesDaily {
  'Time Series (Daily)': Record<string, Record<string, string>>;
}

export async function getDailyHistoryAV(
  avSymbol: string,
  outputsize: 'compact' | 'full' = 'compact'
): Promise<HistoricalData> {
  const json = await fetchAlphaVantage<AVTimeSeriesDaily>({
    function: 'TIME_SERIES_DAILY_ADJUSTED',
    symbol: avSymbol,
    outputsize,
  });

  const timeSeries = json['Time Series (Daily)'];
  if (!timeSeries) {
    throw {
      type: 'unknown',
      message: 'Empty Time Series (Daily) response',
      source: 'alpha-vantage',
    } satisfies DataError;
  }

  const displaySymbol = avSymbol.replace(/\.TRT$/, '');

  const data = Object.entries(timeSeries)
    .map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      adjustedClose: parseFloat(values['5. adjusted close']),
      volume: parseInt(values['6. volume'], 10),
      dividendAmount: parseFloat(values['7. dividend amount']),
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // oldest first

  return {
    symbol: displaySymbol,
    data,
    source: 'alpha-vantage',
    fetchedAt: new Date().toISOString(),
  };
}

// ─── Monthly History ──────────────────────────────────────────

interface AVTimeSeriesMonthly {
  'Monthly Adjusted Time Series': Record<string, Record<string, string>>;
}

export async function getMonthlyHistoryAV(
  avSymbol: string
): Promise<HistoricalData> {
  const json = await fetchAlphaVantage<AVTimeSeriesMonthly>({
    function: 'TIME_SERIES_MONTHLY_ADJUSTED',
    symbol: avSymbol,
  });

  const timeSeries = json['Monthly Adjusted Time Series'];
  if (!timeSeries) {
    throw {
      type: 'unknown',
      message: 'Empty Monthly Adjusted Time Series response',
      source: 'alpha-vantage',
    } satisfies DataError;
  }

  const displaySymbol = avSymbol.replace(/\.TRT$/, '');

  const data = Object.entries(timeSeries)
    .map(([date, values]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      adjustedClose: parseFloat(values['5. adjusted close']),
      volume: parseInt(values['6. volume'], 10),
      dividendAmount: parseFloat(values['7. dividend amount']),
    }))
    .sort((a, b) => a.date.localeCompare(b.date)); // oldest first

  return {
    symbol: displaySymbol,
    data,
    source: 'alpha-vantage',
    fetchedAt: new Date().toISOString(),
  };
}
