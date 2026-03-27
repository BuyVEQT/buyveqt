/**
 * Short ↔ long param key mappings for compact share URLs.
 *
 * Short keys are used in share URLs to keep them tidy.
 * Long keys are used internally by the calculators.
 */

export const SHORT_TO_LONG: Record<string, string> = {
  t: "tab",
  m: "mode",
  a: "amount",
  s: "start",
  r: "result",
  rp: "returnPct",
  c: "contributed",
  mo: "monthly",
  h: "horizon",
  rt: "rate",
  ct: "contributions",
  g: "growth",
  p: "portfolio",
  y: "yield",
  gr: "growthRate",
  ai: "annualIncome",
  ac: "account",
  sb: "starting",
  an: "annual",
};

export const LONG_TO_SHORT: Record<string, string> = Object.fromEntries(
  Object.entries(SHORT_TO_LONG).map(([s, l]) => [l, s])
);

/**
 * Expand short param keys to long keys. Passes through any keys
 * that are already long (or unrecognized) unchanged.
 */
export function expandParams(
  raw: Record<string, string | string[] | undefined>
): Record<string, string | string[] | undefined> {
  const out: Record<string, string | string[] | undefined> = {};
  for (const [k, v] of Object.entries(raw)) {
    const longKey = SHORT_TO_LONG[k] || k;
    out[longKey] = v;
  }
  return out;
}

/**
 * Build a compact share URL from long-key params.
 */
export function buildShareUrl(
  tab: string,
  params: Record<string, string | number>
): string {
  const sp = new URLSearchParams();
  sp.set("t", tab);
  for (const [k, v] of Object.entries(params)) {
    sp.set(LONG_TO_SHORT[k] || k, String(v));
  }
  return `https://buyveqt.com/invest?${sp.toString()}`;
}
