import Link from "next/link";
import type { ArticleFrontmatter } from "@/lib/articles";
import { getAllArticles, getArticleOrdinal } from "@/lib/articles";

interface NextDispatchProps {
  next: ArticleFrontmatter | null;
  previous?: ArticleFrontmatter | null;
}

/**
 * Round 4 v2 — end-of-article CTA card. Paper-light card with
 * "Next dispatch · NN of NN" eyebrow, italic Fraunces title,
 * Newsreader blurb, read-time + "Read next →" CTA.
 *
 * Renders nothing when there's no next + no previous.
 */
export default function NextDispatch({ next, previous }: NextDispatchProps) {
  if (!next && !previous) return null;

  const total = getAllArticles().length;
  const nextOrdinal = next ? getArticleOrdinal(next.slug) : null;
  const nextLabel = nextOrdinal
    ? `Next dispatch · ${String(nextOrdinal).padStart(2, "0")} of ${String(total).padStart(2, "0")}`
    : "Next dispatch";

  return (
    <div style={{ marginTop: 56 }}>
      {next && (
        <Link
          href={`/learn/${next.slug}`}
          style={{
            display: "block",
            padding: "22px 24px 24px",
            background: "var(--paper-light)",
            border: "1px solid var(--rule-soft)",
            borderRadius: 14,
            textDecoration: "none",
            color: "inherit",
            transition: "background 0.15s",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span
              className="ed-label"
              style={{ color: "var(--ink-mute)" }}
            >
              {nextLabel}
            </span>
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--stamp)",
                borderBottom: "1px solid var(--stamp)",
                paddingBottom: 3,
              }}
            >
              Read next →
            </span>
          </div>
          <div
            className="ed-display-italic"
            style={{
              fontSize: "clamp(1.5rem, 2.5vw, 1.75rem)",
              lineHeight: 1.1,
              color: "var(--ink)",
            }}
          >
            {next.title}
          </div>
          {(next.excerpt || next.description) && (
            <p
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 15,
                lineHeight: 1.6,
                color: "var(--ink-soft)",
                marginTop: 10,
                marginBottom: 0,
                maxWidth: "52ch",
              }}
            >
              {next.excerpt || next.description}
            </p>
          )}
          <div
            className="ed-label"
            style={{
              marginTop: 14,
              color: "var(--ink-mute)",
              fontWeight: 600,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {next.readingTime}
            {next.difficulty && next.difficulty !== "beginner" && (
              <>
                <span style={{ opacity: 0.5, margin: "0 8px" }}>·</span>
                <span style={{ textTransform: "capitalize" }}>
                  {next.difficulty}
                </span>
              </>
            )}
          </div>
        </Link>
      )}

      {previous && (
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            fontSize: 13,
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid var(--rule-soft)",
            color: "var(--ink-mute)",
          }}
        >
          ← Previously:{" "}
          <Link
            href={`/learn/${previous.slug}`}
            style={{
              color: "var(--ink)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            {previous.title}
          </Link>
        </p>
      )}
    </div>
  );
}
