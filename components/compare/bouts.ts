import { FUNDS } from "@/data/funds";

/**
 * The fight card — six bouts on file, VEQT against the field.
 *
 * Order here IS the card order: the selected bout is 01 and the remaining
 * five are numbered 02–06 in this sequence (artboard 6b). Category and
 * tagline are display copy; every number on the page is read from
 * `data/funds.ts` or the live API, never from this file.
 */
export interface Bout {
  /** API ticker, e.g. "XEQT.TO". */
  ticker: string;
  /** Display ticker, e.g. "XEQT". */
  short: string;
  /** Kicker's left half — the sleeve this contender occupies. */
  category: string;
  /** Kicker's right half of the row title — "VEQT × XEQT — {tagline}". */
  tagline: string;
}

/** VEQT is pinned at slot 0 of every bout, so deltas read VEQT-minus-other. */
export const HOUSE_TICKER = "VEQT.TO";

export const BOUTS: Bout[] = [
  {
    ticker: "XEQT.TO",
    short: "XEQT",
    category: "All-in-one",
    tagline: "the marquee fight",
  },
  {
    ticker: "ZEQT.TO",
    short: "ZEQT",
    category: "All-in-one",
    tagline: "the thinner book",
  },
  {
    ticker: "VGRO.TO",
    short: "VGRO",
    category: "80/20",
    tagline: "do you want bonds",
  },
  {
    ticker: "VFV.TO",
    short: "VFV",
    category: "S&P 500",
    tagline: "the concentration temptation",
  },
  {
    ticker: "VUN.TO",
    short: "VUN",
    category: "US total market",
    tagline: "the home-bias test",
  },
  {
    ticker: "CAGE.TO",
    short: "CAGE",
    category: "All-in-one",
    tagline: "the new kid",
  },
];

/** The marquee — what /compare opens on with no deep link. */
export const DEFAULT_BOUT = "XEQT.TO";

/** Every ticker the page pulls a price history for (house + the six). */
export const BOUT_TICKERS: string[] = [
  HOUSE_TICKER,
  ...BOUTS.map((b) => b.ticker),
];

export function getBout(ticker: string): Bout | undefined {
  return BOUTS.find((b) => b.ticker === ticker);
}

/**
 * Resolve a `?funds=` list (or a `[slug]` page's `initialFunds`) to a
 * contender. VEQT is the house side, so the bout is the first entry that
 * is a known contender. Returns null when nothing matches — the caller
 * falls back to the marquee.
 */
export function boutFromFunds(funds: string[] | null | undefined): string | null {
  if (!funds) return null;
  for (const raw of funds) {
    const t = raw.trim().toUpperCase();
    const withSuffix = t.endsWith(".TO") ? t : `${t}.TO`;
    if (withSuffix === HOUSE_TICKER) continue;
    if (getBout(withSuffix)) return withSuffix;
  }
  return null;
}

/**
 * Masthead micro-label — "VANGUARD · EST. JAN 2019 · $13.4B".
 * Uppercasing happens in CSS; provider parentheticals are dropped so
 * "iShares (BlackRock)" doesn't blow out the label.
 */
export function houseLabel(ticker: string): string {
  const fund = FUNDS[ticker];
  if (!fund) return "";
  const provider = fund.provider.replace(/\s*\([^)]*\)\s*/g, "").trim();
  const est = new Date(`${fund.inceptionDate}T12:00:00Z`).toLocaleDateString(
    "en-CA",
    { year: "numeric", month: "short" }
  );
  return `${provider} · Est. ${est} · ${fund.aum}`;
}

/** Short masthead label for phones — "VANGUARD · JAN 2019". */
export function houseLabelShort(ticker: string): string {
  const fund = FUNDS[ticker];
  if (!fund) return "";
  const provider = fund.provider.replace(/\s*\([^)]*\)\s*/g, "").trim();
  const est = new Date(`${fund.inceptionDate}T12:00:00Z`).toLocaleDateString(
    "en-CA",
    { year: "numeric", month: "short" }
  );
  return `${provider} · ${est}`;
}

/** Canada sleeve weight from the registry's geography split. 0 for US-only funds. */
export function canadaWeight(ticker: string): number {
  const fund = FUNDS[ticker];
  if (!fund) return 0;
  return fund.geographyAllocation.find((g) => g.region === "Canada")?.weight ?? 0;
}
