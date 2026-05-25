"use client";

import { useEffect, useState } from "react";
import type { RedditPost, SubredditStats } from "@/lib/data/reddit";
import FeaturedPost from "./FeaturedPost";

type TabId = "trending" | "top";

const TABS: { id: TabId; label: string; sublabel: string }[] = [
  { id: "trending", label: "This Week", sublabel: "What's hot" },
  { id: "top", label: "All Time", sublabel: "The greatest hits" },
];

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

interface CommunityContentProps {
  hotPosts: RedditPost[];
  topPosts: RedditPost[];
  /** Stats are surfaced upstairs in the hero now — passed only so the
   *  client-fallback effect can refresh them when the server data is stale. */
  stats: SubredditStats | null;
}

/**
 * V2 community feed.
 *
 *  - Tighter tabs row (Trending / All Time) — no more duplicate live-activity
 *    strip, those numbers live in `<CommunityHero>` upstairs
 *  - "New dispatch every 30 minutes" caption right-aligned with the tabs
 *  - First post → `<FeaturedPost>` (large editorial card with vermilion stripe)
 *  - Remaining posts → existing numbered row pattern, kept nearly as-is
 *
 * The "Take part" footer CTA was extracted into `<CommunityCTA>`.
 */
export default function CommunityContent({
  hotPosts: serverHot,
  topPosts: serverTop,
  stats: serverStats,
}: CommunityContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("trending");
  const [clientFeeds, setClientFeeds] = useState<Record<TabId, RedditPost[]>>({
    trending: serverHot,
    top: serverTop,
  });
  const [, setClientStats] = useState<SubredditStats | null>(serverStats);
  const [loading, setLoading] = useState(false);

  // Client-side refresh when server data is empty OR missing scores (ISR cache
  // may have stale RSS data without scores/comments).
  const serverEmpty = serverHot.length === 0 && serverTop.length === 0;
  const serverMissingScores =
    !serverEmpty && [...serverHot, ...serverTop].every((p) => p.score === 0);
  const needsClientFetch = serverEmpty || serverMissingScores;

  useEffect(() => {
    if (!needsClientFetch) return;

    let cancelled = false;
    if (serverEmpty) setLoading(true);

    fetch("/api/reddit")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const hasPosts =
          (data.posts?.trending?.length ?? 0) > 0 ||
          (data.posts?.top?.length ?? 0) > 0;
        if (hasPosts) {
          setClientFeeds({
            trending: data.posts.trending || [],
            top: data.posts.top || [],
          });
        }
        if (data.stats) setClientStats(data.stats);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [needsClientFetch, serverEmpty]);

  const posts = clientFeeds[activeTab];
  const hasScores = posts.some((p) => p.score > 0);
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="cm-feed bs-enter">
      {/* Tabs row */}
      <div className="cm-feed__head">
        <div className="cm-feed__tabs">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={active}
                className={`cm-feed__tab ${active ? "is-active" : ""}`}
              >
                <span className="ed-stamp cm-feed__tab-label">{tab.label}</span>
                <span className="ed-caption cm-feed__tab-sub">
                  {tab.sublabel}
                </span>
              </button>
            );
          })}
        </div>
        <span className="ed-caption cm-feed__refresh">
          New dispatch every 30 minutes
        </span>
      </div>
      <div className="rule-thick" />

      {loading ? (
        <ol className="cm-feed__list cm-feed__list--skeleton">
          {Array.from({ length: 6 }).map((_, i) => (
            <li key={i} className="cm-feed__row">
              <div className="skeleton cm-feed__skel-num" />
              <div className="cm-feed__skel-body">
                <div className="skeleton cm-feed__skel-title" />
                <div className="skeleton cm-feed__skel-meta" />
              </div>
            </li>
          ))}
        </ol>
      ) : posts.length > 0 ? (
        <>
          {/* Featured post */}
          {featured && <FeaturedPost post={featured} showScore={hasScores} />}

          {/* Numbered list — starts at 02 since featured is 01 */}
          <ol className="cm-feed__list">
            {rest.map((post, i) => (
              <li key={post.id} className="cm-feed__row">
                <span className="ed-display ed-numerals cm-feed__num">
                  {String(i + 2).padStart(2, "0")}
                </span>

                <a
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cm-feed__link"
                >
                  <h3 className="ed-display cm-feed__title">
                    &ldquo;{post.title}&rdquo;
                  </h3>
                  <p className="cm-feed__meta">
                    <span>— u/{post.author}</span>
                    <span className="cm-feed__sep">·</span>
                    <span>{formatAgo(post.createdAt)}</span>
                    {post.commentCount > 0 && (
                      <>
                        <span className="cm-feed__sep">·</span>
                        <span className="ed-numerals">
                          {post.commentCount}{" "}
                          {post.commentCount === 1 ? "reply" : "replies"}
                        </span>
                      </>
                    )}
                    {post.flair && (
                      <>
                        <span className="cm-feed__sep">·</span>
                        <span className="cm-feed__flair">{post.flair}</span>
                      </>
                    )}
                  </p>
                </a>

                {hasScores && (
                  <div className="cm-feed__score">
                    <span
                      className="ed-display ed-numerals cm-feed__score-num"
                      style={{
                        color:
                          post.score >= 100 ? "var(--stamp)" : "var(--ink)",
                      }}
                    >
                      {formatScore(post.score)}
                    </span>
                    <span className="ed-caption cm-feed__score-cap">
                      upvotes
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </>
      ) : (
        /* Empty state — quietly redirect to the source */
        <div className="cm-feed__empty">
          <p
            className="ed-body italic"
            style={{ color: "var(--ink-soft)" }}
          >
            Couldn&apos;t pull the wire from Reddit just now.
          </p>
          <p className="ed-caption cm-feed__empty-link">
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Visit r/JustBuyVEQT directly &rarr;
            </a>
          </p>
        </div>
      )}

      <style jsx>{`
        .cm-feed {
          padding: 30px 0 12px;
        }
        .cm-feed__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .cm-feed__tabs {
          display: flex;
          gap: 28px;
        }
        .cm-feed__tab {
          appearance: none;
          background: transparent;
          border: 0;
          padding: 0 0 4px;
          text-align: left;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 4px;
          border-bottom: 2px solid transparent;
          transition: border-color 0.18s;
        }
        .cm-feed__tab.is-active {
          border-bottom-color: var(--stamp);
        }
        .cm-feed__tab-label {
          color: var(--ink-soft);
          transition: color 0.18s;
        }
        .cm-feed__tab.is-active .cm-feed__tab-label {
          color: var(--stamp);
        }
        .cm-feed__tab-sub {
          font-family: var(--font-serif);
          font-style: italic;
          color: var(--ink-mute);
          font-size: 11.5px;
        }
        .cm-feed__refresh {
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 11.5px;
          color: var(--ink-mute);
        }
        .cm-feed__list {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .cm-feed__row {
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 20px;
          padding: 20px 0;
          border-top: 1px solid var(--rule-soft);
          align-items: start;
        }
        .cm-feed__row:last-child {
          border-bottom: 1px solid var(--rule-soft);
        }
        .cm-feed__num {
          font-size: clamp(1.4rem, 2vw, 1.8rem);
          line-height: 1;
          color: var(--ink-mute);
          padding-top: 2px;
        }
        .cm-feed__link {
          min-width: 0;
          text-decoration: none;
          color: inherit;
          display: block;
        }
        .cm-feed__title {
          font-size: clamp(1.1rem, 1.8vw, 1.4rem);
          line-height: 1.2;
          letter-spacing: -0.012em;
          color: var(--ink);
          margin: 0;
          font-weight: 500;
        }
        .cm-feed__link:hover .cm-feed__title {
          text-decoration: underline;
          text-decoration-thickness: 1.5px;
          text-underline-offset: 4px;
        }
        .cm-feed__meta {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: baseline;
          font-family: var(--font-serif);
          font-style: italic;
          font-size: 13px;
          color: var(--ink-mute);
        }
        .cm-feed__sep {
          opacity: 0.4;
        }
        .cm-feed__flair {
          color: var(--stamp);
          font-style: italic;
        }
        .cm-feed__score {
          text-align: right;
          min-width: 60px;
        }
        .cm-feed__score-num {
          font-size: clamp(1.3rem, 1.8vw, 1.6rem);
          line-height: 1;
          letter-spacing: -0.015em;
        }
        .cm-feed__score-cap {
          margin-top: 4px;
          font-family: var(--font-serif);
          font-style: italic;
          display: block;
          font-size: 10.5px;
          color: var(--ink-mute);
          letter-spacing: 0.04em;
        }
        @media (max-width: 560px) {
          .cm-feed__row {
            grid-template-columns: auto 1fr;
          }
          .cm-feed__score {
            grid-column: 2;
            text-align: left;
            display: flex;
            align-items: baseline;
            gap: 8px;
            min-width: 0;
            margin-top: 4px;
          }
          .cm-feed__score-cap {
            margin-top: 0;
          }
        }
        .cm-feed__skel-num {
          height: 28px;
          width: 32px;
        }
        .cm-feed__skel-body {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .cm-feed__skel-title {
          height: 20px;
          width: 75%;
        }
        .cm-feed__skel-meta {
          height: 12px;
          width: 50%;
        }
        .cm-feed__empty {
          padding: 48px 0;
          text-align: center;
        }
        .cm-feed__empty-link {
          margin-top: 16px;
        }
        .cm-feed__empty-link :global(a) {
          color: var(--stamp);
          text-decoration: underline;
          text-underline-offset: 3px;
        }
      `}</style>
    </section>
  );
}
