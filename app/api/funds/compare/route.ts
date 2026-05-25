import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";
import { ALLOWED_SYMBOLS } from "@/lib/data/symbols";
import { computeReturn, ytdCutoff, oneYearAgoCutoff } from "@/lib/data/returns";
import { computeRiskMetrics, type RiskMetrics } from "@/lib/risk-metrics";

export const revalidate = 300; // 5 minutes — Yahoo is free, refresh frequently

/** Five-year-ago cutoff string, e.g. "2021-04-05" */
function fiveYearAgoCutoff(): string {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 5);
  return d.toISOString().split("T")[0];
}

interface FundQuote {
  ticker: string;
  price: number | null;
  change: number | null;
  changePercent: number | null;
  dividendYield: number | null;
  ytdReturn: number | null;
  oneYearReturn: number | null;
  /** Five-year total return, or null if not enough history. */
  fiveYearReturn: number | null;
  /**
   * Drawdown / recovery measured over the fund's full available
   * history. Null if history is too short (< 30 sessions) to be
   * meaningful, or if the history fetch failed.
   */
  risk: RiskMetrics | null;
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
    let fiveYearReturn: number | null = null;
    let risk: RiskMetrics | null = null;
    if (history) {
      ytdReturn = computeReturn(history.data, quoteData.price, ytdCutoff());
      oneYearReturn = computeReturn(history.data, quoteData.price, oneYearAgoCutoff());
      fiveYearReturn = computeReturn(history.data, quoteData.price, fiveYearAgoCutoff());
      // Drawdown/recovery uses adjusted closes so dividends don't
      // manufacture phantom drops. Series is already oldest-first.
      risk = computeRiskMetrics(
        history.data.map((d) => ({
          date: d.date,
          close: d.adjustedClose || d.close,
        }))
      );
    }

    return {
      ticker: displayTicker,
      price: quoteData.price,
      change: quoteData.change,
      changePercent: quoteData.changePercent,
      dividendYield: quoteData.dividendYield || null,
      ytdReturn,
      oneYearReturn,
      fiveYearReturn,
      risk,
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
      fiveYearReturn: null,
      risk: null,
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
