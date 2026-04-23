import { NextResponse } from "next/server";

/**
 * Financial news wire, via Alpha Vantage's NEWS_SENTIMENT endpoint.
 *
 * We already pay the rate-limit cost on the AV key (25 req/day free tier) for
 * quote fallback, so this route caches aggressively (6h) to leave ~21 calls
 * per day for the quote layer. Six-hour freshness is fine for a broadsheet
 * — the aesthetic is "session recap", not a trading terminal.
 *
 * Topics are market-wide rather than per-ticker because AV's ticker-level
 * news coverage for TSX-listed ETFs (VCN.TO etc.) is thin. Broad topic
 * filtering surfaces the stuff that actually moves VEQT anyway:
 * rate decisions, inflation prints, sector-wide stories.
 */

export const revalidate = 21_600; // 6 hours

const AV_URL = "https://www.alphavantage.co/query";
const AV_TOPICS = "financial_markets,economy_monetary,finance";
const AV_LIMIT = 20;
const ITEMS_TO_RETURN = 6;

type AVSentimentLabel =
  | "Bearish"
  | "Somewhat-Bearish"
  | "Neutral"
  | "Somewhat-Bullish"
  | "Bullish";

interface AVTopicItem {
  topic: string;
  relevance_score: string;
}

interface AVTickerSentiment {
  ticker: string;
  relevance_score: string;
  ticker_sentiment_score: string;
  ticker_sentiment_label: AVSentimentLabel;
}

interface AVFeedItem {
  title: string;
  url: string;
  time_published: string; // YYYYMMDDTHHMMSS
  authors: string[];
  summary: string;
  source: string;
  source_domain: string;
  topics: AVTopicItem[];
  overall_sentiment_score: number;
  overall_sentiment_label: AVSentimentLabel;
  ticker_sentiment?: AVTickerSentiment[];
}

interface AVResponse {
  items?: string;
  feed?: AVFeedItem[];
  Note?: string;
  Information?: string;
}

export interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string; // ISO
  summary: string;
  sentimentScore: number;
  sentimentLabel: AVSentimentLabel;
  topics: string[];
}

export interface NewsPayload {
  items: NewsItem[];
  overall: {
    /** Normalized to three buckets for downstream UI logic. */
    sentiment: "bearish" | "neutral" | "bullish";
    /** Mean overall_sentiment_score across returned items, -1..1. */
    score: number;
  };
  fetchedAt: string;
  source: "alpha-vantage" | "unavailable";
}

/** Parse AV's compact time format (20260422T140000) into ISO. */
function parseAVTime(raw: string): string {
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const hh = raw.slice(9, 11);
  const mm = raw.slice(11, 13);
  const ss = raw.slice(13, 15) || "00";
  return new Date(`${y}-${m}-${d}T${hh}:${mm}:${ss}Z`).toISOString();
}

function normalizeItem(raw: AVFeedItem): NewsItem {
  return {
    title: raw.title,
    url: raw.url,
    source: raw.source,
    publishedAt: parseAVTime(raw.time_published),
    summary: raw.summary ?? "",
    sentimentScore: Number(raw.overall_sentiment_score) || 0,
    sentimentLabel: raw.overall_sentiment_label,
    topics: (raw.topics ?? [])
      .filter((t) => Number(t.relevance_score) >= 0.4)
      .map((t) => t.topic),
  };
}

function bucketSentiment(score: number): "bearish" | "neutral" | "bullish" {
  if (score <= -0.15) return "bearish";
  if (score >= 0.15) return "bullish";
  return "neutral";
}

const EMPTY: NewsPayload = {
  items: [],
  overall: { sentiment: "neutral", score: 0 },
  fetchedAt: new Date().toISOString(),
  source: "unavailable",
};

export async function GET() {
  const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
  if (!apiKey) {
    // Not configured — fail silent so the UI hides the wire strip.
    return NextResponse.json(EMPTY);
  }

  const url = new URL(AV_URL);
  url.searchParams.set("function", "NEWS_SENTIMENT");
  url.searchParams.set("topics", AV_TOPICS);
  url.searchParams.set("limit", String(AV_LIMIT));
  url.searchParams.set("sort", "LATEST");
  url.searchParams.set("apikey", apiKey);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8_000);

  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      next: { revalidate: 21_600 },
    });
    clearTimeout(timeout);

    if (!res.ok) return NextResponse.json(EMPTY);
    const json = (await res.json()) as AVResponse;

    if (json.Note || json.Information || !json.feed || json.feed.length === 0) {
      // Rate-limited or empty — don't surface.
      return NextResponse.json(EMPTY);
    }

    const items = json.feed
      .slice(0, ITEMS_TO_RETURN)
      .map(normalizeItem)
      // Drop oddball duplicates (same url) that AV sometimes repeats.
      .filter(
        (item, i, arr) => arr.findIndex((o) => o.url === item.url) === i
      );

    const avgScore =
      items.reduce((sum, it) => sum + it.sentimentScore, 0) /
      Math.max(items.length, 1);

    return NextResponse.json({
      items,
      overall: { sentiment: bucketSentiment(avgScore), score: avgScore },
      fetchedAt: new Date().toISOString(),
      source: "alpha-vantage",
    } satisfies NewsPayload);
  } catch {
    clearTimeout(timeout);
    return NextResponse.json(EMPTY);
  }
}
