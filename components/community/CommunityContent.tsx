"use client";

import { useState, useEffect } from "react";
import type { RedditPost, SubredditStats } from "@/lib/data/reddit";

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
  return n.toLocaleString();
}

interface CommunityContentProps {
  hotPosts: RedditPost[];
  topPosts: RedditPost[];
  stats: SubredditStats | null;
}

/**
 * The forum's post list — a broadsheet take on Reddit's feed.
 *
 * Tabs read as section dispatches ("This Week" / "All Time") rather than
 * pill buttons. Each post is a numbered entry with a display-italic title
 * and a caption strip carrying the meta — author, time, score, replies,
 * flair — using the same typographic vocabulary as the home page's
 * "Letters" section so the two surfaces feel like one publication.
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
  const [clientStats, setClientStats] = useState<SubredditStats | null>(
    serverStats
  );
  const [loading, setLoading] = useState(false);

  // Client-side refresh when server data is empty OR missing scores
  // (ISR cache may have stale RSS data without scores/comments).
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

  return (
    <section className="bs-enter pb-12">
      {/* ── Tab dispatch + live activity strip ─────────────────── */}
      <div className="border-t-2 border-[var(--ink)] pt-4 sm:pt-5 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 mb-6 sm:mb-8">
        <div className="flex items-end gap-x-7 sm:gap-x-9">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="group text-left"
                aria-pressed={active}
              >
                <span
                  className="bs-stamp block"
                  style={{
                    color: active ? "var(--stamp)" : "var(--ink-soft)",
                    borderBottom: active
                      ? "2px solid var(--stamp)"
                      : "2px solid transparent",
                    paddingBottom: "3px",
                    transition: "color 120ms",
                  }}
                >
                  {tab.label}
                </span>
                <span
                  className="bs-caption italic block mt-0.5 text-[11.5px]"
                  style={{
                    color: active ? "var(--ink)" : "var(--ink-soft)",
                    opacity: active ? 1 : 0.7,
                  }}
                >
                  {tab.sublabel}
                </span>
              </button>
            );
          })}
        </div>

        {clientStats && (
          <p
            className="bs-caption italic text-[12px] flex flex-wrap items-center gap-x-2.5 gap-y-1"
            style={{ color: "var(--ink-soft)" }}
          >
            <span>
              <span className="bs-numerals not-italic text-[var(--ink)]">
                {clientStats.subscribers.toLocaleString("en-CA")}
              </span>{" "}
              members
            </span>
            {clientStats.activeUsers !== null && clientStats.activeUsers > 0 && (
              <>
                <span className="opacity-50">·</span>
                <span>
                  <span className="bs-numerals not-italic text-[var(--ink)]">
                    {clientStats.activeUsers.toLocaleString("en-CA")}
                  </span>{" "}
                  online now
                </span>
              </>
            )}
            <span className="opacity-50">·</span>
            <span className="text-[10.5px]" style={{ letterSpacing: "0.06em" }}>
              dispatch every 30m
            </span>
          </p>
        )}
      </div>

      {/* ── Post list ──────────────────────────────────────────── */}
      {loading ? (
        <ol className="space-y-0">
          {Array.from({ length: 6 }).map((_, i) => (
            <li
              key={i}
              className={`py-5 grid grid-cols-[auto_1fr] gap-5 sm:gap-7 ${
                i === 0 ? "border-t-2" : "border-t"
              } border-[var(--ink)]`}
            >
              <div className="skeleton h-7 w-8" />
              <div className="space-y-2">
                <div className="skeleton h-5 w-3/4" />
                <div className="skeleton h-3 w-1/2" />
              </div>
            </li>
          ))}
        </ol>
      ) : posts.length > 0 ? (
        <ol className="space-y-0">
          {posts.map((post, idx) => (
            <li
              key={post.id}
              className={`py-5 grid grid-cols-[auto_1fr_auto] gap-x-5 sm:gap-x-7 gap-y-2 items-start ${
                idx === 0 ? "border-t-2" : "border-t"
              } border-[var(--ink)]`}
            >
              <span className="bs-display bs-numerals text-2xl sm:text-3xl text-[var(--ink-soft)] leading-none pt-1">
                {String(idx + 1).padStart(2, "0")}
              </span>

              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group block min-w-0"
              >
                <h3 className="bs-display-italic text-xl sm:text-[1.625rem] leading-[1.18] text-[var(--ink)] group-hover:text-[var(--stamp)] transition-colors">
                  &ldquo;{post.title}&rdquo;
                </h3>
                <p className="bs-caption mt-2 flex items-center gap-x-2 gap-y-1 flex-wrap">
                  <span>&mdash; u/{post.author}</span>
                  <span className="opacity-40">·</span>
                  <span>{formatAgo(post.createdAt)}</span>
                  {post.commentCount > 0 && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="bs-numerals">
                        {post.commentCount} {post.commentCount === 1 ? "reply" : "replies"}
                      </span>
                    </>
                  )}
                  {post.flair && (
                    <>
                      <span className="opacity-40">·</span>
                      <span
                        className="italic"
                        style={{ color: "var(--stamp)" }}
                      >
                        {post.flair}
                      </span>
                    </>
                  )}
                </p>
              </a>

              {/* Score column — only when we have real upvote data.
                  Sits on the right like a vote tally on a printed ballot. */}
              {hasScores && (
                <div
                  className="text-right shrink-0 pt-1"
                  style={{ minWidth: "3.25rem" }}
                >
                  <p
                    className="bs-display bs-numerals text-[1.5rem] sm:text-[1.75rem] leading-none tabular-nums"
                    style={{
                      color:
                        post.score >= 100
                          ? "var(--stamp)"
                          : "var(--ink)",
                    }}
                  >
                    {formatScore(post.score)}
                  </p>
                  <p
                    className="bs-caption italic text-[10.5px] mt-1"
                    style={{
                      color: "var(--ink-soft)",
                      letterSpacing: "0.06em",
                    }}
                  >
                    upvotes
                  </p>
                </div>
              )}
            </li>
          ))}
        </ol>
      ) : (
        /* Empty state — quietly redirect to the source */
        <div className="border-t-2 border-[var(--ink)] py-12 text-center">
          <p className="bs-body italic" style={{ color: "var(--ink-soft)" }}>
            Couldn&apos;t pull the wire from Reddit just now.
          </p>
          <p className="bs-caption mt-4">
            <a
              href="https://www.reddit.com/r/JustBuyVEQT/"
              target="_blank"
              rel="noopener noreferrer"
              className="bs-link"
            >
              Visit r/JustBuyVEQT directly &rarr;
            </a>
          </p>
        </div>
      )}

      {/* ── Footer CTA strip ───────────────────────────────────── */}
      <div className="mt-10 sm:mt-12 pt-6 border-t-2 border-[var(--ink)] grid grid-cols-1 sm:grid-cols-12 gap-6 sm:gap-10">
        <div className="sm:col-span-7">
          <p className="bs-stamp mb-2">Take part</p>
          <h3 className="bs-display text-2xl sm:text-3xl leading-[1.05]">
            Got a question, a milestone,
            <br />
            <em className="bs-display-italic">or a panic to share?</em>
          </h3>
          <p
            className="bs-body mt-3 max-w-[44ch] text-[15px]"
            style={{ color: "var(--ink-soft)" }}
          >
            The subreddit is where holders talk to each other unsupervised.
            Bring your real numbers; bring your bad takes; you&apos;ll get
            honesty back.
          </p>
        </div>

        <div className="sm:col-span-5 flex flex-col gap-3 items-start sm:items-end justify-end">
          <a
            href="https://www.reddit.com/r/JustBuyVEQT/"
            target="_blank"
            rel="noopener noreferrer"
            className="bs-stamp inline-flex items-center group"
            style={{
              color: "var(--paper)",
              backgroundColor: "var(--stamp)",
              padding: "10px 16px 9px",
              letterSpacing: "0.16em",
            }}
          >
            <span>Open r/JustBuyVEQT</span>
            <span
              aria-hidden
              className="ml-2 transition-transform group-hover:translate-x-0.5"
            >
              &rarr;
            </span>
          </a>
          <a
            href="https://www.reddit.com/r/JustBuyVEQT/submit"
            target="_blank"
            rel="noopener noreferrer"
            className="bs-link bs-label"
          >
            Start a new thread &rarr;
          </a>
        </div>
      </div>
    </section>
  );
}
