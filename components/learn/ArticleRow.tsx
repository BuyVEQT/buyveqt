"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ArticleFrontmatter } from "@/lib/articles";
import { isInteractive } from "@/lib/interactive-slugs";

interface ArticleRowProps {
  article: ArticleFrontmatter;
  /** Compact variant — used in "Read next" / related strips. */
  compact?: boolean;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/**
 * Round 4 v2 article row. The main visual atom of /learn — used in the
 * grouped category sections, the filtered list, and the "Read next"
 * related strip.
 *
 * Variants:
 *  - editorial (frontmatter.isEditorial): vermilion left-rule + "Our Take"
 *    stamp eyebrow, body slightly indented.
 *  - interactive (slug in INTERACTIVE_SLUGS): small outlined "Tool" badge
 *    next to the title.
 *  - default: bare row with a top hairline.
 *
 * Tags are clickable buttons that navigate to /learn?tag=X for filtering.
 */
export default function ArticleRow({ article, compact = false }: ArticleRowProps) {
  const router = useRouter();
  const interactive = isInteractive(article.slug);
  const editorial = article.isEditorial === true;
  const diffLabel =
    article.difficulty && article.difficulty !== "beginner"
      ? DIFFICULTY_LABEL[article.difficulty]
      : null;
  const tags = (article.tags ?? []).slice(0, 3);

  function handleTagClick(e: React.MouseEvent, tag: string) {
    e.preventDefault();
    e.stopPropagation();
    const next = new URLSearchParams();
    next.set("tag", tag);
    router.replace(`/learn?${next.toString()}`, { scroll: false });
  }

  return (
    <li
      className="learn-row"
      data-variant={editorial ? "editorial" : "default"}
      data-compact={compact ? "true" : "false"}
    >
      {editorial && (
        <div
          className="ed-label"
          style={{ color: "var(--stamp)", marginBottom: 6 }}
        >
          Our Take
        </div>
      )}
      <Link
        href={`/learn/${article.slug}`}
        className="learn-row__link"
        aria-label={article.title}
      >
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <h3
                className="ed-display"
                style={{
                  fontSize: compact ? 17 : "clamp(1.0625rem, 1.8vw, 1.25rem)",
                  lineHeight: 1.2,
                  letterSpacing: "-0.012em",
                  color: "var(--ink)",
                  margin: 0,
                  fontWeight: 500,
                }}
              >
                {article.title}
              </h3>
              {interactive && (
                <span
                  className="ed-label"
                  style={{
                    color: "var(--stamp)",
                    border: "1px solid var(--stamp)",
                    padding: "2px 6px 1px",
                    borderRadius: 3,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                    fontSize: 9,
                  }}
                >
                  Tool
                </span>
              )}
            </div>
            <div
              className="ed-label"
              style={{
                marginTop: 6,
                color: "var(--ink-mute)",
                letterSpacing: "0.04em",
                display: "flex",
                gap: 10,
                alignItems: "center",
                flexWrap: "wrap",
                textTransform: "none",
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              <span>{article.readingTime}</span>
              {diffLabel && (
                <>
                  <span style={{ opacity: 0.4 }}>·</span>
                  <span>{diffLabel}</span>
                </>
              )}
            </div>
            {!compact && (article.excerpt || article.description) && (
              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: 14.5,
                  lineHeight: 1.5,
                  color: "var(--ink-soft)",
                  marginTop: 8,
                  marginBottom: 0,
                  maxWidth: "52ch",
                }}
              >
                {article.excerpt || article.description}
              </p>
            )}
          </div>
          <span
            aria-hidden
            style={{
              color: "var(--ink-mute)",
              fontSize: 18,
              alignSelf: "center",
            }}
          >
            ›
          </span>
        </div>
      </Link>
      {!compact && tags.length > 0 && (
        <div
          style={{
            marginTop: 10,
            display: "flex",
            gap: 6,
            flexWrap: "wrap",
          }}
        >
          {tags.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={(e) => handleTagClick(e, tag)}
              style={{
                fontSize: 10.5,
                color: "var(--ink-mute)",
                fontFamily: "var(--font-sans)",
                border: "1px solid var(--rule-soft)",
                background: "transparent",
                padding: "2px 7px",
                borderRadius: 2,
                cursor: "pointer",
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}
