import { NextResponse } from "next/server";
import {
  getFundInfoYahoo,
  getTrailingDividendsYahoo,
  getSleeveFactsYahoo,
} from "@/lib/data/yahoo-fallback";
import { readCache, writeCache, getCacheKey } from "@/lib/data/cache";
import { FUND_DATA_LAST_UPDATED } from "@/data/funds";
import { SLEEVES } from "@/data/sleeves";

export const revalidate = 86400; // fund-level facts move slowly

type SleeveFieldSource = "yahoo-finance" | "cache" | "snapshot" | "none";

export interface SleeveEntry {
  ticker: string;
  /** Live weight inside VEQT (percent), from Yahoo's VEQT.TO top holdings. */
  liveWeight: number | null;
  /** The drift tick (percent) — VCN's 30 pin, factsheet for the rest. */
  targetWeight: number;
  isPinned: boolean;
  /** Trailing-12-month cash yield (percent) on the TSX sleeve ticker. */
  ttmYield: number | null;
  /** Trailing-12-month distributions per unit, CAD. */
  ttmPerUnit: number | null;
  /** Top holdings of the sleeve (percent of sleeve), heaviest first. */
  topHoldings: Array<{ name: string; weight: number }>;
  /** Sector weights (percent of sleeve), heaviest first — the full book. */
  sectors: Array<{ name: string; weight: number }>;
  /** Calendar-year NAV returns (percent) on the TSX sleeve, newest first. */
  annualReturns: Array<{ year: number; pct: number }>;
  /** The sleeve ETF's own net assets, CAD. */
  netAssets: number | null;
  /** Provenance note when holdings/sectors come through a US wrapper. */
  lookthroughNote: string | null;
}

export interface SleevesResponse {
  sleeves: SleeveEntry[];
  sources: {
    weights: SleeveFieldSource;
    yields: SleeveFieldSource;
    holdings: SleeveFieldSource;
  };
  snapshotAsOf: string;
  fetchedAt: string;
}

/** Ten for the dossier pages; the Observatory panel slices to three. */
const TOP_N = 10;

interface CachedPayload {
  response: SleevesResponse;
}

/**
 * One payload for the Observatory's sleeve-level instruments: the drift
 * lines (live VEQT mix), the sleeve panel (top holdings + sector tilt) and
 * the payout board (TTM yield per sleeve).
 *
 * Everything resolves in parallel and every field degrades independently:
 * a Yahoo miss on one sleeve nulls that sleeve's field rather than the
 * response. The whole composed payload is cached (memory + filesystem)
 * because it costs nine upstream calls to build cold.
 */
export async function GET() {
  // "v2" — the widened dossier shape (top-10, full sectors, annual returns);
  // an old cached payload must not satisfy the degraded-path read.
  const cacheKey = getCacheKey("sleeves", "VEQT", "v2");

  const [veqtInfoResult, perSleeveResults, dividendResults, factsResults] =
    await Promise.allSettled([
      getFundInfoYahoo("VEQT.TO"),
      Promise.allSettled(
        SLEEVES.map((s) => getFundInfoYahoo(s.lookthrough.symbol))
      ),
      Promise.allSettled(
        SLEEVES.map((s) => getTrailingDividendsYahoo(`${s.ticker}.TO`))
      ),
      Promise.allSettled(
        SLEEVES.map((s) => getSleeveFactsYahoo(`${s.ticker}.TO`))
      ),
    ]);

  const veqtInfo =
    veqtInfoResult.status === "fulfilled" ? veqtInfoResult.value : null;

  // Live sleeve weights — usable only when Yahoo returns all four with
  // weights, same structural check the fund-info route applies.
  const topRaw = veqtInfo?.topHoldings ?? [];
  const liveWeightsUsable =
    topRaw.length === SLEEVES.length && topRaw.every((h) => h.weight > 0);
  const liveWeightBySleeve = new Map<string, number>();
  if (liveWeightsUsable) {
    for (const h of topRaw) {
      const ticker = h.symbol.replace(/\.TO$/i, "").toUpperCase();
      liveWeightBySleeve.set(ticker, +(h.weight * 100).toFixed(1));
    }
  }

  const perSleeve =
    perSleeveResults.status === "fulfilled" ? perSleeveResults.value : [];
  const dividends =
    dividendResults.status === "fulfilled" ? dividendResults.value : [];
  const facts =
    factsResults.status === "fulfilled" ? factsResults.value : [];

  let anyHoldings = false;
  let anyYield = false;

  const sleeves: SleeveEntry[] = SLEEVES.map((meta, i) => {
    const infoResult = perSleeve[i];
    const info =
      infoResult && infoResult.status === "fulfilled" ? infoResult.value : null;

    const divResult = dividends[i];
    const div =
      divResult && divResult.status === "fulfilled" ? divResult.value : null;

    const factsResult = facts[i];
    const fact =
      factsResult && factsResult.status === "fulfilled"
        ? factsResult.value
        : null;

    // Holdings arrive as fractions of the sleeve. A wrapper reporting a
    // single ~100% row is the degenerate case the look-through exists to
    // avoid; filter it defensively anyway.
    const topHoldings = (info?.topHoldings ?? [])
      .filter((h) => h.weight > 0 && h.weight < 0.9 && h.name)
      .slice(0, TOP_N)
      .map((h) => ({ name: h.name, weight: +(h.weight * 100).toFixed(2) }));

    const sectors = Object.entries(info?.sectorWeights ?? {})
      .sort((a, b) => b[1] - a[1])
      .map(([name, w]) => ({ name, weight: +(w * 100).toFixed(1) }));

    let ttmYield: number | null = null;
    let ttmPerUnit: number | null = null;
    if (div && div.trailingTotal > 0 && div.price) {
      ttmPerUnit = +div.trailingTotal.toFixed(4);
      ttmYield = +((div.trailingTotal / div.price) * 100).toFixed(2);
    }

    if (topHoldings.length > 0) anyHoldings = true;
    if (ttmYield !== null) anyYield = true;

    return {
      ticker: meta.ticker,
      liveWeight: liveWeightBySleeve.get(meta.ticker) ?? null,
      targetWeight: meta.targetWeight,
      isPinned: meta.isPinned,
      ttmYield,
      ttmPerUnit,
      topHoldings,
      sectors,
      annualReturns: fact?.annualReturns ?? [],
      netAssets: fact?.netAssets ?? null,
      lookthroughNote: meta.lookthrough.note,
    };
  });

  const liveResponse: SleevesResponse = {
    sleeves,
    sources: {
      weights: liveWeightsUsable ? "yahoo-finance" : "snapshot",
      yields: anyYield ? "yahoo-finance" : "none",
      holdings: anyHoldings ? "yahoo-finance" : "none",
    },
    snapshotAsOf: FUND_DATA_LAST_UPDATED,
    fetchedAt: new Date().toISOString(),
  };

  // A fully degraded response (no weights, no yields, no holdings) is worth
  // less than yesterday's cache — serve the cache instead when it exists.
  const fullyDegraded = !liveWeightsUsable && !anyYield && !anyHoldings;
  if (fullyDegraded) {
    const cached = await readCache<CachedPayload>(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached.response,
        sources: {
          weights: cached.response.sources.weights === "none" ? "none" : "cache",
          yields: cached.response.sources.yields === "none" ? "none" : "cache",
          holdings:
            cached.response.sources.holdings === "none" ? "none" : "cache",
        },
      });
    }
    return NextResponse.json(liveResponse);
  }

  await writeCache(cacheKey, { response: liveResponse }).catch(() => {
    /* cache write failures don't break the response */
  });
  return NextResponse.json(liveResponse);
}
