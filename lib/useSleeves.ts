"use client";

import { useSyncExternalStore } from "react";
import type { SleevesResponse } from "@/app/api/sleeves/route";

interface Snapshot {
  data: SleevesResponse | null;
  loading: boolean;
}

/** The route is ISR-cached at 24h; anything younger reads back identical. */
const FRESH_MS = 24 * 60 * 60 * 1000;

/* ── Module-level shared store ────────────────────────────────
 *
 * Same contract as useFundInfo: /api/sleeves is one global resource asked
 * for by several Observatory modules (floor plan, sleeve panel, drift,
 * payout), so one request serves all subscribers and there is no polling —
 * sleeve facts do not move intraday.
 */

const EMPTY_SNAPSHOT: Snapshot = { data: null, loading: true };

let snapshot: Snapshot = EMPTY_SNAPSHOT;
let fetchedAt = 0;
let inFlight: Promise<void> | null = null;
const listeners = new Set<() => void>();

function publish(next: Snapshot): void {
  snapshot = next;
  listeners.forEach((listener) => listener());
}

function load(): Promise<void> {
  if (inFlight) return inFlight;

  const run = (async () => {
    try {
      const res = await fetch("/api/sleeves");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json()) as SleevesResponse;
      fetchedAt = Date.now();
      publish({ data: json, loading: false });
    } catch {
      if (snapshot.loading) publish({ data: snapshot.data, loading: false });
    } finally {
      inFlight = null;
    }
  })();

  inFlight = run;
  return run;
}

function ensureFresh(): void {
  if (inFlight) return;
  if (snapshot.data !== null && Date.now() - fetchedAt < FRESH_MS) return;
  void load();
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  ensureFresh();
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): Snapshot {
  return snapshot;
}

function getServerSnapshot(): Snapshot {
  return EMPTY_SNAPSHOT;
}

/** Shared hook for the Observatory's sleeve-level payload. */
export function useSleeves(): {
  data: SleevesResponse | null;
  loading: boolean;
} {
  const { data, loading } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return { data, loading };
}
