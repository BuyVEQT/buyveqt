import type { QuoteData } from "./data/types";
import type { WeeklyRecap } from "./weekly";
import { formatShareDollars, formatShareDate } from "./share-utils";

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

/**
 * Calculator share snippets — one per tab.
 * Each returns a plain-text string under 280 chars for X/Twitter.
 */

export function historicalShareSnippet(p: {
  mode: string;
  amount: number;
  start: string;
  value: number;
  returnPct: number;
  url: string;
}): string {
  const date = formatShareDate(p.start);
  const value = formatShareDollars(p.value);
  const pct = `${p.returnPct >= 0 ? "+" : ""}${p.returnPct.toFixed(1)}%`;
  if (p.mode === "dca") {
    return `If I'd invested ${formatShareDollars(p.amount)}/mo in VEQT since ${date}, it'd be worth ${value} today (${pct}). Run yours \u2192 ${p.url}`;
  }
  return `If I'd put ${formatShareDollars(p.amount)} into VEQT in ${date}, it'd be worth ${value} today (${pct}). Run yours \u2192 ${p.url}`;
}

export function dcaShareSnippet(p: {
  monthly: number;
  years: number;
  rate: number;
  value: number;
  url: string;
}): string {
  return `${formatShareDollars(p.monthly)}/mo in VEQT for ${p.years} years at ${p.rate}% \u2192 ${formatShareDollars(p.value)}. Plan your DCA \u2192 ${p.url}`;
}

export function dividendShareSnippet(p: {
  portfolio: number;
  yieldRate: number;
  annual: number;
  url: string;
}): string {
  return `A ${formatShareDollars(p.portfolio)} VEQT portfolio at ${p.yieldRate}% yield \u2192 ${formatShareDollars(p.annual)}/year in dividends. Estimate yours \u2192 ${p.url}`;
}

export function tfsaRrspShareSnippet(p: {
  account: string;
  annual: number;
  years: number;
  value: number;
  url: string;
}): string {
  return `${p.account}: ${formatShareDollars(p.annual)}/yr in VEQT for ${p.years} years \u2192 ${formatShareDollars(p.value)}. Project yours \u2192 ${p.url}`;
}
