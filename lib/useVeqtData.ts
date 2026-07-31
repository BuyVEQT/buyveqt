"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import type { VeqtApiResponse, ChartPeriod } from "./types";
import { getCached, setCache } from "./cache";

/** Re-fetch interval: 5 minutes (matches server-side ISR revalidation) */
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

/* ── Module-level shared store ────────────────────────────────
 *
 * Every consumer of this hook used to own a private fetch + a private
 * setInterval. On the home route alone that meant HomeClient, the ticker
 * pill in DesktopNav and the ticker pill in TopBar all pulling the same
 * `/api/veqt?period=…` payload three times and running three timers.
 *
 * The store below collapses that to one request and one timer PER PERIOD
 * KEY, no matter how many components subscribe:
 *
 *   dedupe     a period with a request already in flight hands the same
 *              promise to every latecomer instead of firing a second one.
 *   freshness  data younger than REFETCH_INTERVAL_MS is served straight
 *              from memory — a component mounting 30s after the first
 *              fetch does zero network work.
 *   timers     one interval per period key, started when its first
 *              subscriber arrives and cleared when its last one leaves.
 *              Paused while the tab is hidden (mobile browsers keep firing
 *              setInterval on backgrounded tabs, wasting battery and
 *              cellular data) and resumed with a catch-up fetch.
 *
 * Unmount safety comes for free: fetches write to the store and notify
 * listeners, and an unmounted component has already removed its listener.
 * Nothing is aborted on unmount by design — the in-flight request is shared,
 * so aborting it for one subscriber would starve the others.
 */

interface Snapshot {
  data: VeqtApiResponse | null;
  loading: boolean;
}

/** Shared identity for "nothing fetched yet" so `useSyncExternalStore`
 *  sees a stable reference before the first subscribe, during SSR, and
 *  through hydration. */
const EMPTY_SNAPSHOT: Snapshot = { data: null, loading: true };

interface Entry {
  /** Stable object handed to React; replaced (never mutated) on change. */
  snapshot: Snapshot;
  /** Epoch ms of the last SUCCESSFUL fetch. 0 = never succeeded. */
  fetchedAt: number;
  /** In-flight request, for dedupe. Null when idle. */
  promise: Promise<void> | null;
  listeners: Set<() => void>;
  timer: ReturnType<typeof setInterval> | null;
}

const store = new Map<ChartPeriod, Entry>();
let visibilityBound = false;

function getEntry(period: ChartPeriod): Entry {
  let entry = store.get(period);
  if (!entry) {
    entry = {
      snapshot: EMPTY_SNAPSHOT,
      fetchedAt: 0,
      promise: null,
      listeners: new Set(),
      timer: null,
    };
    store.set(period, entry);
  }
  return entry;
}

function publish(entry: Entry, next: Snapshot): void {
  entry.snapshot = next;
  entry.listeners.forEach((listener) => listener());
}

function load(period: ChartPeriod, isRefresh: boolean): Promise<void> {
  const entry = getEntry(period);
  // Dedupe: whoever asked first owns the request; everyone else waits on it.
  if (entry.promise) return entry.promise;

  // Only show the loading state on an initial load, not background refreshes
  if (!isRefresh && !entry.snapshot.loading) {
    publish(entry, { data: entry.snapshot.data, loading: true });
  }

  const run = (async () => {
    try {
      const res = await fetch(`/api/veqt?period=${period}`);
      if (!res.ok) throw new Error("API error");
      const json: VeqtApiResponse = await res.json();
      entry.fetchedAt = Date.now();
      setCache(`veqt:${period}`, json);
      publish(entry, { data: json, loading: false });
    } catch (err) {
      console.error("Failed to fetch VEQT data:", err);
      // Only fall back to localStorage on initial load — don't replace
      // fresh data with stale cache on a background refresh failure
      if (!isRefresh) {
        const cached = getCached<VeqtApiResponse>(`veqt:${period}`);
        publish(entry, {
          data: cached ?? entry.snapshot.data,
          loading: false,
        });
      } else if (entry.snapshot.loading) {
        publish(entry, { data: entry.snapshot.data, loading: false });
      }
    } finally {
      entry.promise = null;
    }
  })();

  entry.promise = run;
  return run;
}

/** Fetch only when there's nothing in memory or what's there has aged out. */
function ensureFresh(period: ChartPeriod, entry: Entry): void {
  if (entry.promise) return;
  const hasData = entry.snapshot.data !== null;
  if (hasData && Date.now() - entry.fetchedAt < REFETCH_INTERVAL_MS) return;
  void load(period, hasData);
}

function startTimer(period: ChartPeriod, entry: Entry): void {
  if (entry.timer !== null) return;
  if (entry.listeners.size === 0) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return;
  }
  entry.timer = setInterval(() => {
    void load(period, true);
  }, REFETCH_INTERVAL_MS);
}

function stopTimer(entry: Entry): void {
  if (entry.timer !== null) {
    clearInterval(entry.timer);
    entry.timer = null;
  }
}

function onVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    store.forEach(stopTimer);
    return;
  }
  store.forEach((entry, period) => {
    if (entry.listeners.size === 0) return;
    // Catch up on whatever we missed while hidden, then resume. MUST go
    // through the freshness check — visibility can flip rapidly (webviews,
    // automation, mobile app switches), and an unconditional load here
    // turns every flip into a network call.
    ensureFresh(period, entry);
    startTimer(period, entry);
  });
}

function bindVisibility(): void {
  if (visibilityBound || typeof document === "undefined") return;
  visibilityBound = true;
  document.addEventListener("visibilitychange", onVisibilityChange);
}

function unbindVisibilityIfIdle(): void {
  if (!visibilityBound) return;
  for (const entry of store.values()) {
    if (entry.listeners.size > 0) return;
  }
  visibilityBound = false;
  document.removeEventListener("visibilitychange", onVisibilityChange);
}

function subscribe(period: ChartPeriod, onStoreChange: () => void): () => void {
  const entry = getEntry(period);
  entry.listeners.add(onStoreChange);
  bindVisibility();
  ensureFresh(period, entry);
  startTimer(period, entry);

  return () => {
    entry.listeners.delete(onStoreChange);
    // Last subscriber out kills the timer — no orphaned polling.
    if (entry.listeners.size === 0) stopTimer(entry);
    unbindVisibilityIfIdle();
  };
}

function getSnapshot(period: ChartPeriod): Snapshot {
  return store.get(period)?.snapshot ?? EMPTY_SNAPSHOT;
}

function getServerSnapshot(): Snapshot {
  return EMPTY_SNAPSHOT;
}

/**
 * VEQT quote + history for a period. Public API is unchanged:
 * `{ data, loading, period, setPeriod }`.
 */
export function useVeqtData(initialPeriod: ChartPeriod = "1Y") {
  const [period, setPeriod] = useState<ChartPeriod>(initialPeriod);

  const subscribeToPeriod = useCallback(
    (onStoreChange: () => void) => subscribe(period, onStoreChange),
    [period]
  );
  const readSnapshot = useCallback(() => getSnapshot(period), [period]);

  const { data, loading } = useSyncExternalStore(
    subscribeToPeriod,
    readSnapshot,
    getServerSnapshot
  );

  return { data, loading, period, setPeriod };
}
