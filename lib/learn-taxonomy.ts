// Controlled tag vocabulary. Add new tags here, not in .mdx ad-hoc.
export const TAG_VOCAB = [
  // topics
  "veqt", "etf", "vanguard", "blackrock", "xeqt", "vfv", "vgro", "vun", "vcn", "xef", "xec",
  // accounts
  "tfsa", "rrsp", "fhsa", "rrif", "non-registered", "account-type",
  // strategy
  "getting-started", "automation", "dca", "lump-sum", "rebalancing",
  "asset-allocation", "asset-location", "diversification", "home-bias",
  // mechanics
  "mer", "fees", "distributions", "drip", "dividends", "currency",
  "hedging", "covered-calls",
  // psychology
  "psychology", "behavior", "long-term", "market-timing",
  // performance / theory
  "equity-premium", "volatility", "risk", "history", "data",
  // alt strategies
  "robo-advisor", "wealthsimple", "gic", "hisa", "forex", "day-trading",
  // life stage
  "retirement", "withdrawal", "decumulation", "first-home", "home-buying",
  // misc
  "comparison", "decision-tree", "opportunity-cost", "math", "philosophy",
] as const;

export type Tag = typeof TAG_VOCAB[number];
const TAG_SET = new Set<string>(TAG_VOCAB);

export function normalizeTag(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")        // "veqt deep-dive" → "veqt-deep-dive"
    .replace(/_/g, "-");
}

// Map common variants to canonical form (run AFTER normalizeTag)
const TAG_ALIASES: Record<string, string> = {
  "veqt-deep-dive": "veqt",      // collapse meta-tag to topic
  "beginner": "getting-started", // beginner is a difficulty, not a tag
  "strategy": "asset-allocation",// generic → specific
  "first-home-savings-account": "fhsa",
  "dont-sell": "psychology",
  "market-drop": "volatility",
  "4-percent-rule": "withdrawal",
  "cad": "currency",
  "usd": "currency",
  "how-to-buy": "getting-started",
  "brokerage": "getting-started",
  "optimization": "asset-location",
  "tax": "tfsa",                 // aggressive — see note in plan
  "account-type": "tfsa",        // ditto
  // additional useful aliases
  "passive-investing": "asset-allocation",
  "timing": "market-timing",
  "flowchart": "decision-tree",
  "cost": "mer",
  "returns": "risk",
  "bonds": "asset-allocation",
  "risk-tolerance": "risk",
  "time-horizon": "risk",
  "portfolio": "asset-allocation",
  "diy": "asset-allocation",
  "canada": "home-bias",
};

export function canonicalizeTag(raw: string): string | null {
  const n = normalizeTag(raw);
  const aliased = TAG_ALIASES[n] ?? n;
  return TAG_SET.has(aliased) ? aliased : null;
}

export function canonicalizeTags(raw: string[]): string[] {
  const out: string[] = [];
  for (const t of raw ?? []) {
    const c = canonicalizeTag(t);
    if (c && !out.includes(c)) out.push(c);
  }
  return out;
}
