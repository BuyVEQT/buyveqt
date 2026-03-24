import type { QuoteData } from "./data/types";
import type { WeeklyRecap } from "./weekly";

/**
 * Generate a daily close snippet for social posting.
 */
export function dailyCloseSnippet(quote: QuoteData): string {
  const direction = quote.change >= 0 ? "+" : "";
  const emoji = quote.change >= 0 ? "\u{1F4C8}" : "\u{1F4C9}";
  return `VEQT closed at $${quote.price.toFixed(2)} today (${direction}${quote.changePercent.toFixed(2)}%, ${direction}$${Math.abs(quote.change).toFixed(2)}). ${emoji} buyveqt.com`;
}

/**
 * Generate a weekly recap snippet.
 */
export function weeklyRecapSnippet(recap: WeeklyRecap): string {
  const direction = recap.weeklyChange >= 0 ? "+" : "";
  return `VEQT this week: ${direction}${recap.weeklyChangePercent.toFixed(2)}% ($${recap.veqtOpen.toFixed(2)} \u2192 $${recap.veqtClose.toFixed(2)}). Full recap \u2192 buyveqt.com/weekly/${recap.slug}`;
}

/**
 * Generate a distribution alert snippet.
 */
export function distributionSnippet(amount: number, exDate: string): string {
  return `VEQT distribution: $${amount.toFixed(4)}/unit (ex-date ${exDate}). History & income calculator \u2192 buyveqt.com/distributions`;
}
