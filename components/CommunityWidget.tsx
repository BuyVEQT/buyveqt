"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { RedditPost } from "@/lib/data/reddit";
import { fetchRedditClient } from "@/components/community/CommunityContent";

export default function CommunityWidget() {
  const [posts, setPosts] = useState<RedditPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetchRedditClient("hot", 6).then((result) => {
      if (cancelled) return;
      setPosts(result.slice(0, 5));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
          From the community
        </h2>
        <Link
          href="/community"
          className="text-sm font-medium text-[var(--color-brand)] hover:text-[var(--color-brand-dark)] transition-colors"
        >
          View all discussions &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="skeleton h-4 flex-1" />
              <div className="skeleton h-3 w-16 shrink-0" />
            </div>
          ))}
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-0 divide-y divide-[var(--color-border)]">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
            >
              <p className="text-sm text-[var(--color-text-secondary)] group-hover:text-[var(--color-brand)] transition-colors leading-snug line-clamp-1 flex-1">
                {post.title}
              </p>
              <span className="shrink-0 text-xs text-[var(--color-text-muted)] flex items-center gap-1">
                <svg
                  viewBox="0 0 16 16"
                  width="11"
                  height="11"
                  fill="currentColor"
                >
                  <path d="M2 2h12a1 1 0 011 1v8a1 1 0 01-1 1H5l-3 3V3a1 1 0 011-1z" />
                </svg>
                {post.commentCount}
              </span>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[var(--color-text-muted)]">
          Visit{" "}
          <a
            href="https://www.reddit.com/r/JustBuyVEQT/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-brand)] hover:text-[var(--color-brand-dark)]"
          >
            r/JustBuyVEQT
          </a>{" "}
          for community discussions.
        </p>
      )}
    </section>
  );
}
