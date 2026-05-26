export interface ComparisonPage {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  funds: [string, string];
}

export const COMPARISON_PAGES: Record<string, ComparisonPage> = {
  "veqt-vs-xeqt": {
    slug: "veqt-vs-xeqt",
    title: "VEQT vs XEQT: Which All-in-One ETF Is Better?",
    metaTitle: "VEQT vs XEQT Comparison — BuyVEQT",
    metaDescription:
      "Detailed comparison of VEQT and XEQT — Canada's two most popular all-equity ETFs. Compare MER, performance, holdings, and geographic allocation side by side.",
    intro:
      "VEQT and XEQT are the two most popular all-equity ETFs in Canada. Both offer global diversification in a single purchase with effectively identical MERs (~0.20%). They differ mainly in geographic weighting: XEQT tilts more toward the US (~45% vs ~43%), while VEQT offers more Canadian exposure (~31% vs ~25%).",
    funds: ["VEQT.TO", "XEQT.TO"],
  },
  "veqt-vs-zeqt": {
    slug: "veqt-vs-zeqt",
    title: "VEQT vs ZEQT: Vanguard or BMO?",
    metaTitle: "VEQT vs ZEQT Comparison — BuyVEQT",
    metaDescription:
      "Compare VEQT and ZEQT — Vanguard's and BMO's all-equity ETFs. See how they differ in MER, AUM, holdings, and geographic allocation.",
    intro:
      "VEQT from Vanguard and ZEQT from BMO both aim to give you 100% global equity exposure in one ETF. Both have an effective MER of ~0.20%. ZEQT is newer (2022 vs 2019) with significantly smaller AUM ($591M vs $13.4B). Their geographic allocations are similar, with ZEQT having slightly more US exposure.",
    funds: ["VEQT.TO", "ZEQT.TO"],
  },
  "veqt-vs-vgro": {
    slug: "veqt-vs-vgro",
    title: "VEQT vs VGRO: All-Equity or Growth Portfolio?",
    metaTitle: "VEQT vs VGRO Comparison — BuyVEQT",
    metaDescription:
      "Should you choose VEQT (100% equity) or VGRO (80/20 equity/bond)? Compare performance, risk, MER, and allocation to find the right fit.",
    intro:
      "VEQT and VGRO are both from Vanguard and share the same underlying equity ETFs. The key difference: VEQT is 100% equities while VGRO holds 20% bonds. This means VGRO has lower expected volatility but also lower expected long-term returns. The choice comes down to your risk tolerance and investment horizon.",
    funds: ["VEQT.TO", "VGRO.TO"],
  },
  "veqt-vs-cage": {
    slug: "veqt-vs-cage",
    title: "VEQT vs CAGE: Index Orthodoxy vs the Factor Pitch",
    metaTitle: "VEQT vs CAGE Comparison — BuyVEQT",
    metaDescription:
      "VEQT vs CAGE: market-cap indexing vs Avantis's multi-factor all-equity ETF. Compare costs, factor tilts, track records, and which approach fits your beliefs about market efficiency.",
    intro:
      "VEQT holds the world by market cap — the academic baseline, the cheapest bet on everything. CAGE is Avantis's evidence-based all-equity ETF: same global mandate, but rotated toward smaller-cap and value names that academic research says have paid a premium for nearly a century. Same exposure, different sermon.",
    funds: ["VEQT.TO", "CAGE.TO"],
  },
  "veqt-vs-vfv": {
    slug: "veqt-vs-vfv",
    title: "VEQT vs VFV: Global Diversification vs S&P 500",
    metaTitle: "VEQT vs VFV Comparison — BuyVEQT",
    metaDescription:
      "VEQT vs VFV: global equity diversification vs pure S&P 500 exposure. Compare MER, returns, geographic risk, and which Vanguard ETF is right for Canadian investors.",
    intro:
      "VEQT gives you the entire global stock market in one ETF — 13,000+ holdings across 50+ countries. VFV gives you the S&P 500 — 500 of the largest US companies. VFV has been the better performer recently, but VEQT is the more resilient long-term choice. This comes down to whether you believe US dominance is permanent or cyclical.",
    funds: ["VEQT.TO", "VFV.TO"],
  },
};

export function getComparison(slug: string): ComparisonPage | undefined {
  return COMPARISON_PAGES[slug];
}
