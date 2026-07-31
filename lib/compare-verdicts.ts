/**
 * Editorial verdicts for the /compare page — short, opinionated takes that
 * appear when exactly two funds are selected. The page renders the matching
 * verdict only when a curated pair is selected; otherwise the verdict slot
 * is hidden (we don't fake an opinion we haven't earned).
 *
 * Pairs are key'd by sorted, stripped tickers joined with ":". So
 *   ["VEQT.TO", "XEQT.TO"] → "VEQT:XEQT"
 *   ["XEQT.TO", "VEQT.TO"] → "VEQT:XEQT" (same key)
 */

export interface VerdictPoint {
  /** Short label for this scoring dimension, e.g. "Cost (MER)". */
  label: string;
  /** One or two sentence explanation of the round result. */
  explanation: string;
  /** Short ticker of the winner, or "Tie". */
  winner: string;
}

export interface Verdict {
  /** Canonical URL slug for this pair, e.g. "veqt-vs-xeqt". */
  slug: string;
  /** Short italic headline ~5-8 words. Shown in the dark-band editorial card. */
  headline: string;
  /** One paragraph (~30-50 words) — the "our take" body. */
  summary: string;
  /** Recommendation sentence — shown with vermilion left border. */
  recommendation: string;
  /** Round-by-round scoring rendered by the BottomLine component. */
  points: VerdictPoint[];
  /** @deprecated Use summary instead. Kept for backwards compatibility. */
  body?: string;
  /** @deprecated Use recommendation instead. */
  cta?: { label: string; href: string };
}

/** Build the canonical pair key from two raw tickers (with .TO suffix or not). */
export function pairKey(a: string, b: string): string {
  const strip = (t: string) => t.replace(/\.TO$/, "");
  return [strip(a), strip(b)].sort().join(":");
}

export const VERDICTS: Record<string, Verdict> = {
  "VEQT:XEQT": {
    slug: "veqt-vs-xeqt",
    headline: "Two near-twins, one preference call.",
    summary:
      "Both hold the world. Both charge ~0.20%. Both rebalance themselves. The tiebreaker is the company you're handing your money to: Vanguard is owned by its investors; BlackRock is owned by Wall Street. When two funds perform identically, ownership is the only honest answer.",
    recommendation:
      "Hold VEQT if you value Vanguard's investor-owned structure. Hold XEQT if you prefer iShares' slightly broader international tilt or already bank with the iShares ecosystem. Either choice is defensible — just pick one and stop switching.",
    points: [
      {
        label: "Cost (MER)",
        explanation:
          "Both ~0.20% after late-2025 fee cuts. Cost is no longer a differentiator.",
        winner: "Tie",
      },
      {
        label: "Canadian allocation",
        explanation:
          "VEQT holds slightly more Canadian equities — a small tax advantage in taxable accounts via the Canadian dividend tax credit.",
        winner: "VEQT",
      },
      {
        label: "International tilt",
        explanation:
          "XEQT carries marginally broader international exposure outside North America.",
        winner: "XEQT",
      },
      {
        label: "Fund size & liquidity",
        explanation:
          "XEQT has larger AUM (~$14.7B vs ~$13.4B). Both are highly liquid with tight spreads.",
        winner: "XEQT",
      },
      {
        label: "Ownership structure",
        explanation:
          "Vanguard is owned by its fund investors — no external shareholders taking a cut. That structural alignment is a permanent edge.",
        winner: "VEQT",
      },
    ],
  },
  "VEQT:ZEQT": {
    slug: "veqt-vs-zeqt",
    headline: "Vanguard or BMO. A close, mostly-cosmetic call.",
    summary:
      "ZEQT is the youngest of the all-equity trio (2022) and the smallest by a wide margin. The allocation looks like XEQT's. The fees match. But there's no track record through a real bear market — and BMO's distribution machine is the reason it exists, not investor demand.",
    recommendation:
      "Choose VEQT for its longer track record and Vanguard's structural advantage. ZEQT is a fine fund but brings nothing VEQT doesn't already offer — and its youth means it hasn't been stress-tested through a serious drawdown yet.",
    points: [
      {
        label: "Track record",
        explanation:
          "VEQT launched in 2019 and has lived through the 2020 COVID crash. ZEQT launched in 2022 — no full bear cycle yet.",
        winner: "VEQT",
      },
      {
        label: "Cost (MER)",
        explanation:
          "Both ~0.20%. No winner here — costs are a wash.",
        winner: "Tie",
      },
      {
        label: "Fund size & liquidity",
        explanation:
          "VEQT is dramatically larger (~$13.4B vs ZEQT's ~$1B). More assets means tighter spreads and better tax-loss-harvesting options.",
        winner: "VEQT",
      },
      {
        label: "Ownership structure",
        explanation:
          "Vanguard's investor-owned model aligns interests better than BMO's bank-subsidiary structure.",
        winner: "VEQT",
      },
      {
        label: "Holdings count",
        explanation:
          "VEQT holds ~13,700 securities vs ZEQT's ~9,000. Broader diversification within the same mandate.",
        winner: "VEQT",
      },
    ],
  },
  "VEQT:VFV": {
    slug: "veqt-vs-vfv",
    headline: "World vs U.S. — diversification, or recency?",
    summary:
      "Comparing VEQT to VFV is comparing a portfolio to a position. VFV is 100% large-cap U.S. — a great holding, but not a portfolio. VEQT owns 13,700+ companies in 50+ countries. If you already own VFV, VEQT is the rest of your equity sleeve.",
    recommendation:
      "Unless you have a specific, thesis-driven reason to be 100% U.S. equity, choose VEQT. VFV's superior recent returns are a product of U.S. dominance in the last decade — that trend may or may not persist. VEQT lets you hold the whole world without betting on one region.",
    points: [
      {
        label: "Diversification",
        explanation:
          "VEQT holds 13,700+ companies across 50+ countries. VFV holds ~500 large-cap U.S. companies. No contest for global breadth.",
        winner: "VEQT",
      },
      {
        label: "Recent returns (10Y)",
        explanation:
          "U.S. large-cap has dominated global markets for over a decade. VFV's track record reflects this tailwind.",
        winner: "VFV",
      },
      {
        label: "Concentration risk",
        explanation:
          "VFV is a single-country, single-market-cap bet. A prolonged U.S. underperformance period hits VFV far harder.",
        winner: "VEQT",
      },
      {
        label: "Cost (MER)",
        explanation:
          "VFV is cheaper at ~0.09% vs VEQT's 0.20%. The extra cost buys global diversification.",
        winner: "VFV",
      },
      {
        label: "Portfolio completeness",
        explanation:
          "VEQT is a complete, self-rebalancing portfolio. VFV is a single position that needs other assets around it.",
        winner: "VEQT",
      },
    ],
  },
  "VEQT:VGRO": {
    slug: "veqt-vs-vgro",
    headline: "100% equity vs 80/20. It's a question about bonds.",
    summary:
      "VGRO is VEQT plus 20% bonds. The bonds smooth the ride and drag the long-run return. If you'd panic-sell VEQT in a 30% drawdown, hold VGRO instead. If you can sit through one, history says the equity-only sleeve wins the decade.",
    recommendation:
      "Your gut in a 30% drawdown is the only honest answer. If you've never lived through one, VGRO's bonds are cheap insurance. If you've held equities through a bear market and stayed the course, VEQT's undiluted compound growth is the better long-run bet.",
    points: [
      {
        label: "Long-run return expectation",
        explanation:
          "100% equity has historically outperformed 80/20 over 10+ year horizons. VEQT wins on raw expected return.",
        winner: "VEQT",
      },
      {
        label: "Volatility & drawdown",
        explanation:
          "VGRO's 20% bond sleeve softens bear-market drawdowns by ~5-8 percentage points — meaningful if you're close to spending the money.",
        winner: "VGRO",
      },
      {
        label: "Cost (MER)",
        explanation:
          "Identical. Both charge a 0.17% management fee after Vanguard's November 2025 cut, with effective MERs of ~0.20%. No cost difference.",
        winner: "Tie",
      },
      {
        label: "Behavioural fit",
        explanation:
          "A fund you hold through downturns beats a fund you sell at the bottom. VGRO's smoother ride keeps investors in their seat.",
        winner: "VGRO",
      },
      {
        label: "Holdings breadth",
        explanation:
          "VEQT holds only equity globally. VGRO adds Canadian, U.S., and international bond exposure — genuinely different asset classes.",
        winner: "VGRO",
      },
    ],
  },
  "CAGE:VEQT": {
    slug: "veqt-vs-cage",
    headline: "Index orthodoxy vs the factor pitch.",
    summary:
      "VEQT holds the world by market cap — the academic baseline, the cheapest possible bet on \"everything.\" CAGE rotates that holding toward the corners academic research says have paid a premium since the 1920s: smaller companies, profitable companies, companies trading cheaper than their fundamentals. It's the same global equity exposure, weighted by a different sermon.",
    recommendation:
      "If you believe market-cap weighting is the honest default and that any deviation is closet-active in disguise, hold VEQT and pay 20bps. If you've read Fama–French and want a single-ticket way to harvest the size and value premia without bolting AVUV onto your portfolio, CAGE earns its 7bps premium — provided you can stomach years where mega-cap growth runs and the factor sleeve underperforms.",
    points: [
      {
        label: "Cost (MER)",
        explanation:
          "VEQT's 0.17% management fee (~0.20% effective MER) vs CAGE's 0.28%. Cap-weighted indexing is cheaper because it's the lowest-effort weighting scheme — you're paying for the absence of decisions.",
        winner: "VEQT",
      },
      {
        label: "Weighting philosophy",
        explanation:
          "VEQT mirrors what investors collectively own. CAGE deliberately overweights smaller-cap and higher-profitability value names per Avantis's research process — a thesis-driven tilt, not a market mirror.",
        winner: "Tie",
      },
      {
        label: "Track record",
        explanation:
          "VEQT launched in 2019 and has lived through a real crash. CAGE is brand-new (2024) — its factor strategy has decades of academic evidence behind it, but the Canadian wrapper itself has no through-cycle data.",
        winner: "VEQT",
      },
      {
        label: "Diversification breadth",
        explanation:
          "VEQT holds 13,700+ securities. CAGE holds ~4,500 with deliberate factor screens — fewer names by design, more concentrated in factor-favored quadrants.",
        winner: "VEQT",
      },
      {
        label: "Expected long-run premia",
        explanation:
          "If small-cap and value premia persist as they have since 1928, CAGE's tilts should compound to a multi-percent edge over decades. \"If\" is the operative word — those premia have disappeared for 10+ year stretches before.",
        winner: "CAGE",
      },
      {
        label: "Behavioural risk",
        explanation:
          "Holding a factor fund through a multi-year mega-cap growth run is harder than holding the market through the same run, because the underperformance feels like a choice. VEQT removes that temptation.",
        winner: "VEQT",
      },
    ],
  },
  "VEQT:VUN": {
    slug: "veqt-vs-vun",
    headline: "VEQT already owns VUN — at 43%.",
    summary:
      "VUN is one of VEQT's four building blocks. Holding both isn't diversifying; it's overweighting the U.S. on top of an already U.S.-heavy fund. Pick one job: total-world (VEQT) or U.S.-only (VUN). Don't do both unintentionally.",
    recommendation:
      "If you want total-world equities, hold VEQT alone. If you want U.S.-total-market, hold VUN alone. Combining them creates unintentional U.S. overweight — you'd be holding VUN twice, once inside VEQT and once directly.",
    points: [
      {
        label: "Diversification",
        explanation:
          "VEQT holds 13,700+ companies globally. VUN holds ~3,600 U.S. companies. VEQT wins on breadth by a wide margin.",
        winner: "VEQT",
      },
      {
        label: "U.S. exposure",
        explanation:
          "VUN is 100% U.S. total market. VEQT is ~44% U.S. Holding both doubles up on the U.S. sleeve.",
        winner: "VUN",
      },
      {
        label: "Cost (MER)",
        explanation:
          "VUN is cheaper at ~0.16% vs VEQT's 0.20%. The difference is small but VUN wins on raw cost.",
        winner: "VUN",
      },
      {
        label: "Portfolio completeness",
        explanation:
          "VEQT is a complete, self-rebalancing global portfolio. VUN requires other assets (Canada, international, bonds) to be a complete allocation.",
        winner: "VEQT",
      },
      {
        label: "Overlap risk",
        explanation:
          "Combining VEQT + VUN creates heavy U.S. concentration (~65%+). This is unintentional for most investors.",
        winner: "VEQT",
      },
    ],
  },
};

/** Lookup a verdict for two tickers. Returns null if the pair isn't curated. */
export function getVerdict(tickerA: string, tickerB: string): Verdict | null {
  return VERDICTS[pairKey(tickerA, tickerB)] ?? null;
}
