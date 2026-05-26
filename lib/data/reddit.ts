export interface RedditPost {
  id: string;
  title: string;
  author: string;
  createdAt: string;
  score: number;
  commentCount: number;
  permalink: string;
  flair: string | null;
  isSelf: boolean;
  isStickied: boolean;
}

export interface SubredditStats {
  /** Total all-time subscriber count. Source: Reddit /about endpoint. */
  subscribers: number;
  /** Users currently active in the sub. Source: Reddit /about endpoint. */
  activeUsers: number | null;
  /** Highest score on any top-all-time post on file. Derived page-side
   *  from the top/all listing. Shows what's resonated with the community
   *  without misleading when daily volume is low. */
  topPostScore?: number;
  /** Average comment count across the active feed (proxy for engagement).
   *  Derived page-side from `hotPosts`. */
  avgComments?: number;
}

const SUBREDDIT = 'JustBuyVEQT';
const REDDIT_FETCH_TIMEOUT = 8000;
const PROXY_BASE = 'https://reddit-api.buyveqt.ca';

/**
 * Last-known-good subscriber count. Used as a baseline when the
 * proxy is unreachable so the community hero never renders a literal
 * "0 members" (which reads as a broken site). Bump this number when
 * we re-deploy and notice the live count has drifted meaningfully.
 *
 * The real count is fetched live from `${PROXY_BASE}/about` on every
 * revalidation (every 30 min via page-level ISR). This constant only
 * kicks in when that fetch fails.
 */
const BASELINE_SUBSCRIBERS = 6180;

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

/* ── RSS fallback via rss2json (no scores, but always works) ── */
interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
}

async function getRedditPostsRss(sort: string): Promise<RedditPost[]> {
  try {
    const rssUrl = `https://www.reddit.com/r/${SUBREDDIT}/${sort}.rss`;
    const res = await fetch(
      `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`,
      { next: { revalidate: 600 } }
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

/* ── Main fetch: Cloudflare proxy → RSS fallback ─────────── */
export async function getRedditPosts(
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 8,
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<RedditPost[]> {
  // Tier 1: Cloudflare Worker proxy (full data, not blocked)
  let url = `${PROXY_BASE}/${sort}?limit=${limit}`;
  if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const posts = parseRedditListing(await res.json());
      if (posts.length > 0) return posts;
      console.warn(`[reddit] proxy ${sort} returned 0 posts; falling back to RSS`);
    } else {
      console.warn(`[reddit] proxy ${sort} returned HTTP ${res.status}; falling back to RSS`);
    }
  } catch (err) {
    // Surface the real cause in Vercel logs — the silent catch is why
    // we couldn't tell whether the proxy was unreachable or just slow.
    console.warn(
      `[reddit] proxy ${sort} fetch failed (${url}):`,
      err instanceof Error ? err.message : String(err)
    );
  }

  // Tier 2: RSS (no scores/comments, but always works)
  return getRedditPostsRss(sort);
}

/**
 * Returns subreddit-level stats. Always returns a non-null object —
 * falls back to the `BASELINE_SUBSCRIBERS` constant if the proxy
 * fetch fails, so the community hero never renders "0 members"
 * during a proxy outage. `activeUsers` stays nullable because
 * Reddit's `/about` no longer reliably populates `accounts_active`
 * for unauthenticated requests, and the hero already handles a
 * null/0 value by showing "—" instead of a literal zero.
 */
export async function getSubredditStats(): Promise<SubredditStats> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const res = await fetch(`${PROXY_BASE}/about`, {
      signal: controller.signal,
      next: { revalidate: 1800 },
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`[reddit] proxy /about returned HTTP ${res.status}; using baseline`);
      return { subscribers: BASELINE_SUBSCRIBERS, activeUsers: null };
    }

    const json = await res.json();
    const data = json?.data;
    if (!data) {
      console.warn('[reddit] proxy /about returned no data; using baseline');
      return { subscribers: BASELINE_SUBSCRIBERS, activeUsers: null };
    }
    const subs = data.subscribers as number | undefined;
    return {
      // Even if the response is missing `subscribers`, prefer the
      // baseline over a literal 0 — a 0 here reads as a broken site,
      // a slightly stale baseline reads as "we're still here".
      subscribers: typeof subs === 'number' && subs > 0 ? subs : BASELINE_SUBSCRIBERS,
      activeUsers: (data.accounts_active as number) ?? null,
    };
  } catch (err) {
    console.warn(
      '[reddit] proxy /about fetch failed; using baseline:',
      err instanceof Error ? err.message : String(err)
    );
    return { subscribers: BASELINE_SUBSCRIBERS, activeUsers: null };
  }
}
