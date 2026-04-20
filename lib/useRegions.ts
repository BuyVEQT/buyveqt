"use client";

import { useEffect, useState } from "react";

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
    load();
    const interval = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { payload, loading };
}
