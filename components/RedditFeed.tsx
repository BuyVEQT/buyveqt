import type { RedditPost } from "@/lib/data/reddit";

interface RedditFeedProps {
  posts: RedditPost[];
  className?: string;
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function RedditFeed({ posts, className }: RedditFeedProps) {
  if (posts.length === 0) return null;

  return (
    <div className={className}>
      <div className="space-y-0 divide-y divide-[var(--color-border)]">
        {posts.map((post) => (
          <div key={post.id} className="py-3 first:pt-0 last:pb-0">
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="flex items-start gap-2">
                <p className="text-sm font-medium text-[var(--color-text-primary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug line-clamp-2 flex-1">
                  {post.title}
                </p>
                {post.flair && (
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--color-base)] text-[var(--color-text-muted)] border border-[var(--color-border)]">
                    {post.flair}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                <span>u/{post.author}</span>
                <span className="flex items-center gap-0.5">
                  {/* Upvote arrow */}
                  <svg
                    viewBox="0 0 16 16"
                    width="12"
                    height="12"
                    fill="currentColor"
                  >
                    <path d="M8 2l5 6H9v6H7V8H3l5-6z" />
                  </svg>
                  {post.score}
                </span>
                <span className="flex items-center gap-0.5">
                  {/* Comment bubble */}
                  <svg
                    viewBox="0 0 16 16"
                    width="12"
                    height="12"
                    fill="currentColor"
                  >
                    <path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1z" />
                  </svg>
                  {post.commentCount}
                </span>
                <span>{timeAgo(post.createdAt)}</span>
              </div>
            </a>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--color-border)]">
        <a
          href="https://www.reddit.com/r/JustBuyVEQT/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          View more on r/JustBuyVEQT &rarr;
        </a>
      </div>
    </div>
  );
}
