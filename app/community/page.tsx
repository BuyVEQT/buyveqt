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
 * Derive the live pulse-strip numbers that Reddit's about endpoint
 * doesn't surface (postsToday, avgComments), and graft them onto the
 * server-side `SubredditStats` so the hero can render statically.
 *
 * Reddit's API doesn't expose newSubscribersThisWeek; we leave that
 * undefined and the hero hides the column when missing. With a proper
 * backend pipeline this could come from a daily snapshot diff.
 */
function deriveLiveStats(
  base: SubredditStats | null,
  hotPosts: RedditPost[]
): SubredditStats | null {
  if (!base) return null;

  const ONE_DAY_MS = 86_400_000;
  const now = Date.now();
  const postsToday = hotPosts.filter(
    (p) => now - new Date(p.createdAt).getTime() <= ONE_DAY_MS
  ).length;

  const withComments = hotPosts.filter((p) => p.commentCount > 0);
  const avgComments =
    withComments.length > 0
      ? Math.round(
          withComments.reduce((sum, p) => sum + p.commentCount, 0) /
            withComments.length
        )
      : 0;

  return {
    ...base,
    postsToday,
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
  const enrichedStats = deriveLiveStats(stats, hotPosts);

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
