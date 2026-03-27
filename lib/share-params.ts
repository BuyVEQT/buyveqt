/**
 * Short ↔ long param key mappings for compact share URLs.
 *
 * Rules:
 * - Every short key is a single character
 * - `tab` is NEVER written to share URLs — it's inferred from
 *   which distinctive key is present (see inferTab)
 *
 * Single-char assignments:
 *   a  amount        b  starting (Balance)    c  contributed
 *   e  ratE          g  growth                h  horizon
 *   i  annualIncome  l  annuaL contribution   m  mode
 *   n  contributioNs o  mOnthly               p  portfolio
 *   q  returnPct (Q) r  result                s  start
 *   u  accoUnt       w  groWthRate            y  yield
 */

export const SHORT_TO_LONG: Record<string, string> = {
  // shared / historical
  t: "tab",   // legacy — still accepted but not written
  m: "mode",
  a: "amount",
  s: "start",
  r: "result",
  q: "returnPct",
  c: "contributed",
  // dca planner
  o: "monthly",
  h: "horizon",
  e: "rate",
  n: "contributions",
  g: "growth",
  // dividends
  p: "portfolio",
  y: "yield",
  w: "growthRate",
  i: "annualIncome",
  // tfsa/rrsp
  u: "account",
  b: "starting",
  l: "annual",
};

// Also accept the old 2-char keys for backwards compatibility
const LEGACY: Record<string, string> = {
  rp: "returnPct",
  mo: "monthly",
  rt: "rate",
  ct: "contributions",
  gr: "growthRate",
  ai: "annualIncome",
  ac: "account",
  sb: "starting",
  an: "annual",
};

export const LONG_TO_SHORT: Record<string, string> = Object.fromEntries(
  Object.entries(SHORT_TO_LONG)
    .filter(([s]) => s !== "t") // don't write tab
    .map(([s, l]) => [l, s])
);

/**
 * Infer which calculator tab is active from whichever distinctive
 * long key is present. Falls back to explicit "tab" / "t" if provided.
 */
export function inferTab(
  params: Record<string, string | string[] | undefined>
): string | null {
  const explicit = params.tab || params.t;
  if (typeof explicit === "string") return explicit;

  if (params.mode   || params.m) return "historical";
  if (params.start  || params.s) return "historical";
  if (params.monthly|| params.o) return "dca";
  if (params.yield  || params.y) return "dividends";
  if (params.account|| params.u) return "tfsa-rrsp";

  return null;
}

/**
 * Expand short (and legacy 2-char) param keys to long keys.
 * Passes through already-long keys unchanged.
 */
export function expandParams(
  raw: Record<string, string | string[] | undefined>
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    const longKey = SHORT_TO_LONG[k] || LEGACY[k] || k;
    out[longKey] = v;
  }
  // Ensure tab is set if inferable
  if (!out.tab) {
    const inferred = inferTab(out);
    if (inferred) out.tab = inferred;
  }
  return out;
}

/**
 * Build a compact share URL from long-key params.
 * Tab is NOT written — it's inferred from the other keys on decode.
 */
export function buildShareUrl(
  _tab: string,
  params: Record<string, string | number>
): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    sp.set(LONG_TO_SHORT[k] || k, String(v));
  }
  return `https://www.buyveqt.com/invest?${sp.toString()}`;
}
