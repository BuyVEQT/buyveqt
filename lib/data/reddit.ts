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
  subscribers: number;
  activeUsers: number | null;
}

const SUBREDDIT = 'JustBuyVEQT';
const REDDIT_FETCH_TIMEOUT = 8000;
const UA = 'web:BuyVEQT:1.0 (by /u/buyveqt)';

/* ── OAuth token management ──────────────────────────────── */
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
        'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': UA,
      },
      body: 'grant_type=client_credentials',
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.access_token) return null;

    oauthToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in ?? 3600) * 1000,
    };
    return oauthToken.token;
  } catch {
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

/* ── RSS fallback via rss2json (always works, no scores) ──── */
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

/* ── Main fetch with 3-tier fallback ─────────────────────── */
export async function getRedditPosts(
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 8,
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<RedditPost[]> {
  // Tier 1: OAuth API (full data, not IP-blocked)
  const token = await getOAuthToken();
  if (token) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

      let url = `https://oauth.reddit.com/r/${SUBREDDIT}/${sort}?limit=${limit}&raw_json=1`;
      if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

      const res = await fetch(url, {
        signal: controller.signal,
        headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': UA },
        next: { revalidate: 600 },
      });
      clearTimeout(timeout);

      if (res.ok) {
        const posts = parseRedditListing(await res.json());
        if (posts.length > 0) return posts;
      }
    } catch {
      // fall through
    }
  }

  // Tier 2: Public JSON API (full data, blocked on Vercel)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    let url = `https://old.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`;
    if (sort === 'top' && timeFilter) url += `&t=${timeFilter}`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': UA, 'Accept': 'application/json' },
      next: { revalidate: 600 },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const posts = parseRedditListing(await res.json());
      if (posts.length > 0) return posts;
    }
  } catch {
    // fall through
  }

  // Tier 3: RSS (no scores/comments, but always works)
  console.info(`[Reddit] JSON fetches failed for ${sort}, falling back to RSS`);
  return getRedditPostsRss(sort);
}

export async function getSubredditStats(): Promise<SubredditStats | null> {
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
          headers: { 'Authorization': `Bearer ${token}`, 'User-Agent': UA },
          next: { revalidate: 1800 },
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
      }
    } catch {
      // fall through
    }
  }

  // Tier 2: Public JSON
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const res = await fetch(
      `https://old.reddit.com/r/${SUBREDDIT}/about.json`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': UA, 'Accept': 'application/json' },
        next: { revalidate: 1800 },
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
    return null;
  }
}
