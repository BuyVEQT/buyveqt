/**
 * Server-side JSON file cache for financial data.
 * Writes last-good API responses to data/cache/ so the site always
 * has real data even when Yahoo Finance is down.
 *
 * On Vercel, the filesystem is read-only at runtime, so writes are
 * best-effort — the committed cache files serve as the baseline.
 * Locally or in environments with write access, cache updates on
 * every successful fetch.
 */

import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "data", "cache");

function sanitizeKey(key: string): string {
  return key.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
}

export function readCache<T>(key: string): { data: T; timestamp: string } | null {
  try {
    const filePath = path.join(CACHE_DIR, `${sanitizeKey(key)}.json`);
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T): void {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
    const filePath = path.join(CACHE_DIR, `${sanitizeKey(key)}.json`);
    const entry = { data, timestamp: new Date().toISOString() };
    fs.writeFileSync(filePath, JSON.stringify(entry), "utf-8");
  } catch {
    // Read-only filesystem (Vercel) or other issue — silently ignore
  }
}
