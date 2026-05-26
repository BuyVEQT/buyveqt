/** Reusable Tailwind class constants for common patterns */

export const CARD = "rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] p-5 sm:p-6";
export const STAT_CARD = "rounded-lg border border-[var(--color-border)] bg-[var(--color-base)] p-4";

/**
 * Per-fund accent colors used by the /compare page (chart lines, picker
 * chips, geography swatches). Keys are the short ticker (without ".TO").
 *
 * Extended in Round 4 M3 to match the design comp's palette: VEQT in
 * vermilion (the house color), the other 5 in a mix of editorial tokens
 * and accent hex values so eight lines never collide on a chart.
 */
export const FUND_COLOR: Record<string, string> = {
  VEQT: "var(--stamp)",
  XEQT: "var(--ink)",
  ZEQT: "var(--amber)",
  CAGE: "#6a4b9c",
  VFV: "#3a5b9c",
  VGRO: "#1d5431",
  VUN: "#06b6d4",
};

/** Resolve a fund's chart color from its short ticker (e.g. "VEQT"). */
export function fundColor(shortTicker: string): string {
  return FUND_COLOR[shortTicker] ?? "var(--ink)";
}
