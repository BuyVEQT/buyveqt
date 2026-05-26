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
        winner: "Tie",
        explanation:
          "Both now have a 0.17% management fee and ~0.20% effective MER after late-2025 fee cuts. Cost is no longer a differentiator.",
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
        winner: "XEQT",
        explanation:
          "XEQT remains larger than VEQT in assets under management (~$14.7B vs ~$13.4B). Both are highly liquid with tight bid-ask spreads.",
      },
      {
        label: "Simplicity",
        winner: "Tie",
        explanation:
          "Both are single-ticket solutions that require zero rebalancing. Buy either, contribute regularly, and ignore the noise.",
      },
    ],
    recommendation:
      "If you already hold one, there's no compelling reason to switch. If choosing fresh, both are excellent. Pick whichever your brokerage makes easier to buy, or go with VEQT if you value a slight home-country tilt and Vanguard's investor-owned structure.",
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
        winner: "Tie",
        explanation:
          "Both VEQT and VGRO have the same ~0.20% effective MER after Vanguard's November 2025 fee cuts.",
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
          "VEQT has ~$13.4B in AUM vs ZEQT's ~$591M, which means better liquidity and tighter bid-ask spreads.",
      },
      {
        label: "MER",
        winner: "Tie",
        explanation:
          "Both have an effective MER of ~0.20%. VEQT's management fee is 0.17%, ZEQT's is 0.15%. The all-in MERs are effectively identical.",
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
  {
    slug: "veqt-vs-cage",
    summary:
      "VEQT is the market by market cap — the cheapest, lowest-decision bet on every public company. CAGE is the same global equity exposure rotated toward what academic research has called premium-paying corners since 1928: smaller companies, profitable companies, value names. It's not active vs passive; it's index orthodoxy vs the factor pitch.",
    points: [
      {
        label: "Cost (MER)",
        winner: "VEQT",
        explanation:
          "VEQT ~0.20% effective vs CAGE 0.27%. Cap-weighted indexing is cheaper because it's the lowest-effort weighting scheme — you pay extra for Avantis's factor screens.",
      },
      {
        label: "Weighting philosophy",
        winner: "Tie",
        explanation:
          "VEQT mirrors what investors collectively own. CAGE deliberately overweights smaller-cap and higher-profitability value names. Both have defensible academic foundations — they answer different questions.",
      },
      {
        label: "Track record",
        winner: "VEQT",
        explanation:
          "VEQT launched 2019 with through-cycle data. CAGE launched 2024 — the underlying factor research goes back nearly a century, but the Canadian wrapper itself is brand new.",
      },
      {
        label: "Holdings breadth",
        winner: "VEQT",
        explanation:
          "VEQT holds 13,700+ securities globally. CAGE holds ~4,500, deliberately concentrated in factor-favored quadrants — fewer names by design.",
      },
      {
        label: "Expected factor premia",
        winner: "CAGE",
        explanation:
          "If size and value premia persist as they have historically, CAGE's tilts should compound to a meaningful edge over multi-decade horizons. The premia have disappeared for 10+ year stretches before — so this is a long-horizon bet.",
      },
      {
        label: "Behavioural risk",
        winner: "VEQT",
        explanation:
          "Holding a factor fund through a mega-cap growth run is harder than holding the market through it — the underperformance feels like a choice. VEQT removes that temptation by definition.",
      },
    ],
    recommendation:
      "Hold VEQT if you believe market-cap weighting is the honest default and any deviation is closet-active in disguise. Hold CAGE if you've read Fama–French, want a single-ticket way to harvest the size and value premia, and can sit through years of mega-cap growth dominance without flinching. Don't pick CAGE for the hype — pick it for the thesis, or skip it.",
  },
  {
    slug: "veqt-vs-vfv",
    summary:
      "VFV has been the better performer recently — the S&P 500 has been on a historic run. But VEQT is the more resilient long-term choice. This comes down to whether you believe US dominance is permanent or cyclical.",
    points: [
      {
        label: "Recent performance",
        winner: "VFV",
        explanation:
          "VFV has significantly outperformed over the past 5 years, driven by US large-cap tech. This is a fact, not a prediction — past performance doesn't guarantee future results.",
      },
      {
        label: "Geographic diversification",
        winner: "VEQT",
        explanation:
          "VEQT holds 13,000+ stocks across 50+ countries. VFV holds 500 US companies. During the US 'lost decade' (2000–2009), international diversification was the difference between flat returns and meaningful growth.",
      },
      {
        label: "Cost (MER)",
        winner: "VFV",
        explanation:
          "VFV charges 0.09% — less than half of VEQT's ~0.20%. On a $100K portfolio, that's a ~$110/year difference. Real, but small relative to the diversification question.",
      },
      {
        label: "Currency risk",
        winner: "VEQT",
        explanation:
          "VFV is 100% exposed to USD/CAD fluctuations. VEQT's ~31% Canadian allocation provides a natural hedge. When the Canadian dollar strengthens, VFV holders feel it.",
      },
      {
        label: "Concentration risk",
        winner: "VEQT",
        explanation:
          "VFV's top 10 holdings make up ~35% of the fund — heavily weighted toward US mega-cap tech. VEQT spreads risk across 13,000+ stocks, sectors, and economies.",
      },
      {
        label: "Canadian tax efficiency",
        winner: "VEQT",
        explanation:
          "VEQT's Canadian equity allocation (~31%) receives eligible dividend treatment in taxable accounts. VFV's distributions are 100% foreign income. In registered accounts, the difference is minimal.",
      },
    ],
    recommendation:
      "If you believe the US will continue to outperform the rest of the world indefinitely, VFV is the rational choice and cheaper to hold. If you believe that no country stays on top forever — and 120 years of market history supports this — VEQT is the more prudent bet. We lean VEQT because diversification is the only free lunch in investing, but we respect the VFV argument.",
  },
];

export function getVerdict(slug: string): ComparisonVerdict | undefined {
  return VERDICTS.find((v) => v.slug === slug);
}
