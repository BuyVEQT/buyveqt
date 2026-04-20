import { NextResponse } from "next/server";
import { getQuote } from "@/lib/data";
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

export async function GET() {
  const etfs = ORDERED.map(
    (region) => UNDERLYING_ETFS.find((e) => e.region === region)!
  );

  const results = await Promise.allSettled(
    etfs.map((etf) => getQuote(etf.ticker))
  );

  const regions = etfs.map((etf, i) => {
    const result = results[i];
    const base = {
      ticker: etf.ticker,
      region: etf.region,
      label: REGION_LABELS[etf.region] ?? etf.region,
      weight: etf.weight,
      fullName: etf.name,
    };

    if (result.status !== "fulfilled") {
      return {
        ...base,
        price: null,
        change: null,
        changePercent: null,
        contribution: null,
        error: true,
      };
    }

    const q = result.value;
    return {
      ...base,
      price: q.price,
      change: q.change,
      changePercent: q.changePercent,
      contribution: (q.changePercent * etf.weight) / 100,
      error: false,
    };
  });

  return NextResponse.json({
    regions,
    fetchedAt: new Date().toISOString(),
  });
}
