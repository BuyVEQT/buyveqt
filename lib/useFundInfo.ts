"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { FundInfoResponse } from "@/app/api/fund-info/[ticker]/route";

interface UseFundInfoResult {
  data: FundInfoResponse | null;
  loading: boolean;
  error: string | null;
}

/** The route is ISR-cached at 24h, so anything younger than that would come
 *  back byte-identical. Re-mounts inside a session read memory instead. */
const FRESH_MS = 24 * 60 * 60 * 1000;

/* ── Module-level shared store, keyed by ticker ──────────────
 *
 * Same shape as useVeqtData / useRegions: one request per ticker no matter
 * how many components mount, an in-flight promise shared with latecomers,
 * and a memory hit for anything still fresh. No timer here — fund facts
 * don't move intraday and the route is a 24h ISR read.
 */

interface Snapshot {
  data: FundInfoResponse | null;
  loading: boolean;
  error: string | null;
}

/** Stable identity for "nothing fetched yet" — SSR, hydration, pre-subscribe. */
const EMPTY_SNAPSHOT: Snapshot = { data: null, loading: true, error: null };

interface Entry {
  snapshot: Snapshot;
  /** Epoch ms of the last SUCCESSFUL fetch. 0 = never succeeded. */
  fetchedAt: number;
  promise: Promise<void> | null;
  listeners: Set<() => void>;
}

const store = new Map<string, Entry>();

function getEntry(ticker: string): Entry {
  let entry = store.get(ticker);
  if (!entry) {
    entry = {
      snapshot: EMPTY_SNAPSHOT,
      fetchedAt: 0,
      promise: null,
      listeners: new Set(),
    };
    store.set(ticker, entry);
  }
  return entry;
}

function publish(entry: Entry, next: Snapshot): void {
  entry.snapshot = next;
  entry.listeners.forEach((listener) => listener());
}

function load(ticker: string): Promise<void> {
  const entry = getEntry(ticker);
  if (entry.promise) return entry.promise;

  if (!entry.snapshot.loading || entry.snapshot.error !== null) {
    publish(entry, { data: entry.snapshot.data, loading: true, error: null });
  }

  const run = (async () => {
    try {
      const res = await fetch(`/api/fund-info/${encodeURIComponent(ticker)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as FundInfoResponse;
      entry.fetchedAt = Date.now();
      publish(entry, { data: json, loading: false, error: null });
    } catch (err: unknown) {
      publish(entry, {
        data: entry.snapshot.data,
        loading: false,
        error: err instanceof Error ? err.message : "unknown",
      });
    } finally {
      entry.promise = null;
    }
  })();

  entry.promise = run;
  return run;
}

function ensureFresh(ticker: string, entry: Entry): void {
  if (entry.promise) return;
  if (entry.snapshot.data !== null && Date.now() - entry.fetchedAt < FRESH_MS) {
    return;
  }
  void load(ticker);
}

function subscribe(ticker: string, onStoreChange: () => void): () => void {
  const entry = getEntry(ticker);
  entry.listeners.add(onStoreChange);
  ensureFresh(ticker, entry);
  return () => {
    entry.listeners.delete(onStoreChange);
  };
}

function getSnapshot(ticker: string): Snapshot {
  return store.get(ticker)?.snapshot ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot(): Snapshot {
  return EMPTY_SNAPSHOT;
}

/**
 * Client hook for /api/fund-info/[ticker]. Returns the three-tier-resolved
 * AUM / MER / yield / sleeves / sectors, with a per-field `sources` map so
 * the UI can label data freshness ("via Yahoo" vs "as of <snapshot date>").
 *
 * The route is ISR-cached at 24h, so a hot path is just a Next-edge hit; the
 * underlying Yahoo + filesystem cache only fires once per revalidation
 * window per container.
 */
export function useFundInfo(ticker: string): UseFundInfoResult {
  const subscribeToTicker = useCallback(
    (onStoreChange: () => void) => subscribe(ticker, onStoreChange),
    [ticker]
  );
  const readSnapshot = useCallback(() => getSnapshot(ticker), [ticker]);

  const { data, loading, error } = useSyncExternalStore(
    subscribeToTicker,
    readSnapshot,
    getServerSnapshot
  );

  return { data, loading, error };
}
