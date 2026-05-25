/**
 * Static sleeve top-holdings snapshot used as a fallback when the live
 * /api/sleeve-composition hook returns nothing or has no per-holding data.
 * Mirrors the shape of data/sleeve-sector-snapshot-2026-q1.ts.
 *
 * Source: Vanguard Canada factsheet Q1 2026 + underlying ETF fact sheets.
 * Update quarterly when new factsheets arrive.
 */

export interface HoldingMini {
  name: string;
  ticker: string;
  /** Weight as a percentage of the sleeve (e.g. 7.2 = 7.2%). */
  weight: number;
}

export const SLEEVE_TOP_HOLDINGS_2026_Q1: Record<string, HoldingMini[]> = {
  VUN: [
    { name: "Apple Inc.",      ticker: "AAPL", weight: 7.2 },
    { name: "Microsoft Corp.", ticker: "MSFT", weight: 6.5 },
    { name: "NVIDIA Corp.",    ticker: "NVDA", weight: 5.4 },
  ],
  VCN: [
    { name: "Royal Bank of Canada",  ticker: "RY",   weight: 6.1 },
    { name: "Toronto-Dominion Bank", ticker: "TD",   weight: 4.7 },
    { name: "Shopify Inc.",          ticker: "SHOP", weight: 3.0 },
  ],
  VIU: [
    { name: "Novo Nordisk",  ticker: "NVO",  weight: 1.9 },
    { name: "ASML Holding",  ticker: "ASML", weight: 1.6 },
    { name: "Nestlé S.A.",   ticker: "NESN", weight: 1.5 },
  ],
  VEE: [
    { name: "Taiwan Semiconductor", ticker: "TSM",    weight: 7.1 },
    { name: "Tencent Holdings",     ticker: "0700",   weight: 4.3 },
    { name: "Samsung Electronics",  ticker: "005930", weight: 3.6 },
  ],
};

/** ISO period for the snapshot. Bump whenever values change. */
export const SLEEVE_TOP_HOLDINGS_AS_OF = "2026-Q1";
