import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";

const ALLOWED_SYMBOLS = ["VEQT", "XEQT", "ZEQT", "VGRO", "VFV", "VUN"];

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
    const quoteData = await getQuote(symbol);
    const currentPrice = quoteData.price;

    let ytdReturn: number | null = null;
    let oneYearReturn: number | null = null;

    try {
      const history = await getDailyHistory(symbol, "full");

      if (history.data.length > 0 && currentPrice > 0) {
        const yearStart = `${new Date().getFullYear()}-01-01`;
        const ytdStart = history.data.find((d) => d.date >= yearStart);
        if (ytdStart) {
          const sp = ytdStart.adjustedClose || ytdStart.close;
          if (sp > 0) ytdReturn = ((currentPrice - sp) / sp) * 100;
        }

        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const oneYearStr = oneYearAgo.toISOString().split("T")[0];
        const yearStart1Y = history.data.find((d) => d.date >= oneYearStr);
        if (yearStart1Y) {
          const sp = yearStart1Y.adjustedClose || yearStart1Y.close;
          if (sp > 0) oneYearReturn = ((currentPrice - sp) / sp) * 100;
        }
      }
    } catch {
      // non-critical
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
