"use client";

import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import { isInteractive } from "@/lib/interactive-slugs";

interface ArchiveCardProps {
  article: ArticleFrontmatter;
  /** "wide" spans both grid columns and gets feature styling. */
  span?: "narrow" | "wide";
}

/**
 * Magazine-grid card for the V2 archive. Replaces the v1 ArticleRow when
 * rendered inside the archive section.
 *
 * - Meta row: category + reading-time eyebrows
 * - Fraunces 2-line title, Newsreader 2-line excerpt
 * - Foot chips: Tool / difficulty / up to 2 tags
 * - Editorial pieces (`isEditorial`) get a 3px vermilion left stripe + an
 *   "Our take" marker. Pair with `span="wide"` to render full-width.
 */
export default function ArchiveCard({ article, span = "narrow" }: ArchiveCardProps) {
  const isEditorial = article.isEditorial === true;
  const isTool = isInteractive(article.slug);
  const category = (article.category ?? "").replace(/-/g, " ");

  return (
    <Link
      href={`/learn/${article.slug}`}
      className={`acard ${span === "wide" ? "acard--wide" : ""} ${isEditorial ? "acard--editorial" : ""}`}
    >
      {isEditorial && (
        <div className="acard__editorial-mark">
          <span className="ed-stamp" style={{ color: "var(--stamp)" }}>
            Our take
          </span>
        </div>
      )}
      <div className="acard__meta">
        <span className="ed-stamp acard__cat">{category}</span>
        <span
          className="ed-stamp acard__time"
          style={{ color: "var(--ink-mute)" }}
        >
          {article.readingTime}
        </span>
      </div>
      <h3 className="ed-display acard__title">{article.title}</h3>
      <p className="ed-body acard__excerpt">
        {article.excerpt || article.description}
      </p>
      <div className="acard__foot">
        {isTool && <span className="acard__tool">⚙ Tool</span>}
        {article.difficulty && article.difficulty !== "beginner" && (
          <span className="acard__diff">{article.difficulty}</span>
        )}
        {article.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="acard__tag">
            #{tag}
          </span>
        ))}
      </div>

      <style jsx global>{`
        .acard {
          display: flex;
          flex-direction: column;
          padding: 20px 22px 18px;
          background: var(--paper-light);
          border: 1px solid var(--rule-soft);
          border-radius: 18px;
          text-decoration: none;
          color: inherit;
          position: relative;
          transition: border-color 0.18s, transform 0.18s, box-shadow 0.18s;
        }
        .acard:hover {
          border-color: var(--ink);
          transform: translateY(-2px);
          box-shadow: 0 4px 18px rgba(15, 13, 10, 0.05);
        }
        .acard--editorial {
          border-left: 3px solid var(--stamp);
          padding-left: 22px;
        }
        .acard__editorial-mark {
          margin-bottom: 10px;
        }
        .acard__meta {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 10px;
          margin-bottom: 10px;
        }
        .acard__cat {
          color: var(--ink-mute);
          text-transform: uppercase;
        }
        .acard__title {
          font-size: clamp(1.05rem, 1.6vw, 1.25rem);
          line-height: 1.2;
          letter-spacing: -0.012em;
          color: var(--ink);
          margin: 0 0 8px;
          font-weight: 500;
        }
        .acard--wide .acard__title {
          font-size: clamp(1.3rem, 2vw, 1.6rem);
        }
        .acard__excerpt {
          font-size: 13.5px;
          line-height: 1.5;
          color: var(--ink-soft);
          margin: 0 0 14px;
          flex: 1;
        }
        .acard--wide .acard__excerpt {
          font-size: 14.5px;
          max-width: 60ch;
        }
        .acard__foot {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
          margin-top: auto;
        }
        .acard__tool,
        .acard__diff,
        .acard__tag {
          font-family: var(--font-sans);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          color: var(--ink-mute);
          border: 1px solid var(--rule-soft);
          padding: 3px 8px;
          border-radius: 999px;
        }
        .acard__tool {
          color: var(--stamp);
          border-color: var(--stamp);
        }
        .acard__diff {
          text-transform: capitalize;
        }
      `}</style>
    </Link>
  );
}
