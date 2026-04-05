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
const REDDIT_USER_AGENT = 'BuyVEQT/1.0 (community site; buyveqt.ca)';

/* ── RSS fallback via rss2json (not blocked by Reddit) ────── */
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

export async function getRedditPosts(
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 8,
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<RedditPost[]> {
  // Tier 1: Reddit JSON API (may be blocked on Vercel)
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    let url = `https://old.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`;
    if (sort === 'top' && timeFilter) {
      url += `&t=${timeFilter}`;
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': REDDIT_USER_AGENT,
        'Accept': 'application/json',
      },
      next: { revalidate: 600 },
    });

    clearTimeout(timeout);

    if (response.ok) {
      const json = await response.json();
      const posts = json?.data?.children || [];

      const result = posts
        .map((child: Record<string, Record<string, unknown>>) => {
          const d = child.data;
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
            isStickied: d.stickied as boolean,
          };
        })
        .filter((post: RedditPost) => !post.isStickied);

      if (result.length > 0) return result;
    }
  } catch {
    // fall through to RSS
  }

  // Tier 2: RSS via rss2json (Reddit blocks Vercel IPs, rss2json is not blocked)
  console.info(`[Reddit] JSON fetch failed for ${sort}, falling back to RSS`);
  return getRedditPostsRss(sort);
}

export async function getSubredditStats(): Promise<SubredditStats | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const response = await fetch(
      `https://old.reddit.com/r/${SUBREDDIT}/about.json`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': REDDIT_USER_AGENT,
          'Accept': 'application/json',
        },
        next: { revalidate: 1800 },
      }
    );

    clearTimeout(timeout);

    if (!response.ok) return null;

    const json = await response.json();
    const data = json?.data;
    if (!data) return null;

    return {
      subscribers: (data.subscribers as number) ?? 0,
      activeUsers: (data.accounts_active as number) ?? null,
    };
  } catch (error) {
    console.warn('[Reddit] Failed to fetch subreddit stats:', error);
    return null;
  }
}
