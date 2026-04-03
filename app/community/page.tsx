import type { Metadata } from "next";
import PageShell from "@/components/layout/PageShell";
import CommunityContent from "@/components/community/CommunityContent";
import { getRedditPosts, getSubredditStats } from "@/lib/data/reddit";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildBreadcrumbSchema, canonicalUrl } from "@/lib/seo-config";

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: "Community — r/JustBuyVEQT",
  description:
    "Live discussions, questions, and milestones from the r/JustBuyVEQT community. Join Canadian passive investors building wealth with VEQT.",
  alternates: { canonical: canonicalUrl("/community") },
  openGraph: {
    title: "Community — r/JustBuyVEQT",
    description:
      "Live discussions, questions, and milestones from the r/JustBuyVEQT community.",
    url: canonicalUrl("/community"),
  },
};

export default async function CommunityPage() {
  const [hotResult, newResult, topResult, statsResult] =
    await Promise.allSettled([
      getRedditPosts("hot", 12),
      getRedditPosts("new", 12),
      getRedditPosts("top", 12, "all"),
      getSubredditStats(),
    ]);

  const hot = hotResult.status === "fulfilled" ? hotResult.value : [];
  const topAll = topResult.status === "fulfilled" ? topResult.value : [];
  const newPosts = (
    newResult.status === "fulfilled" ? newResult.value : []
  ).slice(0, 10);
  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;

  // Merge hot + top/all to always have 10 posts for low-activity subs
  const seen = new Set<string>();
  const hotPosts: typeof hot = [];
  for (const post of [...hot, ...topAll]) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      hotPosts.push(post);
    }
    if (hotPosts.length >= 10) break;
  }

  return (
    <PageShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Community", path: "/community" },
        ])}
      />
      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            Community
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
            r/JustBuyVEQT
          </h1>
          <p className="mt-2 text-[var(--color-text-secondary)] max-w-2xl">
            Real conversations from the community. Questions, milestones, and
            everything in between.
          </p>
        </div>

        <CommunityContent
          hotPosts={hotPosts}
          newPosts={newPosts}
          stats={stats}
        />
      </main>
    </PageShell>
  );
}
