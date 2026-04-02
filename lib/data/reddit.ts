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
const REDDIT_USER_AGENT = 'BuyVEQT/1.0 (community site)';

export async function getRedditPosts(
  sort: 'hot' | 'new' | 'top' = 'hot',
  limit: number = 8,
  timeFilter?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
): Promise<RedditPost[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    let url = `https://www.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`;
    if (sort === 'top' && timeFilter) {
      url += `&t=${timeFilter}`;
    }

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': REDDIT_USER_AGENT },
      next: { revalidate: 600 },
    });

    clearTimeout(timeout);

    if (!response.ok) return [];

    const json = await response.json();
    const posts = json?.data?.children || [];

    return posts
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
  } catch (error) {
    console.warn('[Reddit] Failed to fetch posts:', error);
    return [];
  }
}

export async function getSubredditStats(): Promise<SubredditStats | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const response = await fetch(
      `https://www.reddit.com/r/${SUBREDDIT}/about.json`,
      {
        signal: controller.signal,
        headers: { 'User-Agent': REDDIT_USER_AGENT },
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
