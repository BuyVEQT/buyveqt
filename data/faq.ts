export interface FAQItem {
  question: string;
  answer: string;
}

export const COMPARE_FAQ: FAQItem[] = [
  {
    question: "What's the difference between VEQT and XEQT?",
    answer:
      "Both are all-equity, globally diversified ETFs designed for long-term Canadian investors. The main differences are provider (Vanguard vs iShares) and geographic allocation — XEQT has more US exposure (~45% vs ~43%) and less Canada (~25% vs ~31%). After late-2025 fee cuts, both have an effective MER of ~0.20%. In practice, their performance has been very similar. Choose based on your brokerage, preferred provider, or whether you want a slight Canada or US tilt. This is not financial advice — consider your own investment goals.",
  },
  {
    question: "Is a lower MER always better?",
    answer:
      "A lower MER means you keep more of your returns, all else being equal. However, a 0.04% MER difference (like VEQT vs XEQT) is very small — on a $100,000 portfolio, that's $40/year. Other factors like geographic allocation, tracking error, and your brokerage's commission structure may matter more in practice. Don't let a tiny MER difference be the sole deciding factor.",
  },
  {
    question: "Does it matter that ZEQT has lower AUM?",
    answer:
      "Lower AUM (assets under management) can mean wider bid-ask spreads and slightly lower liquidity, which may result in marginally higher trading costs. However, ZEQT's AUM of ~$591M is still growing. For most buy-and-hold investors placing market orders during trading hours, the difference in liquidity between ZEQT and VEQT is negligible. AUM becomes more relevant for very large trades or limit orders.",
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
  // VEQT vs CAGE FAQs
  {
    question: "What's the difference between VEQT and CAGE?",
    answer:
      "VEQT holds the entire global stock market weighted by market capitalization — every company at the proportion the market thinks it's worth. CAGE (Avantis All-Equity ETF) holds a similar global mandate but rotates the weights toward smaller-cap and higher-profitability value companies. Same equity universe, different weighting scheme. VEQT costs ~0.20% MER; CAGE costs 0.27%.",
  },
  {
    question: "Is CAGE active management?",
    answer:
      "Sort of — Avantis calls it \"evidence-based\" investing. They don't pick individual stocks based on opinion; they screen the global universe using academic factors (size, value, profitability) that have shown long-run premia since the 1920s. It's rules-based and systematic, but it's not pure market-cap indexing either. Closer to \"smart beta\" or factor investing than to traditional stock-picking.",
  },
  {
    question: "Should I switch from VEQT to CAGE?",
    answer:
      "Only if you have a real belief in the size and value premia. Those premia have historically rewarded patient investors, but they've also disappeared for 10+ year stretches (most recently 2010–2020, when mega-cap growth dominated). If you'd panic-sell CAGE during a multi-year stretch of underperforming the index, you'll do worse than just holding VEQT. The wrong fund held forever beats the right fund sold at the bottom.",
  },
  {
    question: "Can I hold both VEQT and CAGE?",
    answer:
      "Yes, and some investors do — using VEQT as a market-cap core and adding CAGE as a factor satellite (say, 70/30 or 80/20). The combined portfolio has a mild tilt toward small-cap and value without abandoning the market-cap baseline. Just don't double-count: holding both at 50/50 isn't twice the diversification, it's a diluted factor tilt at a higher blended fee.",
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
