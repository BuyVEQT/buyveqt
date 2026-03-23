import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { readCache, writeCache } from "@/lib/file-cache";

const yf = new YahooFinance({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

const ALLOWED_TICKERS = ["VEQT.TO", "XEQT.TO", "ZEQT.TO", "VGRO.TO", "VFV.TO", "VUN.TO"];

export const revalidate = 1800;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const normalizedTicker = ticker.toUpperCase().endsWith(".TO")
    ? ticker.toUpperCase()
    : `${ticker.toUpperCase()}.TO`;

  if (!ALLOWED_TICKERS.includes(normalizedTicker)) {
    return NextResponse.json(
      { error: true, message: "Unsupported ticker" },
      { status: 400 }
    );
  }

  const cacheKey = `quote_${normalizedTicker}`;

  try {
    const q = await yf.quote(normalizedTicker);

    // Calculate YTD return
    let ytdReturn: number | null = null;
    try {
      const ytdHistory = await yf.historical(normalizedTicker, {
        period1: new Date(new Date().getFullYear(), 0, 1),
        period2: new Date(),
        interval: "1d",
      });
      if (Array.isArray(ytdHistory) && ytdHistory.length > 0) {
        const startPrice = ytdHistory[0].close;
        const currentPrice = q.regularMarketPrice ?? 0;
        if (startPrice && currentPrice) {
          ytdReturn = ((currentPrice - startPrice) / startPrice) * 100;
        }
      }
    } catch {
      // non-critical
    }

    // Calculate 1Y return
    let oneYearReturn: number | null = null;
    try {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const yearHistory = await yf.historical(normalizedTicker, {
        period1: oneYearAgo,
        period2: new Date(),
        interval: "1d",
      });
      if (Array.isArray(yearHistory) && yearHistory.length > 0) {
        const startPrice = yearHistory[0].close;
        const currentPrice = q.regularMarketPrice ?? 0;
        if (startPrice && currentPrice) {
          oneYearReturn = ((currentPrice - startPrice) / startPrice) * 100;
        }
      }
    } catch {
      // non-critical
    }

    const response = {
      ticker: normalizedTicker,
      price: q.regularMarketPrice ?? null,
      change: q.regularMarketChange ?? null,
      changePercent: q.regularMarketChangePercent ?? null,
      fiftyTwoWeekHigh: q.fiftyTwoWeekHigh ?? null,
      fiftyTwoWeekLow: q.fiftyTwoWeekLow ?? null,
      dividendYield: q.dividendYield ?? null,
      ytdReturn,
      oneYearReturn,
      lastUpdated: new Date().toISOString(),
      error: false,
    };

    // Cache successful response
    writeCache(cacheKey, response);

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Failed to fetch quote for ${normalizedTicker}:`, error);

    // Try file cache
    const cached = readCache<Record<string, unknown>>(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached.data,
        lastUpdated: cached.timestamp,
        error: false,
      });
    }

    return NextResponse.json({
      ticker: normalizedTicker,
      price: null,
      change: null,
      changePercent: null,
      fiftyTwoWeekHigh: null,
      fiftyTwoWeekLow: null,
      dividendYield: null,
      ytdReturn: null,
      oneYearReturn: null,
      lastUpdated: new Date().toISOString(),
      error: true,
    });
  }
}
