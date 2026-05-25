import type { RedditPost } from "@/lib/data/reddit";

function formatAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 365) return `${Math.floor(days / 365)}y ago`;
  if (days >= 30) return `${Math.floor(days / 30)}mo ago`;
  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) return `${hours}h ago`;
  const mins = Math.floor(diffMs / 60_000);
  if (mins >= 1) return `${mins}m ago`;
  return "just now";
}

function formatScore(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toLocaleString("en-CA");
}

interface FeaturedPostProps {
  post: RedditPost;
  /** Show the upvotes block on the right (hidden when we don't have score data). */
  showScore?: boolean;
}

/**
 * V2 featured post — the top entry of the active tab gets editorial treatment.
 *
 *  - Vermilion left stripe (4px) + heavier 1px ink border
 *  - "Top post · 01" vermilion-filled stamp + optional flair pill
 *  - Italic display headline (clamp 1.6 → 2.4rem)
 *  - Foot row: author · time · replies, with right-aligned upvote count
 *  - Hover: 2px lift + 22px paper shadow
 */
export default function FeaturedPost({
  post,
  showScore = true,
}: FeaturedPostProps) {
  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="cm-featured"
    >
      <div className="cm-featured__meta-top">
        <span className="cm-featured__top-stamp">Top post · 01</span>
        {post.flair && (
          <span className="ed-stamp" style={{ color: "var(--ink-mute)" }}>
            {post.flair}
          </span>
        )}
      </div>

      <h3 className="ed-display-italic cm-featured__title">
        &ldquo;{post.title}&rdquo;
      </h3>

      <div className="cm-featured__foot">
        <span className="cm-featured__author">— u/{post.author}</span>
        <span className="cm-featured__sep">·</span>
        <span>{formatAgo(post.createdAt)}</span>
        {post.commentCount > 0 && (
          <>
            <span className="cm-featured__sep">·</span>
            <span className="ed-numerals">
              {post.commentCount}{" "}
              {post.commentCount === 1 ? "reply" : "replies"}
            </span>
          </>
        )}
        {showScore && post.score > 0 && (
          <div className="cm-featured__upvotes">
            <span
              className="ed-display ed-numerals"
              style={{ color: "var(--stamp)" }}
            >
              {formatScore(post.score)}
            </span>
            <span className="ed-caption cm-featured__upvotes-cap">
              upvotes
            </span>
          </div>
        )}
      </div>

      <style jsx>{`
        .cm-featured {
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 26px 28px;
          background: var(--paper-light);
          border: 1px solid var(--ink);
          border-left: 4px solid var(--stamp);
          border-radius: 22px;
          text-decoration: none;
          color: inherit;
          margin-top: 8px;
          transition: transform 0.18s, box-shadow 0.18s;
        }
        .cm-featured:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 22px rgba(15, 13, 10, 0.06);
        }
        .cm-featured__meta-top {
          display: flex;
          gap: 14px;
          align-items: baseline;
          flex-wrap: wrap;
        }
        .cm-featured__top-stamp {
          font-family: var(--font-sans);
          font-size: 0.625rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--paper-light);
          background: var(--stamp);
          padding: 5px 12px 4px;
          border-radius: 4px;
        }
        .cm-featured__title {
          font-size: clamp(1.6rem, 3vw, 2.4rem);
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--ink);
          margin: 0;
          max-width: 32ch;
        }
        .cm-featured__foot {
          display: flex;
          gap: 10px;
          align-items: baseline;
          flex-wrap: wrap;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 13.5px;
          color: var(--ink-soft);
        }
        .cm-featured__author {
          color: var(--ink);
          font-weight: 500;
        }
        .cm-featured__sep {
          opacity: 0.4;
        }
        .cm-featured__upvotes {
          margin-left: auto;
          display: inline-flex;
          align-items: baseline;
          gap: 4px;
        }
        .cm-featured__upvotes-cap {
          margin-left: 4px;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 12px;
          color: var(--ink-mute);
        }
      `}</style>
    </a>
  );
}
