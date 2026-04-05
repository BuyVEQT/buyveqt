import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";

const ALLOWED_TICKERS = ["VEQT", "XEQT", "ZEQT", "VGRO", "XGRO", "VFV", "VUN"];

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  // Normalize: strip .TO if present to get base symbol
  const symbol = ticker.toUpperCase().replace(/\.TO$/, "");
  const displayTicker = `${symbol}.TO`;

  if (!ALLOWED_TICKERS.includes(symbol)) {
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
      const currentPrice = quoteData.price;

      if (history.data.length > 0 && currentPrice > 0) {
        const yearStart = new Date(new Date().getFullYear(), 0, 1)
          .toISOString()
          .split("T")[0];
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
