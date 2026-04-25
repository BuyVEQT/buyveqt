// Client-safe — no Node.js imports.
// Hardcoded set of article slugs that include interactive tools.

export const INTERACTIVE_SLUGS = new Set([
  "veqt-decision-flowchart",
  "veqt-mer-true-cost",
  "veqt-withdrawal-strategy",
  "veqt-asset-location",
  "forex-vs-veqt",
  "covered-call-dividend-trap",
  "why-timing-the-market-fails",
  "veqt-is-down",
  "lump-sum-vs-dca",
]);

export function isInteractive(slug: string): boolean {
  return INTERACTIVE_SLUGS.has(slug);
}
