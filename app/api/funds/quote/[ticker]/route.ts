import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";
import { ALLOWED_SYMBOLS } from "@/lib/data/symbols";
import { computeReturn, ytdCutoff, oneYearAgoCutoff } from "@/lib/data/returns";

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  // Normalize: strip .TO if present to get base symbol
  const symbol = ticker.toUpperCase().replace(/\.TO$/, "");
  const displayTicker = `${symbol}.TO`;

  if (!ALLOWED_SYMBOLS.includes(symbol)) {
    return NextResponse.json(
      { error: true, message: "Unsupported ticker" },
      { status: 400 }
    );
  }

  try {
    const quoteData = await getQuote(symbol);

    // Calculate YTD and 1Y returns from history
    let ytdReturn: number | null = null;
    let oneYearReturn: number | null = null;

    try {
      const history = await getDailyHistory(symbol, "full");
      ytdReturn = computeReturn(history.data, quoteData.price, ytdCutoff());
      oneYearReturn = computeReturn(history.data, quoteData.price, oneYearAgoCutoff());
    } catch {
      // non-critical
    }

    const response = {
      ticker: displayTicker,
      price: quoteData.price,
      change: quoteData.change,
      changePercent: quoteData.changePercent,
      fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh || null,
      fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow || null,
      dividendYield: quoteData.dividendYield || null,
      ytdReturn,
      oneYearReturn,
      lastUpdated: quoteData.fetchedAt,
      source: quoteData.source,
      error: false,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error(`Failed to fetch quote for ${displayTicker}:`, error);
    return NextResponse.json({
      ticker: displayTicker,
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
