import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";
import { computeReturn, ytdCutoff } from "@/lib/data/returns";
import { FALLBACK_QUOTE } from "@/lib/constants";
import type { VeqtQuote, HistoricalDataPoint, VeqtApiResponse } from "@/lib/types";

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "1Y";

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

    // Append (or update) today's live quote price so the chart's last point
    // matches the price widget instead of lagging behind by a day.
    if (quoteData) {
      // Eastern (TSX) calendar date, not UTC: after ~7pm ET the UTC date has
      // already rolled to tomorrow, which would append a future-dated point
      // ahead of the real series.
      const todayStr = new Date().toLocaleDateString("en-CA", {
        timeZone: "America/Toronto",
      });
      const lastPoint = historical[historical.length - 1];
      if (lastPoint && lastPoint.date === todayStr) {
        // Today's close already in history — update it with live price
        lastPoint.close = quoteData.price;
      } else {
        // Today not yet in history — append live price as today's point
        historical.push({ date: todayStr, close: quoteData.price });
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
      isFallback: true,
    };
    isFallback = true;
  }

  const response: VeqtApiResponse = {
    quote,
    historical,
    isFallback,
    quoteSource: quoteData?.source ?? "cache",
    quoteFetchedAt: quoteData?.fetchedAt ?? FALLBACK_QUOTE.lastUpdated,
    historySource: historyData?.source,
    historyFetchedAt: historyData?.fetchedAt,
  };

  return NextResponse.json(response, {
    headers: {
      // Dynamic route (reads ?period); s-maxage gives the CDN a per-period
      // cache so repeat hits don't re-run the Yahoo/AV fetch path.
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
    },
  });
}
