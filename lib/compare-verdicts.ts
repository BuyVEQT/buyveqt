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

export interface Verdict {
  /** Short headline — display-italic, ~5-8 words. */
  headline: string;
  /** One short paragraph (~30-50 words) — the "our take" body. */
  body: string;
  /** Optional CTA link to a deeper article. */
  cta?: { label: string; href: string };
}

/** Build the canonical pair key from two raw tickers (with .TO suffix or not). */
export function pairKey(a: string, b: string): string {
  const strip = (t: string) => t.replace(/\.TO$/, "");
  return [strip(a), strip(b)].sort().join(":");
}

export const VERDICTS: Record<string, Verdict> = {
  "VEQT:XEQT": {
    headline: "Tied on the spreadsheet. Separated by trust.",
    body:
      "Both hold the world. Both charge ~0.20%. Both rebalance themselves. The tiebreaker is the company you're handing your money to: Vanguard is owned by its investors; BlackRock is owned by Wall Street. When two funds perform identically, ownership is the only honest answer.",
    cta: { label: "Read: Why we choose VEQT over XEQT", href: "/learn/why-we-choose-veqt-over-xeqt" },
  },
  "VEQT:ZEQT": {
    headline: "Same job. Less mileage.",
    body:
      "ZEQT is the youngest of the all-equity trio (2022) and the smallest by a wide margin. The allocation looks like XEQT's. The fees match. But there's no track record through a real bear market — and BMO's distribution machine is the reason it exists, not investor demand.",
  },
  "VEQT:VFV": {
    headline: "A globe versus a single country.",
    body:
      "Comparing VEQT to VFV is comparing a portfolio to a position. VFV is 100% large-cap U.S. — a great holding, but not a portfolio. VEQT owns 13,700+ companies in 50+ countries. If you already own VFV, VEQT is the rest of your equity sleeve.",
  },
  "VEQT:VGRO": {
    headline: "Same family. Different appetite for risk.",
    body:
      "VGRO is VEQT plus 20% bonds. The bonds smooth the ride and drag the long-run return. If you'd panic-sell VEQT in a 30% drawdown, hold VGRO instead. If you can sit through one, history says the equity-only sleeve wins the decade.",
  },
  "VEQT:XGRO": {
    headline: "VEQT's BlackRock cousin, with a seat belt.",
    body:
      "Same setup as VEQT vs VGRO — 80% equity, 20% bonds — only on the iShares side. XGRO has the longer track record (back to 2007) since BlackRock pre-dates the all-in-one boom. Same trade-off applies: bonds for stomach, no bonds for compounding.",
  },
  "VEQT:VUN": {
    headline: "VEQT already owns VUN — at 43%.",
    body:
      "VUN is one of VEQT's four building blocks. Holding both isn't diversifying; it's overweighting the U.S. on top of an already U.S.-heavy fund. Pick one job: total-world (VEQT) or U.S.-only (VUN). Don't do both unintentionally.",
  },
};

/** Lookup a verdict for two tickers. Returns null if the pair isn't curated. */
export function getVerdict(tickerA: string, tickerB: string): Verdict | null {
  return VERDICTS[pairKey(tickerA, tickerB)] ?? null;
}
