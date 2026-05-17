/**
 * Live sleeve composition — sector weights for VUN/VCN, country weights
 * for VIU/VEE. Three-tier resolution per sleeve:
 *
 *   1. Vanguard's official quarterly factsheet PDF (authoritative,
 *      contains both sector AND country tables, refreshed quarterly).
 *   2. Yahoo `quoteSummary.topHoldings.sectorWeightings` — covers
 *      sectors only; useful when the PDF route is unavailable.
 *   3. Hardcoded snapshot in data/sleeve-composition.ts.
 *
 * The response includes a `source` per sleeve so the UI can tell the
 * reader which tier was used, plus `asOfDate` from the factsheet
 * header when tier 1 succeeded.
 */
import { NextResponse } from 'next/server';
import { getSectorWeightsYahoo } from '@/lib/data/yahoo-fallback';
import { getFactsheet } from '@/lib/data/vanguard-factsheet';
import {
  SLEEVE_COMPOSITIONS,
  type CompositionItem,
} from '@/data/sleeve-composition';

export const revalidate = 86400; // 24h — composition drifts on a quarterly cadence

type Ticker = 'VUN' | 'VCN' | 'VIU' | 'VEE';
type SleeveSource = 'vanguard-factsheet' | 'yahoo-finance' | 'fallback';

interface SleeveSpec {
  ticker: Ticker;
  breakdownType: 'sector' | 'country';
  breakdownLabel: string;
  yahooTickers: string[]; // tried only when factsheet path fails
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
    yahooTickers: [], // Yahoo doesn't expose country weights
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
      source: SleeveSource;
      /** "March 31, 2026" when the factsheet path succeeded; null otherwise. */
      asOfDate: string | null;
      proxyTicker: string | null;
    }
  >;
  fetchedAt: string;
}

function topN(items: CompositionItem[]): {
  items: CompositionItem[];
  other: number;
} {
  const sorted = items
    .filter((it) => it.weight > 0)
    .slice()
    .sort((a, b) => b.weight - a.weight);
  const top = sorted.slice(0, TOP_N);
  const remainderPct = 100 - top.reduce((sum, it) => sum + it.weight, 0);
  return { items: top, other: Math.max(0, remainderPct) };
}

function topNFromFractions(weights: Record<string, number>): {
  items: CompositionItem[];
  other: number;
} {
  // Yahoo returns fractions 0..1 — convert to integer % first.
  const asItems = Object.entries(weights).map(([name, w]) => ({
    name,
    weight: Math.round(w * 100),
  }));
  return topN(asItems);
}

async function loadSleeve(spec: SleeveSpec) {
  // Tier 1 — Vanguard factsheet PDF. Pick sectors or countries based
  // on the sleeve's breakdownType.
  const factsheet = await getFactsheet(spec.ticker);
  if (factsheet) {
    const source =
      spec.breakdownType === 'sector' ? factsheet.sectors : factsheet.countries;
    if (source.length > 0) {
      const { items, other } = topN(source);
      return {
        ticker: spec.ticker,
        breakdownType: spec.breakdownType,
        breakdownLabel: spec.breakdownLabel,
        items,
        other,
        source: 'vanguard-factsheet' as const,
        asOfDate: factsheet.asOfDate,
        proxyTicker: null,
      };
    }
  }

  // Tier 2 — Yahoo (sectors only).
  for (const yahooTicker of spec.yahooTickers) {
    const data = await getSectorWeightsYahoo(yahooTicker);
    if (data) {
      const { items, other } = topNFromFractions(data.weights);
      if (items.length > 0) {
        return {
          ticker: spec.ticker,
          breakdownType: spec.breakdownType,
          breakdownLabel: spec.breakdownLabel,
          items,
          other,
          source: 'yahoo-finance' as const,
          asOfDate: null,
          proxyTicker: yahooTicker,
        };
      }
    }
  }

  // Tier 3 — hardcoded snapshot.
  const cached = SLEEVE_COMPOSITIONS[spec.ticker];
  return {
    ticker: spec.ticker,
    breakdownType: spec.breakdownType,
    breakdownLabel: spec.breakdownLabel,
    items: cached?.items ?? [],
    other: cached?.other ?? 0,
    source: 'fallback' as const,
    asOfDate: null,
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
