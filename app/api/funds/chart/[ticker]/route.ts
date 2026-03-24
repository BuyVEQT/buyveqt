import { NextResponse } from "next/server";
import { getDailyHistory } from "@/lib/data";

const ALLOWED_TICKERS = ["VEQT", "XEQT", "ZEQT", "VGRO", "VFV", "VUN"];

function getStartDate(range: string): string {
  const now = new Date();
  switch (range) {
    case "1M":
      now.setMonth(now.getMonth() - 1);
      break;
    case "3M":
      now.setMonth(now.getMonth() - 3);
      break;
    case "6M":
      now.setMonth(now.getMonth() - 6);
      break;
    case "YTD":
      return `${now.getFullYear()}-01-01`;
    case "ALL":
      return "2012-01-01";
    case "1Y":
    default:
      now.setFullYear(now.getFullYear() - 1);
      break;
  }
  return now.toISOString().split("T")[0];
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const symbol = ticker.toUpperCase().replace(/\.TO$/, "");
  const displayTicker = `${symbol}.TO`;

  if (!ALLOWED_TICKERS.includes(symbol)) {
    return NextResponse.json(
      { error: true, message: "Unsupported ticker" },
      { status: 400 }
    );
  }

  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "1Y";

  // Longer ranges get longer cache
  const revalidateTime = ["6M", "1Y", "ALL"].includes(range) ? 86400 : 3600;

  try {
    const outputsize = range === "ALL" ? "full" : "compact";
    const historyData = await getDailyHistory(symbol, outputsize);

    const cutoff = getStartDate(range);
    const data = historyData.data
      .filter((d) => d.date >= cutoff)
      .map((d) => ({
        date: d.date,
        close: d.adjustedClose || d.close,
      }));

    return NextResponse.json(
      {
        ticker: displayTicker,
        range,
        data,
        source: historyData.source,
        error: false,
      },
      {
        headers: {
          "Cache-Control": `s-maxage=${revalidateTime}, stale-while-revalidate`,
        },
      }
    );
  } catch (error) {
    console.error(`Failed to fetch chart for ${displayTicker}:`, error);
    return NextResponse.json({
      ticker: displayTicker,
      range,
      data: [],
      error: true,
    });
  }
}
