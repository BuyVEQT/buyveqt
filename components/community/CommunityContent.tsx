"use client";

import { useState, useEffect } from "react";
import type { RedditPost, SubredditStats } from "@/lib/data/reddit";

type TabId = "trending" | "new";

const TABS: { id: TabId; label: string }[] = [
  { id: "trending", label: "Trending" },
  { id: "new", label: "New" },
];

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

/** Client-side Reddit fetch — used as fallback when server-side data is empty
 *  (Reddit blocks requests from cloud provider IPs like Vercel) */
export async function fetchRedditClient(
  sort: string,
  limit: number = 10
): Promise<RedditPost[]> {
  try {
    const url = `https://www.reddit.com/r/JustBuyVEQT/${sort}.json?limit=${limit}&raw_json=1`;

    const res = await fetch(url, {
      headers: { "User-Agent": "buyveqt.com/1.0" },
    });

    if (!res.ok) {
      console.warn(`[Reddit] Client fetch ${sort} failed: HTTP ${res.status}`);
      return [];
    }

    const json = await res.json();
    const posts = json?.data?.children || [];

    const result = posts
      .filter(
        (child: Record<string, Record<string, unknown>>) =>
          !child.data.stickied
      )
      .map((child: Record<string, Record<string, unknown>>) => {
        const d = child.data;
        return {
          id: d.id as string,
          title: d.title as string,
          author: d.author as string,
          createdAt: new Date(
            (d.created_utc as number) * 1000
          ).toISOString(),
          score: d.score as number,
          commentCount: d.num_comments as number,
          permalink: `https://www.reddit.com${d.permalink as string}`,
          flair: (d.link_flair_text as string) || null,
          isSelf: d.is_self as boolean,
          isStickied: d.stickied as boolean,
        };
      });

    console.log(`[Reddit] Client fetch ${sort}: ${result.length} posts`);
    return result;
  } catch (error) {
    console.warn(`[Reddit] Client fetch ${sort} error:`, error);
    return [];
  }
}

async function fetchStatsClient(): Promise<SubredditStats | null> {
  try {
    const res = await fetch(
      "https://www.reddit.com/r/JustBuyVEQT/about.json",
      { headers: { "User-Agent": "buyveqt.com/1.0" } }
    );
    if (!res.ok) {
      console.warn(`[Reddit] Client stats fetch failed: HTTP ${res.status}`);
      return null;
    }
    const json = await res.json();
    const data = json?.data;
    if (!data) return null;
    return {
      subscribers: (data.subscribers as number) ?? 0,
      activeUsers: (data.accounts_active as number) ?? null,
    };
  } catch (error) {
    console.warn("[Reddit] Client stats fetch error:", error);
    return null;
  }
}

interface CommunityContentProps {
  hotPosts: RedditPost[];
  newPosts: RedditPost[];
  stats: SubredditStats | null;
}

export default function CommunityContent({
  hotPosts: serverHot,
  newPosts: serverNew,
  stats: serverStats,
}: CommunityContentProps) {
  const [activeTab, setActiveTab] = useState<TabId>("trending");
  const [clientFeeds, setClientFeeds] = useState<Record<TabId, RedditPost[]>>({
    trending: serverHot,
    new: serverNew,
  });
  const [clientStats, setClientStats] = useState<SubredditStats | null>(
    serverStats
  );
  const [loading, setLoading] = useState(false);

  // Client-side fallback when all server feeds are empty (Reddit blocks Vercel IPs)
  const serverEmpty = serverHot.length === 0 && serverNew.length === 0;

  useEffect(() => {
    if (!serverEmpty) return;

    let cancelled = false;
    setLoading(true);

    Promise.all([
      fetchRedditClient("hot"),
      fetchRedditClient("new"),
      fetchStatsClient(),
    ]).then(([hot, fresh, stats]) => {
      if (cancelled) return;
      setClientFeeds({ trending: hot, new: fresh });
      if (stats) setClientStats(stats);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [serverEmpty]);

  const posts = clientFeeds[activeTab];

  return (
    <>
      {/* Tab bar */}
      <div className="border-b border-[var(--color-border)] mb-6">
        <div className="flex gap-0">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-[var(--color-brand)] text-[var(--color-brand)]"
                  : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      {loading ? (
        <div className="space-y-4 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className="skeleton h-8 w-12 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-full" />
                <div className="skeleton h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="divide-y divide-[var(--color-border)]">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-4 py-4 first:pt-0"
            >
              {/* Score */}
              <div className="shrink-0 w-12 text-center pt-0.5">
                <div
                  className={`text-sm font-bold tabular-nums ${
                    post.score >= 10
                      ? "text-[var(--color-positive)]"
                      : "text-[var(--color-text-muted)]"
                  }`}
                >
                  {post.score >= 1000
                    ? `${(post.score / 1000).toFixed(1)}k`
                    : post.score}
                </div>
                <svg
                  viewBox="0 0 16 16"
                  width="10"
                  height="10"
                  fill="currentColor"
                  className="mx-auto text-[var(--color-text-muted)]"
                >
                  <path d="M8 2l5 6H9v6H7V8H3l5-6z" />
                </svg>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
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
                <div className="flex items-center gap-3 mt-1.5 text-xs text-[var(--color-text-muted)]">
                  <span>u/{post.author}</span>
                  <span className="flex items-center gap-0.5">
                    <svg
                      viewBox="0 0 16 16"
                      width="12"
                      height="12"
                      fill="currentColor"
                    >
                      <path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1z" />
                    </svg>
                    {post.commentCount} comments
                  </span>
                  <span>{timeAgo(post.createdAt)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        /* Empty state */
        <div className="text-center py-16">
          <p className="text-[var(--color-text-muted)] mb-3">
            {activeTab === "trending"
              ? "Couldn't load posts right now."
              : "No posts yet — be the first to start a discussion!"}
          </p>
          <a
            href={
              activeTab === "trending"
                ? "https://www.reddit.com/r/JustBuyVEQT/"
                : "https://www.reddit.com/r/JustBuyVEQT/submit"
            }
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
          >
            {activeTab === "trending"
              ? "Visit r/JustBuyVEQT directly →"
              : "Start a discussion on Reddit →"}
          </a>
        </div>
      )}

      {/* Stats bar */}
      {clientStats && (
        <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
          <div className="flex items-center gap-6 text-sm text-[var(--color-text-muted)]">
            <div>
              <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
                {clientStats.subscribers.toLocaleString()}
              </span>{" "}
              members
            </div>
            {clientStats.activeUsers !== null && clientStats.activeUsers > 0 && (
              <div>
                <span className="font-semibold text-[var(--color-text-primary)] tabular-nums">
                  {clientStats.activeUsers.toLocaleString()}
                </span>{" "}
                online now
              </div>
            )}
            <span className="text-xs text-[var(--color-text-muted)]">
              Updated every 30 minutes
            </span>
          </div>
        </div>
      )}

      {/* CTA buttons */}
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href="https://www.reddit.com/r/JustBuyVEQT/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-[var(--color-brand)] text-white text-sm font-semibold hover:bg-[var(--color-brand-dark)] transition-colors"
        >
          Join the discussion on Reddit
        </a>
        <a
          href="https://www.reddit.com/r/JustBuyVEQT/submit"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center px-5 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-base)] transition-colors"
        >
          Start a discussion
        </a>
      </div>
    </>
  );
}
