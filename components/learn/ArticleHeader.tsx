import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import { getArticleOrdinal } from "@/lib/articles";

interface ArticleHeaderProps {
  frontmatter: ArticleFrontmatter;
  /** Display-friendly category label (e.g. "Head-to-Head"). */
  categoryLabel: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Round 4 v2 article header. Top breadcrumb → thick ink top-rule →
 * Dispatch No. + read-time row → italic display h1 → byline (with
 * optional Our Take pill when isEditorial).
 */
export default function ArticleHeader({
  frontmatter,
  categoryLabel,
}: ArticleHeaderProps) {
  const updated = formatDate(
    frontmatter.updatedDate ?? frontmatter.lastUpdated
  );
  const editorial = frontmatter.isEditorial === true;
  const ordinal = getArticleOrdinal(frontmatter.slug);
  const dispatchLabel = ordinal
    ? `Dispatch No. ${String(ordinal).padStart(2, "0")}`
    : "Dispatch";
  // categoryLabel arrives as "Learn · Head-to-Head" — split for the breadcrumb.
  const trailing = categoryLabel.startsWith("Learn · ")
    ? categoryLabel.slice("Learn · ".length)
    : categoryLabel;

  return (
    <header>
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 18,
          flexWrap: "wrap",
        }}
      >
        <Link
          href="/learn"
          className="ed-label"
          style={{
            color: "var(--ink)",
            textDecoration: "none",
          }}
        >
          Learn
        </Link>
        <span style={{ color: "var(--ink-mute)", opacity: 0.4 }}>·</span>
        <span
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 14,
            color: "var(--ink-mute)",
          }}
        >
          {trailing}
        </span>
      </nav>

      {/* Dispatch No. row above the thick ink rule */}
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          marginBottom: 18,
          borderTop: "2px solid var(--ink)",
          paddingTop: 18,
        }}
      >
        <span
          className="ed-label"
          style={{ color: "var(--stamp)" }}
        >
          {dispatchLabel}
        </span>
        <span
          className="ed-label"
          style={{
            marginLeft: "auto",
            color: "var(--ink-mute)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {frontmatter.readingTime} read
        </span>
      </div>

      <h1
        className="ed-display-italic"
        style={{
          fontSize: "clamp(2.25rem, 5vw, 4.25rem)",
          lineHeight: 1,
          letterSpacing: "-0.028em",
          margin: "0 0 18px",
          color: "var(--ink)",
          maxWidth: "20ch",
        }}
      >
        {frontmatter.title}
      </h1>

      <div
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          fontSize: 15,
          color: "var(--ink-mute)",
          lineHeight: 1.5,
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span>By BuyVEQT</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <span>Updated {updated}</span>
        {frontmatter.difficulty && frontmatter.difficulty !== "beginner" && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span style={{ textTransform: "capitalize" }}>
              {frontmatter.difficulty}
            </span>
          </>
        )}
        {editorial && (
          <>
            <span style={{ opacity: 0.4 }}>·</span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontStyle: "normal",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: "#f6efdc",
                background: "#0f0d0a",
                padding: "3px 8px",
                borderRadius: 3,
              }}
            >
              Our Take
            </span>
          </>
        )}
      </div>
    </header>
  );
}
