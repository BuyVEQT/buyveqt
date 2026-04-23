"use client";

import { useEffect, useState } from "react";
import type { NewsPayload } from "@/app/api/news/route";

const REFRESH_MS = 30 * 60 * 1000; // 30 min

/**
 * Shared hook for the financial news wire.
 * The /api/news route already caches for 6h, so this refresh is cheap —
 * mostly a hedge against the user leaving the tab open overnight.
 */
export function useNews(): { payload: NewsPayload | null; loading: boolean } {
  const [payload, setPayload] = useState<NewsPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/news");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: NewsPayload = await res.json();
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
