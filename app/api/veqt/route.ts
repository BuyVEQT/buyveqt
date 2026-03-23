import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { VEQT_TICKER, FALLBACK_QUOTE } from "@/lib/constants";
import type { VeqtQuote, HistoricalDataPoint, VeqtApiResponse } from "@/lib/types";

export const revalidate = 1800; // 30 minutes ISR-style caching

const yf = new YahooFinance({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

function getStartDate(period: string): Date {
  const now = new Date();
  switch (period) {
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "YTD":
      return new Date(now.getFullYear(), 0, 1);
    case "1Y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    case "3Y":
      return new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
    case "5Y":
      return new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
    default:
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "1Y";

  try {
    const [quoteResult, historicalResult] = await Promise.all([
      yf.quote(VEQT_TICKER),
      yf.historical(VEQT_TICKER, {
        period1: getStartDate(period),
        period2: new Date(),
        interval: ["3Y", "5Y"].includes(period) ? "1wk" : "1d",
      }),
    ]);

    // Calculate YTD return
    let ytdReturn: number | null = null;
    try {
      const ytdHistory = await yf.historical(VEQT_TICKER, {
        period1: new Date(new Date().getFullYear(), 0, 1),
        period2: new Date(),
        interval: "1d",
      });
      if (Array.isArray(ytdHistory) && ytdHistory.length > 0) {
        const startPrice = ytdHistory[0].close;
        const currentPrice = quoteResult.regularMarketPrice ?? 0;
        if (startPrice && currentPrice) {
          ytdReturn = ((currentPrice - startPrice) / startPrice) * 100;
        }
      }
    } catch {
      // YTD calculation is non-critical
    }

    const quote: VeqtQuote = {
      price: quoteResult.regularMarketPrice ?? 0,
      previousClose: quoteResult.regularMarketPreviousClose ?? 0,
      change: quoteResult.regularMarketChange ?? 0,
      changePercent: quoteResult.regularMarketChangePercent ?? 0,
      dayHigh: quoteResult.regularMarketDayHigh ?? 0,
      dayLow: quoteResult.regularMarketDayLow ?? 0,
      fiftyTwoWeekHigh: quoteResult.fiftyTwoWeekHigh ?? 0,
      fiftyTwoWeekLow: quoteResult.fiftyTwoWeekLow ?? 0,
      dividendYield: quoteResult.dividendYield ?? 0,
      ytdReturn,
      volume: quoteResult.regularMarketVolume ?? 0,
      marketCap: quoteResult.marketCap ?? 0,
      currency: quoteResult.currency ?? "CAD",
      exchange: quoteResult.exchange ?? "TSX",
      lastUpdated: new Date().toISOString(),
    };

    const historical: HistoricalDataPoint[] = (
      Array.isArray(historicalResult) ? historicalResult : []
    ).map((d: { date: Date; close?: number | null }) => ({
      date: d.date.toISOString().split("T")[0],
      close: d.close ?? 0,
    }));

    const response: VeqtApiResponse = {
      quote,
      historical,
      isFallback: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Failed to fetch VEQT data:", error);

    const response: VeqtApiResponse = {
      quote: { ...FALLBACK_QUOTE, lastUpdated: new Date().toISOString() },
      historical: [],
      isFallback: true,
    };

    return NextResponse.json(response, { status: 200 });
  }
}
