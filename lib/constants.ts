import { AssetAllocation, VeqtQuote } from "./types";

export const VEQT_TICKER = "VEQT.TO";

export const STATIC_DATA = {
  mer: 0.2,
  aum: "$12.2B",
} as const;

export const MER_FOOTNOTE =
  "Vanguard reduced VEQT's management fee from 0.22% to 0.17% in November 2025. The official MER (which includes operating expenses and taxes) is still reported as 0.24% pending fiscal year-end recalculation. The effective MER is expected to be approximately 0.19%–0.20%.";

export const ASSET_ALLOCATION: AssetAllocation[] = [
  { name: "US", value: 43, color: "#2563eb" },
  { name: "Canada", value: 31, color: "#16a34a" },
  { name: "International", value: 18, color: "#f59e0b" },
  { name: "Emerging Markets", value: 7, color: "#8b5cf6" },
];

export const UNDERLYING_ETFS = [
  { ticker: "VUN", name: "US Total Market", region: "US", weight: 43 },
  { ticker: "VCN", name: "Canada All Cap", region: "Canada", weight: 31 },
  { ticker: "VIU", name: "Developed ex-NA", region: "International", weight: 18 },
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
      aum: "$12.2B",
      holdings: "13,700+",
      inception: "Jan 2019",
    },
    {
      ticker: "XEQT",
      name: "iShares Core Equity ETF",
      mer: "0.20%",
      aum: "$14.7B",
      holdings: "8,400+",
      inception: "Aug 2019",
    },
    {
      ticker: "ZEQT",
      name: "BMO All-Equity ETF",
      mer: "0.20%",
      aum: "$591M",
      holdings: "9,000+",
      inception: "Jan 2022",
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
    slug: "why-we-choose-veqt-over-xeqt",
    title: "Why We Choose VEQT Over XEQT",
    teaser: "VEQT and XEQT are close on paper. But the company behind VEQT, and how it's built, make the difference.",
    editorial: true,
  },
  {
    slug: "passive-investing-behavioral-edge",
    title: "The Real Edge of Passive Investing Isn't What You Think",
    teaser: "Low fees matter. Diversification matters. But the biggest advantage of buying VEQT and doing nothing? You stop making expensive mistakes.",
    editorial: true,
  },
  {
    slug: "getting-started-with-veqt",
    title: "Getting Started with VEQT: A Beginner's Complete Guide",
    teaser: "Everything you need to know to buy your first shares of VEQT. Account types, brokerages, and what to expect.",
  },
];

// Last-resort fallback when ALL data sources AND cache fail.
// Updated manually — this should reflect a reasonably recent price.
// The timestamp is intentionally fixed (not new Date()) so the UI
// honestly shows "data from Mar 24" rather than lying "updated just now."
export const FALLBACK_QUOTE: VeqtQuote = {
  price: 53.19,
  previousClose: 53.25,
  change: -0.06,
  changePercent: -0.11,
  dayHigh: 53.45,
  dayLow: 52.95,
  fiftyTwoWeekHigh: 53.91,
  fiftyTwoWeekLow: 43.53,
  dividendYield: 1.43,
  ytdReturn: null,
  volume: 0,
  marketCap: 0,
  currency: "CAD",
  exchange: "TSX",
  lastUpdated: "2026-03-24T20:00:00.000Z", // Fixed date — never new Date()
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
  { key: "ALL", label: "All", months: 0 },
] as const;

export const DISCLAIMER =
  "BuyVEQT is a community-built informational resource and is not affiliated with, endorsed by, or sponsored by Vanguard Investments Canada Inc. or any other financial institution. Nothing on this site constitutes financial, investment, tax, or legal advice. All data is provided for informational purposes only and may be delayed or inaccurate. Always consult a qualified financial advisor before making investment decisions.";

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare" },
  { href: "/invest", label: "Calculator" },
  { href: "/learn", label: "Learn" },
  { href: "/community", label: "Community" },
];

export const NAV_LINKS_SECONDARY = [
  { href: "/distributions", label: "Distributions" },
  { href: "/inside-veqt", label: "Inside VEQT" },
  { href: "/methodology", label: "Methodology" },
];
