"use client";

import { useEffect, useState } from "react";

interface RedditPost {
  id: string;
  title: string;
  author: string;
  score: number;
  commentCount: number;
  permalink: string;
  flair: string | null;
  createdAt: string;
}

interface RedditPayload {
  posts: {
    trending?: RedditPost[];
    top?: RedditPost[];
  };
  stats: { subscribers: number; activeUsers: number | null } | null;
}

function formatAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diffMs / 86_400_000);
  if (days >= 7) return `${Math.floor(days / 7)}w ago`;
  if (days >= 1) return `${days}d ago`;
  const hours = Math.floor(diffMs / 3_600_000);
  if (hours >= 1) return `${hours}h ago`;
  return "just now";
}

export default function Letters() {
  const [payload, setPayload] = useState<RedditPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/reddit");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: RedditPayload = await res.json();
        if (!cancelled) {
          setPayload(data);
          setLoading(false);
        }
      } catch {
        if (!cancelled) setLoading(false);
      }
    }
    load();
  }, []);

  const letters = (payload?.posts?.trending ?? payload?.posts?.top ?? []).slice(
    0,
    4
  );
  const subs = payload?.stats?.subscribers;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        <div className="lg:col-span-5">
          <p className="bs-stamp mb-2">r/JustBuyVEQT</p>
          <h3 className="bs-display text-3xl sm:text-4xl lg:text-[2.75rem] leading-[1]">
            What the subreddit
            <br />
            <em className="bs-display-italic">is talking about.</em>
          </h3>
        </div>
        <p className="lg:col-span-7 bs-body">
          {subs ? (
            <>
              <span className="bs-numerals">
                {subs.toLocaleString("en-CA")}
              </span>{" "}
              Canadians hold each other accountable at{" "}
            </>
          ) : (
            "Canadians hold each other accountable at "
          )}
          <a
            href="https://reddit.com/r/JustBuyVEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="bs-link"
          >
            r/JustBuyVEQT
          </a>
          . Here&apos;s what&apos;s on the top of the feed this week.
        </p>
      </div>

      {loading && letters.length === 0 ? (
        <div className="space-y-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border-t border-[var(--ink)] pt-4">
              <div className="skeleton h-5 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/3" />
            </div>
          ))}
        </div>
      ) : letters.length === 0 ? (
        <p className="bs-body italic text-[var(--ink-soft)]">
          Nothing fresh on the feed.{" "}
          <a
            href="https://reddit.com/r/JustBuyVEQT"
            target="_blank"
            rel="noopener noreferrer"
            className="bs-link"
          >
            Visit the subreddit directly.
          </a>
        </p>
      ) : (
        <ol className="space-y-0">
          {letters.map((post, idx) => (
            <li
              key={post.id}
              className={`py-5 grid grid-cols-[auto_1fr] gap-5 sm:gap-7 ${
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
                className="group block"
              >
                <h4 className="bs-display-italic text-xl sm:text-2xl leading-[1.15] text-[var(--ink)] group-hover:text-[var(--stamp)] transition-colors">
                  &ldquo;{post.title}&rdquo;
                </h4>
                <p className="bs-caption mt-1.5 flex items-center gap-2 flex-wrap">
                  <span>&mdash; u/{post.author}</span>
                  <span className="opacity-40">·</span>
                  <span>{formatAgo(post.createdAt)}</span>
                  {post.score > 0 && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="bs-numerals">
                        {post.score.toLocaleString()} upvotes
                      </span>
                    </>
                  )}
                  {post.commentCount > 0 && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="bs-numerals">
                        {post.commentCount} replies
                      </span>
                    </>
                  )}
                  {post.flair && (
                    <>
                      <span className="opacity-40">·</span>
                      <span className="italic text-[var(--stamp)]">
                        {post.flair}
                      </span>
                    </>
                  )}
                </p>
              </a>
            </li>
          ))}
        </ol>
      )}

      <p className="bs-caption mt-8 text-right">
        <a
          href="https://reddit.com/r/JustBuyVEQT"
          target="_blank"
          rel="noopener noreferrer"
          className="bs-link"
        >
          Open r/JustBuyVEQT &rarr;
        </a>
      </p>
    </>
  );
}
