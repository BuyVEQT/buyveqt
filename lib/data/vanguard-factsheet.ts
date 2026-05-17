/**
 * Vanguard quarterly factsheet parser — fetches the official VIU/VEE/
 * VUN/VCN PDF factsheets from `fund-docs.vanguard.com` and pulls out
 * the sector and country breakdowns.
 *
 * Why this exists: Yahoo's `quoteSummary.topHoldings` exposes sector
 * weights but no country breakdowns, leaving VIU and VEE on a hardcoded
 * fallback in v1. Vanguard's static PDF host serves the official
 * quarterly factsheet with both tables in a clean, line-delimited layout
 * on page 2. Parsed once a day (revalidate 24h), it's authoritative and
 * unrate-limited — no API key, no auth.
 *
 * Uses `unpdf` (a serverless-friendly pdfjs build) so the parse runs
 * inside Next.js's server route without external worker files.
 *
 * Sector names in the PDF are ICB ("Basic Materials", "Telecommunications");
 * we normalize to the display names already used by the proxy-ETF map
 * so the join in RegionDrilldown stays straightforward.
 *
 * If the PDF fetch or parse fails for any reason — URL drift, format
 * change, network — the caller falls back to Yahoo (existing path) and
 * then to the hardcoded snapshot. Three tiers; the UI shows the
 * resulting source so readers know what they're looking at.
 */
import { extractText, getDocumentProxy } from 'unpdf';

const FACTSHEET_URLS: Record<string, string> = {
  VUN: 'https://fund-docs.vanguard.com/VUN_U.S._Total_Market_Index_ETF_9557_FS_EN_CA.pdf',
  VCN: 'https://fund-docs.vanguard.com/VCN_FTSE_Canada_All_Cap_Index_ETF_9561_FS_EN_CA.pdf',
  VIU: 'https://fund-docs.vanguard.com/VIU_FTSE_Developed_All_Cap_ex_North_America_Index_ETF_9569_FS_EN_CA.pdf',
  VEE: 'https://fund-docs.vanguard.com/VEE_FTSE_Emerging_Markets_All_Cap_Index_ETF_9556_FS_EN_CA.pdf',
};

const FETCH_TIMEOUT_MS = 15000;

/** Map Vanguard's ICB sector names to the display names used elsewhere
 *  (proxy-etfs.ts, region-drilldown.ts) so the join survives. */
const SECTOR_NAME_NORMALIZE: Record<string, string> = {
  'Basic Materials': 'Materials',
  Telecommunications: 'Communication Services',
};

/** Vanguard uses "Korea"; the proxy ETF map uses "South Korea". A
 *  handful of similar shorthand differences live here. */
const COUNTRY_NAME_NORMALIZE: Record<string, string> = {
  Korea: 'South Korea',
};

export interface FactsheetItem {
  name: string;
  weight: number; // integer percent
}

export interface FactsheetData {
  ticker: string;
  sectors: FactsheetItem[];
  countries: FactsheetItem[];
  /** "March 31, 2026" from the factsheet header; null if not found. */
  asOfDate: string | null;
  source: 'vanguard-factsheet';
  fetchedAt: string;
}

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const t = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  return Promise.race([p, t]).finally(() => clearTimeout(timer));
}

/**
 * Extract a table that lives between `headerLabel` and the next
 * "Total" row. Each row in the factsheet looks like:
 *
 *   Name X.X% Y.Y%
 *
 * where the first percent is the fund weight and the second is the
 * benchmark weight. We keep the fund weight and drop the benchmark.
 */
function parseTable(
  pageText: string,
  headerLabel: string,
  normalize: Record<string, string>
): FactsheetItem[] {
  const start = pageText.indexOf(headerLabel);
  if (start === -1) return [];

  // Cut the slice from headerLabel through the next "Total" line.
  const afterHeader = pageText.slice(start);
  const totalMatch = afterHeader.match(/\nTotal\s+\d/);
  const slice = totalMatch
    ? afterHeader.slice(0, totalMatch.index)
    : afterHeader;

  const out: FactsheetItem[] = [];
  // Each row: "Name X.X% Y.Y%". Name can contain spaces, dots, and
  // hyphens. Two percents follow; we keep the first.
  const rowRe = /^([A-Z][A-Za-z &.\-]+?)\s+(\d+(?:\.\d+)?)%\s+\d+(?:\.\d+)?%/gm;
  let m: RegExpExecArray | null;
  while ((m = rowRe.exec(slice)) !== null) {
    const rawName = m[1].trim();
    // Skip the column header line ("VIU Benchmark") which falls
    // through if the ticker happens to start with a capital — it won't
    // match because there's no "%" on that line, but defensive guard.
    if (rawName === 'Other') continue;
    const weight = parseFloat(m[2]);
    if (!Number.isFinite(weight) || weight <= 0) continue;
    const displayName = normalize[rawName] ?? rawName;
    const existing = out.find((it) => it.name === displayName);
    if (existing) {
      existing.weight = Math.round((existing.weight + weight) * 10) / 10;
    } else {
      out.push({ name: displayName, weight });
    }
  }
  // Round to integer % to match the existing UI convention.
  return out.map((it) => ({ name: it.name, weight: Math.round(it.weight) }));
}

function extractAsOfDate(text: string): string | null {
  const m = text.match(
    /Factsheet\s*\|\s*([A-Z][a-z]+\s+\d{1,2},\s*\d{4})/
  );
  return m?.[1] ?? null;
}

/**
 * Fetch and parse the Vanguard factsheet PDF for a sleeve. Returns
 * null on any failure — caller decides whether to fall back.
 */
export async function getFactsheet(
  ticker: string
): Promise<FactsheetData | null> {
  const url = FACTSHEET_URLS[ticker];
  if (!url) return null;

  try {
    const res = await withTimeout(
      fetch(url, {
        headers: {
          // Vanguard's CDN returns 403 to default Node/curl UAs. A
          // real-browser UA gets a clean 200.
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          Accept: 'application/pdf',
        },
        // Fetch-layer cache reduces upstream calls when ISR rebuilds.
        next: { revalidate: 900 },
      } as RequestInit & { next: { revalidate: number } }),
      FETCH_TIMEOUT_MS,
      `Vanguard factsheet ${ticker}`
    );

    if (!res.ok) {
      console.warn(
        `[VanguardFactsheet] ${ticker} HTTP ${res.status} from ${url}`
      );
      return null;
    }

    const buf = new Uint8Array(await res.arrayBuffer());
    const pdf = await getDocumentProxy(buf);
    const { text } = await extractText(pdf, { mergePages: false });

    if (!Array.isArray(text) || text.length === 0) {
      console.warn(`[VanguardFactsheet] ${ticker} no page text extracted`);
      return null;
    }

    // The sector / country tables live on page 2; the date is on every
    // page header. Concatenate as a fallback so we still find tables if
    // Vanguard ever changes the page ordering.
    const allText = text.join('\n\n');

    const sectors = parseTable(
      allText,
      'Sector weighting',
      SECTOR_NAME_NORMALIZE
    );
    const countries = parseTable(
      allText,
      'Market allocation',
      COUNTRY_NAME_NORMALIZE
    );

    if (sectors.length === 0 && countries.length === 0) {
      console.warn(
        `[VanguardFactsheet] ${ticker} parsed no tables — PDF layout may have changed`
      );
      return null;
    }

    return {
      ticker,
      sectors,
      countries,
      asOfDate: extractAsOfDate(allText),
      source: 'vanguard-factsheet',
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.warn(
      `[VanguardFactsheet] ${ticker} fetch/parse failed:`,
      error instanceof Error ? error.message : error
    );
    return null;
  }
}
