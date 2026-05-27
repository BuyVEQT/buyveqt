"use client";

import { useEffect, useState } from "react";

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

/**
 * Shared hook for the four-sleeve regional attribution data.
 * Used by both the dynamic Lead eyebrow and the RegionCards grid so
 * they pull from the same fetch instead of duplicating requests.
 */
export function useRegions(): { payload: RegionsPayload | null; loading: boolean } {
  const [payload, setPayload] = useState<RegionsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let interval: ReturnType<typeof setInterval> | null = null;

    async function load() {
      try {
        const res = await fetch("/api/regions");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RegionsPayload = await res.json();
        if (!cancelled) {
          setPayload(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }

    // Pause the 5-minute poll whenever the tab is hidden — mobile
    // browsers keep firing setInterval on backgrounded tabs which
    // wastes battery and cellular data. Resume + fetch-once on
    // visibility change.
    const startPolling = () => {
      if (interval) return;
      interval = setInterval(load, REFRESH_MS);
    };
    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        stopPolling();
      } else {
        load();
        startPolling();
      }
    };

    load();
    if (document.visibilityState === "visible") startPolling();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      stopPolling();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return { payload, loading };
}
