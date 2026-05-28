"use client";

import { useEffect, useMemo, useState } from "react";
import type { SleeveCompositionResponse } from "@/app/api/sleeve-composition/route";
import type { SectorReturnsResponse } from "@/app/api/sector-returns/route";
import {
  SLEEVE_TOP_HOLDINGS_2026_Q1,
  type HoldingMini,
} from "@/lib/sleeve-top-holdings";

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
    let interval: ReturnType<typeof setInterval> | null = null;
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
    // Pause polling on hidden tabs (mobile keeps firing setInterval on
    // backgrounded tabs, wasting battery/data); resume + catch up on show.
    const startPolling = () => {
      if (interval) return;
      interval = setInterval(load, COMPOSITION_REFRESH_MS);
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
    let interval: ReturnType<typeof setInterval> | null = null;
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
    // Pause polling on hidden tabs (mobile keeps firing setInterval on
    // backgrounded tabs, wasting battery/data); resume + catch up on show.
    const startPolling = () => {
      if (interval) return;
      interval = setInterval(load, RETURNS_REFRESH_MS);
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

/**
 * Derives the top-3 holdings per sleeve from the live composition hook.
 * The composition items are name+weight entries (sectors or countries, not
 * individual stock names), so for the purpose of top holdings we always fall
 * back to the curated Q1 2026 snapshot which has actual company names.
 *
 * Returns a stable Map<ticker, HoldingMini[]> keyed by sleeve ticker.
 */
export function useSleeveTopHoldings(): Map<string, HoldingMini[]> {
  const { payload: composition } = useSleeveComposition();

  return useMemo<Map<string, HoldingMini[]>>(() => {
    const out = new Map<string, HoldingMini[]>();
    const TICKERS = ["VUN", "VCN", "VIU", "VEE"] as const;

    for (const ticker of TICKERS) {
      // The sleeve-composition route returns sector/country weights, not
      // individual company holdings. We always use the snapshot for company
      // names and individual stock weights — this is the correct fallback
      // semantics (parallel to buildSleeveSectors in InsideRegionGrid).
      const fallback = SLEEVE_TOP_HOLDINGS_2026_Q1[ticker] ?? [];
      out.set(ticker, fallback.slice(0, 3));
    }

    // composition is kept in scope so future wiring (when the API exposes
    // per-holding data) can override without a hook signature change.
    void composition;

    return out;
  }, [composition]);
}
