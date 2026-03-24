import fs from 'fs/promises';
import path from 'path';

// Use /tmp on Vercel (writable in serverless), local .cache dir in dev
const CACHE_DIR = process.env.VERCEL
  ? '/tmp/buyveqt-cache'
  : path.join(process.cwd(), '.cache');

/**
 * Generate a filesystem-safe cache key from the request parameters.
 * Examples: "quote-VEQT", "history-daily-VEQT-compact", "history-monthly-XEQT"
 */
function getCacheKey(type: string, symbol: string, ...extras: string[]): string {
  return [type, symbol, ...extras].filter(Boolean).join('-');
}

/**
 * Read cached data. Returns null if cache doesn't exist or is unparseable.
 * Does NOT check freshness — that's the caller's decision.
 */
async function readCache<T>(key: string): Promise<T | null> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/**
 * Write data to cache. Silently fails — cache writes should never break the app.
 */
async function writeCache<T>(key: string, data: T): Promise<void> {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    await fs.writeFile(filePath, JSON.stringify(data), 'utf-8');
  } catch (error) {
    console.warn('[Cache] Write failed:', error);
  }
}

export { getCacheKey, readCache, writeCache };
