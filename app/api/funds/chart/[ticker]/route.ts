import { NextResponse } from "next/server";
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["ripHistorical", "yahooSurvey"] });

const ALLOWED_TICKERS = ["VEQT.TO", "XEQT.TO", "ZEQT.TO", "VGRO.TO", "VFV.TO"];

function getStartDate(range: string): Date {
  const now = new Date();
  switch (range) {
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3M":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "YTD":
      return new Date(now.getFullYear(), 0, 1);
    case "ALL":
      return new Date(2012, 0, 1);
    case "1Y":
    default:
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  }
}

export async function GET(
  request: Request,
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

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "1Y";

  // Longer ranges get longer cache
  const revalidateTime = ["6M", "1Y", "ALL"].includes(range) ? 3600 : 1800;

  try {
    const interval = range === "ALL" ? ("1wk" as const) : ("1d" as const);

    const historicalResult = await yf.historical(normalizedTicker, {
      period1: getStartDate(range),
      period2: new Date(),
      interval,
    });

    const data = (Array.isArray(historicalResult) ? historicalResult : []).map(
      (d: { date: Date; close?: number | null }) => ({
        date: d.date.toISOString().split("T")[0],
        close: d.close ?? 0,
      })
    );

    return NextResponse.json(
      { ticker: normalizedTicker, range, data, error: false },
      {
        headers: {
          "Cache-Control": `s-maxage=${revalidateTime}, stale-while-revalidate`,
        },
      }
    );
  } catch (error) {
    console.error(`Failed to fetch chart for ${normalizedTicker}:`, error);
    return NextResponse.json({
      ticker: normalizedTicker,
      range,
      data: [],
      error: true,
    });
  }
}
