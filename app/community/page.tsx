import type { Metadata } from "next";
import CommunityHero from "@/components/community/CommunityHero";
import CommunityContent from "@/components/community/CommunityContent";
import PulseVerdict from "@/components/community/PulseVerdict";
import CommunityCloser from "@/components/community/CommunityCloser";
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

const css = `
.ins-cm {
  background: var(--ins-paper);
  min-height: 100dvh;
  color: var(--ins-ink);
  font-family: var(--ins-font);
}
.ins-cm__page {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 40px 40px;
}

@media (max-width: 640px) {
  .ins-cm__page {
    gap: 26px;
    padding: 0 20px 28px;
  }
}
`;

/**
 * Derive pulse-strip numbers from listings. Reddit's /about endpoint only
 * gives `subscribers` and `accounts_active`; everything else is computed
 * from posts.
 *
 * Both derived values stay `undefined` when the underlying listing didn't
 * include real data (e.g. the proxy fell back to RSS, which exposes neither
 * scores nor comment counts).
 *
 * NOTE: the Instrument redesign no longer *prints* `topPostScore` or
 * `avgComments` anywhere — the recipe bans engagement counts outright. The
 * derivation stays because it is part of the `SubredditStats` contract this
 * page shares with the Edge route at `/api/reddit`, which the hero refetches
 * on mount; dropping it here would silently fork the two shapes.
 */
function deriveLiveStats(
  base: SubredditStats,
  hotPosts: RedditPost[],
  topPosts: RedditPost[]
): SubredditStats {
  // Only count posts with real comment data — RSS-fallback posts all
  // have commentCount=0, which would average to 0 and look broken.
  const withComments = hotPosts.filter((p) => p.commentCount > 0);
  const avgComments =
    withComments.length > 0
      ? Math.round(
          withComments.reduce((sum, p) => sum + p.commentCount, 0) /
            withComments.length
        )
      : undefined;

  // Same defense for scores: RSS posts all have score=0, so the max
  // would be 0 and read as "the top post got zero upvotes".
  const realScores = topPosts.map((p) => p.score).filter((s) => s > 0);
  const topPostScore =
    realScores.length > 0 ? Math.max(...realScores) : undefined;

  return {
    ...base,
    topPostScore,
    avgComments,
  };
}

/**
 * /community — "The Pulse", the Instrument treatment of the subreddit feed.
 *
 * Module order:
 *   CommunityHero     kicker · display · dek · micro-facts rail
 *   CommunityContent  THE MOOD (ink/red ratio bar) + THE PULSE (tabs +
 *                     bordered quote cards)
 *   PulseVerdict      the one verdict rail
 *   CommunityCloser   display · dek · the one red CTA
 *
 * The broadsheet `InteriorShell` is gone: nav, footer and tab bar all come
 * from app/layout.tsx, and the Instrument owns its own white page frame the
 * same way the home route does.
 */
export default async function CommunityPage() {
  const [hotResult, topResult, statsResult] = await Promise.allSettled([
    getRedditPosts("hot", 12),
    getRedditPosts("top", 12, "all"),
    getSubredditStats(),
  ]);

  const hot = hotResult.status === "fulfilled" ? hotResult.value : [];
  const topAll = topResult.status === "fulfilled" ? topResult.value : [];
  // `getSubredditStats` always resolves (it swallows errors and returns
  // `{ subscribers: 0, activeUsers: null }` on failure), so this is just a
  // defensive guard for the unreachable rejected branch. CommunityHero
  // refetches live stats client-side from `/api/reddit` regardless, so even
  // a zero here gets corrected within a second of hydration.
  const stats =
    statsResult.status === "fulfilled"
      ? statsResult.value
      : { subscribers: 0, activeUsers: null };

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

  // Hero facts: distinct threads the page is actually holding, and the age
  // of the newest one. Both are corpus facts, not engagement counts.
  const distinctIds = new Set([...hot, ...topAll].map((p) => p.id));
  const latestIso =
    [...hot, ...topAll].reduce<string | null>(
      (latest, p) =>
        latest === null || p.createdAt > latest ? p.createdAt : latest,
      null
    ) ?? null;

  return (
    <>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Community", path: "/community" },
        ])}
      />

      <main className="ins-root ins-cm">
        <div className="ins-cm__page">
          <CommunityHero
            stats={enrichedStats}
            threadCount={distinctIds.size}
            latestIso={latestIso}
          />

          <CommunityContent hotPosts={hotPosts} topPosts={topPosts} />

          <PulseVerdict />

          <CommunityCloser />
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: css }} />
    </>
  );
}
