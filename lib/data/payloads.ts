import { getQuote, getDailyHistory } from "@/lib/data";
import { computeReturn, ytdCutoff } from "@/lib/data/returns";
import { FALLBACK_QUOTE, UNDERLYING_ETFS } from "@/lib/constants";
import type { VeqtQuote, HistoricalDataPoint, VeqtApiResponse } from "@/lib/types";
import type { RegionsPayload, RegionSparkPoint } from "@/lib/useRegions";

/**
 * Server-side payload builders, shared by the API routes and the pages
 * that server-render their initial data (home first — the CLS fix).
 *
 * The route handlers (/api/veqt, /api/regions) are now thin JSON wrappers
 * around these, and app/page.tsx calls them directly at ISR time so the
 * first HTML already carries the price, the weather and the sleeves —
 * no skeleton→content reflow on load. Both callers share the same
 * lib/data cache underneath, so this adds no extra Yahoo traffic.
 */

function getHistoryDays(period: string): number {
  switch (period) {
    case "1M": return 30;
    case "3M": return 90;
    case "6M": return 180;
    case "YTD": {
      const now = new Date();
      const jan1 = new Date(now.getFullYear(), 0, 1);
      return Math.ceil((now.getTime() - jan1.getTime()) / (1000 * 60 * 60 * 24));
    }
    case "1Y": return 365;
    case "3Y": return 365 * 3;
    case "5Y": return 365 * 5;
    case "ALL": {
      // VEQT inception: January 29, 2019
      const inception = new Date(2019, 0, 29);
      return Math.ceil((Date.now() - inception.getTime()) / (1000 * 60 * 60 * 24));
    }
    default: return 365;
  }
}

export async function buildVeqtPayload(period: string): Promise<VeqtApiResponse> {
  // Use allSettled so one failure doesn't kill the other.
  // Quote and history are independent — show whichever we can get.
  const [quoteResult, historyResult] = await Promise.allSettled([
    getQuote("VEQT"),
    getDailyHistory("VEQT", ["ALL", "3Y", "5Y", "1Y"].includes(period) ? "full" : "compact"),
  ]);

  const quoteData = quoteResult.status === "fulfilled" ? quoteResult.value : null;
  const historyData = historyResult.status === "fulfilled" ? historyResult.value : null;

  // Build historical array from whatever we got
  let historical: HistoricalDataPoint[] = [];
  if (historyData && historyData.data.length > 0) {
    const daysBack = getHistoryDays(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    historical = historyData.data
      .filter((d) => d.date >= cutoffStr)
      .map((d) => ({ date: d.date, close: d.adjustedClose || d.close }));

    // Append (or update) the live quote so the chart's last point matches
    // the price widget instead of lagging behind by a day.
    if (quoteData) {
      // Date the point with the quote's own trading session, NOT the request
      // wall clock. Between midnight and the next open, Yahoo's quote still
      // carries the prior session — stamping it "today" displayed yesterday's
      // close under tomorrow's date and left a phantom gap on yesterday.
      const quoteDateStr = quoteData.latestTradingDay;
      const lastPoint = historical[historical.length - 1];
      if (lastPoint && lastPoint.date === quoteDateStr) {
        // Session already in history — update it with the live price
        lastPoint.close = quoteData.price;
      } else if (!lastPoint || lastPoint.date < quoteDateStr) {
        // Session not yet in history — append the live price as its point
        historical.push({ date: quoteDateStr, close: quoteData.price });
      }
    }
  }

  // Build quote from live data or fallback
  let quote: VeqtQuote;
  let isFallback: boolean;

  if (quoteData) {
    // We have real data. previousClose / dayHigh / dayLow / marketCap come
    // straight from Yahoo (or AV's GLOBAL_QUOTE for the first three); they
    // were hardcoded to 0 in an earlier iteration, which silently disabled
    // the HeroPriceCard's intraday-range and prev-close captions.
    quote = {
      price: quoteData.price,
      previousClose: quoteData.previousClose,
      change: quoteData.change,
      changePercent: quoteData.changePercent,
      dayHigh: quoteData.dayHigh,
      dayLow: quoteData.dayLow,
      fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow,
      dividendYield: quoteData.dividendYield,
      ytdReturn: null,
      volume: quoteData.volume,
      marketCap: quoteData.marketCap,
      currency: "CAD",
      exchange: "TSX",
      lastUpdated: quoteData.fetchedAt,
      latestTradingDay: quoteData.latestTradingDay,
      isFallback: quoteData.source === "cache",
    };
    isFallback = quoteData.source === "cache";

    // Try to compute YTD return from history
    if (historyData) {
      quote.ytdReturn = computeReturn(historyData.data, quoteData.price, ytdCutoff());
    }
  } else {
    // Both APIs failed AND cache is empty — use hardcoded fallback.
    // IMPORTANT: Do NOT lie about the timestamp. Use a clearly old date
    // so the UI shows this is stale, not "Updated 1 min ago."
    quote = {
      ...FALLBACK_QUOTE,
      lastUpdated: FALLBACK_QUOTE.lastUpdated,
      latestTradingDay: FALLBACK_QUOTE.lastUpdated.slice(0, 10),
      isFallback: true,
    };
    isFallback = true;
  }

  return {
    quote,
    historical,
    isFallback,
    quoteSource: quoteData?.source ?? "cache",
    quoteFetchedAt: quoteData?.fetchedAt ?? FALLBACK_QUOTE.lastUpdated,
    historySource: historyData?.source,
    historyFetchedAt: historyData?.fetchedAt,
  };
}

/* ── Regions (the four sleeves) ── */

const REGION_LABELS: Record<string, string> = {
  US: "United States",
  Canada: "Canada",
  International: "Int'l Developed",
  "Emerging Markets": "Emerging Markets",
};

// Fixed render order — Canada first (home market), then US, Int'l, EM.
const ORDERED = ["Canada", "US", "International", "Emerging Markets"];

// How many trailing sessions to return for each region's sparkline. Keeping
// this tight (~30 trading days ≈ 6 weeks) because the sparkline's job is
// "how does today feel vs. the past month," not long-horizon context.
const SPARKLINE_SESSIONS = 30;

export async function buildRegionsPayload(): Promise<RegionsPayload> {
  const etfs = ORDERED.map(
    (region) => UNDERLYING_ETFS.find((e) => e.region === region)!
  );

  // Quote + 1-month history per sleeve, all fetched in parallel. One failure
  // does not drag the others down.
  const quoteResults = await Promise.allSettled(
    etfs.map((etf) => getQuote(etf.ticker))
  );
  const historyResults = await Promise.allSettled(
    etfs.map((etf) => getDailyHistory(etf.ticker, "compact"))
  );

  const regions = etfs.map((etf, i) => {
    const quoteResult = quoteResults[i];
    const historyResult = historyResults[i];
    const base = {
      ticker: etf.ticker,
      region: etf.region,
      label: REGION_LABELS[etf.region] ?? etf.region,
      weight: etf.weight,
      fullName: etf.name,
    };

    // History may arrive even if the live quote fails — and vice versa.
    // Render what we have, leave the rest null.
    let history: RegionSparkPoint[] = [];
    if (historyResult.status === "fulfilled" && historyResult.value) {
      const { data } = historyResult.value;
      history = data
        .slice(-SPARKLINE_SESSIONS)
        .map((d) => ({ date: d.date, close: d.adjustedClose || d.close }))
        .filter((d) => Number.isFinite(d.close) && d.close > 0);
    }

    if (quoteResult.status !== "fulfilled") {
      return {
        ...base,
        price: null,
        change: null,
        changePercent: null,
        contribution: null,
        history,
        error: true,
      };
    }

    const q = quoteResult.value;
    return {
      ...base,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      contribution: (q.changePercent * etf.weight) / 100,
      history,
      error: false,
    };
  });

  return {
    regions,
    fetchedAt: new Date().toISOString(),
  };
}
