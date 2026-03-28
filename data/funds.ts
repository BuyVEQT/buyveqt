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

export const FUNDS: Record<string, FundData> = {
  "VEQT.TO": {
    ticker: "VEQT.TO",
    name: "Vanguard All-Equity ETF Portfolio",
    shortName: "VEQT",
    provider: "Vanguard",
    mer: 0.2,
    aum: "$11.2B",
    inceptionDate: "2019-01-29",
    numberOfHoldings: 13700,
    distributionFrequency: "Annually",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "A single-ticket ETF providing 100% global equity exposure across Canada, US, international developed, and emerging markets.",
    whoThisSuits:
      "The original all-in-one equity ETF, built by the company that invented index investing. Broadest diversification (13,700+ holdings), market-cap-weighted global allocation, and backed by Vanguard's investor-owned structure.",
    geographyAllocation: [
      { region: "United States", weight: 40, color: "#2563eb" },
      { region: "Canada", weight: 30, color: "#dc2626" },
      { region: "International Developed", weight: 23, color: "#16a34a" },
      { region: "Emerging Markets", weight: 7, color: "#f59e0b" },
    ],
    underlyingETFs: [
      { ticker: "VUN", name: "Vanguard US Total Market Index ETF", weight: 40, region: "United States" },
      { ticker: "VCN", name: "Vanguard FTSE Canada All Cap Index ETF", weight: 30, region: "Canada" },
      { ticker: "VIU", name: "Vanguard FTSE Developed All Cap ex North America Index ETF", weight: 23, region: "International" },
      { ticker: "VEE", name: "Vanguard FTSE Emerging Markets All Cap Index ETF", weight: 7, region: "Emerging Markets" },
    ],
    chartColor: "#dc2626",
    merFootnote:
      "Vanguard reduced VEQT's management fee from 0.22% to 0.17% in November 2025. The official MER is still reported as 0.24% pending fiscal year-end recalculation. The effective MER is expected to be ~0.19%–0.20%.",
  },
  "XEQT.TO": {
    ticker: "XEQT.TO",
    name: "iShares Core Equity ETF Portfolio",
    shortName: "XEQT",
    provider: "iShares (BlackRock)",
    mer: 0.20,
    aum: "$9.5B",
    inceptionDate: "2019-08-07",
    numberOfHoldings: 9300,
    distributionFrequency: "Annually",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 100,
    fixedIncomeAllocation: 0,
    description:
      "iShares' all-equity portfolio ETF offering global diversification with a slightly higher US allocation than VEQT.",
    whoThisSuits:
      "Investors who want slightly lower fees with more US tilt. Nearly identical to VEQT in purpose.",
    geographyAllocation: [
      { region: "United States", weight: 45, color: "#2563eb" },
      { region: "Canada", weight: 25, color: "#dc2626" },
      { region: "International Developed", weight: 22, color: "#16a34a" },
      { region: "Emerging Markets", weight: 8, color: "#f59e0b" },
    ],
    underlyingETFs: [
      { ticker: "ITOT", name: "iShares Core S&P Total US Stock Market ETF", weight: 45, region: "United States" },
      { ticker: "XIC", name: "iShares Core S&P/TSX Capped Composite Index ETF", weight: 25, region: "Canada" },
      { ticker: "XEF", name: "iShares Core MSCI EAFE IMI Index ETF", weight: 22, region: "International" },
      { ticker: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", weight: 8, region: "Emerging Markets" },
    ],
    chartColor: "#2563eb",
    merFootnote:
      "XEQT's management fee is 0.18%. The MER of 0.20% includes operating expenses.",
  },
  "ZEQT.TO": {
    ticker: "ZEQT.TO",
    name: "BMO All-Equity ETF",
    shortName: "ZEQT",
    provider: "BMO",
    mer: 0.20,
    aum: "$1.2B",
    inceptionDate: "2022-02-15",
    numberOfHoldings: 9000,
    distributionFrequency: "Annually",
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
  },
  "VGRO.TO": {
    ticker: "VGRO.TO",
    name: "Vanguard Growth ETF Portfolio",
    shortName: "VGRO",
    provider: "Vanguard",
    mer: 0.2,
    aum: "$6.5B",
    inceptionDate: "2018-01-25",
    numberOfHoldings: 13700,
    distributionFrequency: "Annually",
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
      "Vanguard's November 2025 fee cuts applied to its asset allocation ETFs, including VGRO. The effective MER is expected to decrease from 0.24% to approximately 0.20%.",
  },
  "XGRO.TO": {
    ticker: "XGRO.TO",
    name: "iShares Core Growth ETF Portfolio",
    shortName: "XGRO",
    provider: "iShares (BlackRock)",
    mer: 0.20,
    aum: "$2.5B",
    inceptionDate: "2007-06-21",
    numberOfHoldings: 9300,
    distributionFrequency: "Quarterly",
    currency: "CAD",
    exchangeListed: "TSX",
    equityAllocation: 80,
    fixedIncomeAllocation: 20,
    description:
      "iShares' 80/20 growth portfolio — global equity exposure with a 20% bond allocation for reduced volatility. The iShares counterpart to Vanguard's VGRO.",
    whoThisSuits:
      "Investors with medium-to-long horizons (5–20 years) who want growth but prefer a smoother ride, or anyone who knows they'd panic-sell in a steep downturn.",
    geographyAllocation: [
      { region: "United States", weight: 36, color: "#2563eb" },
      { region: "Canada", weight: 20, color: "#dc2626" },
      { region: "International Developed", weight: 20, color: "#16a34a" },
      { region: "Emerging Markets", weight: 4, color: "#f59e0b" },
      { region: "Bonds", weight: 20, color: "#6b7280" },
    ],
    underlyingETFs: [
      { ticker: "ITOT", name: "iShares Core S&P Total US Stock Market ETF", weight: 36, region: "United States" },
      { ticker: "XIC", name: "iShares Core S&P/TSX Capped Composite Index ETF", weight: 20, region: "Canada" },
      { ticker: "IEFA", name: "iShares Core MSCI EAFE ETF", weight: 20, region: "International" },
      { ticker: "IEMG", name: "iShares Core MSCI Emerging Markets ETF", weight: 4, region: "Emerging Markets" },
      { ticker: "XSAB", name: "iShares Core Canadian Short Term Bond Index ETF", weight: 20, region: "Canada (Bonds)" },
    ],
    chartColor: "#e11d48",
    merFootnote:
      "XGRO's management fee is 0.18%. The MER of 0.20% includes operating expenses.",
  },
  "VFV.TO": {
    ticker: "VFV.TO",
    name: "Vanguard S&P 500 Index ETF",
    shortName: "VFV",
    provider: "Vanguard",
    mer: 0.09,
    aum: "$11B",
    inceptionDate: "2012-11-02",
    numberOfHoldings: 500,
    distributionFrequency: "Annually",
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
  },
  "VUN.TO": {
    ticker: "VUN.TO",
    name: "Vanguard U.S. Total Market Index ETF",
    shortName: "VUN",
    provider: "Vanguard",
    mer: 0.16,
    aum: "$8.5B",
    inceptionDate: "2013-08-02",
    numberOfHoldings: 3700,
    distributionFrequency: "Annually",
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
  },
};

export const FUND_TICKERS = Object.keys(FUNDS);
export const ALL_FUNDS = Object.values(FUNDS);

export function getFund(ticker: string): FundData | undefined {
  return FUNDS[ticker];
}
