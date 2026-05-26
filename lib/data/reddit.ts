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
   *  from the top/all listing. */
  topPostScore?: number;
  /** Average comment count across the active feed (proxy for engagement).
   *  Derived page-side from `hotPosts`. */
  avgComments?: number;
}

const SUBREDDIT = 'JustBuyVEQT';
const REDDIT_FETCH_TIMEOUT = 8000;
const UA = 'web:BuyVEQT:1.0 (by /u/buyveqt)';
const PROXY_BASE = 'https://reddit-api.buyveqt.ca';

/* ── OAuth token management ──────────────────────────────────
 *
 * Restored from PR #107 (Apr 2026), the version that originally
 * worked. App-only OAuth (client_credentials grant) — no user login
 * needed, just `REDDIT_CLIENT_ID` + `REDDIT_CLIENT_SECRET` env vars.
 *
 * The Cloudflare Worker proxy approach (PR #108) replaced this and
 * worked for a while, but Reddit eventually blocked the Worker's IPs
 * (returns 403 to anonymous reads from CF egress). OAuth bypasses
 * those blocks by going through `oauth.reddit.com` with a bearer
 * token.
 *
 * Token cached in module scope; refreshed when within 60s of expiry.
 * Per-invocation cold starts get a fresh token, which is fine —
 * fetching one costs ~150ms.
 */
let oauthToken: { token: string; expiresAt: number } | null = null;

async function getOAuthToken(): Promise<string | null> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  if (oauthToken && Date.now() < oauthToken.expiresAt - 60_000) {
    return oauthToken.token;
  }

  try {
    const res = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });
    if (!res.ok) {
      console.warn(`[reddit] OAuth token request returned HTTP ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (!data.access_token) {
      console.warn('[reddit] OAuth token response missing access_token');
      return null;
    }
    oauthToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return oauthToken.token;
  } catch (err) {
    console.warn(
      '[reddit] OAuth token fetch threw:',
      err instanceof Error ? err.message : String(err)
    );
    return null;
  }
}

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

/* ── Tier 3: RSS fallback via rss2json (always works, no scores) ── */
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

/* ── Main fetch with 4-tier fallback ───────────────────────
 *
 * Re-ordered to put the Cloudflare Worker proxy second (after OAuth).
 * The Worker works reliably most of the time; Reddit sometimes
 * rate-limits it but a clean retry usually succeeds. OAuth still
 * wins when env vars are set since it bypasses both anonymous-read
 * blocks and Worker rate-limiting.
 *
 *   1. OAuth (oauth.reddit.com)  — full data, requires env vars
 *   2. Cloudflare Worker proxy   — full data when Reddit allows it
 *   3. Public JSON (old.reddit)  — full data when not IP-blocked
 *   4. RSS via rss2json          — no scores, but always works
 */
export async function getRedditPosts(
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 8,
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<RedditPost[]> {
  // Tier 1: OAuth API
  const token = await getOAuthToken();
  if (token) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

      let url = `https://oauth.reddit.com/r/${SUBREDDIT}/${sort}?limit=${limit}&raw_json=1`;
      if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA },
        cache: 'no-store',
      });
      clearTimeout(timeout);

      if (res.ok) {
        const posts = parseRedditListing(await res.json());
        if (posts.length > 0) return posts;
      } else {
        console.warn(`[reddit] OAuth ${sort} returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn(
        `[reddit] OAuth ${sort} fetch threw:`,
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  // Tier 2: Cloudflare Worker proxy
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    let url = `${PROXY_BASE}/${sort}?limit=${limit}`;
    if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

    const res = await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const posts = parseRedditListing(await res.json());
      if (posts.length > 0) return posts;
    }
  } catch {
    // fall through
  }

  // Tier 3: Public JSON API (may be IP-blocked from Vercel)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    let url = `https://old.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`;
    if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA, Accept: 'application/json' },
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const posts = parseRedditListing(await res.json());
      if (posts.length > 0) return posts;
    }
  } catch {
    // fall through to RSS
  }

  // Tier 4: RSS
  console.info(`[reddit] All JSON tiers failed for ${sort}; using RSS`);
  return getRedditPostsRss(sort);
}

/**
 * Subreddit stats with the same 4-tier OAuth → Worker proxy →
 * public → null chain. RSS doesn't expose subscriber counts, so
 * when all three JSON tiers fail we return
 * `{ subscribers: 0, activeUsers: null }` and the community hero
 * shows `—` via `emptyAsDash`.
 */
export async function getSubredditStats(): Promise<SubredditStats> {
  const empty: SubredditStats = { subscribers: 0, activeUsers: null };

  // Tier 1: OAuth
  const token = await getOAuthToken();
  if (token) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

      const res = await fetch(
        `https://oauth.reddit.com/r/${SUBREDDIT}/about`,
        {
          signal: controller.signal,
          headers: { Authorization: `Bearer ${token}`, 'User-Agent': UA },
          cache: 'no-store',
        }
      );
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        const data = json?.data;
        if (data) {
          return {
            subscribers: (data.subscribers as number) ?? 0,
            activeUsers: (data.accounts_active as number) ?? null,
          };
        }
      } else {
        console.warn(`[reddit] OAuth /about returned HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn(
        '[reddit] OAuth /about fetch threw:',
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  // Tier 2: Cloudflare Worker proxy
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const res = await fetch(`${PROXY_BASE}/about`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const data = json?.data;
      if (data && typeof data.subscribers === 'number' && data.subscribers > 0) {
        return {
          subscribers: data.subscribers as number,
          activeUsers: (data.accounts_active as number) ?? null,
        };
      }
    }
  } catch {
    // fall through
  }

  // Tier 3: Public JSON
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const res = await fetch(
      `https://old.reddit.com/r/${SUBREDDIT}/about.json`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': UA, Accept: 'application/json' },
        cache: 'no-store',
      }
    );
    clearTimeout(timeout);
    if (!res.ok) return empty;

    const json = await res.json();
    const data = json?.data;
    if (!data) return empty;
    return {
      subscribers: (data.subscribers as number) ?? 0,
      activeUsers: (data.accounts_active as number) ?? null,
    };
  } catch {
    return empty;
  }
}
