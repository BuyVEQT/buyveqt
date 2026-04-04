import { NextResponse } from 'next/server';
import type { RedditPost, SubredditStats } from '@/lib/data/reddit';

const SUBREDDIT = 'JustBuyVEQT';
const REDDIT_TIMEOUT = 8000;
const UA = 'BuyVEQT/1.0 (community site)';

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

const POSTS_TTL = 5 * 60_000; // 5 min
const STATS_TTL = 30 * 60_000; // 30 min

/* ── Fetch helpers ───────────────────────────────────────── */
async function fetchPosts(
  sort: string,
  limit: number,
  timeFilter?: string
): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT);

  let url = `https://www.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`;
  if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA },
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (!res.ok) return [];

    const json = await res.json();
    return (json?.data?.children || [])
      .filter(
        (c: Record<string, Record<string, unknown>>) => !c.data.stickied
      )
      .map((c: Record<string, Record<string, unknown>>) => {
        const d = c.data;
        return {
          id: d.id as string,
          title: d.title as string,
          author: d.author as string,
          createdAt: new Date(
            (d.created_utc as number) * 1000
          ).toISOString(),
          score: d.score as number,
          commentCount: d.num_comments as number,
          permalink: `https://www.reddit.com${d.permalink as string}`,
          flair: (d.link_flair_text as string) || null,
          isSelf: d.is_self as boolean,
          isStickied: false,
        };
      });
  } catch {
    clearTimeout(timeout);
    return [];
  }
}

async function fetchStats(): Promise<SubredditStats | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT);

  try {
    const res = await fetch(
      `https://www.reddit.com/r/${SUBREDDIT}/about.json`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': UA },
        cache: 'no-store',
      }
    );
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

/* ── Route handler ───────────────────────────────────────── */
export async function GET() {
  const now = Date.now();

  // Return cached posts if fresh
  const postsFresh = now - postsCache.fetchedAt < POSTS_TTL;
  const statsFresh = now - statsCache.fetchedAt < STATS_TTL;

  if (postsFresh && statsFresh && Object.keys(postsCache.data).length > 0) {
    return NextResponse.json(
      { posts: postsCache.data, stats: statsCache.data, cached: true },
      { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
    );
  }

  // Fetch fresh data — try hot + new + top/all as fallback
  const [hot, fresh, topAll] = await Promise.all([
    fetchPosts('hot', 12),
    fetchPosts('new', 12),
    fetchPosts('top', 12, 'all'),
  ]);

  // For "trending" tab: prefer hot, backfill with top/all to always have 10+
  const seenIds = new Set<string>();
  const trending: RedditPost[] = [];
  for (const post of [...hot, ...topAll]) {
    if (!seenIds.has(post.id)) {
      seenIds.add(post.id);
      trending.push(post);
    }
    if (trending.length >= 10) break;
  }

  const newPosts: Record<string, RedditPost[]> = {
    trending,
    new: fresh.slice(0, 10),
  };

  // Only update cache if we got real data
  const gotData = trending.length > 0 || fresh.length > 0;
  if (gotData) {
    postsCache = { data: newPosts, fetchedAt: now };
  }

  // Stats
  let stats = statsCache.data;
  if (!statsFresh) {
    const freshStats = await fetchStats();
    if (freshStats) {
      stats = freshStats;
      statsCache = { data: freshStats, fetchedAt: now };
    }
  }

  // Return fresh data, or stale cache if fetch failed
  const finalPosts = gotData ? newPosts : postsCache.data;

  return NextResponse.json(
    { posts: finalPosts, stats, cached: !gotData },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
  );
}
