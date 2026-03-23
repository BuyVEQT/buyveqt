"use client";

import { useState, useEffect, useCallback } from "react";
import type { VeqtApiResponse, ChartPeriod } from "./types";
import { getCached, setCache } from "./cache";

export function useVeqtData() {
  const [data, setData] = useState<VeqtApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<ChartPeriod>("1Y");

  const fetchData = useCallback(async (p: ChartPeriod) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/veqt?period=${p}`);
      if (!res.ok) throw new Error("API error");
      const json: VeqtApiResponse = await res.json();
      setData(json);
      setCache(`veqt:${p}`, json);
    } catch (err) {
      console.error("Failed to fetch VEQT data:", err);
      const cached = getCached<VeqtApiResponse>(`veqt:${p}`);
      if (cached) {
        setData(cached);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(period);
  }, [period, fetchData]);

  return { data, loading, period, setPeriod };
}
