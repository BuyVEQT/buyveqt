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
          "XEQT has surpassed VEQT in assets under management (~$14.7B vs ~$12.2B). Both are highly liquid with tight bid-ask spreads.",
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
          "VEQT has ~$12.2B in AUM vs ZEQT's ~$591M, which means better liquidity and tighter bid-ask spreads.",
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
    slug: "veqt-vs-xgro",
    summary:
      "This isn't a provider battle — it's a philosophy question. VEQT bets that over long horizons, 100% equities win. XGRO hedges that bet with a 20% bond buffer. Both are right, depending on your timeline and temperament.",
    points: [
      {
        label: "Long-term return potential",
        winner: "VEQT",
        explanation:
          "100% equities have historically outperformed 80/20 portfolios over 15+ year periods. The bond allocation in XGRO reduces upside alongside risk.",
      },
      {
        label: "Drawdown protection",
        winner: "XGRO",
        explanation:
          "XGRO's 20% bond buffer meaningfully reduced losses during the COVID crash and 2022 bear market. If you'd sell in a panic, XGRO's smoother ride may preserve more wealth in practice.",
      },
      {
        label: "Simplicity",
        winner: "Tie",
        explanation:
          "Both are single-ticker, auto-rebalanced portfolios. Buy either and forget it.",
      },
      {
        label: "Cost (MER)",
        winner: "Tie",
        explanation:
          "XGRO's MER is 0.20%. VEQT's effective MER is ~0.20% after the November 2025 fee cut (official MER update pending). Essentially identical.",
      },
      {
        label: "Suitability for 5–15 year goals",
        winner: "XGRO",
        explanation:
          "For medium-term goals like a home down payment or mid-career savings, the bond cushion provides more predictable outcomes.",
      },
      {
        label: "Suitability for 20+ year goals",
        winner: "VEQT",
        explanation:
          "For retirement-horizon investing, the equity risk premium has historically rewarded patient investors. Bonds become a drag over very long periods.",
      },
    ],
    recommendation:
      "If you're investing for 20+ years and can stomach a 30%+ drawdown without selling, VEQT is the sharper tool. If your horizon is shorter, or you know you'd panic in a crash, XGRO's bond cushion earns its keep. The worst outcome isn't picking the 'wrong' fund — it's selling either one at the bottom.",
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
