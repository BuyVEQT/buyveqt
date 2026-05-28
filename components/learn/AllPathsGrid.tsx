"use client";

import type { ArticleFrontmatter } from "@/lib/articles";
import { LEARN_PATHS } from "@/lib/learn-paths-data";
import PathCard from "./PathCard";

interface AllPathsGridProps {
  articles: ArticleFrontmatter[];
}

/**
 * Client-side grid that renders all six LEARN_PATHS as flip cards.
 *
 * Lives in a "use client" boundary because `PathCard` needs the
 * `byslug` lookup function — RSC can't pass functions across to
 * client components, so we resolve it here on the client.
 *
 * Used by /learn/path (the "all paths" index page).
 */
export default function AllPathsGrid({ articles }: AllPathsGridProps) {
  const byslug = (slug: string): ArticleFrontmatter | undefined =>
    articles.find((a) => a.slug === slug);

  return (
    <section className="all-paths-grid" aria-label="All reading paths">
      {LEARN_PATHS.map((p) => (
        <PathCard key={p.id} path={p} byslug={byslug} />
      ))}

      <style jsx>{`
        .all-paths-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 14px;
          padding-bottom: 56px;
        }
        @media (min-width: 720px) {
          .all-paths-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }
      `}</style>
    </section>
  );
}
