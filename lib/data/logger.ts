export function logDataFetch(
  source: string,
  symbol: string,
  success: boolean,
  durationMs: number,
  error?: string
) {
  const entry = {
    timestamp: new Date().toISOString(),
    source,
    symbol,
    success,
    durationMs: Math.round(durationMs),
    ...(error && { error }),
  };
  console.log('[MarketData]', JSON.stringify(entry));
}
