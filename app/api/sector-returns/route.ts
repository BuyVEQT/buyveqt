/**
 * Live sector and country daily returns — fans Yahoo quotes out across
 * a curated basket of sector/country proxy ETFs (XLK, EWJ, MCHI, etc.).
 * The result is keyed by display name so RegionDrilldown can look up
 * "Tech" or "Japan" directly without an extra mapping step.
 *
 * Bypasses the SYMBOLS table / Alpha Vantage fallback — these proxies
 * aren't in the SYMBOLS catalog and AV's 25/day budget shouldn't be
 * burned on sector tickers. Yahoo is free and unrate-limited for the
 * basket size we use (~30 tickers).
 */
import { NextResponse } from 'next/server';
import { getQuoteYahoo } from '@/lib/data/yahoo-fallback';
import {
  US_SECTOR_PROXIES,
  CA_SECTOR_PROXIES,
  INTL_COUNTRY_PROXIES,
  EM_COUNTRY_PROXIES,
  allProxyTickers,
  type ProxyEntry,
} from '@/lib/data/proxy-etfs';

export const revalidate = 300; // 5 min — matches /api/regions

export interface SectorReturnsResponse {
  /** Display name → today's % change (signed, e.g. -1.72). */
  usSectors: Record<string, number>;
  caSectors: Record<string, number>;
  intlCountries: Record<string, number>;
  emCountries: Record<string, number>;
  /** Tickers that failed to return a quote, for diagnostics. */
  missing: string[];
  fetchedAt: string;
}

function pickReturnsFor(
  list: ProxyEntry[],
  quoteMap: Map<string, number>
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const entry of list) {
    const pct = quoteMap.get(entry.ticker);
    if (typeof pct === 'number' && Number.isFinite(pct)) {
      out[entry.display] = Number(pct.toFixed(2));
    }
  }
  return out;
}

export async function GET() {
  const tickers = allProxyTickers();

  // Fan out all quote fetches in parallel. One missing ETF doesn't drag
  // the others down; UI consumers fall back to hardcoded numbers on miss.
  const results = await Promise.allSettled(
    tickers.map((t) => getQuoteYahoo(t, t))
  );

  const quoteMap = new Map<string, number>();
  const missing: string[] = [];
  results.forEach((res, i) => {
    const ticker = tickers[i];
    if (res.status === 'fulfilled' && res.value) {
      quoteMap.set(ticker, res.value.changePercent);
    } else {
      missing.push(ticker);
    }
  });

  return NextResponse.json({
    usSectors: pickReturnsFor(US_SECTOR_PROXIES, quoteMap),
    caSectors: pickReturnsFor(CA_SECTOR_PROXIES, quoteMap),
    intlCountries: pickReturnsFor(INTL_COUNTRY_PROXIES, quoteMap),
    emCountries: pickReturnsFor(EM_COUNTRY_PROXIES, quoteMap),
    missing,
    fetchedAt: new Date().toISOString(),
  });
}
