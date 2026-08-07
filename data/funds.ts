export interface GeographyAllocation {
  region: string;
  weight: number;
  color: string;
}

export interface UnderlyingETF {
  ticker: string;
  name: string;
  weight: number;
  region: string;
}

export interface FundData {
  ticker: string;
  name: string;
  shortName: string;
  provider: string;
  mer: number;
  /** Annual management fee — the figure providers publish post-2025 fee cuts. */
  managementFee: number;
  aum: string;
  inceptionDate: string;
  numberOfHoldings: number;
  distributionFrequency: string;
  currency: string;
  exchangeListed: string;
  equityAllocation: number;
  fixedIncomeAllocation: number;
  description: string;
  whoThisSuits: string;
  geographyAllocation: GeographyAllocation[];
  underlyingETFs: UnderlyingETF[];
  chartColor: string;
  merFootnote?: string;
}

/**
 * Fund data last verified: August 6, 2026 (VEQT from the June 30, 2026 factsheet)
 * Sources: Vanguard Canada fact sheets, BlackRock Canada fact sheets, BMO ETF Centre
 *
 * UPDATE SCHEDULE: Quarterly (next: ~Nov 2026, on the Sep 30 factsheets)
 *
 * What to update each quarter:
 * 1. Allocation percentages — from each fund's product page
 * 2. Holdings count — from fact sheets
 * 3. AUM — from product pages
 * 4. Yield — from product pages
 * 5. Sector weightings — from fact sheets
 * 6. FUND_DATA_LAST_UPDATED constant below
 *
 * What to update only on announcement:
 * - MER / management fee changes (add to footnote with effective date)
 * - Distribution frequency changes
 */

/** ISO date of last fund data verification. Update quarterly. */
export const FUND_DATA_LAST_UPDATED = "2026-06-30";

export const FUNDS: Record<string, FundData> = {
  "VEQT.TO": {
    ticker: "VEQT.TO",
    name: "Vanguard All-Equity ETF Portfolio",
    shortName: "VEQT",
    provider: "Vanguard",
    mer: 0.22, // factsheet 2026-06-30: official MER 0.22% (as of Mar 31 2026, post fee cut)
    managementFee: 0.17, // Vanguard, eff. Nov 18 2025 (was 0.22%)
    aum: "$15.7B", // factsheet 2026-06-30: $15,671M
    inceptionDate: "2019-01-29",
    numberOfHoldings: 13743, // factsheet 2026-06-30
    distributionFrequency: "Annually",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "A single-ticket ETF providing 100% global equity exposure across Canada, US, international developed, and emerging markets.",
    whoThisSuits:
      "The original all-in-one equity ETF, built by the company that invented index investing. Broadest diversification (13,700+ holdings), market-cap-weighted global allocation, and backed by Vanguard's investor-owned structure.",
    // Sleeve weights from Vanguard's official June 30 2026 factsheet.
    // The four entries sum to 99.9 (Vanguard's own rounding).
    geographyAllocation: [
      { region: "United States", weight: 45.3, color: "#2563eb" },
      { region: "Canada", weight: 29.6, color: "#dc2626" },
      { region: "International Developed", weight: 17.9, color: "#16a34a" },
      { region: "Emerging Markets", weight: 7.1, color: "#f59e0b" },
    ],
    underlyingETFs: [
      { ticker: "VUN", name: "Vanguard US Total Market Index ETF", weight: 45.3, region: "United States" },
      { ticker: "VCN", name: "Vanguard FTSE Canada All Cap Index ETF", weight: 29.6, region: "Canada" },
      { ticker: "VIU", name: "Vanguard FTSE Developed All Cap ex North America Index ETF", weight: 17.9, region: "International" },
      { ticker: "VEE", name: "Vanguard FTSE Emerging Markets All Cap Index ETF", weight: 7.1, region: "Emerging Markets" },
    ],
    chartColor: "#dc2626",
    merFootnote:
      "Vanguard reduced VEQT's management fee from 0.22% to 0.17% effective November 18, 2025. The June 30, 2026 factsheet reports the official MER at 0.22% (annualized as of March 31, 2026) — the first fiscal recalculation to reflect the cut, down from 0.24%.",
  },
  "XEQT.TO": {
    ticker: "XEQT.TO",
    name: "iShares Core Equity ETF Portfolio",
    shortName: "XEQT",
    provider: "iShares (BlackRock)",
    mer: 0.20,
    managementFee: 0.17, // BlackRock, eff. Dec 18 2025 (was 0.18%)
    aum: "$14.7B",
    inceptionDate: "2019-08-07",
    numberOfHoldings: 8475, // iShares: underlying holdings as of May 29 2026
    distributionFrequency: "Quarterly",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "iShares' all-equity portfolio ETF offering global diversification with a slightly higher US allocation than VEQT.",
    whoThisSuits:
      "Investors who want more US tilt. Nearly identical to VEQT in cost and purpose.",
    geographyAllocation: [
      { region: "United States", weight: 45, color: "#2563eb" },
      { region: "Canada", weight: 25, color: "#dc2626" },
      { region: "International Developed", weight: 25, color: "#16a34a" },
      { region: "Emerging Markets", weight: 5, color: "#f59e0b" },
    ],
    underlyingETFs: [
      { ticker: "ITOT", name: "iShares Core S&P Total US Stock Market ETF", weight: 45, region: "United States" },
      { ticker: "XIC", name: "iShares Core S&P/TSX Capped Composite Index ETF", weight: 25, region: "Canada" },
      { ticker: "XEF", name: "iShares Core MSCI EAFE IMI Index ETF", weight: 25, region: "International" },
      { ticker: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", weight: 5, region: "Emerging Markets" },
    ],
    chartColor: "#2563eb",
    merFootnote:
      "XEQT's management fee was reduced from 0.18% to 0.17% in December 2025. The MER of 0.20% includes operating expenses.",
  },
  "ZEQT.TO": {
    ticker: "ZEQT.TO",
    name: "BMO All-Equity ETF",
    shortName: "ZEQT",
    provider: "BMO",
    mer: 0.18, // BMO factsheet (Apr 30 2026): audited MER 0.18%
    managementFee: 0.15, // BMO, cut Jun 2025
    aum: "$591M",
    inceptionDate: "2022-01-24",
    numberOfHoldings: 9000,
    distributionFrequency: "Quarterly",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "BMO's all-equity portfolio ETF offering global diversification with competitive fees and a similar allocation to XEQT.",
    whoThisSuits:
      "Newer alternative from BMO with competitive fees. Smaller AUM but growing. Good for BMO brokerage users.",
    geographyAllocation: [
      { region: "United States", weight: 45, color: "#2563eb" },
      { region: "Canada", weight: 25, color: "#dc2626" },
      { region: "International Developed", weight: 23, color: "#16a34a" },
      { region: "Emerging Markets", weight: 7, color: "#f59e0b" },
    ],
    underlyingETFs: [
      { ticker: "ZSP", name: "BMO S&P 500 Index ETF", weight: 45, region: "United States" },
      { ticker: "ZCN", name: "BMO S&P/TSX Capped Composite Index ETF", weight: 25, region: "Canada" },
      { ticker: "ZEA", name: "BMO MSCI EAFE Index ETF", weight: 23, region: "International" },
      { ticker: "ZEM", name: "BMO MSCI Emerging Markets Index ETF", weight: 7, region: "Emerging Markets" },
    ],
    chartColor: "#16a34a",
    merFootnote:
      "BMO cut ZEQT's management fee to 0.15% (effective June 2025). The MER was 0.18% as of the fund's last fiscal year.",
  },
  // The new entrant. Avantis (American Century subsidiary, founded 2019
  // by ex-DFA Co-CEO Eduardo Repetto) partnered with CIBC Asset Management
  // to bring Avantis's multi-factor academic strategy into a single
  // TSX-listed all-equity ticket, launched March 2026. Tilts toward
  // smaller-cap, value, and higher-profitability names away from the
  // mega-cap growth that dominates a market-cap index.
  //
  // Allocation figures from the Apr 30 2026 holdings disclosure — verify
  // against the current CIBC Asset Management fact sheet quarterly.
  "CAGE.TO": {
    ticker: "CAGE.TO",
    name: "Avantis CIBC All-Equity Asset Allocation ETF",
    shortName: "CAGE",
    provider: "Avantis × CIBC",
    mer: 0.28,
    managementFee: 0.28, // Avantis × CIBC; full MER pending (~0.30-0.40% expected)
    aum: "$267M",
    inceptionDate: "2026-03-18",
    numberOfHoldings: 4500,
    distributionFrequency: "Quarterly",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "An evidence-based, multi-factor all-equity ETF using Avantis's Fama-French-derived size, value, and profitability tilts inside a Canadian wrapper sub-advised by CIBC Asset Management.",
    whoThisSuits:
      "Investors who buy the academic case for the size, value, and profitability premia, and want a single-ticket all-equity portfolio without assembling factor sleeves themselves. Comfortable absorbing ~8-15bps of fee headwind over the index cohort as the price of an active factor engine, and willing to hold through multi-year stretches where the factors underperform.",
    geographyAllocation: [
      { region: "United States", weight: 40.1, color: "#2563eb" },
      { region: "Canada", weight: 30.7, color: "#dc2626" },
      { region: "International Developed", weight: 16.6, color: "#16a34a" },
      { region: "Emerging Markets", weight: 5.1, color: "#f59e0b" },
      { region: "Global Small-Cap Value", weight: 7.4, color: "#6a4b9c" },
    ],
    underlyingETFs: [
      { ticker: "CAUS", name: "Avantis CIBC U.S. All-Cap Equity ETF", weight: 40.1, region: "United States" },
      { ticker: "CACE", name: "Avantis CIBC Canadian Equity ETF", weight: 30.7, region: "Canada" },
      { ticker: "CADE", name: "Avantis CIBC International Equity ETF", weight: 16.6, region: "International" },
      { ticker: "CASV", name: "Avantis CIBC Global Small Cap Value ETF", weight: 7.4, region: "Global Small-Cap Value" },
      { ticker: "CAEM", name: "Avantis CIBC Emerging Markets Equity ETF", weight: 5.1, region: "Emerging Markets" },
    ],
    chartColor: "#6a4b9c",
    merFootnote:
      "0.28% management fee. Full MER not yet published — first-year reporting expected to land between 0.30%-0.40% once trading costs and operating expenses are recognized. Higher than the 0.17%-0.20% index cohort but lower than most traditional active strategies.",
  },
  "VGRO.TO": {
    ticker: "VGRO.TO",
    name: "Vanguard Growth ETF Portfolio",
    shortName: "VGRO",
    provider: "Vanguard",
    mer: 0.2,
    managementFee: 0.17, // Vanguard, eff. Nov 18 2025 (was 0.22%)
    aum: "$9.2B",
    inceptionDate: "2018-01-25",
    numberOfHoldings: 13700,
    distributionFrequency: "Quarterly",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 80,
    fixedIncomeAllocation: 20,
    description:
      "Vanguard's 80/20 growth portfolio — same global equity exposure as VEQT but with 20% Canadian and global bonds for reduced volatility.",
    whoThisSuits:
      "Investors who want built-in bond exposure (80/20 equity/bond split) for slightly less volatility than VEQT.",
    geographyAllocation: [
      { region: "United States", weight: 32, color: "#2563eb" },
      { region: "Canada", weight: 24, color: "#dc2626" },
      { region: "International Developed", weight: 18, color: "#16a34a" },
      { region: "Emerging Markets", weight: 5, color: "#f59e0b" },
      { region: "Bonds", weight: 21, color: "#6b7280" },
    ],
    underlyingETFs: [
      { ticker: "VUN", name: "Vanguard US Total Market Index ETF", weight: 32, region: "United States" },
      { ticker: "VCN", name: "Vanguard FTSE Canada All Cap Index ETF", weight: 24, region: "Canada" },
      { ticker: "VIU", name: "Vanguard FTSE Developed All Cap ex North America Index ETF", weight: 18, region: "International" },
      { ticker: "VEE", name: "Vanguard FTSE Emerging Markets All Cap Index ETF", weight: 5, region: "Emerging Markets" },
      { ticker: "VAB", name: "Vanguard Canadian Aggregate Bond Index ETF", weight: 12, region: "Canada (Bonds)" },
      { ticker: "VBG", name: "Vanguard Global ex-US Aggregate Bond Index ETF", weight: 9, region: "Global (Bonds)" },
    ],
    chartColor: "#8b5cf6",
    merFootnote:
      "Vanguard reduced VGRO's management fee from 0.22% to 0.17% in November 2025. The official MER is still reported as 0.24% pending fiscal year-end recalculation. The effective MER is expected to be approximately 0.19%–0.20%.",
  },
  "VFV.TO": {
    ticker: "VFV.TO",
    name: "Vanguard S&P 500 Index ETF",
    shortName: "VFV",
    provider: "Vanguard",
    mer: 0.09,
    managementFee: 0.08, // Vanguard
    aum: "$28.3B",
    inceptionDate: "2012-11-02",
    numberOfHoldings: 500,
    distributionFrequency: "Quarterly",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "A pure S&P 500 index fund offering exposure to the 500 largest US companies. Low cost but concentrated in one market.",
    whoThisSuits:
      "Investors who want pure US large-cap exposure. Lower fee but zero diversification outside the US.",
    geographyAllocation: [
      { region: "United States", weight: 100, color: "#2563eb" },
    ],
    underlyingETFs: [],
    chartColor: "#f59e0b",
    merFootnote:
      "VFV charges a 0.08% management fee; its MER is 0.09%. Cheaper than the all-in-one funds because it holds one market (the S&P 500), not the whole world.",
  },
  "VUN.TO": {
    ticker: "VUN.TO",
    name: "Vanguard U.S. Total Market Index ETF",
    shortName: "VUN",
    provider: "Vanguard",
    mer: 0.16,
    managementFee: 0.15, // Vanguard
    aum: "$8.5B",
    inceptionDate: "2013-08-02",
    numberOfHoldings: 3700,
    distributionFrequency: "Quarterly",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "A pure US total market index fund tracking the CRSP US Total Market Index. One of VEQT's four underlying ETFs, providing broad exposure to US large-, mid-, and small-cap stocks.",
    whoThisSuits:
      "Investors who want dedicated US equity exposure in Canadian dollars. Lower fee but zero diversification outside the US market.",
    geographyAllocation: [
      { region: "United States", weight: 100, color: "#2563eb" },
    ],
    underlyingETFs: [],
    chartColor: "#06b6d4",
    merFootnote:
      "VUN charges a 0.15% management fee; its MER is 0.16%. One of VEQT's four underlying building blocks (US total market).",
  },
};

export const FUND_TICKERS = Object.keys(FUNDS);
export const ALL_FUNDS = Object.values(FUNDS);

export function getFund(ticker: string): FundData | undefined {
  return FUNDS[ticker];
}
