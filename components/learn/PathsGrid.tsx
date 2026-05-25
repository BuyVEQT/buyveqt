"use client";

import { LEARN_PATHS } from "@/lib/learn-paths-data";
import type { ArticleFrontmatter } from "@/lib/articles";
import PathCard from "./PathCard";

interface PathsGridProps {
  articles: ArticleFrontmatter[];
}

/**
 * "Where do I start?" — V2 question-driven path block.
 *
 * Surfaces the first 3 of 6 paths as large flip cards on `>= 720px`,
 * stacked single-col on mobile. A quiet "See all six paths →" link
 * routes to `/learn/path` (the full-paths index) for the remaining 3.
 *
 * Replaces the v1 6-up grid + verbose explainer.
 */
export default function PathsGrid({ articles }: PathsGridProps) {
  const featured = LEARN_PATHS.slice(0, 3);
  const byslug = (slug: string): ArticleFrontmatter | undefined =>
    articles.find((a) => a.slug === slug);

  return (
    <section className="discover-v2 discover-v2--paths">
      <div className="discover-v2__head">
        <div>
          <div className="ed-stamp">Where do I start?</div>
          <h2 className="ed-display discover-v2__h2">
            Pick the{" "}
            <em style={{ fontStyle: "italic", fontWeight: 500 }}>question</em>{" "}
            that fits.
          </h2>
        </div>
        <p className="ed-caption discover-v2__deck">
          Six reading paths, three highlighted here. Each one is 4–6
          dispatches in the order we think they belong.
        </p>
      </div>
      <div className="discover-v2__grid discover-v2__grid--paths">
        {featured.map((p) => (
          <PathCard key={p.id} path={p} byslug={byslug} />
        ))}
      </div>
      <div className="discover-v2__more">
        <a href="/learn/path" className="discover-v2__more-link">
          See all six paths →
        </a>
      </div>

      <style jsx global>{`
        .discover-v2 {
          padding: 8px 0 28px;
        }
        .discover-v2__head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 18px;
          flex-wrap: wrap;
        }
        .discover-v2__h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin: 6px 0 0;
        }
        .discover-v2__deck {
          flex: 0 1 380px;
          max-width: 380px;
          font-size: 13px;
        }
        .discover-v2__grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        @media (min-width: 720px) {
          .discover-v2__grid--paths {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
          .discover-v2__grid--picks {
            grid-template-columns: repeat(3, 1fr);
            gap: 14px;
          }
        }
        .discover-v2__more {
          margin-top: 16px;
          text-align: right;
        }
        .discover-v2__more-link {
          font-family: var(--font-sans);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--ink-soft);
          text-decoration: none;
        }
        .discover-v2__more-link:hover {
          color: var(--stamp);
        }
      `}</style>
    </section>
  );
}
