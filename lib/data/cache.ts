import fs from 'fs/promises';
import path from 'path';

// Use /tmp on Vercel (writable in serverless), local .cache dir in dev
const CACHE_DIR = process.env.VERCEL
  ? '/tmp/buyveqt-cache'
  : path.join(process.cwd(), '.cache');

/**
 * In-memory cache that survives within a single container's lifecycle.
 * On Vercel, warm containers reuse this between requests.
 * This is the FIRST fallback — faster than filesystem and always available
 * within a warm container.
 */
const memoryCache = new Map<string, { data: string; writtenAt: number }>();

/**
 * Generate a filesystem-safe cache key from the request parameters.
 * Examples: "quote-VEQT", "history-daily-VEQT-compact", "history-monthly-XEQT"
 */
function getCacheKey(type: string, symbol: string, ...extras: string[]): string {
  return [type, symbol, ...extras].filter(Boolean).join('-');
}

/**
 * Read cached data. Checks in-memory first, then filesystem.
 * Returns null if neither has data.
 */
async function readCache<T>(key: string): Promise<T | null> {
  // 1. Try in-memory cache first (always available in warm containers)
  const memEntry = memoryCache.get(key);
  if (memEntry) {
    try {
      return JSON.parse(memEntry.data) as T;
    } catch {
      // corrupted memory entry, continue to filesystem
    }
  }

  // 2. Try filesystem cache
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as T;

    // Backfill memory cache from filesystem
    memoryCache.set(key, { data: raw, writtenAt: Date.now() });

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Write data to BOTH in-memory and filesystem cache.
 * In-memory write always succeeds. Filesystem write silently fails if /tmp is unavailable.
 */
async function writeCache<T>(key: string, data: T): Promise<void> {
  const json = JSON.stringify(data);

  // Always write to memory (this never fails)
  memoryCache.set(key, { data: json, writtenAt: Date.now() });

  // Also write to filesystem (may fail on cold start race, that's OK)
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, `${key}.json`);
    await fs.writeFile(filePath, json, 'utf-8');
  } catch (error) {
    console.warn('[Cache] Filesystem write failed (memory cache still holds data):', error);
  }
}

export { getCacheKey, readCache, writeCache };
