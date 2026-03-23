import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";
import { readCache, writeCache } from "@/lib/file-cache";

const yf = new YahooFinance({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

const ALLOWED_TICKERS = ["VEQT.TO", "XEQT.TO", "ZEQT.TO", "VGRO.TO", "VFV.TO", "VUN.TO"];

export const revalidate = 1800;

interface FundQuote {
  ticker: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  dividendYield: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  error: boolean;
}

async function fetchQuote(ticker: string): Promise<FundQuote> {
  try {
    const q = await yf.quote(ticker);
    const currentPrice = q.regularMarketPrice ?? 0;

    let ytdReturn: number | null = null;
    let oneYearReturn: number | null = null;

    try {
      const [ytdHistory, yearHistory] = await Promise.all([
        yf.historical(ticker, {
          period1: new Date(new Date().getFullYear(), 0, 1),
          period2: new Date(),
          interval: "1d",
        }),
        yf.historical(ticker, {
          period1: new Date(new Date().getFullYear() - 1, new Date().getMonth(), new Date().getDate()),
          period2: new Date(),
          interval: "1d",
        }),
      ]);

      if (Array.isArray(ytdHistory) && ytdHistory.length > 0 && ytdHistory[0].close && currentPrice) {
        ytdReturn = ((currentPrice - ytdHistory[0].close) / ytdHistory[0].close) * 100;
      }
      if (Array.isArray(yearHistory) && yearHistory.length > 0 && yearHistory[0].close && currentPrice) {
        oneYearReturn = ((currentPrice - yearHistory[0].close) / yearHistory[0].close) * 100;
      }
    } catch {
      // non-critical
    }

    return {
      ticker,
      price: q.regularMarketPrice ?? null,
      change: q.regularMarketChange ?? null,
      changePercent: q.regularMarketChangePercent ?? null,
      dividendYield: q.dividendYield ?? null,
      ytdReturn,
      oneYearReturn,
      error: false,
    };
  } catch {
    return {
      ticker,
      price: null,
      change: null,
      changePercent: null,
      dividendYield: null,
      ytdReturn: null,
      oneYearReturn: null,
      error: true,
    };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tickersParam = searchParams.get("tickers") || "VEQT.TO,XEQT.TO";
  const cacheKey = `compare_${tickersParam.replace(/[,.\s]/g, "_")}`;

  const tickers = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase())
    .filter((t) => ALLOWED_TICKERS.includes(t));

  if (tickers.length === 0) {
    return NextResponse.json(
      { error: true, message: "No valid tickers provided" },
      { status: 400 }
    );
  }

  const results = await Promise.all(tickers.map(fetchQuote));

  const data: Record<string, FundQuote> = {};
  let hasAnyData = false;
  for (const result of results) {
    data[result.ticker] = result;
    if (!result.error) hasAnyData = true;
  }

  const response = { data, lastUpdated: new Date().toISOString() };

  // Cache if we got at least some real data
  if (hasAnyData) {
    writeCache(cacheKey, response);
  }

  // If all failed, try file cache
  if (!hasAnyData) {
    const cached = readCache<typeof response>(cacheKey);
    if (cached) {
      return NextResponse.json({ ...cached.data, lastUpdated: cached.timestamp });
    }
  }

  return NextResponse.json(response);
}
