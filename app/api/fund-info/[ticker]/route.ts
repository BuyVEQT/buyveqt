import { NextResponse } from "next/server";
import { getFundInfoYahoo } from "@/lib/data/yahoo-fallback";
import { readCache, writeCache, getCacheKey } from "@/lib/data/cache";
import type { FundInfo } from "@/lib/data/yahoo-fallback";
import { FUNDS, FUND_DATA_LAST_UPDATED } from "@/data/funds";

export const revalidate = 86400; // 24h — fund-level facts move slowly

type FundInfoSource = "yahoo-finance" | "cache" | "snapshot";

export interface FundInfoResponse {
  ticker: string;
  /** AUM in CAD as a raw number when known. */
  netAssets: number | null;
  /** Human-readable AUM string ("$13.4B"). Always populated; falls back to
   *  the snapshot string in data/funds.ts when no live number exists. */
  aumDisplay: string;
  /** Annual report expense ratio (decimal — 0.0024 means 0.24%). */
  expenseRatio: number | null;
  /** Trailing annual dividend yield as percent. */
  trailingDividendYield: number | null;
  /** Number of holdings — snapshot-sourced for now; Yahoo doesn't expose it. */
  holdingCount: number;
  /** Sleeve allocations for a fund-of-funds. Snapshot for now; Yahoo's
   *  topHoldings list is unreliable for fund-of-funds tickers. */
  sleeves: Array<{ ticker: string; name: string; weight: number; region: string }>;
  /** Sector weights (display name → percent). Combined from live + snapshot. */
  sectorWeights: Record<string, number>;
  /** Per-field source so the UI can label data freshness. */
  sources: {
    netAssets: FundInfoSource;
    expenseRatio: FundInfoSource;
    trailingDividendYield: FundInfoSource;
    holdingCount: FundInfoSource;
    sleeves: FundInfoSource;
    sectorWeights: FundInfoSource;
  };
  /** When the underlying snapshot was last verified — for "as of" labels. */
  snapshotAsOf: string;
  fetchedAt: string;
}

function formatAum(raw: number | null, fallback: string): string {
  if (raw === null || !Number.isFinite(raw) || raw <= 0) return fallback;
  if (raw >= 1e9) return `$${(raw / 1e9).toFixed(1)}B`;
  if (raw >= 1e6) return `$${(raw / 1e6).toFixed(0)}M`;
  return `$${raw.toFixed(0)}`;
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  // Accept either "VEQT" or "VEQT.TO"; data/funds.ts keys on the .TO form.
  const normalized = ticker.toUpperCase().endsWith(".TO")
    ? ticker.toUpperCase()
    : `${ticker.toUpperCase()}.TO`;
  const snapshot = FUNDS[normalized];
  if (!snapshot) {
    return NextResponse.json(
      { error: "Unknown ticker", ticker: normalized },
      { status: 404 }
    );
  }

  // ─── Tier 1 — live Yahoo ─────────────────────────────────────
  // ─── Tier 2 — cache (warm container, then filesystem) ────────
  // ─── Tier 3 — static snapshot from data/funds.ts ────────────
  const cacheKey = getCacheKey("fund-info", normalized.replace(".TO", ""));
  let live: FundInfo | null = null;
  let liveFromCache = false;

  try {
    live = await getFundInfoYahoo(normalized);
  } catch {
    live = null;
  }

  if (live) {
    await writeCache(cacheKey, live).catch(() => {
      /* cache write failures don't break the response */
    });
  } else {
    live = await readCache<FundInfo>(cacheKey);
    liveFromCache = !!live;
  }

  const liveSource: FundInfoSource = live
    ? liveFromCache
      ? "cache"
      : "yahoo-finance"
    : "snapshot";

  // Yahoo's topHoldings for a fund-of-funds CAN return the four underlying
  // ETFs, but the data is inconsistent — sometimes weights, sometimes just
  // names. Default to the curated snapshot and only override when live data
  // is structurally complete.
  const liveSleevesUsable =
    live &&
    live.topHoldings.length === snapshot.underlyingETFs.length &&
    live.topHoldings.every((h) => h.weight > 0);

  // Compose response, picking the freshest value available per field.
  // Yahoo returns 0 (not null) for Vanguard Canada's MER and dividend yield
  // on VEQT — treat that as missing data so we fall back to the snapshot
  // rather than displaying "0.00%" as if it were authoritative.
  const expenseRatio =
    live && live.expenseRatio !== null && live.expenseRatio > 0
      ? live.expenseRatio
      : null;
  const dividendYield =
    live && live.trailingDividendYield !== null && live.trailingDividendYield > 0
      ? live.trailingDividendYield
      : null;
  const netAssetsLive =
    live && live.netAssets !== null && live.netAssets > 0
      ? live.netAssets
      : null;

  // Build sector map — keep snapshot's curated breakdown by default, override
  // with Yahoo's when it's substantially populated.
  const sectorWeights: Record<string, number> = {};
  if (live && Object.keys(live.sectorWeights).length >= 5) {
    for (const [k, v] of Object.entries(live.sectorWeights)) {
      sectorWeights[k] = +(v * 100).toFixed(1);
    }
  }

  const sleeves = liveSleevesUsable
    ? snapshot.underlyingETFs.map((s, i) => ({
        ...s,
        weight: +((live!.topHoldings[i].weight * 100) || s.weight).toFixed(1),
      }))
    : snapshot.underlyingETFs;

  const response: FundInfoResponse = {
    ticker: normalized,
    netAssets: netAssetsLive,
    aumDisplay: formatAum(netAssetsLive, snapshot.aum),
    expenseRatio,
    trailingDividendYield: dividendYield,
    holdingCount: snapshot.numberOfHoldings,
    sleeves,
    sectorWeights,
    sources: {
      netAssets: netAssetsLive !== null ? liveSource : "snapshot",
      expenseRatio: expenseRatio !== null ? liveSource : "snapshot",
      trailingDividendYield: dividendYield !== null ? liveSource : "snapshot",
      holdingCount: "snapshot", // Yahoo doesn't expose for ETFs
      sleeves: liveSleevesUsable ? liveSource : "snapshot",
      sectorWeights:
        Object.keys(sectorWeights).length > 0 ? liveSource : "snapshot",
    },
    snapshotAsOf: FUND_DATA_LAST_UPDATED,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(response);
}
