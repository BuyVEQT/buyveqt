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

const SUBREDDIT = 'JustBuyVEQT';
const REDDIT_FETCH_TIMEOUT = 8000;

export async function getRedditPosts(
  sort: 'hot' | 'new' = 'hot',
  limit: number = 8
): Promise<RedditPost[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REDDIT_FETCH_TIMEOUT);

    const response = await fetch(
      `https://www.reddit.com/r/${SUBREDDIT}/${sort}.json?limit=${limit}&raw_json=1`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'BuyVEQT/1.0 (community site)',
        },
        next: { revalidate: 600 }, // 10 minutes
      }
    );

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
