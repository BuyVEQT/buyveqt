import { AssetAllocation, VeqtQuote } from "./types";

export const VEQT_TICKER = "VEQT.TO";

export const STATIC_DATA = {
  mer: 0.2,
  aum: "$11.2B",
} as const;

export const MER_FOOTNOTE =
  "Vanguard reduced VEQT's management fee from 0.22% to 0.17% in November 2025. The official MER (which includes operating expenses and taxes) is still reported as 0.24% pending fiscal year-end recalculation. The effective MER is expected to be approximately 0.19%–0.20%.";

export const ASSET_ALLOCATION: AssetAllocation[] = [
  { name: "US", value: 40, color: "#2563eb" },
  { name: "Canada", value: 30, color: "#16a34a" },
  { name: "International", value: 23, color: "#f59e0b" },
  { name: "Emerging Markets", value: 7, color: "#8b5cf6" },
];

export const UNDERLYING_ETFS = [
  { ticker: "VUN", name: "US Total Market", region: "US", weight: 40 },
  { ticker: "VCN", name: "Canada All Cap", region: "Canada", weight: 30 },
  { ticker: "VIU", name: "Developed ex-NA", region: "International", weight: 23 },
  { ticker: "VEE", name: "Emerging Markets", region: "Emerging Markets", weight: 7 },
];

export const TOP_HOLDINGS = [
  { name: "Apple Inc.", weight: 4.2 },
  { name: "Microsoft Corp.", weight: 3.8 },
  { name: "Royal Bank of Canada", weight: 2.1 },
  { name: "Toronto-Dominion Bank", weight: 1.9 },
  { name: "Amazon.com Inc.", weight: 1.7 },
];

export const COMPARISON_DATA = {
  etfs: [
    {
      ticker: "VEQT",
      name: "Vanguard All-Equity ETF",
      mer: "~0.20%*",
      aum: "$11.2B",
      holdings: "13,500+",
      inception: "Jan 2019",
    },
    {
      ticker: "XEQT",
      name: "iShares Core Equity ETF",
      mer: "0.20%",
      aum: "$9.8B",
      holdings: "9,300+",
      inception: "Aug 2019",
    },
    {
      ticker: "ZEQT",
      name: "BMO All-Equity ETF",
      mer: "0.20%",
      aum: "$1.1B",
      holdings: "9,000+",
      inception: "Feb 2021",
    },
  ],
};

export const LATEST_DISTRIBUTION = {
  amount: "$0.76018",
  exDivDate: "Dec 30, 2025",
  payableDate: "Jan 7, 2026",
};

export const LEARN_ARTICLES = [
  {
    slug: "what-is-veqt",
    title: "What Is VEQT? A Simple Explanation",
    teaser: "A beginner-friendly explanation of what VEQT is, how it works, and why Canadian investors love it.",
  },
  {
    slug: "veqt-vs-xeqt",
    title: "VEQT vs XEQT: What's the Difference?",
    teaser: "The most common VEQT question, answered. Two similar ETFs — here's what actually differs.",
  },
  {
    slug: "veqt-in-tfsa-vs-rrsp-vs-non-registered",
    title: "VEQT in a TFSA vs RRSP vs Non-Registered",
    teaser: "Where should you hold VEQT? A plain-English breakdown of the tax implications for each account type.",
  },
];

export const FALLBACK_QUOTE: VeqtQuote = {
  price: 42.5,
  previousClose: 42.35,
  change: 0.15,
  changePercent: 0.35,
  dayHigh: 42.65,
  dayLow: 42.2,
  fiftyTwoWeekHigh: 45.12,
  fiftyTwoWeekLow: 36.88,
  dividendYield: 1.8,
  ytdReturn: null,
  volume: 250000,
  marketCap: 11200000000,
  currency: "CAD",
  exchange: "TSX",
  lastUpdated: new Date().toISOString(),
  isFallback: true,
};

export const CHART_PERIODS = [
  { key: "1M", label: "1M", months: 1 },
  { key: "3M", label: "3M", months: 3 },
  { key: "6M", label: "6M", months: 6 },
  { key: "YTD", label: "YTD", months: 0 },
  { key: "1Y", label: "1Y", months: 12 },
  { key: "3Y", label: "3Y", months: 36 },
  { key: "5Y", label: "5Y", months: 60 },
] as const;

export const DISCLAIMER =
  "This site is not affiliated with Vanguard Investments Canada Inc. Data provided for informational purposes only. Not financial advice. Past performance does not guarantee future results.";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" },
  { href: "/inside-veqt", label: "Inside VEQT" },
  { href: "/distributions", label: "Distributions" },
  { href: "/learn", label: "Learn" },
  { href: "/calculators", label: "Calculators" },
];
