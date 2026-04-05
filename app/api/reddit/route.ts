import { NextResponse } from 'next/server';
import type { RedditPost, SubredditStats } from '@/lib/data/reddit';

export const runtime = 'edge';

const SUBREDDIT = 'JustBuyVEQT';
const REDDIT_TIMEOUT = 8000;
const PROXY_BASE = 'https://reddit-api.buyveqt.ca';

/* ── In-memory cache ─────────────────────────────────────── */
interface CacheEntry<T> {
  data: T;
  fetchedAt: number;
}

let postsCache: CacheEntry<Record<string, RedditPost[]>> = {
  data: {},
  fetchedAt: 0,
};
let statsCache: CacheEntry<SubredditStats | null> = {
  data: null,
  fetchedAt: 0,
};

const POSTS_TTL = 5 * 60_000;
const STATS_TTL = 30 * 60_000;

/* ── Reddit response parser ──────────────────────────────── */
function parseRedditListing(json: Record<string, unknown>): RedditPost[] {
  const children = (json?.data as Record<string, unknown>)?.children;
  if (!Array.isArray(children)) return [];

  return children
    .filter((c: Record<string, Record<string, unknown>>) => !c.data.stickied)
    .map((c: Record<string, Record<string, unknown>>) => {
      const d = c.data;
      return {
        id: d.id as string,
        title: d.title as string,
        author: d.author as string,
        createdAt: new Date((d.created_utc as number) * 1000).toISOString(),
        score: d.score as number,
        commentCount: d.num_comments as number,
        permalink: `https://www.reddit.com${d.permalink as string}`,
        flair: (d.link_flair_text as string) || null,
        isSelf: d.is_self as boolean,
        isStickied: false,
      };
    });
}

/* ── Fetch via Cloudflare Worker proxy (full data, always works) ── */
async function fetchPostsProxy(
  sort: string,
  limit: number,
  timeFilter?: string
): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT);

  let url = `${PROXY_BASE}/${sort}?limit=${limit}`;
  if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    if (!res.ok) return [];
    return parseRedditListing(await res.json());
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

async function fetchStatsProxy(): Promise<SubredditStats | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT);

  try {
    const res = await fetch(`${PROXY_BASE}/about`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);
    if (!res.ok) return null;

    const json = await res.json();
    const data = json?.data;
    if (!data) return null;
    return {
      subscribers: (data.subscribers as number) ?? 0,
      activeUsers: (data.accounts_active as number) ?? null,
    };
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

/* ── RSS fallback via rss2json (no scores, but always works) ── */
interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
}

async function fetchPostsRss(sort: string): Promise<RedditPost[]> {
  try {
    const rssUrl = `https://www.reddit.com/r/${SUBREDDIT}/${sort}.rss`;
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return [];

    const json = await res.json();
    if (json.status !== 'ok' || !json.items?.length) return [];

    return (json.items as Rss2JsonItem[]).map((item) => {
      const idMatch = item.guid?.match(/t3_(\w+)/);
      const authorClean = item.author?.replace(/^\/u\//, '') || 'unknown';
      return {
        id: idMatch ? idMatch[1] : item.guid || Math.random().toString(36),
        title: item.title,
        author: authorClean,
        createdAt: new Date(item.pubDate).toISOString(),
        score: 0,
        commentCount: 0,
        permalink: item.link,
        flair: null,
        isSelf: true,
        isStickied: false,
      };
    });
  } catch {
    return [];
  }
}

/* ── Fetch with fallback ─────────────────────────────────── */
async function fetchPosts(
  sort: string,
  limit: number,
  timeFilter?: string
): Promise<RedditPost[]> {
  // Tier 1: Cloudflare Worker proxy (full data, not blocked)
  const posts = await fetchPostsProxy(sort, limit, timeFilter);
  if (posts.length > 0) return posts;

  // Tier 2: RSS (no scores, but always works)
  return fetchPostsRss(sort);
}

/* ── Route handler ───────────────────────────────────────── */
export async function GET() {
  const now = Date.now();

  const postsFresh = now - postsCache.fetchedAt < POSTS_TTL;
  const statsFresh = now - statsCache.fetchedAt < STATS_TTL;

  if (postsFresh && statsFresh && Object.keys(postsCache.data).length > 0) {
    return NextResponse.json(
      { posts: postsCache.data, stats: statsCache.data, cached: true },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
    );
  }

  const [hot, topAll] = await Promise.all([
    fetchPosts('hot', 12),
    fetchPosts('top', 12, 'all'),
  ]);

  // Merge hot + top/all for trending
  const seenIds = new Set<string>();
  const trending: RedditPost[] = [];
  for (const post of [...hot, ...topAll]) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      trending.push(post);
    }
    if (trending.length >= 10) break;
  }

  const posts: Record<string, RedditPost[]> = {
    trending,
    top: topAll.slice(0, 10),
  };

  const gotData = trending.length > 0 || topAll.length > 0;
  if (gotData) {
    postsCache = { data: posts, fetchedAt: now };
  }

  let stats = statsCache.data;
  if (!statsFresh) {
    const freshStats = await fetchStatsProxy();
    if (freshStats) {
      stats = freshStats;
      statsCache = { data: freshStats, fetchedAt: now };
    }
  }

  const finalPosts = gotData ? posts : postsCache.data;

  return NextResponse.json(
    { posts: finalPosts, stats, cached: !gotData },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
  );
}
