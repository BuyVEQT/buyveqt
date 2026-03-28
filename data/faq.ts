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
  // VEQT vs XGRO FAQs
  {
    question: "Is XGRO safer than VEQT?",
    answer:
      "In the short term, yes — XGRO's 20% bond allocation reduces volatility and drawdowns. During the COVID crash, XGRO fell less than VEQT. However, over very long periods (20+ years), the 'safety' of bonds comes at the cost of lower expected returns. Safety depends on your time horizon.",
  },
  {
    question: "Should I hold VEQT or XGRO in my TFSA?",
    answer:
      "Either works well in a TFSA. If you're young with decades until retirement, VEQT's higher equity allocation may generate more tax-free growth. If you're closer to needing the money, XGRO's bond cushion provides more stability.",
  },
  {
    question: "Can I hold both VEQT and XGRO?",
    answer:
      "You could, but there's significant overlap. Both hold the same global equity markets — XGRO just adds bonds on top. Holding both gives you something between 80–100% equity, which you could achieve more cleanly with one fund. Pick the allocation that matches your risk tolerance.",
  },
  {
    question: "Why not just use VGRO instead of XGRO?",
    answer:
      "VGRO (Vanguard) and XGRO (iShares) are extremely similar — both are 80/20 equity/bond portfolios. The differences are minor: slightly different geographic tilts, index providers (FTSE vs MSCI/S&P), and MERs. See our VEQT vs VGRO comparison for more on the Vanguard side.",
  },
  // VEQT vs VFV FAQs
  {
    question: "VFV has better returns than VEQT. Why wouldn't I just buy VFV?",
    answer:
      "VFV has outperformed recently because the US market — especially tech — has been on a historic run. But 'recently' isn't 'always.' From 2000–2009, the S&P 500 returned roughly 0% while international markets grew significantly. Past performance doesn't predict future results. VEQT protects against the risk that US dominance doesn't last forever.",
  },
  {
    question: "Is VFV's lower MER a big deal?",
    answer:
      "VFV charges 0.09% vs VEQT's ~0.20%. On $100,000, that's about $110/year difference. It's not nothing, but the diversification question matters far more than a 0.11% fee gap. You're paying a small premium for exposure to the entire global economy instead of just the US.",
  },
  {
    question:
      "Doesn't VFV already give me international diversification because S&P 500 companies operate globally?",
    answer:
      "Partially. S&P 500 companies generate ~40% of revenue internationally. But their stock prices still move with US market sentiment, US regulation, and US monetary policy. Owning actual international stocks (as VEQT does) provides true diversification of both revenue sources AND market risk factors.",
  },
  {
    question: "Should I combine VFV and VEQT?",
    answer:
      "This is common but creates a deliberate US overweight. VEQT already has ~44% US exposure. Adding VFV on top pushes that higher. If you want more US exposure than VEQT provides, a small VFV satellite position is fine — just understand you're making an active bet on continued US outperformance.",
  },
];
