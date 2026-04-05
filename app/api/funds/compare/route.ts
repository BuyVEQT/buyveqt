import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";
import { ALLOWED_SYMBOLS } from "@/lib/data/symbols";
import { computeReturn, ytdCutoff, oneYearAgoCutoff } from "@/lib/data/returns";

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

interface FundQuote {
  ticker: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  dividendYield: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  source?: string;
  error: boolean;
}

async function fetchQuote(symbol: string): Promise<FundQuote> {
  const displayTicker = `${symbol}.TO`;
  try {
    // Parallelize — quote and history are independent
    const [quoteResult, historyResult] = await Promise.allSettled([
      getQuote(symbol),
      getDailyHistory(symbol, "full"),
    ]);

    if (quoteResult.status !== "fulfilled") throw quoteResult.reason;
    const quoteData = quoteResult.value;
    const history = historyResult.status === "fulfilled" ? historyResult.value : null;

    let ytdReturn: number | null = null;
    let oneYearReturn: number | null = null;
    if (history) {
      ytdReturn = computeReturn(history.data, quoteData.price, ytdCutoff());
      oneYearReturn = computeReturn(history.data, quoteData.price, oneYearAgoCutoff());
    }

    return {
      ticker: displayTicker,
      price: quoteData.price,
      change: quoteData.change,
      changePercent: quoteData.changePercent,
      dividendYield: quoteData.dividendYield || null,
      ytdReturn,
      oneYearReturn,
      source: quoteData.source,
      error: false,
    };
  } catch {
    return {
      ticker: displayTicker,
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

  const symbols = tickersParam
    .split(",")
    .map((t) => t.trim().toUpperCase().replace(/\.TO$/, ""))
    .filter((s) => ALLOWED_SYMBOLS.includes(s));

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: true, message: "No valid tickers provided" },
      { status: 400 }
    );
  }

  const results = await Promise.all(symbols.map(fetchQuote));

  const data: Record<string, FundQuote> = {};
  for (const result of results) {
    data[result.ticker] = result;
  }

  const response = { data, lastUpdated: new Date().toISOString() };

  return NextResponse.json(response);
}
