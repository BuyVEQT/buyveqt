"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { VeqtApiResponse, ChartPeriod } from "./types";
import { getCached, setCache } from "./cache";

/** Re-fetch interval: 5 minutes (matches server-side ISR revalidation) */
const REFETCH_INTERVAL_MS = 5 * 60 * 1000;

export function useVeqtData() {
  const [data, setData] = useState<VeqtApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ChartPeriod>("1Y");
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async (p: ChartPeriod, isRefresh = false) => {
    // Only show loading spinner on initial load, not background refreshes
    if (!isRefresh) setLoading(true);

    try {
      const res = await fetch(`/api/veqt?period=${p}`);
      if (!res.ok) throw new Error("API error");
      const json: VeqtApiResponse = await res.json();
      setData(json);
      setCache(`veqt:${p}`, json);
    } catch (err) {
      console.error("Failed to fetch VEQT data:", err);
      // Only fall back to localStorage on initial load — don't replace
      // fresh data with stale cache on a background refresh failure
      if (!isRefresh) {
        const cached = getCached<VeqtApiResponse>(`veqt:${p}`);
        if (cached) {
          setData(cached);
        }
      }
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch
    fetchData(period);

    // Auto-refresh every 5 minutes while the tab is open
    intervalRef.current = setInterval(() => {
      fetchData(period, true);
    }, REFETCH_INTERVAL_MS);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [period, fetchData]);

  return { data, loading, period, setPeriod };
}
