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
 * Headers sent to the Cloudflare Worker proxy.
 *
 * Vercel's Node serverless `fetch` (undici) sends a `node` User-Agent
 * by default. Some CDN edge configs treat that as bot-ish traffic;
 * explicit identification avoids any chance of UA-based filtering
 * between Vercel and the proxy. The Worker itself passes its own UA
 * to Reddit, so this only matters for the Vercel→CF hop.
 */
const PROXY_HEADERS = {
  'User-Agent': 'buyveqt-web/1.0 (+https://buyveqt.ca)',
  Accept: 'application/json',
};

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

    // `cache: 'no-store'` deliberately bypasses Next's data cache.
    // The page itself is dynamically rendered (see app/community/page.tsx
    // `force-dynamic`) on Edge, then CDN-cached via response headers, so
    // there's no point also caching the underlying fetch — and Next's
    // fetch cache had been holding poisoned/empty responses across
    // revalidations, leaving the pulse strip stuck on zeros for hours.
    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: PROXY_HEADERS,
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
 * Returns subreddit-level stats from the Cloudflare Worker proxy.
 * On any failure (timeout, non-2xx, malformed body) returns
 * `{ subscribers: 0, activeUsers: null }` and the hero renders `—`
 * via `emptyAsDash`. No hardcoded last-known-good number — the page
 * either shows real live data or honestly admits it's missing.
 *
 * `activeUsers` stays nullable because Reddit's `/about` no longer
 * reliably populates `accounts_active` for unauthenticated requests.
 */
export async function getSubredditStats(): Promise<SubredditStats> {
  const empty: SubredditStats = { subscribers: 0, activeUsers: null };
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const res = await fetch(`${PROXY_BASE}/about`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: PROXY_HEADERS,
    });
    clearTimeout(timeout);
    if (!res.ok) {
      console.warn(`[reddit] proxy /about returned HTTP ${res.status}`);
      return empty;
    }

    const json = await res.json();
    const data = json?.data;
    if (!data) {
      console.warn('[reddit] proxy /about returned no data');
      return empty;
    }
    const subs = data.subscribers as number | undefined;
    return {
      subscribers: typeof subs === 'number' ? subs : 0,
      activeUsers: (data.accounts_active as number) ?? null,
    };
  } catch (err) {
    console.warn(
      '[reddit] proxy /about fetch failed:',
      err instanceof Error ? err.message : String(err)
    );
    return empty;
  }
}
