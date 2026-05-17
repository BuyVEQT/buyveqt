"use client";

import { useEffect, useState } from "react";
import type { SleeveCompositionResponse } from "@/app/api/sleeve-composition/route";
import type { SectorReturnsResponse } from "@/app/api/sector-returns/route";

const COMPOSITION_REFRESH_MS = 60 * 60 * 1000; // 1h — composition is sticky
const RETURNS_REFRESH_MS = 5 * 60 * 1000; // 5 min — matches /api/regions

/**
 * Shared hook for live sleeve composition (sector weights for VUN/VCN,
 * country weights for VIU/VEE). Server route is cached 24h via ISR;
 * client refresh is once an hour so the UI stays in sync after a long
 * session without hammering the endpoint.
 */
export function useSleeveComposition(): {
  payload: SleeveCompositionResponse | null;
  loading: boolean;
} {
  const [payload, setPayload] = useState<SleeveCompositionResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/sleeve-composition");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SleeveCompositionResponse = await res.json();
        if (!cancelled) {
          setPayload(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, COMPOSITION_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { payload, loading };
}

/**
 * Shared hook for today's sector and country returns, fetched from
 * /api/sector-returns. Mirrors useRegions cadence (5 min) so drill rows
 * stay aligned with the region-level numbers above them.
 */
export function useSectorReturns(): {
  payload: SectorReturnsResponse | null;
  loading: boolean;
} {
  const [payload, setPayload] = useState<SectorReturnsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/sector-returns");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: SectorReturnsResponse = await res.json();
        if (!cancelled) {
          setPayload(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    const interval = setInterval(load, RETURNS_REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return { payload, loading };
}
