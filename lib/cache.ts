/** Lightweight localStorage cache for financial data fallback */

interface CachedEntry<T> {
  data: T;
  timestamp: number;
}

const PREFIX = "buyveqt:";

/**
 * Maximum age for cached data in milliseconds.
 * Data older than this is treated as expired and not returned.
 * 1 hour — long enough to survive brief API outages,
 * short enough that visitors never see seriously stale data.
 */
const MAX_CACHE_AGE_MS = 60 * 60 * 1000; // 1 hour

export function getCached<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const entry: CachedEntry<T> = JSON.parse(raw);

    // Reject stale data — better to show loading/error than 3-week-old prices
    if (Date.now() - entry.timestamp > MAX_CACHE_AGE_MS) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function setCache<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;
  try {
    const entry: CachedEntry<T> = { data, timestamp: Date.now() };
    localStorage.setItem(PREFIX + key, JSON.stringify(entry));
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}
