import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import CommunityHero from "@/components/community/CommunityHero";
import CommunityContent from "@/components/community/CommunityContent";
import CommunityCTA from "@/components/community/CommunityCTA";
import {
  getRedditPosts,
  getSubredditStats,
  type RedditPost,
  type SubredditStats,
} from "@/lib/data/reddit";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: "The Forum — r/JustBuyVEQT",
  description:
    "Letters from the holders. Live discussions, questions, and milestones from the r/JustBuyVEQT community of Canadian passive investors.",
  alternates: { canonical: canonicalUrl("/community") },
  openGraph: {
    title: "The Forum — r/JustBuyVEQT",
    description:
      "Letters from the holders — live discussions, questions, and milestones from r/JustBuyVEQT.",
    url: canonicalUrl("/community"),
  },
};

/**
 * Derive pulse-strip numbers from listings. Reddit's /about endpoint
 * only gives `subscribers` and `accounts_active`; everything else is
 * computed from posts.
 *
 * `topPostScore` reads the highest score on file from the top-all-time
 * listing. Previously this slot was "Posts today", which read as a
 * broken zero whenever the sub had a quiet day. Top score is a more
 * honest gauge for a small-but-engaged community.
 *
 * `avgComments` is the mean of `commentCount` across posts that have
 * received at least one reply — a proxy for engagement quality.
 */
function deriveLiveStats(
  base: SubredditStats | null,
  hotPosts: RedditPost[],
  topPosts: RedditPost[]
): SubredditStats | null {
  if (!base) return null;

  const withComments = hotPosts.filter((p) => p.commentCount > 0);
  const avgComments =
    withComments.length > 0
      ? Math.round(
          withComments.reduce((sum, p) => sum + p.commentCount, 0) /
            withComments.length
        )
      : 0;

  const topPostScore = topPosts.length > 0
    ? Math.max(...topPosts.map((p) => p.score))
    : 0;

  return {
    ...base,
    topPostScore,
    avgComments,
  };
}

export default async function CommunityPage() {
  const [hotResult, topResult, statsResult] = await Promise.allSettled([
    getRedditPosts("hot", 12),
    getRedditPosts("top", 12, "all"),
    getSubredditStats(),
  ]);

  const hot = hotResult.status === "fulfilled" ? hotResult.value : [];
  const topAll = topResult.status === "fulfilled" ? topResult.value : [];
  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;

  // Merge hot + top/all for trending to always have 10+ posts
  const seen = new Set<string>();
  const hotPosts: RedditPost[] = [];
  for (const post of [...hot, ...topAll]) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      hotPosts.push(post);
    }
    if (hotPosts.length >= 10) break;
  }

  const topPosts = topAll.slice(0, 10);
  const enrichedStats = deriveLiveStats(stats, hotPosts, topAll);

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Community", path: "/community" },
        ])}
      />

      <CommunityHero stats={enrichedStats} />

      <CommunityContent
        hotPosts={hotPosts}
        topPosts={topPosts}
        stats={enrichedStats}
      />

      <div style={{ marginTop: 32 }}>
        <CommunityCTA />
      </div>
    </InteriorShell>
  );
}
