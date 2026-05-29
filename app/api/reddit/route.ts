import { NextResponse } from 'next/server';
import {
  getRedditPosts,
  getSubredditStats,
  type RedditPost,
  type SubredditStats,
} from '@/lib/data/reddit';

export const runtime = 'edge';

/* ── In-memory cache (per warm Edge instance) ───────────────
 * The fetch chain (OAuth → proxied .json → RSS) lives in lib/data/reddit.ts
 * and is shared with the server-rendered /community page — this route just
 * caches it and derives the hero's pulse-strip numbers. */
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

const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300',
};

export async function GET() {
  const now = Date.now();

  const postsFresh = now - postsCache.fetchedAt < POSTS_TTL;
  const statsFresh = now - statsCache.fetchedAt < STATS_TTL;

  if (postsFresh && statsFresh && Object.keys(postsCache.data).length > 0) {
    return NextResponse.json(
      { posts: postsCache.data, stats: statsCache.data, cached: true },
      { headers: CACHE_HEADERS }
    );
  }

  const [hot, topAll] = await Promise.all([
    getRedditPosts('hot', 12),
    getRedditPosts('top', 12, 'all'),
  ]);

  // Merge hot + top/all for trending so we always have 10+ entries.
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
    const freshStats = await getSubredditStats();
    // Only cache real stats — getSubredditStats returns { subscribers: 0 }
    // when every tier fails, which we don't want to pin for 30 minutes.
    if (freshStats && freshStats.subscribers > 0) {
      stats = freshStats;
      statsCache = { data: freshStats, fetchedAt: now };
    }
  }

  const finalPosts = gotData ? posts : postsCache.data;

  // Derive the pulse-strip numbers the community hero needs (topPostScore,
  // avgComments) so the hero populates from this one call. Mirrors
  // `deriveLiveStats` in app/community/page.tsx.
  const trendingForStats: RedditPost[] = finalPosts.trending ?? [];
  const topForStats: RedditPost[] = finalPosts.top ?? [];

  const realScores = topForStats.map((p) => p.score).filter((s) => s > 0);
  const topPostScore =
    realScores.length > 0 ? Math.max(...realScores) : undefined;

  const withComments = trendingForStats.filter((p) => p.commentCount > 0);
  const avgComments =
    withComments.length > 0
      ? Math.round(
          withComments.reduce((sum, p) => sum + p.commentCount, 0) /
            withComments.length
        )
      : undefined;

  const enrichedStats = stats ? { ...stats, topPostScore, avgComments } : null;

  return NextResponse.json(
    { posts: finalPosts, stats: enrichedStats, cached: !gotData },
    { headers: CACHE_HEADERS }
  );
}
