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
const OAUTH_UA = 'web:BuyVEQT:1.0 (by /u/buyveqt)';
// A real browser UA. Reddit blocks API-style UAs on anonymous reads, so the
// proxied/direct .json path presents itself as a normal browser.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

/* ── Residential-proxy fetch ─────────────────────────────────
 *
 * Reddit 403s its `.json` API from EVERY datacenter IP (Vercel AND
 * Cloudflare), regardless of User-Agent — confirmed by probing. The only
 * no-OAuth way to read full data (scores / comments / subscribers) is from a
 * NON-datacenter IP. Set a residential-proxy template in env to route through
 * one; `{url}` is replaced with the URL-encoded Reddit endpoint:
 *
 *   REDDIT_PROXY_TEMPLATE=https://api.scraperapi.com/?api_key=KEY&url={url}
 *   REDDIT_PROXY_TEMPLATE=https://app.scrapingbee.com/api/v1/?api_key=KEY&render=false&url={url}
 *
 * With no template set, this fetches directly (which Reddit blocks from
 * Vercel) and callers fall through to RSS. Works on both the Node (page) and
 * Edge (/api/reddit) runtimes — plain fetch + process.env only.
 */
function redditFetch(targetUrl: string, signal: AbortSignal): Promise<Response> {
  const tmpl = process.env.REDDIT_PROXY_TEMPLATE;
  const finalUrl = tmpl
    ? tmpl.replace('{url}', encodeURIComponent(targetUrl))
    : targetUrl;
  return fetch(finalUrl, {
    signal,
    headers: {
      'User-Agent': BROWSER_UA,
      Accept: 'application/json, text/plain, */*',
    },
    cache: 'no-store',
  });
}

/* ── OAuth token management ──────────────────────────────────
 *
 * App-only OAuth (client_credentials). Bypasses Reddit's anonymous-read IP
 * blocks via `oauth.reddit.com`. Optional: only used when REDDIT_CLIENT_ID +
 * REDDIT_CLIENT_SECRET are set. (Reddit currently gates new app approvals, so
 * the proxy path above is the primary route; OAuth lights up automatically if
 * creds ever exist.) Token cached in module scope, refreshed near expiry.
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
        'User-Agent': OAUTH_UA,
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

/* ── RSS fallback via rss2json (always works, no scores) ── */
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
        id: idMatch ? idMatch[1] : item.guid || `rss-${item.link}`,
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

/* ── Posts: OAuth → proxied/direct .json → RSS ─────────────
 *
 *   1. OAuth (oauth.reddit.com)     — full data, only if creds are set
 *   2. Proxied .json (old.reddit)   — full data; needs REDDIT_PROXY_TEMPLATE
 *                                      (a residential IP) since Reddit blocks
 *                                      datacenter IPs
 *   3. RSS via rss2json             — no scores/comments, but always works
 */
export async function getRedditPosts(
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 8,
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<RedditPost[]> {
  // Tier 1: OAuth (skipped instantly when creds are absent)
  const token = await getOAuthToken();
  if (token) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

      let url = `https://oauth.reddit.com/r/${SUBREDDIT}/${sort}?limit=${limit}&raw_json=1`;
      if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': OAUTH_UA },
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

  // Tier 2: public .json, via residential proxy if configured
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    let url = `https://old.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`;
    if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

    const res = await redditFetch(url, controller.signal);
    clearTimeout(timeout);

    if (res.ok) {
      const posts = parseRedditListing(await res.json());
      if (posts.length > 0) return posts;
    }
  } catch {
    // fall through to RSS
  }

  // Tier 3: RSS
  return getRedditPostsRss(sort);
}

/**
 * Subreddit stats (subscribers + active users) via the same OAuth → proxied
 * .json chain. RSS doesn't expose subscriber counts, so when both fail we
 * return `{ subscribers: 0, activeUsers: null }` and the hero shows `—`.
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
          headers: { Authorization: `Bearer ${token}`, 'User-Agent': OAUTH_UA },
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

  // Tier 2: public /about, via residential proxy if configured
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const res = await redditFetch(
      `https://old.reddit.com/r/${SUBREDDIT}/about.json`,
      controller.signal
    );
    clearTimeout(timeout);
    if (res.ok) {
      const json = await res.json();
      const data = json?.data;
      if (data && typeof data.subscribers === 'number') {
        return {
          subscribers: data.subscribers as number,
          activeUsers: (data.accounts_active as number) ?? null,
        };
      }
    }
  } catch {
    // fall through
  }

  return empty;
}
