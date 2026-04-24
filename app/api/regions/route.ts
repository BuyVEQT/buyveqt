import { NextResponse } from "next/server";
import { getQuote, getDailyHistory } from "@/lib/data";
import { UNDERLYING_ETFS } from "@/lib/constants";

export const revalidate = 300;

const REGION_LABELS: Record<string, string> = {
  US: "United States",
  Canada: "Canada",
  International: "Int'l Developed",
  "Emerging Markets": "Emerging Markets",
};

// Fixed render order — Canada first (home market), then US, Int'l, EM.
const ORDERED = ["Canada", "US", "International", "Emerging Markets"];

// How many trailing sessions to return for each region's sparkline. Keeping
// this tight (~30 trading days ≈ 6 weeks) because the sparkline's job is
// "how does today feel vs. the past month," not long-horizon context.
const SPARKLINE_SESSIONS = 30;

export interface RegionSparkPoint {
  date: string;
  close: number;
}

export async function GET() {
  const etfs = ORDERED.map(
    (region) => UNDERLYING_ETFS.find((e) => e.region === region)!
  );

  // Quote + 1-month history per sleeve, all fetched in parallel. One failure
  // does not drag the others down.
  const quoteResults = await Promise.allSettled(
    etfs.map((etf) => getQuote(etf.ticker))
  );
  const historyResults = await Promise.allSettled(
    etfs.map((etf) => getDailyHistory(etf.ticker, "compact"))
  );

  const regions = etfs.map((etf, i) => {
    const quoteResult = quoteResults[i];
    const historyResult = historyResults[i];
    const base = {
      ticker: etf.ticker,
      region: etf.region,
      label: REGION_LABELS[etf.region] ?? etf.region,
      weight: etf.weight,
      fullName: etf.name,
    };

    // History may arrive even if the live quote fails — and vice versa.
    // Render what we have, leave the rest null.
    let history: RegionSparkPoint[] = [];
    if (historyResult.status === "fulfilled" && historyResult.value) {
      const { data } = historyResult.value;
      history = data
        .slice(-SPARKLINE_SESSIONS)
        .map((d) => ({ date: d.date, close: d.adjustedClose || d.close }))
        .filter((d) => Number.isFinite(d.close) && d.close > 0);
    }

    if (quoteResult.status !== "fulfilled") {
      return {
        ...base,
        price: null,
        change: null,
        changePercent: null,
        contribution: null,
        history,
        error: true,
      };
    }

    const q = quoteResult.value;
    return {
      ...base,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      contribution: (q.changePercent * etf.weight) / 100,
      history,
      error: false,
    };
  });

  return NextResponse.json({
    regions,
    fetchedAt: new Date().toISOString(),
  });
}
