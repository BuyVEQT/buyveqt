"use client";

import { useSyncExternalStore } from "react";

export interface RegionSparkPoint {
  date: string;
  close: number;
}

export interface Region {
  ticker: string;
  region: string;
  label: string;
  weight: number;
  fullName: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  contribution: number | null;
  /** Up to ~30 trailing sessions of closes, oldest first. Empty if unavailable. */
  history: RegionSparkPoint[];
  error: boolean;
}

export interface RegionsPayload {
  regions: Region[];
  fetchedAt: string;
}

const REFRESH_MS = 5 * 60 * 1000;

/* ── Module-level shared store ────────────────────────────────
 *
 * `/api/regions` is a single global resource, but three components ask for
 * it (HomeClient, GeographyPanel, RegionDrilldown) and each used to run its
 * own fetch + its own 5-minute interval. The store below gives the whole
 * page one request and one timer:
 *
 *   dedupe     an in-flight request is shared with every latecomer.
 *   freshness  a payload younger than REFRESH_MS is served from memory.
 *   timers     one interval total, started with the first subscriber and
 *              cleared when the last one unmounts. Paused while the tab is
 *              hidden and resumed with a catch-up fetch.
 *
 * Unmount safety: fetches write to the store and notify listeners, and an
 * unmounted component has already removed its listener. The request is
 * shared, so it is deliberately never aborted on one subscriber's unmount.
 */

interface Snapshot {
  payload: RegionsPayload | null;
  loading: boolean;
}

/** Stable identity for "nothing fetched yet" — used for SSR, hydration and
 *  the pre-subscribe render. */
const EMPTY_SNAPSHOT: Snapshot = { payload: null, loading: true };

let snapshot: Snapshot = EMPTY_SNAPSHOT;
/** Epoch ms of the last SUCCESSFUL fetch. 0 = never succeeded. */
let fetchedAt = 0;
let inFlight: Promise<void> | null = null;
let timer: ReturnType<typeof setInterval> | null = null;
let visibilityBound = false;
const listeners = new Set<() => void>();

function publish(next: Snapshot): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function load(): Promise<void> {
  if (inFlight) return inFlight;

  const run = (async () => {
    try {
      const res = await fetch("/api/regions");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: RegionsPayload = await res.json();
      fetchedAt = Date.now();
      publish({ payload: data, loading: false });
    } catch {
      // Keep whatever payload we already had; just stop reporting loading.
      if (snapshot.loading) publish({ payload: snapshot.payload, loading: false });
    } finally {
      inFlight = null;
    }
  })();

  inFlight = run;
  return run;
}

function ensureFresh(): void {
  if (inFlight) return;
  if (snapshot.payload !== null && Date.now() - fetchedAt < REFRESH_MS) return;
  void load();
}

function startPolling(): void {
  if (timer !== null || listeners.size === 0) return;
  if (typeof document !== "undefined" && document.visibilityState === "hidden") {
    return;
  }
  timer = setInterval(() => {
    void load();
  }, REFRESH_MS);
}

function stopPolling(): void {
  if (timer !== null) {
    clearInterval(timer);
    timer = null;
  }
}

function onVisibilityChange(): void {
  if (document.visibilityState === "hidden") {
    stopPolling();
    return;
  }
  if (listeners.size === 0) return;
  // Freshness-checked, not unconditional — rapid visibility flips
  // (webviews, automation, app switches) must not each cost a fetch.
  ensureFresh();
  startPolling();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  if (!visibilityBound && typeof document !== "undefined") {
    visibilityBound = true;
    document.addEventListener("visibilitychange", onVisibilityChange);
  }
  ensureFresh();
  startPolling();

  return () => {
    listeners.delete(onStoreChange);
    if (listeners.size === 0) {
      stopPolling();
      if (visibilityBound) {
        visibilityBound = false;
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    }
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return EMPTY_SNAPSHOT;
}

/**
 * Shared hook for the four-sleeve regional attribution data.
 * Used by both the dynamic Lead eyebrow and the RegionCards grid so
 * they pull from the same fetch instead of duplicating requests.
 */
export function useRegions(): { payload: RegionsPayload | null; loading: boolean } {
  const { payload, loading } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return { payload, loading };
}
