"use client";

import { useEffect, useState } from "react";
import type { FundInfoResponse } from "@/app/api/fund-info/[ticker]/route";

interface UseFundInfoResult {
  data: FundInfoResponse | null;
  loading: boolean;
  error: string | null;
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
  const [data, setData] = useState<FundInfoResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/fund-info/${encodeURIComponent(ticker)}`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as FundInfoResponse;
      })
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "unknown");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [ticker]);

  return { data, loading, error };
}
