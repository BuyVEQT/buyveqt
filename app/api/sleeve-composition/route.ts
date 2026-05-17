/**
 * Live sleeve composition — sector weights for VUN/VCN, country weights
 * for VIU/VEE. Pulled from Yahoo's `quoteSummary.topHoldings` for the
 * sector side, with fallback to US-equivalent ETFs when the .TO listing
 * returns empty. Country breakdowns aren't exposed by Yahoo's free API,
 * so VIU/VEE come from the hardcoded fact-sheet table for now and the
 * response flags the source so the UI can show a freshness signal.
 */
import { NextResponse } from 'next/server';
import { getSectorWeightsYahoo } from '@/lib/data/yahoo-fallback';
import {
  SLEEVE_COMPOSITIONS,
  type CompositionItem,
} from '@/data/sleeve-composition';

export const revalidate = 86400; // 24h — composition drifts on a quarterly cadence

interface SleeveSpec {
  ticker: 'VUN' | 'VCN' | 'VIU' | 'VEE';
  breakdownType: 'sector' | 'country';
  breakdownLabel: string;
  yahooTickers: string[]; // try in order
}

const SLEEVES: SleeveSpec[] = [
  {
    ticker: 'VUN',
    breakdownType: 'sector',
    breakdownLabel: 'Top sectors',
    yahooTickers: ['VUN.TO', 'VTI'],
  },
  {
    ticker: 'VCN',
    breakdownType: 'sector',
    breakdownLabel: 'Top sectors',
    yahooTickers: ['VCN.TO', 'XIC.TO'],
  },
  {
    ticker: 'VIU',
    breakdownType: 'country',
    breakdownLabel: 'Top countries',
    // Yahoo doesn't expose country weights — flag as 'fallback' so UI shows the date
    yahooTickers: [],
  },
  {
    ticker: 'VEE',
    breakdownType: 'country',
    breakdownLabel: 'Top countries',
    yahooTickers: [],
  },
];

const TOP_N = 5;

export interface SleeveCompositionResponse {
  sleeves: Record<
    string,
    {
      ticker: string;
      breakdownType: 'sector' | 'country';
      breakdownLabel: string;
      items: CompositionItem[];
      other: number;
      source: 'yahoo-finance' | 'fallback';
      proxyTicker: string | null;
    }
  >;
  fetchedAt: string;
}

function toTopN(weights: Record<string, number>): {
  items: CompositionItem[];
  other: number;
} {
  // Weights from Yahoo are fractions 0..1. Convert to whole-percent ints
  // (rounded) to match the existing UI convention.
  const sorted = Object.entries(weights)
    .map(([name, w]) => ({ name, weight: Math.round(w * 100) }))
    .filter((it) => it.weight > 0)
    .sort((a, b) => b.weight - a.weight);
  const top = sorted.slice(0, TOP_N);
  const remainderPct =
    100 - top.reduce((sum, it) => sum + it.weight, 0);
  return {
    items: top,
    other: Math.max(0, remainderPct),
  };
}

async function loadSleeve(spec: SleeveSpec) {
  for (const yahooTicker of spec.yahooTickers) {
    const data = await getSectorWeightsYahoo(yahooTicker);
    if (data) {
      const { items, other } = toTopN(data.weights);
      if (items.length > 0) {
        return {
          ticker: spec.ticker,
          breakdownType: spec.breakdownType,
          breakdownLabel: spec.breakdownLabel,
          items,
          other,
          source: 'yahoo-finance' as const,
          proxyTicker: yahooTicker,
        };
      }
    }
  }
  // Fall back to the hardcoded fact-sheet table.
  const cached = SLEEVE_COMPOSITIONS[spec.ticker];
  return {
    ticker: spec.ticker,
    breakdownType: spec.breakdownType,
    breakdownLabel: spec.breakdownLabel,
    items: cached?.items ?? [],
    other: cached?.other ?? 0,
    source: 'fallback' as const,
    proxyTicker: null,
  };
}

export async function GET() {
  const results = await Promise.all(SLEEVES.map(loadSleeve));
  const sleeves: SleeveCompositionResponse['sleeves'] = {};
  for (const r of results) sleeves[r.ticker] = r;
  return NextResponse.json({
    sleeves,
    fetchedAt: new Date().toISOString(),
  });
}
