/** Which URL params belong to each calculator tab */
export const TAB_PARAMS: Record<string, string[]> = {
  historical: ["mode", "amount", "start"],
  dca: ["monthly", "years", "rate"],
  dividends: ["portfolio", "yield", "growth"],
  "tfsa-rrsp": ["account", "starting", "annual", "horizon", "return"],
};

/** Remove specific params from the URL without touching others */
export function clearCalcParams(keys: string[]) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  let changed = false;
  for (const k of keys) {
    if (params.has(k)) {
      params.delete(k);
      changed = true;
    }
  }
  if (changed) {
    const qs = params.toString();
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, "", url);
  }
}

/**
 * Read calculator-specific params from the URL on mount.
 * Returns a record of param values (using defaults for missing ones).
 */
export function readCalcParams(
  keys: string[],
  defaults: Record<string, string>
): Record<string, string> {
  if (typeof window === "undefined") return { ...defaults };
  const params = new URLSearchParams(window.location.search);
  const result: Record<string, string> = {};
  for (const k of keys) {
    result[k] = params.get(k) ?? defaults[k] ?? "";
  }
  return result;
}

/**
 * Write calculator-specific params to the URL, preserving all other params.
 */
export function writeCalcParams(updates: Record<string, string>) {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(updates)) {
    params.set(k, v);
  }
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}
