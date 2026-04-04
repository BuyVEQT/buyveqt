import type { QuoteData } from "./data/types";
import type { WeeklyRecap } from "./weekly";

/**
 * Generate a daily close snippet for social posting.
 */
export function dailyCloseSnippet(quote: QuoteData): string {
  const direction = quote.change >= 0 ? "+" : "";
  const emoji = quote.change >= 0 ? "\u{1F4C8}" : "\u{1F4C9}";
  return `VEQT closed at $${quote.price.toFixed(2)} today (${direction}${quote.changePercent.toFixed(2)}%, ${direction}$${Math.abs(quote.change).toFixed(2)}). ${emoji} buyveqt.ca`;
}

/**
 * Generate a weekly recap snippet.
 */
export function weeklyRecapSnippet(recap: WeeklyRecap): string {
  const direction = recap.weeklyChange >= 0 ? "+" : "";
  return `VEQT this week: ${direction}${recap.weeklyChangePercent.toFixed(2)}% ($${recap.veqtOpen.toFixed(2)} \u2192 $${recap.veqtClose.toFixed(2)}). Full recap \u2192 buyveqt.ca/weekly/${recap.slug}`;
}

/**
 * Generate a distribution alert snippet.
 */
export function distributionSnippet(amount: number, exDate: string): string {
  return `VEQT distribution: $${amount.toFixed(4)}/unit (ex-date ${exDate}). History & income calculator \u2192 buyveqt.ca/distributions`;
}

// ─── Shareable calculator result snippets ─────────────────────

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

function fmtDlr(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function fmtDate(yyyymm: string): string {
  const [y, m] = yyyymm.split("-");
  const mi = parseInt(m, 10);
  if (!y || isNaN(mi) || mi < 1 || mi > 12) return yyyymm;
  return `${MONTHS[mi - 1]} ${y}`;
}

export interface HistoricalShareParams {
  mode: "lump" | "dca";
  amount: number;
  start: string; // "YYYY-MM"
  result: number;
  returnPct: number;
  contributed: number;
  url: string;
}

export function historicalShareSnippet(p: HistoricalShareParams): string {
  if (p.mode === "dca") {
    return `I ran the numbers: ${fmtDlr(p.amount)}/mo into VEQT since ${fmtDate(p.start)} would be worth ${fmtDlr(p.result)} today (+${p.returnPct.toFixed(1)}%). Run your own numbers \u2192 ${p.url}`;
  }
  return `If I'd put ${fmtDlr(p.amount)} into VEQT in ${fmtDate(p.start)}, it would be worth ${fmtDlr(p.result)} today (+${p.returnPct.toFixed(1)}%). Run your own numbers \u2192 ${p.url}`;
}

export interface DCAShareParams {
  monthly: number;
  horizon: number;
  rate: number;
  result: number;
  url: string;
}

export function dcaShareSnippet(p: DCAShareParams): string {
  return `${fmtDlr(p.monthly)}/mo into VEQT for ${p.horizon} years could grow to ${fmtDlr(p.result)} (assuming ${p.rate}% returns). Plan your own \u2192 ${p.url}`;
}

export interface DividendShareParams {
  portfolio: number;
  annualIncome: number;
  yieldRate: number;
  url: string;
}

export function dividendShareSnippet(p: DividendShareParams): string {
  return `A ${fmtDlr(p.portfolio)} VEQT portfolio could generate ${fmtDlr(p.annualIncome)}/year in dividends at ${p.yieldRate}% yield. Estimate yours \u2192 ${p.url}`;
}

export interface TfsaRrspShareParams {
  account: "tfsa" | "rrsp";
  result: number;
  horizon: number;
  url: string;
}

export function tfsaRrspShareSnippet(p: TfsaRrspShareParams): string {
  return `My ${p.account.toUpperCase()} with VEQT could grow to ${fmtDlr(p.result)} over ${p.horizon} years. Project yours \u2192 ${p.url}`;
}
