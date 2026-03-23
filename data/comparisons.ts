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
      "VEQT and XEQT are the two most popular all-equity ETFs in Canada. Both offer global diversification in a single purchase, but they differ in provider, fees, and geographic weighting. XEQT tilts more toward the US (45% vs 40%) and has a slightly lower MER (0.20% vs 0.24%), while VEQT offers more Canadian exposure.",
    funds: ["VEQT.TO", "XEQT.TO"],
  },
  "veqt-vs-zeqt": {
    slug: "veqt-vs-zeqt",
    title: "VEQT vs ZEQT: Vanguard or BMO?",
    metaTitle: "VEQT vs ZEQT Comparison — BuyVEQT",
    metaDescription:
      "Compare VEQT and ZEQT — Vanguard's and BMO's all-equity ETFs. See how they differ in MER, AUM, holdings, and geographic allocation.",
    intro:
      "VEQT from Vanguard and ZEQT from BMO both aim to give you 100% global equity exposure in one ETF. ZEQT is newer (2022 vs 2019) with a lower MER (0.20% vs 0.24%) but significantly smaller AUM. Their geographic allocations are similar, with ZEQT having slightly more US exposure.",
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
};

export function getComparison(slug: string): ComparisonPage | undefined {
  return COMPARISON_PAGES[slug];
}
