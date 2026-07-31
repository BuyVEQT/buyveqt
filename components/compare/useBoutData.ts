"use client";

import { useEffect, useState } from "react";
import { BOUT_TICKERS, HOUSE_TICKER } from "./bouts";
import type { PricePoint } from "./compare-math";

export interface BoutQuote {
  price: number | null;
  changePercent: number | null;
  oneYearReturn: number | null;
}

export interface BoutData {
  /** Live quotes for the selected pair — `/api/funds/compare`. */
  quotes: Record<string, BoutQuote>;
  /** Full daily tape for the house fund and all six contenders. */
  histories: Record<string, PricePoint[]>;
}

/**
 * The page's only data layer. Two fetches, both against endpoints the
 * previous compare page already used:
 *
 *   `/api/funds/compare?tickers=…`      live quotes for the selected pair
 *   `/api/funds/chart/{t}?range=ALL`    daily closes, one per bout ticker
 *
 * Histories load once for all seven tickers because every row on the
 * fight card carries its own common-tape spread — switching bouts then
 * costs one quote fetch, not seven chart fetches. Rows render an em dash
 * until their series lands, so there's no separate loading state.
 */
export default function useBoutData(contender: string): BoutData {
  const [quotes, setQuotes] = useState<Record<string, BoutQuote>>({});
  const [histories, setHistories] = useState<Record<string, PricePoint[]>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/funds/compare?tickers=${HOUSE_TICKER},${contender}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (cancelled || !json?.data) return;
        const next: Record<string, BoutQuote> = {};
        for (const [ticker, q] of Object.entries(
          json.data as Record<string, BoutQuote>
        )) {
          next[ticker] = {
            price: q.price ?? null,
            changePercent: q.changePercent ?? null,
            oneYearReturn: q.oneYearReturn ?? null,
          };
        }
        setQuotes(next);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [contender]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      BOUT_TICKERS.map(async (ticker) => {
        try {
          const res = await fetch(`/api/funds/chart/${ticker}?range=ALL`);
          if (!res.ok) return { ticker, data: [] as PricePoint[] };
          const json = await res.json();
          return { ticker, data: (json.data ?? []) as PricePoint[] };
        } catch {
          return { ticker, data: [] as PricePoint[] };
        }
      })
    ).then((results) => {
      if (cancelled) return;
      const next: Record<string, PricePoint[]> = {};
      for (const { ticker, data } of results) next[ticker] = data;
      setHistories(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { quotes, histories };
}
