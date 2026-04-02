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
  const [hotResult, topResult, newResult, statsResult] =
    await Promise.allSettled([
      getRedditPosts("hot", 10),
      getRedditPosts("top", 10, "week"),
      getRedditPosts("new", 10),
      getSubredditStats(),
    ]);

  const hotPosts = hotResult.status === "fulfilled" ? hotResult.value : [];
  const topPosts = topResult.status === "fulfilled" ? topResult.value : [];
  const newPosts = newResult.status === "fulfilled" ? newResult.value : [];
  const stats = statsResult.status === "fulfilled" ? statsResult.value : null;

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
          topPosts={topPosts}
          newPosts={newPosts}
          stats={stats}
        />
      </main>
    </PageShell>
  );
}
