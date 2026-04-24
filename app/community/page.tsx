import type { Metadata } from "next";
import InteriorShell from "@/components/broadsheet/InteriorShell";
import CommunityContent from "@/components/community/CommunityContent";
import { getRedditPosts, getSubredditStats } from "@/lib/data/reddit";
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
  const hotPosts: typeof hot = [];
  for (const post of [...hot, ...topAll]) {
    if (!seen.has(post.id)) {
      seen.add(post.id);
      hotPosts.push(post);
    }
    if (hotPosts.length >= 10) break;
  }

  const topPosts = topAll.slice(0, 10);

  return (
    <InteriorShell>
      <JsonLd
        data={buildBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Community", path: "/community" },
        ])}
      />

      {/* ── Page head ──────────────────────────────────────────── */}
      <section className="pt-8 sm:pt-10 pb-6 bs-enter">
        <p className="bs-stamp mb-3">The Forum</p>
        <h1
          className="bs-display text-[2.25rem] sm:text-[3.25rem] lg:text-[4.25rem] leading-[0.98]"
          style={{ color: "var(--ink)" }}
        >
          Letters from
          <br />
          <em className="bs-display-italic">the holders.</em>
        </h1>
        <p
          className="bs-body mt-5 max-w-[58ch]"
          style={{ color: "var(--ink)" }}
        >
          {stats?.subscribers ? (
            <>
              <span className="bs-numerals not-italic">
                {stats.subscribers.toLocaleString("en-CA")}
              </span>{" "}
              Canadians
            </>
          ) : (
            "Thousands of Canadians"
          )}{" "}
          hold each other accountable at{" "}
          <a
            href="https://www.reddit.com/r/JustBuyVEQT/"
            target="_blank"
            rel="noopener noreferrer"
            className="bs-link"
          >
            r/JustBuyVEQT
          </a>
          . Questions, milestones, the occasional panic, the occasional
          victory. Here&apos;s what&apos;s on the feed.
        </p>
      </section>

      <CommunityContent
        hotPosts={hotPosts}
        topPosts={topPosts}
        stats={stats}
      />
    </InteriorShell>
  );
}
