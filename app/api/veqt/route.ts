import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";
import { FALLBACK_QUOTE } from "@/lib/constants";
import type { VeqtQuote, HistoricalDataPoint, VeqtApiResponse } from "@/lib/types";

export const revalidate = 900; // 15 minutes (was 30 min, now matches new quote route)

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
    case "1Y":
    default: return 365;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "1Y";

  try {
    const [quoteData, historyData] = await Promise.all([
      getQuote("VEQT"),
      getDailyHistory("VEQT", period === "1Y" || period === "YTD" ? "full" : "compact"),
    ]);

    // Filter history to match requested period
    const daysBack = getHistoryDays(period);
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - daysBack);
    const cutoffStr = cutoff.toISOString().split("T")[0];

    const historical: HistoricalDataPoint[] = historyData.data
      .filter((d) => d.date >= cutoffStr)
      .map((d) => ({ date: d.date, close: d.adjustedClose || d.close }));

    // Map QuoteData to VeqtQuote shape for backward compatibility
    const quote: VeqtQuote = {
      price: quoteData.price,
      previousClose: 0, // not available from new data service
      change: quoteData.change,
      changePercent: quoteData.changePercent,
      dayHigh: 0,
      dayLow: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      dividendYield: 0,
      ytdReturn: null,
      volume: quoteData.volume,
      marketCap: 0,
      currency: "CAD",
      exchange: "TSX",
      lastUpdated: quoteData.fetchedAt,
      isFallback: quoteData.source === "cache",
    };

    // Try to compute YTD return from history data
    if (historyData.data.length > 0) {
      const yearStart = new Date(new Date().getFullYear(), 0, 1)
        .toISOString()
        .split("T")[0];
      const startPoint = historyData.data.find((d) => d.date >= yearStart);
      if (startPoint) {
        const startPrice = startPoint.adjustedClose || startPoint.close;
        if (startPrice > 0) {
          quote.ytdReturn =
            ((quoteData.price - startPrice) / startPrice) * 100;
        }
      }
    }

    const response: VeqtApiResponse = {
      quote,
      historical,
      isFallback: quoteData.source === "cache",
      quoteSource: quoteData.source,
      quoteFetchedAt: quoteData.fetchedAt,
      historySource: historyData.source,
      historyFetchedAt: historyData.fetchedAt,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch VEQT data:", error);

    const response: VeqtApiResponse = {
      quote: { ...FALLBACK_QUOTE, lastUpdated: new Date().toISOString() },
      historical: [],
      isFallback: true,
      quoteSource: "cache",
      quoteFetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response, { status: 200 });
  }
}
