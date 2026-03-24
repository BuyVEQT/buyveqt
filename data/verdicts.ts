export interface VerdictPoint {
  label: string;
  winner: string;
  explanation: string;
}

export interface ComparisonVerdict {
  slug: string;
  summary: string;
  points: VerdictPoint[];
  recommendation: string;
}

export const VERDICTS: ComparisonVerdict[] = [
  {
    slug: "veqt-vs-xeqt",
    summary:
      "VEQT and XEQT are remarkably similar funds — both are all-equity, globally diversified, single-ticket portfolios. The differences are small enough that most investors won't notice them over a 20-year horizon. Your choice comes down to minor preferences in geographic allocation and provider loyalty.",
    points: [
      {
        label: "Lowest cost (MER)",
        winner: "XEQT",
        explanation:
          "XEQT's MER is slightly lower. Over decades and large balances this compounds, but the difference is modest.",
      },
      {
        label: "Canadian allocation",
        winner: "VEQT",
        explanation:
          "VEQT holds slightly more Canadian equities, which can provide a small tax advantage in taxable accounts through the Canadian dividend tax credit.",
      },
      {
        label: "International diversification",
        winner: "XEQT",
        explanation:
          "XEQT tilts slightly more toward international markets, giving marginally broader global exposure.",
      },
      {
        label: "Fund size (AUM)",
        winner: "VEQT",
        explanation:
          "VEQT has a larger asset base, which generally means tighter bid-ask spreads and more liquidity for large trades.",
      },
      {
        label: "Simplicity",
        winner: "Tie",
        explanation:
          "Both are single-ticket solutions that require zero rebalancing. Buy either, contribute regularly, and ignore the noise.",
      },
    ],
    recommendation:
      "If you already hold one, there's no compelling reason to switch. If choosing fresh, both are excellent. Pick whichever your brokerage makes easier to buy, or go with VEQT if you value a slight home-country tilt and XEQT if you want marginally lower fees.",
  },
  {
    slug: "veqt-vs-vgro",
    summary:
      "This is really a question about bonds. VEQT is 100% equities. VGRO is ~80% equities and ~20% bonds. The right choice depends on your risk tolerance and time horizon, not which fund is \"better.\"",
    points: [
      {
        label: "Higher expected long-term returns",
        winner: "VEQT",
        explanation:
          "All-equity portfolios have historically outperformed balanced portfolios over long periods (20+ years), though with more volatility along the way.",
      },
      {
        label: "Lower volatility",
        winner: "VGRO",
        explanation:
          "The 20% bond allocation cushions drops during market downturns. If a 30%+ portfolio drop would cause you to sell in a panic, VGRO may keep you invested.",
      },
      {
        label: "Best for long time horizon (15+ years)",
        winner: "VEQT",
        explanation:
          "With decades to recover from downturns, the all-equity approach historically rewards patience with higher returns.",
      },
      {
        label: "Best for shorter horizon or lower risk tolerance",
        winner: "VGRO",
        explanation:
          "If you're within 10-15 years of needing the money, or if market drops genuinely stress you, the bond cushion helps.",
      },
      {
        label: "Lowest cost (MER)",
        winner: "VEQT",
        explanation:
          "VEQT's MER is slightly lower. Bond funds add a small cost layer in VGRO.",
      },
    ],
    recommendation:
      "Young investors with a 20+ year horizon and strong stomach for volatility: VEQT. Investors closer to needing the money, or who know they'd panic-sell in a crash: VGRO. The best fund is the one you can hold through the worst days without selling.",
  },
  {
    slug: "veqt-vs-zeqt",
    summary:
      "VEQT (Vanguard) and ZEQT (BMO) are both all-equity, globally diversified ETFs targeting a similar outcome. The differences are in provider, slight allocation tilts, and fund size. For most investors, this is a coin flip.",
    points: [
      {
        label: "Fund size and liquidity",
        winner: "VEQT",
        explanation:
          "VEQT has significantly more assets under management, which typically means better liquidity and tighter bid-ask spreads.",
      },
      {
        label: "MER",
        winner: "ZEQT",
        explanation:
          "ZEQT's MER is competitive and may be slightly lower. Check current MERs as these can change year to year.",
      },
      {
        label: "Track record",
        winner: "VEQT",
        explanation:
          "VEQT launched earlier and has a longer performance history to evaluate, though both are relatively young funds.",
      },
      {
        label: "Provider ecosystem",
        winner: "Tie",
        explanation:
          "Vanguard and BMO are both reputable providers. If your brokerage has commission-free trading for one provider, that may tip the decision.",
      },
    ],
    recommendation:
      "VEQT is the more established choice with better liquidity. ZEQT is a fine alternative if your brokerage favors BMO products or you prefer their slight allocation differences. Either will serve a passive investor well.",
  },
];

export function getVerdict(slug: string): ComparisonVerdict | undefined {
  return VERDICTS.find((v) => v.slug === slug);
}
