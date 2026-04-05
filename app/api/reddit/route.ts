import { NextResponse } from 'next/server';
import type { RedditPost, SubredditStats } from '@/lib/data/reddit';

export const runtime = 'edge';

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

/* ── Reddit JSON fetch (may be blocked by Reddit on Vercel) ── */
async function fetchPostsJson(
  sort: string,
  limit: number,
  timeFilter?: string
): Promise<RedditPost[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT);

  let url = `https://old.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`;
  if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
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

/* ── RSS fallback via rss2json (not blocked by Reddit) ────── */
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

async function fetchStats(): Promise<SubredditStats | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REDDIT_TIMEOUT);

  try {
    const res = await fetch(
      `https://old.reddit.com/r/${SUBREDDIT}/about.json`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': UA, 'Accept': 'application/json' },
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

  // Tier 1: Try Reddit JSON API directly
  const [hot, fresh, topAll] = await Promise.all([
    fetchPostsJson('hot', 12),
    fetchPostsJson('new', 12),
    fetchPostsJson('top', 12, 'all'),
  ]);

  let trending: RedditPost[] = [];
  let newFeed: RedditPost[] = [];
  const gotJsonData = hot.length > 0 || fresh.length > 0;

  if (gotJsonData) {
    // Merge hot + top/all for trending
    const seenIds = new Set<string>();
    for (const post of [...hot, ...topAll]) {
      if (!seenIds.has(post.id)) {
        seenIds.add(post.id);
        trending.push(post);
      }
      if (trending.length >= 10) break;
    }
    newFeed = fresh.slice(0, 10);
  }

  // Tier 2: RSS fallback via rss2json (Reddit blocks Vercel IPs but rss2json is not blocked)
  if (!gotJsonData) {
    const [rssHot, rssNew] = await Promise.all([
      fetchPostsRss('hot'),
      fetchPostsRss('new'),
    ]);
    trending = rssHot.slice(0, 10);
    newFeed = rssNew.slice(0, 10);
  }

  const posts: Record<string, RedditPost[]> = {
    trending,
    new: newFeed,
  };

  const gotData = trending.length > 0 || newFeed.length > 0;
  if (gotData) {
    postsCache = { data: posts, fetchedAt: now };
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

  const finalPosts = gotData ? posts : postsCache.data;

  return NextResponse.json(
    { posts: finalPosts, stats, cached: !gotData },
    { headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300' } }
  );
}
