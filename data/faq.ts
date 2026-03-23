export interface FAQItem {
  question: string;
  answer: string;
}

export const COMPARE_FAQ: FAQItem[] = [
  {
    question: "What's the difference between VEQT and XEQT?",
    answer:
      "Both are all-equity, globally diversified ETFs designed for long-term Canadian investors. The main differences are provider (Vanguard vs iShares), MER (0.24% vs 0.20%), and geographic allocation — XEQT has more US exposure (45% vs 40%) and less Canada (25% vs 30%). In practice, their performance has been very similar. Choose based on your brokerage, preferred provider, or whether you want a slight Canada or US tilt. This is not financial advice — consider your own investment goals.",
  },
  {
    question: "Is a lower MER always better?",
    answer:
      "A lower MER means you keep more of your returns, all else being equal. However, a 0.04% MER difference (like VEQT vs XEQT) is very small — on a $100,000 portfolio, that's $40/year. Other factors like geographic allocation, tracking error, and your brokerage's commission structure may matter more in practice. Don't let a tiny MER difference be the sole deciding factor.",
  },
  {
    question: "Does it matter that ZEQT has lower AUM?",
    answer:
      "Lower AUM (assets under management) can mean wider bid-ask spreads and slightly lower liquidity, which may result in marginally higher trading costs. However, ZEQT's AUM of ~$1.2B is still substantial and growing. For most buy-and-hold investors placing market orders during trading hours, the difference in liquidity between ZEQT and VEQT is negligible. AUM becomes more relevant for very large trades or limit orders.",
  },
  {
    question: "Should I pick VEQT or VGRO?",
    answer:
      "This depends on your risk tolerance and time horizon. VEQT is 100% equities — higher expected long-term returns but more volatility. VGRO is 80% equities and 20% bonds — slightly lower expected returns but smoother ride during downturns. If you have 10+ years and can stomach 30-40% drops without panicking, VEQT is the more aggressive choice. If you want a built-in cushion, VGRO provides that. Neither is objectively better — it depends on your personal situation.",
  },
  {
    question: "Why isn't VFV a true all-in-one ETF?",
    answer:
      "VFV tracks only the S&P 500 — the 500 largest US companies. While it has performed very well historically, it provides zero exposure to Canadian, international, or emerging market stocks. A true all-in-one ETF like VEQT or XEQT gives you global diversification in a single purchase. VFV is a great fund, but it's a US-only bet. Combining it with other ETFs to get global coverage defeats the simplicity that makes all-in-one funds attractive.",
  },
];
